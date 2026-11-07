// src/browse/model.js
var TAB_IDS = ["inicio", "peliculas", "series"];
function cardOf(x) {
  if (!x) return null;
  const ref = x.ref || x.url || x.id || "";
  const title = String(x.title || "").trim();
  const kind = x.kind === "series" || ref.includes("/serie/") ? "series" : "movie";
  return {
    id: x.id || ref,
    ref,
    title,
    kind,
    poster: x.poster || x.art || "",
    backdrop: x.backdrop || x.art || x.poster || "",
    year: x.year,
    overview: x.overview || ""
  };
}
function tabOf(page) {
  if (!page || !Array.isArray(page.rows)) return null;
  const rails = [];
  const slides = [];
  for (const r of page.rows) {
    const items = (Array.isArray(r.items) ? r.items : []).map(cardOf).filter(Boolean);
    if (!items.length) continue;
    rails.push({
      id: r.id || r.ref || "rail",
      title: r.title || "Destacados",
      items
    });
    if (!slides.length && items.length) {
      slides.push(items[0]);
    }
  }
  return { slides, rails };
}

// src/browse/logo.js
var LOGO_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAABZVBMVEVMaXESEhISEhIPDw8SEhISEhISEhISEhISEhISEhIPDw8QEBAUFBQcHBwSEhIREREAAAAREREREREREREREREQEBAZGRkRERESEhISEhIRERESEhIRERESEhIPDw8QEBAREREPDw8SEhISEhISEhIRERERERESEhIRERESEhIQEBARERERERESEhISEhIRERESEhIAAAAPDw8RERERERERERESEhISEhISEhISEhITExMQEBASEhISEhISEhISEhISEhISEhIRERESEhITExMSEhISEhIRERERERETExMSEhIREREREREREREPDw8SEhITExMSEhIRERERERERERERERERERESEhIRERERERERERESEhISEhISEhIRERERERERERESEhIAAAAXFxcUFBQNDQ0ODg4SEhIRERESEhISEhIQEBARERERERESEhISEhIRERERERERERERERESEhLlCRT///8IwVn6AAAAdHRSTlMAs/gw/N22+f79ID4zCe6RB+WizOY/CoCMDuf7Hu0xL/YhiOA4jo/QaH099y1U7OhRBhDkkyzr8LLvTy5SldHStM/YwUA3wtlmNXy+ZQ8iqjTOza7xkDypHSutuJm3y8rjNgULMhMjHHd+eR+BZ296v9fWvVHVmbwAAAAJcEhZcwAACxMAAAsTAQCanBgAAAL8SURBVHja7d1nU1pRGATgg9RLkS4IFkSxgLEba4zGrum9997LG39/CEElSCcOZye7X+STs8/MFe5c9axSldKxMZyyrVjb7dKC2NutK7bUp3CHajADka2WFD8BWY9s1t/+7ttt0Sj9ydd11e8NWESzGKZnNdd3PxItY+upqf6U1yKaxgi8qt7/zLhonNhylfo+r2iegKdS/75ron2CzvL9Z6cFIDFzuf7hOYHIgqtM/4yAJFFSMNouMLlZ4irqCwlQ/Cd+kn3XBSpBXxHgnIDFW/T5K3CZKOzfGcIDjE8hX0C/c6vg/tmCCLAcv5c+EMiYDvv3ODAB4s4DboD2lyv5z2ADFWB8yAHeCWy+5AAXcAHbuedXApzdLOAjMmAkC9hCBuxnn9+2IQPaPGpDoONSw9iAi2oQGxBVNmyASZ3HBgypfmyAVXVjA84qOzagTQl4CCCAAAIIIIAAAk4X8LOFIYAAAggggAACCCCAAAIIIIAAAv5nwOkRtXkuRAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTwL7YIIIAAAggggAACCCCAAAIIIIAAzf+LSXi6DQEEEEAAAQQQAAqAPzQY/thm+IOz4Y8uhz88Hv74fvgBhTA2IA0+IpLJDp2uIwN+ZHdoIsiAvSxgs+nvcpBPI6/kHyySNT0mdXD0pf5XzeV7bg1rBBfwPgdwGqgAo+vPJNx9VMCd/Caf2YEJcLw8nEW0YQLmj3YpeyyIgPjS8TToDCIgVTgu68cDxC4VzuMuwwEci38PFM+g3UoMFk9cB7Hu4h5PFo90O/1I/ae7Ts6kzwLNvM/1lhqqdyVQ+iduq5IZGMPov5BWZXLvKUL/UK8qGyfAe9GTLlUhz5O6z10/nFSVMxHSub5/UVXNi2Rc1/pxb6eqJeZVLa8jx/ySqjWjAYtu9Q3TVVVP3nwe0qn+t8hlVXd2R75q8dw0s7/nVg3G49qJrq5Zu1vym0D7mHXNFN1JeypW/AW5ZhKkywsGngAAAABJRU5ErkJggg==";

