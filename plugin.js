// src/hdfull.js
var BASE_URL = "https://www3.hdfull.one";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function getSessionCookie() {
  try {
    return String(kino?.config?.get?.("hdfullCookies") || "").trim();
  } catch (_) {
    return "";
  }
}
function isAuthorized() {
  return !!getSessionCookie();
}
function makeHeaders() {
  const cookie = getSessionCookie();
  return {
    "User-Agent": USER_AGENT,
    "Referer": BASE_URL + "/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    ...cookie ? { "Cookie": cookie } : {}
  };
}
async function fetchHtml(url) {
  const fetcher = typeof kino !== "undefined" ? kino.fetch : globalThis.fetch;
  const target = url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  const res = await fetcher(target, {
    headers: makeHeaders()
  });
  if (!res.ok) {
    throw new Error(`HDFull HTTP ${res.status}`);
  }
  return res.text();
}
function absUrl(u) {
  if (!u) return "";
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("http")) return u;
  return `${BASE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}
function parseCards(html) {
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  const linkRegex = /<a\b[^>]*\bhref=["']([^"']*(?:\/pelicula\/|\/serie\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(linkRegex)) {
    const rawHref = m[1];
    const inner = m[2];
    const fullTag = m[0];
    const href = absUrl(rawHref);
    if (seen.has(href)) continue;
    let title = "";
    const titleAttr = fullTag.match(/\btitle=["']([^"']+)["']/i);
    if (titleAttr) title = titleAttr[1];
    if (!title) {
      const altMatch = inner.match(/<img[^>]+alt=["']([^"']+)["']/i);
      if (altMatch) title = altMatch[1];
    }
    if (!title) {
      title = inner.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    title = title.replace(/\s*-\s*HDFull.*$/i, "").trim();
    if (!title || title.length < 2) continue;
    let poster = "";
    const imgMatch = inner.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
    if (imgMatch) {
      poster = absUrl(imgMatch[1]);
    }
    seen.add(href);
    const isSeries = href.includes("/serie/");
    const yMatch = title.match(/\((\d{4})\)/);
    const year = yMatch ? parseInt(yMatch[1], 10) : void 0;
    const cleanTitle2 = title.replace(/\s*\(\d{4}\).*$/, "").trim();
    items.push({
      id: href,
      ref: href,
      title: cleanTitle2,
      kind: isSeries ? "series" : "movie",
      type: isSeries ? "series" : "movie",
      poster,
      art: poster,
      year
    });
  }
  return items;
}

// src/fallback.js
var USER_AGENT2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function cleanTitle(raw) {
  return String(raw || "").replace(/\s*\(\d{4}\).*$/, "").replace(/[:–—|].*$/, "").trim();
}
function decodeBase64(str) {
  if (typeof atob === "function") return atob(str);
  return "";
}
function decodeNupload(html) {
  try {
    const mFunc = html.match(/var\s+([A-Za-z0-9_]+)\s*=\s*"";\s*([A-Za-z0-9_]+)\.forEach\(function\s+[A-Za-z0-9_]+\(value\)\s*\{\s*\1\s*\+=\s*String\.fromCharCode\(parseInt\(atob\(value\)\.replace\(\/\\D\/g,''?\)\)\s*-\s*(\d+)\);\s*\}\s*\);/);
    if (!mFunc) return null;
    const [_, targetVar, arrVar, offsetStr] = mFunc;
    const offset = parseInt(offsetStr, 10);
    const mArr = html.match(new RegExp("var\\s+" + arrVar + "\\s*=\\s*(\\[[^\\]]+\\]);"));
    if (!mArr) return null;
    const arr = JSON.parse(mArr[1]);
    let baseUrl = "";
    for (const item of arr) {
      const raw = decodeBase64(item);
      const code = parseInt(raw.replace(/\D/g, ""), 10) - offset;
      baseUrl += String.fromCharCode(code);
    }
    const mSesz = html.match(/var sesz="([^"]+)"/);
    const sesz = mSesz ? mSesz[1] : "";
    return baseUrl + "?s=" + sesz;
  } catch (_) {
    return null;
  }
}
async function resolveFallback(title) {
  const q = cleanTitle(title);
  if (!q) return null;
  try {
    const searchUrl = "https://repelisplus.my/buscar/" + encodeURIComponent(q);
    const sRes = await kino.fetch(searchUrl, {
      headers: { "User-Agent": USER_AGENT2 }
    });
    if (!sRes.ok) return null;
    const sHtml = await sRes.text();
    const mPost = sHtml.match(/<a[^>]+href=["'](https:\/\/repelisplus\.my\/ver\/[^"']+)["']/i);
    if (!mPost) return null;
    const movieUrl = mPost[1];
    const mRes = await kino.fetch(movieUrl, {
      headers: { "User-Agent": USER_AGENT2 }
    });
    if (!mRes.ok) return null;
    const mHtml = await mRes.text();
    const mJaljz = mHtml.match(/var jaljz = (\{[\s\S]*?\});/);
    if (!mJaljz) return null;
    const jaljz = JSON.parse(mJaljz[1]);
    const keys = [];
    for (const groupKey of ["0", "1", "2"]) {
      const group = jaljz[groupKey];
      if (!group || !group.pos) continue;
      for (const posKey of Object.keys(group.pos)) {
        const item = group.pos[posKey];
        if (item && item.key) {
          keys.push({ key: item.key, lang: group.id || "Latino" });
        }
      }
    }
    for (const k of keys.slice(0, 3)) {
      try {
        const buUrl = "https://watchfun.top/bu/?key=" + encodeURIComponent(k.key);
        const buRes = await kino.fetch(buUrl, {
          headers: { "User-Agent": USER_AGENT2, Referer: movieUrl }
        });
        if (!buRes.ok) continue;
        const buHtml = await buRes.text();
        const iframeSrc = (buHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i) || [])[1];
        if (!iframeSrc) continue;
        const nuRes = await kino.fetch(iframeSrc, {
          headers: { "User-Agent": USER_AGENT2, Referer: "https://watchfun.top/" }
        });
        if (!nuRes.ok) continue;
        const nuHtml = await nuRes.text();
        const m3u8Url = decodeNupload(nuHtml);
        if (!m3u8Url || !m3u8Url.startsWith("http")) continue;
        return {
          url: m3u8Url,
          mime: "application/x-mpegURL",
          headers: {
            Referer: iframeSrc,
            Origin: new URL(iframeSrc).origin,
            "User-Agent": USER_AGENT2
          },
          name: `${k.lang} \xB7 HD (Fallback)`
        };
      } catch (_) {
      }
    }
  } catch (err) {
    console.log("[HDFull Fallback] error:", err.message);
  }
  return null;
}

// src/plugin.js
var VERSION = "1.0.1";
var PREFIX = `[HDFull v${VERSION}]`;
var LOGIN_URL = `${BASE_URL}/login`;
console.log(`${PREFIX} Creado por JuandreXter`);
var log = (...x) => console.log(PREFIX, ...x);
function msg(title, body, action) {
  const children = [
    { type: "Icon", name: "lock", size: 54, color: "error" },
    { type: "Text", text: title, style: "h1", textAlign: "center" },
    { type: "Text", text: body, textAlign: "center", color: "muted" }
  ];
  if (action) {
    children.push({
      type: "Button",
      label: action.label,
      onPressed: { event: action.event },
      autofocus: true
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
          children
        }
      ]
    }
  };
}
function loginView() {
  return msg(
    "Inicio de sesi\xF3n requerido",
    "HDFull requiere una cuenta para acceder a sus enlaces. Pulsa el bot\xF3n, inicia sesi\xF3n en la ventana segura del navegador y al terminar pulsa Listo.",
    { label: "Abrir inicio de sesi\xF3n", event: "hdfull.login" }
  );
}
function unavailableView() {
  return msg(
    "Navegador visual no disponible",
    "Este dispositivo no cuenta con WebView compatible para abrir el navegador visual de Kino."
  );
}
async function screen() {
  log("screen(): comprobando sesi\xF3n");
  if (!isAuthorized()) return loginView();
  return {
    type: "Scaffold",
    appBar: {
      type: "AppBar",
      title: "HDFull"
    },
    body: {
      type: "SingleChildScrollView",
      padding: 24,
      children: [
        {
          type: "Column",
          crossAxisAlignment: "center",
          gap: 16,
          children: [
            { type: "Icon", name: "check_circle", size: 48, color: "success" },
            { type: "Text", text: "Sesi\xF3n activa en HDFull", style: "h2", textAlign: "center" },
            {
              type: "Text",
              text: "Tu cuenta est\xE1 vinculada. Ya puedes explorar el cat\xE1logo desde la pantalla principal de Kino o usar la b\xFAsqueda.",
              textAlign: "center",
              color: "muted"
            },
            {
              type: "Button",
              label: "Actualizar o cambiar cuenta",
              onPressed: { event: "hdfull.login" }
            }
          ]
        }
      ]
    }
  };
}
async function screenEvent(ev) {
  const e = typeof ev === "string" ? JSON.parse(ev) : ev || {};
  log(`screenEvent(ev="${e.name}")`);
  if (e.name === "hdfull.login") {
    if (!kino?.visualBrowser?.available) {
      return { view: unavailableView(), state: { loginError: "visualBrowser_unavailable" } };
    }
    const result = await kino.visualBrowser.open({
      url: LOGIN_URL,
      title: "Iniciar sesi\xF3n en HDFull",
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
          "token"
        ],
        storeAs: { setting: "hdfullCookies", format: "header", thenEvent: "hdfull.loggedIn" },
        finalUrl: true
      },
      userAgent: "browser",
      timeoutMs: 6e5
    });
    if (result.status === "done" && result.stored) {
      return {
        view: await screen(),
        state: { loggedIn: true },
        message: "Sesi\xF3n de HDFull guardada"
      };
    }
    if (result.status === "timeout") {
      return { view: loginView(), message: "El inicio de sesi\xF3n tard\xF3 demasiado. Int\xE9ntalo otra vez." };
    }
    return { view: loginView() };
  }
  if (e.name === "hdfull.loggedIn") {
    return { view: await screen(), state: { loggedIn: true }, message: "Sesi\xF3n vinculada con \xE9xito" };
  }
  return null;
}
async function home() {
  log("home(): cargando cat\xE1logo");
  if (!isAuthorized()) {
    log("home(): no autorizado, sesi\xF3n no iniciada");
    return [];
  }
  try {
    const [peliHtml, serieHtml] = await Promise.all([
      fetchHtml("/peliculas-estreno").catch(() => fetchHtml("/peliculas/date/1")),
      fetchHtml("/series-estreno").catch(() => fetchHtml("/series/date/1"))
    ]);
    const pelis = parseCards(peliHtml);
    const series = parseCards(serieHtml);
    return [
      { id: "peliculas", title: "Pel\xEDculas en HDFull", ref: "peliculas", items: pelis },
      { id: "series", title: "Series en HDFull", ref: "series", items: series }
    ].filter((r) => r.items.length > 0);
  } catch (err) {
    log(`home() error: ${err.message}`);
    return [];
  }
}
async function browse(ref = "peliculas", cursor = "1") {
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
      next: items.length > 0 ? String(page + 1) : void 0
    };
  } catch (err) {
    log(`browse() error: ${err.message}`);
    return { items: [] };
  }
}
async function search(arg) {
  const q = typeof arg === "string" ? arg : arg?.q || arg?.query || "";
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
async function details(ref) {
  log(`details(${ref})`);
  let item = {
    id: ref,
    ref,
    title: "",
    overview: "",
    poster: "",
    kind: ref.includes("/serie/") ? "series" : "movie",
    type: ref.includes("/serie/") ? "series" : "movie"
  };
  try {
    const html = await fetchHtml(ref);
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
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
  } catch (_) {
  }
  return item;
}
async function episodes(ref) {
  log(`episodes(${ref})`);
  const d = await details(ref);
  const eps = [];
  try {
    const html = await fetchHtml(ref);
    const matches = html.matchAll(/<a[^>]+href=["']([^"']*(?:\/temporada-(\d+)\/episodio-(\d+)[^"']*))["'][^>]*>([\s\S]*?)<\/a>/gi);
    const seen = /* @__PURE__ */ new Set();
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
        poster: d.poster
      });
    }
  } catch (err) {
    log(`episodes() error: ${err.message}`);
  }
  return {
    series: { title: d.title, ref },
    episodes: eps
  };
}
async function resolve(ref) {
  log(`resolve(${ref})`);
  const d = await details(ref).catch(() => ({ title: "" }));
  const title = d.title || ref.split("/").filter(Boolean).pop() || "";
  try {
    const html = await fetchHtml(ref);
    const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
    for (const u of iframes) {
      const streamMatch = u.match(/https?:[^"'\\s]+\.m3u8[^"'\\s]*/i);
      if (streamMatch) {
        return {
          url: streamMatch[0],
          mime: "application/x-mpegURL",
          headers: { Referer: ref }
        };
      }
    }
  } catch (_) {
  }
  if (title) {
    log(`activando fallback para "${title}"...`);
    const fb = await resolveFallback(title);
    if (fb) {
      log(`fallback resuelto con \xE9xito: ${fb.url}`);
      return fb;
    }
  }
  throw new Error("No se pudo obtener un stream reproducible para este t\xEDtulo en HDFull");
}
export {
  browse,
  details,
  episodes,
  home,
  resolve,
  screen,
  screenEvent,
  search
};
