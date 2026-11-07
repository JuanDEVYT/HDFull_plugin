import { makeBrowse } from './browse/index.js';
import { BASE_URL, getSessionCookie, isAuthorized, fetchHtml, parseCards } from "./hdfull.js";
import { resolveFallback } from "./fallback.js";

const VERSION = "1.0.3";
const PREFIX = `[HDFull v${VERSION}]`;
const LOGIN_URL = `${BASE_URL}/login`;

console.log(`${PREFIX} Creado por JuandreXter`);
const log = (...x) => console.log(PREFIX, ...x);

let b;
function app() {
  return b || (b = makeBrowse({
    kino: typeof kino !== 'undefined' ? kino : null,
    loadTab,
    searchTitles: async q => (await search({ q })).items,
  }));
}

async function loadTab(t) {
  log(`loadTab("${t}")`);
  if (t === 'inicio') return { rows: await home() };
  const r = await browse(t, '1');
  return { rows: [{ id: t, title: t === 'peliculas' ? 'Películas' : 'Series', ref: t, items: r.items }] };
}

function msg(title, body, action) {
  const children = [
    { type: "Icon", name: "lock", size: 54, color: "error" },
    { type: "Text", text: title, style: "h1", textAlign: "center" },
    { type: "Text", text: body, textAlign: "center", color: "muted" },
  ];
  if (action) {
    children.push({
      type: "Button",
      label: action.label,
      onPressed: { event: action.event },
      autofocus: true,
    });
  }
  return {
    type: "Scaffold",
    appBar: { type: "AppBar", title: "HDFull" },
    body: {
      type: "SingleChildScrollView",
      padding: 32,
      children: [
        {
          type: "Column",
          mainAxisAlignment: "center",
          crossAxisAlignment: "center",
          gap: 24,
          children,
        },
      ],
    },
  };
}

function loginView() {
  return msg(
    "Inicio de sesión requerido",
    "HDFull requiere una cuenta para acceder a sus enlaces. Pulsa el botón, inicia sesión en la ventana segura del navegador y al terminar pulsa Listo.",
    { label: "Abrir inicio de sesión", event: "hdfull.login" }
  );
}

function unavailableView() {
  return msg(
    "Navegador visual no disponible",
    "Este dispositivo no cuenta con WebView compatible para abrir el navegador visual de Kino."
  );
}

export async function screen(ctx) {
  log("screen(): comprobando sesión");
  if (!isAuthorized()) return loginView();
  return app().view(ctx || {});
}

export async function screenEvent(ev) {
  const e = typeof ev === "string" ? JSON.parse(ev) : ev || {};
  log(`screenEvent(ev="${e.name}")`);

  if (e.name === "hdfull.login") {
    if (!kino?.visualBrowser?.available) {
      return { view: unavailableView(), state: { loginError: "visualBrowser_unavailable" } };
    }
    const result = await kino.visualBrowser.open({
      url: LOGIN_URL,
      title: "Iniciar sesión en HDFull",
      collect: {
        cookies: [
          "PHPSESSID",
          "session",
          "remember",
          "remember_token",
          "XSRF-TOKEN",
          "cf_clearance",
          "__cf_bm",
          "login",
          "user",
          "token",
        ],
        storeAs: { setting: "hdfullCookies", format: "header", thenEvent: "hdfull.loggedIn" },
        finalUrl: true,
      },
      userAgent: "browser",
      timeoutMs: 600000,
    });

    if (result.status === "done" && result.stored) {
      b = null; // Reiniciar instancia para cargar el catálogo fresco
      return {
        view: await screen(),
        state: { loggedIn: true },
        message: "Sesión vinculada con éxito",
      };
    }
    if (result.status === "timeout") {
      return { view: loginView(), message: "El inicio de sesión tardó demasiado. Inténtalo otra vez." };
    }
    return { view: loginView() };
  }

  if (e.name === "hdfull.loggedIn") {
    b = null;
    return { view: await screen(), state: { loggedIn: true }, message: "Sesión vinculada con éxito" };
  }

  // Si no es un evento de auth y hay sesión activa, delegar a la app de browse
  if (isAuthorized()) {
    return app().event(e);
  }

  return null;
}

export async function home() {
  log("home(): cargando catálogo");
  if (!isAuthorized()) {
    log("home(): no autorizado, sesión no iniciada");
    return [];
  }

  try {
    const [peliHtml, serieHtml] = await Promise.all([
      fetchHtml("/peliculas-estreno").catch(() => fetchHtml("/peliculas/date/1")),
      fetchHtml("/series-estreno").catch(() => fetchHtml("/series/date/1")),
    ]);

    const pelis = parseCards(peliHtml);
    const series = parseCards(serieHtml);

    return [
      { id: "peliculas", title: "Películas en HDFull", ref: "peliculas", items: pelis },
      { id: "series", title: "Series en HDFull", ref: "series", items: series },
    ].filter(r => r.items.length > 0);
  } catch (err) {
    log(`home() error: ${err.message}`);
    return [];
  }
}