// src/browse/view.js
function renderView({ state = {}, device = "tv", focusId, route }) {
  const currentTab = state.tab || "inicio";
  const navItems = [
    { id: "tab-inicio", label: "Inicio", icon: "home", selected: currentTab === "inicio" },
    { id: "tab-peliculas", label: "Pel\xEDculas", icon: "movie", selected: currentTab === "peliculas" },
    { id: "tab-series", label: "Series", icon: "tv", selected: currentTab === "series" }
  ];
  const appBar = {
    type: "AppBar",
    title: "HDFull",
    leading: {
      type: "Image",
      src: LOGO_DATA,
      width: 32,
      height: 32
    },
    actions: [
      {
        type: "IconButton",
        icon: "refresh",
        tooltip: "Volver a iniciar sesi\xF3n o actualizar cookies",
        onPressed: { event: "hdfull.login" }
      }
    ]
  };
  const body = [];
  body.push({
    type: "Row",
    padding: { top: 8, bottom: 16, left: 16, right: 16 },
    gap: 12,
    children: navItems.map((item) => ({
      type: "FilterChip",
      id: item.id,
      label: item.label,
      selected: item.selected,
      leading: { type: "Icon", name: item.icon, size: 18 },
      onPressed: { event: "nav.tab", tab: item.id.replace("tab-", "") }
    }))
  });
  const tabData = state.tabs?.[currentTab] || { slides: [], rails: [] };
  if (!tabData.slides?.length && !tabData.rails?.length) {
    if (state.pending?.includes(currentTab)) {
      body.push({
        type: "Center",
        padding: 48,
        child: {
          type: "Column",
          crossAxisAlignment: "center",
          gap: 16,
          children: [
            { type: "CircularProgressIndicator", size: 36 },
            { type: "Text", text: "Cargando cat\xE1logo de HDFull...", color: "muted" }
          ]
        }
      });
    } else {
      body.push({
        type: "Center",
        padding: 48,
        child: {
          type: "Column",
          crossAxisAlignment: "center",
          gap: 16,
          children: [
            { type: "Icon", name: "lock_clock", size: 48, color: "warning" },
            { type: "Text", text: "Sesi\xF3n de Cloudflare o HDFull expirada", style: "h2" },
            {
              type: "Text",
              text: "Cloudflare o HDFull requieren renovar las cookies seguras para acceder al cat\xE1logo.",
              color: "muted",
              textAlign: "center"
            },
            {
              type: "Button",
              label: "Renovar sesi\xF3n en el navegador",
              onPressed: { event: "hdfull.login" },
              autofocus: true
            }
          ]
        }
      });
    }
    return {
      type: "Scaffold",
      appBar,
      body: {
        type: "SingleChildScrollView",
        children: body
      }
    };
  }
  const hero = tabData.slides[0];
  if (hero) {
    body.push({
      type: "HeroCard",
      id: hero.id,
      title: hero.title,
      backdrop: hero.backdrop || hero.poster,
      poster: hero.poster,
      overview: hero.overview,
      year: hero.year,
      action: {
        id: `play-${hero.id}`,
        label: "Reproducir",
        icon: "play_arrow",
        action: { event: "play", ref: hero.ref, id: hero.id }
      },
      secondaryAction: {
        id: `info-${hero.id}`,
        label: "Detalles",
        icon: "info",
        action: { event: "details", ref: hero.ref, id: hero.id }
      }
    });
  }
  for (const rail of tabData.rails) {
    if (!rail.items?.length) continue;
    body.push({
      type: "TitleRail",
      id: `rail-${rail.id}`,
      title: rail.title,
      items: rail.items.map((card) => ({
        id: card.id,
        title: card.title,
        poster: card.poster,
        year: card.year,
        kind: card.kind,
        action: { event: "details", ref: card.ref, id: card.id }
      }))
    });
  }
  return {
    type: "Scaffold",
    appBar,
    body: {
      type: "SingleChildScrollView",
      children: body
    }
  };
}