export async function browse(ref = "peliculas", cursor = "1") {
  log(`browse(${ref}, ${cursor})`);
  if (!isAuthorized()) return { items: [] };

  const page = Number(cursor) || 1;
  const isSeries = ref === "series" || ref.includes("/serie");
  const path = isSeries ? `/series/date/${page}` : `/peliculas/date/${page}`;

  try {
    const html = await fetchHtml(path);
    const items = parseCards(html);
    return {
      items,
      next: items.length > 0 ? String(page + 1) : undefined,
    };
  } catch (err) {
    log(`browse() error: ${err.message}`);
    return { items: [] };
  }
}

export async function search(arg) {
  const q = typeof arg === "string" ? arg : (arg?.q || arg?.query || "");
  if (!q.trim()) return { items: [] };
  log(`search("${q}")`);

  if (isAuthorized()) {
    try {
      const html = await fetchHtml(`/buscar?q=${encodeURIComponent(q)}`);
      const items = parseCards(html);
      if (items.length > 0) return { items };
    } catch (err) {
      log(`search() error: ${err.message}`);
    }
  }

  return { items: [] };
}

export async function details(ref) {
  log(`details(${ref})`);
  let item = {
    id: ref,
    ref,
    title: "",
    overview: "",
    poster: "",
    kind: ref.includes("/serie/") ? "series" : "movie",
    type: ref.includes("/serie/") ? "series" : "movie",
  };

  try {
    const html = await fetchHtml(ref);
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<title>([\s\S]*?)<\/title>/i);
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

    if (ogTitle) item.title = ogTitle[1].replace(/\s*-\s*HDFull.*$/i, "").trim();
    if (ogDesc) item.overview = ogDesc[1].trim();
    if (ogImage) item.poster = ogImage[1];

    const yMatch = item.title.match(/\((\d{4})\)/);
    if (yMatch) item.year = parseInt(yMatch[1], 10);
  } catch (err) {
    log(`details() fetch error: ${err.message}`);
  }

  try {
    if (kino?.meta?.byTitle && item.title) {
      const m = await kino.meta({ title: item.title, kind: item.kind, year: item.year });
      if (m) item = { ...item, ...m, ids: m.ids || item.ids };
    }
  } catch (_) {}

  return item;
}

export async function episodes(ref) {
  log(`episodes(${ref})`);
  const d = await details(ref);
  const eps = [];

  try {
    const html = await fetchHtml(ref);
    const matches = html.matchAll(/<a[^>]+href=["']([^"']*(?:\/temporada-(\d+)\/episodio-(\d+)[^"']*))["'][^>]*>([\s\S]*?)<\/a>/gi);
    const seen = new Set();
    for (const m of matches) {
      const epUrl = m[1].startsWith("http") ? m[1] : `${BASE_URL}${m[1]}`;
      if (seen.has(epUrl)) continue;
      seen.add(epUrl);

      const s = parseInt(m[2], 10);
      const e = parseInt(m[3], 10);
      const title = m[4].replace(/<[^>]*>/g, "").trim() || `Episodio ${e}`;

      eps.push({
        id: epUrl,
        ref: epUrl,
        title,
        season: s,
        episode: e,
        kind: "episode",
        type: "episode",
        poster: d.poster,
      });
    }
  } catch (err) {
    log(`episodes() error: ${err.message}`);
  }

  return {
    series: { title: d.title, ref },
    episodes: eps,
  };
}

export async function resolve(ref) {
  log(`resolve(${ref})`);
  const d = await details(ref).catch(() => ({ title: "" }));
  const title = d.title || ref.split("/").filter(Boolean).pop() || "";

  // 1. Extraer iframe directo si existe
  try {
    const html = await fetchHtml(ref);
    const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    for (const u of iframes) {
      const streamMatch = u.match(/https?:[^"'\\s]+\.m3u8[^"'\\s]*/i);
      if (streamMatch) {
        return {
          url: streamMatch[0],
          mime: "application/x-mpegURL",
          headers: { Referer: ref },
        };
      }
    }
  } catch (_) {}

  // 2. Fallback multi-fuente por título
  if (title) {
    log(`activando fallback para "${title}"...`);
    const fb = await resolveFallback(title);
    if (fb) {
      log(`fallback resuelto con éxito: ${fb.url}`);
      return fb;
    }
  }

  throw new Error("No se pudo obtener un stream reproducible para este título en HDFull");
}