// src/browse/index.js
var TAB_KEY = "hdfull_tab";
function makeBrowse({ kino: kino2, loadTab: loadTab2, searchTitles }) {
  const cache = /* @__PURE__ */ new Map();
  function getStoredTab() {
    try {
      const t = kino2?.storage?.get(TAB_KEY);
      return TAB_IDS.includes(t) ? t : "inicio";
    } catch (_) {
      return "inicio";
    }
  }
  function storeTab(t) {
    try {
      kino2?.storage?.set(TAB_KEY, t);
    } catch (_) {
    }
  }
  function view(ctx) {
    const st = ctx?.state && typeof ctx.state === "object" ? ctx.state : {};
    const tab = TAB_IDS.includes(st.tab) ? st.tab : getStoredTab();
    const tabsData = {
      inicio: cache.get("inicio") || { slides: [], rails: [] },
      peliculas: cache.get("peliculas") || { slides: [], rails: [] },
      series: cache.get("series") || { slides: [], rails: [] }
    };
    return renderView({
      state: { ...st, tab, tabs: tabsData },
      device: ctx?.device || "tv",
      route: ctx?.route
    });
  }
  async function load(tab) {
    try {
      const page = await loadTab2(tab);
      const data = tabOf(page);
      if (data && (data.slides.length || data.rails.length)) {
        cache.set(tab, data);
        return true;
      }
    } catch (e) {
      console.log(`[HDFull Browse] error cargando ${tab}:`, e.message);
    }
    return false;
  }
  async function event(ev) {
    const name = ev?.name;
    const st = ev?.state && typeof ev.state === "object" ? ev.state : {};
    const currentTab = TAB_IDS.includes(st.tab) ? st.tab : getStoredTab();
    if (name === "open") {
      const pending = [currentTab, ...TAB_IDS.filter((t) => t !== currentTab && !cache.has(t))];
      return {
        state: { tab: currentTab, pending },
        view: view({ state: { tab: currentTab, pending }, device: ev.device })
      };
    }
    if (name === "nav.tab") {
      const target = TAB_IDS.includes(ev.tab) ? ev.tab : "inicio";
      storeTab(target);
      const pending = cache.has(target) ? [] : [target];
      return {
        state: { tab: target, pending },
        view: view({ state: { tab: target, pending }, device: ev.device })
      };
    }
    if (name === "tick") {
      const pending = Array.isArray(st.pending) ? [...st.pending] : [];
      if (!pending.length) return null;
      const next = pending.shift();
      await load(next);
      return {
        state: { ...st, pending },
        view: view({ state: { ...st, pending }, device: ev.device })
      };
    }
    return null;
  }
  return { view, event };
}

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
var VERSION = "1.0.3";
var PREFIX = `[HDFull v${VERSION}]`;
var LOGIN_URL = `${BASE_URL}/login`;
console.log(`${PREFIX} Creado por JuandreXter`);
var log = (...x) => console.log(PREFIX, ...x);
var b;
function app() {
  return b || (b = makeBrowse({
    kino: typeof kino !== "undefined" ? kino : null,
    loadTab,
    searchTitles: async (q) => (await search({ q })).items
  }));
}
async function loadTab(t) {
  log(`loadTab("${t}")`);
  if (t === "inicio") return { rows: await home() };
  const r = await browse(t, "1");
  return { rows: [{ id: t, title: t === "peliculas" ? "Pel\xEDculas" : "Series", ref: t, items: r.items }] };
}
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
async function screen(ctx) {
  log("screen(): comprobando sesi\xF3n");
  if (!isAuthorized()) return loginView();
  return app().view(ctx || {});
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
      b = null;
      return {
        view: await screen(),
        state: { loggedIn: true },
        message: "Sesi\xF3n vinculada con \xE9xito"
      };
    }
    if (result.status === "timeout") {
      return { view: loginView(), message: "El inicio de sesi\xF3n tard\xF3 demasiado. Int\xE9ntalo otra vez." };
    }
    return { view: loginView() };
  }
  if (e.name === "hdfull.loggedIn") {
    b = null;
    return { view: await screen(), state: { loggedIn: true }, message: "Sesi\xF3n vinculada con \xE9xito" };
  }
  if (isAuthorized()) {
    return app().event(e);
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
