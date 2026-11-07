// src/browse/model.js
var TAB_IDS = ["inicio", "peliculas", "series"];
var MAX_SLIDES = 6;
var MAX_RAILS = 8;
var MAX_RAIL_ITEMS = 24;
var MAX_SLIDE_TEXT = 160;
var HTTPS = /^https?:\/\//;
function cardOf(item) {
  if (!item) return null;
  const out = {
    id: `${item.kind || "movie"}-${item.id}`,
    ref: item.ref,
    title: item.title,
    kind: item.kind || "movie"
  };
  const poster = item.poster || item.art || item.logo;
  if (poster && HTTPS.test(poster)) out.poster = poster;
  if (item.backdrop && HTTPS.test(item.backdrop)) out.backdrop = item.backdrop;
  if (item.rating !== void 0) out.rating = item.rating;
  if (item.year !== void 0) out.year = item.year;
  if (item.badges && Array.isArray(item.badges)) out.badges = item.badges.slice(0, 3);
  return out;
}
function slidesOf(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") continue;
    const img = it.backdrop || it.image || it.poster || it.art;
    if (!img || !HTTPS.test(img)) continue;
    if (!it.ref || typeof it.ref !== "string") continue;
    const title = typeof it.title === "string" ? it.title : "";
    const rawTxt = typeof it.text === "string" ? it.text : typeof it.overview === "string" ? it.overview : "";
    const text = rawTxt.length > MAX_SLIDE_TEXT ? rawTxt.slice(0, MAX_SLIDE_TEXT - 1).trim() + "\u2026" : rawTxt;
    const s = {
      id: `${it.kind || "movie"}-${it.id || title}`,
      ref: it.ref,
      kind: it.kind || "movie",
      title,
      image: img,
      text
    };
    if (it.logo && HTTPS.test(it.logo)) s.logo = it.logo;
    out.push(s);
    if (out.length >= MAX_SLIDES) break;
  }
  return out;
}
function railsOf(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const itemsRaw = Array.isArray(row.items) ? row.items : [];
    const items = itemsRaw.map(cardOf).filter(Boolean).slice(0, MAX_RAIL_ITEMS);
    if (items.length === 0) continue;
    out.push({
      id: String(row.id || row.ref || out.length),
      title: String(row.title || ""),
      ref: typeof row.ref === "string" ? row.ref : void 0,
      items
    });
    if (out.length >= MAX_RAILS) break;
  }
  return out;
}
function tabOf(page) {
  if (!page || typeof page !== "object") return null;
  const rows = Array.isArray(page.rows) ? page.rows : [];
  const explicitSlides = Array.isArray(page.slides) ? page.slides : [];
  let slides = slidesOf(explicitSlides);
  let rails = railsOf(rows);
  if (slides.length === 0 && rails.length > 0) {
    const first = rails[0];
    const rest = rails.slice(1);
    const promoted = first.items.filter((i) => i.backdrop || i.poster).slice(0, MAX_SLIDES);
    if (promoted.length > 0) {
      slides = slidesOf(promoted.map((c) => ({ ...c, image: c.backdrop || c.poster })));
      rails = rest;
    }
  }
  return { slides, rails };
}
function playedKey(ref) {
  const r = String(ref || "");
  const m = /\/(?:pelicula|serie|episodio)\/([^\/\?#]+)/.exec(r) || /hdfull\.autos\/[^\/]+\/([^\/\?#]+)/.exec(r);
  return m ? m[1] : "";
}
function recentOf(keys, loadedTabs) {
  if (!Array.isArray(keys) || keys.length === 0) return [];
  const pool = /* @__PURE__ */ new Map();
  for (const tab of loadedTabs) {
    if (!tab) continue;
    for (const r of tab.rails) {
      for (const c of r.items) {
        const k = playedKey(c.ref);
        if (k && !pool.has(k)) pool.set(k, c);
      }
    }
    for (const s of tab.slides) {
      const k = playedKey(s.ref);
      if (k && !pool.has(k)) {
        pool.set(k, {
          id: s.id,
          ref: s.ref,
          kind: s.kind,
          title: s.title,
          poster: s.image,
          backdrop: s.image
        });
      }
    }
  }
  const out = [];
  for (const k of keys) {
    const hit = pool.get(k);
    if (hit) out.push(hit);
  }
  return out;
}

// src/browse/words.js
var WORDS_RAW = {
  appName: ["HDFull", "HDFull"],
  tabHome: ["Inicio", "Home"],
  tabMovies: ["Pel\xEDculas", "Movies"],
  tabSeries: ["Series", "Series"],
  tabAnime: ["Animaci\xF3n", "Animation"],
  recentRail: ["Continuar viendo", "Continue Watching"],
  emptyTitle: ["Sin contenido todav\xEDa", "No content yet"],
  emptySub: ["Vuelve a intentarlo en unos instantes.", "Try again in a few moments."],
  failedTitle: ["No se pudo cargar", "Could not load"],
  failedSub: ["Comprueba la conexi\xF3n e int\xE9ntalo de nuevo.", "Check your connection and try again."],
  btnRetry: ["Reintentar", "Retry"],
  btnSearch: ["Buscar", "Search"],
  btnSettings: ["Ajustes", "Settings"],
  brSearchTitle: ["Buscar en HDFull", "Search HDFull"],
  brSearchHint: ["Pel\xEDcula, serie o t\xEDtulo...", "Movie, series or title..."],
  brRecentSearches: ["B\xFAsquedas recientes", "Recent searches"],
  brNoResults: ["Sin resultados para esta b\xFAsqueda.", "No results for this search."],
  brSearching: ["Buscando en HDFull...", "Searching HDFull..."],
  brTypeToSearch: ["Escribe un t\xEDtulo para empezar a buscar.", "Type a title to start searching."],
  setLangTitle: ["Idioma de audio preferido", "Preferred Audio Language"],
  setLangDesc: ["Prioridad al seleccionar servidores de reproducci\xF3n autom\xE1tica.", "Priority when selecting auto-play servers."],
  setLangLatino: ["Espa\xF1ol Latino", "Latin Spanish"],
  setLangCastellano: ["Castellano (Espa\xF1a)", "Castilian (Spain)"],
  setLangSub: ["Subtitulado", "Subtitled"],
  aboutTitle: ["Acerca de HDFull", "About HDFull"],
  aboutDesc: ["Cat\xE1logo y reproducci\xF3n de HDFull para Kino.", "Official HD catalog and playback plugin for Kino."],
  aboutAuthor: ["Creado por JuandreXter", "Created by JuandreXter"],
  aboutVersion: ["Versi\xF3n 1.0.4", "Version 1.0.4"],
  watchNow: ["Reproducir", "Play"],
  moreInfo: ["Ver detalles", "More details"],
  brWatch: ["Reproducir", "Play"],
  brInfo: ["Ver detalles", "Details"],
  brSettings: ["Ajustes", "Settings"],
  brClose: ["Cerrar", "Close"],
  brSearch: ["Buscar", "Search"],
  brRecent: ["Continuar viendo", "Continue watching"],
  brEmpty: ["No hay contenido disponible.", "No content available."],
  brFailed: ["No se pudo cargar el contenido.", "Could not load content."],
  brRetry: ["Reintentar", "Retry"]
};
var WORDS = Object.fromEntries(
  Object.entries(WORDS_RAW).map(([k, [es, en]]) => [
    k,
    { id: k, es, en, text: es, textEn: en }
  ])
);
function both(key, vars = {}) {
  const w = WORDS[key] || { id: key, es: key, en: key };
  let es = w.es;
  let en = w.en;
  for (const [k, v] of Object.entries(vars)) {
    es = es.replaceAll(`{${k}}`, v);
    en = en.replaceAll(`{${k}}`, v);
  }
  return { id: w.id, es, en, text: es, textEn: en };
}

// src/browse/logo.js
var LOGO_ASPECT = "1:1";
var LOGO_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAABZVBMVEVMaXESEhISEhIPDw8SEhISEhISEhISEhISEhISEhIPDw8QEBAUFBQcHBwSEhIREREAAAAREREREREREREREREQEBAZGRkRERESEhISEhIRERESEhIRERESEhIPDw8QEBAREREPDw8SEhISEhISEhIRERERERESEhIRERESEhIQEBARERERERESEhISEhIRERESEhIAAAAPDw8RERERERERERESEhISEhISEhISEhITExMQEBASEhISEhISEhISEhISEhISEhIRERESEhITExMSEhISEhIRERERERETExMSEhIREREREREREREPDw8SEhITExMSEhIRERERERERERERERERERESEhIRERERERERERESEhISEhISEhIRERERERERERESEhIAAAAXFxcUFBQNDQ0ODg4SEhIRERESEhISEhIQEBARERERERESEhISEhIRERERERERERERERESEhLlCRT///8IwVn6AAAAdHRSTlMAs/gw/N22+f79ID4zCe6RB+WizOY/CoCMDuf7Hu0xL/YhiOA4jo/QaH099y1U7OhRBhDkkyzr8LLvTy5SldHStM/YwUA3wtlmNXy+ZQ8iqjTOza7xkDypHSutuJm3y8rjNgULMhMjHHd+eR+BZ296v9fWvVHVmbwAAAAJcEhZcwAACxMAAAsTAQCanBgAAAL8SURBVHja7d1nU1pRGATgg9RLkS4IFkSxgLEba4zGrum9997LG39/CEElSCcOZye7X+STs8/MFe5c9axSldKxMZyyrVjb7dKC2NutK7bUp3CHajADka2WFD8BWY9s1t/+7ttt0Sj9ydd11e8NWESzGKZnNdd3PxItY+upqf6U1yKaxgi8qt7/zLhonNhylfo+r2iegKdS/75ron2CzvL9Z6cFIDFzuf7hOYHIgqtM/4yAJFFSMNouMLlZ4irqCwlQ/Cd+kn3XBSpBXxHgnIDFW/T5K3CZKOzfGcIDjE8hX0C/c6vg/tmCCLAcv5c+EMiYDvv3ODAB4s4DboD2lyv5z2ADFWB8yAHeCWy+5AAXcAHbuedXApzdLOAjMmAkC9hCBuxnn9+2IQPaPGpDoONSw9iAi2oQGxBVNmyASZ3HBgypfmyAVXVjA84qOzagTQl4CCCAAAIIIIAAAk4X8LOFIYAAAggggAACCCCAAAIIIIAAAv5nwOkRtXkuRAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTwL7YIIIAAAggggAACCCCAAAIIIIAAzf+LSXi6DQEEEEAAAQQQAAqAPzQY/thm+IOz4Y8uhz88Hv74fvgBhTA2IA0+IpLJDp2uIwN+ZHdoIsiAvSxgs+nvcpBPI6/kHyySNT0mdXD0pf5XzeV7bg1rBBfwPgdwGqgAo+vPJNx9VMCd/Caf2YEJcLw8nEW0YQLmj3YpeyyIgPjS8TToDCIgVTgu68cDxC4VzuMuwwEci38PFM+g3UoMFk9cB7Hu4h5PFo90O/1I/ae7Ts6kzwLNvM/1lhqqdyVQ+iduq5IZGMPov5BWZXLvKUL/UK8qGyfAe9GTLlUhz5O6z10/nFSVMxHSub5/UVXNi2Rc1/pxb6eqJeZVLa8jx/ySqjWjAYtu9Q3TVVVP3nwe0qn+t8hlVXd2R75q8dw0s7/nVg3G49qJrq5Zu1vym0D7mHXNFN1JeypW/AW5ZhKkywsGngAAAABJRU5ErkJggg==";

// src/browse/view.js
var TAB_KEYS = {
  inicio: "tabHome",
  peliculas: "tabMovies",
  series: "tabSeries",
  animacion: "tabAnime",
  anime: "tabAnime"
};
var POLL_MS = 1500;
var SEARCH_CAP = 60;
var twin = (key, field = "text", vars) => {
  const w = both(key, vars);
  return { [field]: w.es, [field + "En"]: w.en };
};
var logo = () => ({
  type: "Image",
  key: "logo",
  url: LOGO_DATA,
  aspect: LOGO_ASPECT,
  fit: "contain",
  h: 40,
  alt: "HDFull",
  altEn: "HDFull",
  fallback: { type: "Text", text: "HDFull", textEn: "HDFull", style: "h4" }
});
var tabBar = (active) => ({
  type: "TabBar",
  key: "tabs",
  divider: false,
  value: active,
  onChanged: "tab",
  tabs: TAB_IDS.map((id) => ({ value: id, ...twin(TAB_KEYS[id], "label") }))
});
var railSkeleton = (n) => ({
  type: "Column",
  key: "skel" + n,
  gap: 8,
  children: [
    { type: "Skeleton", shape: "line" },
    { type: "Row", gap: 12, sizes: ["compact"], children: [1, 2, 3].map((i) => ({ type: "Skeleton", shape: "card", key: `sk${n}c${i}`, flex: 1 })) },
    { type: "Row", gap: 12, sizes: ["medium", "expanded"], children: [1, 2, 3, 4, 5, 6].map((i) => ({ type: "Skeleton", shape: "card", key: `sk${n}w${i}`, flex: 1 })) }
  ]
});
var gridSkeleton = () => ({
  type: "Column",
  key: "gridSkeleton",
  gap: 12,
  children: [
    ...[1, 2].map((r) => ({ type: "Row", gap: 12, sizes: ["compact"], key: `gc${r}`, children: [1, 2, 3].map((i) => ({ type: "Skeleton", shape: "card", key: `gc${r}-${i}`, flex: 1 })) })),
    ...[1, 2].map((r) => ({ type: "Row", gap: 12, sizes: ["medium", "expanded"], key: `gw${r}`, children: [1, 2, 3, 4, 5, 6].map((i) => ({ type: "Skeleton", shape: "card", key: `gw${r}-${i}`, flex: 1 })) }))
  ]
});
var heroSkeleton = () => ({
  type: "Skeleton",
  key: "heroSkeleton",
  shape: "block",
  height: { compact: 200, expanded: 320 }
});
var slideNode = (s) => ({
  type: "heroCard",
  key: "slide-" + s.id,
  h: { compact: 200, expanded: 240 },
  title: s.title,
  text: s.text,
  image: s.image,
  ...s.logo ? { logo: s.logo } : {},
  buttons: [
    {
      type: "ElevatedButton",
      key: "watch-" + s.id,
      ...twin("brWatch", "labelText"),
      icon: "play",
      onPressed: { go: { play: { ref: s.ref, kind: s.kind, id: s.id, title: s.title } } }
    },
    {
      type: "TextButton",
      key: "info-" + s.id,
      ...twin("brInfo", "labelText"),
      onPressed: { go: { title: { ref: s.ref, kind: s.kind, id: s.id, title: s.title } } }
    }
  ]
});
var hero = (slides) => slides.length === 1 ? slideNode(slides[0]) : {
  type: "PageView",
  key: "hero" + slides.length,
  autoPlayMs: 6e3,
  children: slides.map(slideNode)
};
var rail = (r, key, titleOverride, size = "medium") => ({
  type: "titleRail",
  key,
  ...titleOverride || { title: r.title },
  ...r.ref ? { ref: r.ref } : {},
  items: r.items,
  size
});
function browseView({ tab, data, recent, pending, failed, device = "phone" }) {
  const tv = device === "tv";
  const gear = {
    type: "IconButton",
    key: "settingsButton",
    icon: "settings",
    ...twin("brSettings", "labelText"),
    ...twin("brSettings", "tooltip"),
    onPressed: { event: "go", arg: "settings" }
  };
  const active = TAB_IDS.includes(tab) ? tab : TAB_IDS[0];
  const body = [];
  if (data) {
    if (data.slides.length > 0) body.push(hero(data.slides));
    else if (pending) body.push(heroSkeleton());
    if (recent && recent.length > 0) body.push(rail({ items: recent }, "recent", twin("brRecent", "title"), tv ? "small" : "medium"));
    for (const r of data.rails) {
      body.push(rail(r, "rail-" + String(r.id).replace(/[^A-Za-z0-9_-]/g, "_"), null, tv ? "small" : "medium"));
    }
    if (data.rails.length === 0) {
      body.push({ type: "Text", ...twin("brEmpty", "text"), color: "muted" });
    }
  } else if (failed) {
    body.push({
      type: "MaterialBanner",
      key: "loadFailed",
      role: "error",
      ...twin("brFailed"),
      action: { ...twin("brRetry", "label"), onTap: "retry" }
    });
  } else {
    body.push(heroSkeleton(), railSkeleton(1), railSkeleton(2), railSkeleton(3));
  }
  return {
    type: "Scaffold",
    appBar: {
      type: "AppBar",
      mergeWithKinoBar: true,
      dense: true,
      divider: false,
      leading: {
        type: "IconButton",
        key: "close",
        icon: "close",
        ...twin("brClose", "labelText"),
        ...twin("brClose", "tooltip"),
        onPressed: { go: { close: true } }
      },
      actions: tv ? [
        {
          type: "IconButton",
          key: "searchButton",
          icon: "search",
          ...twin("brSearch", "labelText"),
          ...twin("brSearch", "tooltip"),
          onPressed: "openSearch"
        },
        gear
      ] : [gear],
      title: tv ? {
        type: "Row",
        key: "titleRow",
        gap: 24,
        crossAxisAlignment: "center",
        children: [logo(), tabBar(active)]
      } : logo()
    },
    ...tv ? {} : {
      floatingActionButton: {
        type: "FloatingActionButton",
        key: "searchFab",
        icon: "search",
        ...twin("brSearch", "tooltip"),
        onPressed: "openSearch"
      }
    },
    body: {
      type: "Column",
      key: "page",
      children: [
        ...tv ? [] : [
          {
            type: "Column",
            key: "tabsRow",
            padding: { compact: 0, expanded: 24 },
            children: [tabBar(active)]
          }
        ],
        {
          type: "SingleChildScrollView",
          key: "browse-" + active,
          flex: 1,
          children: [
            {
              type: "Column",
              padding: { compact: 12, expanded: 24 },
              gap: 16,
              children: body
            }
          ]
        }
      ]
    },
    ...pending ? { every: { ms: POLL_MS, event: "tick" } } : {}
  };
}
function settingsView() {
  return {
    type: "Scaffold",
    appBar: {
      type: "AppBar",
      mergeWithKinoBar: true,
      dense: true,
      divider: false,
      leading: {
        type: "IconButton",
        key: "back",
        icon: "arrow_back",
        ...twin("brBack", "labelText"),
        ...twin("brBack", "tooltip"),
        onPressed: "back"
      },
      title: logo()
    },
    body: {
      type: "SingleChildScrollView",
      key: "settings-page",
      children: [
        {
          type: "Column",
          padding: { compact: 12, expanded: 24 },
          gap: 16,
          children: [{ type: "settings", key: "form" }]
        }
      ]
    }
  };
}
function searchView({ query, status, items, history = [], device = "phone" }) {
  const tv = device === "tv";
  const searchForm = () => ({
    type: "Form",
    key: "searchForm",
    onSubmitted: "search",
    gap: 8,
    children: tv ? [
      {
        type: "Row",
        key: "searchRow",
        gap: 16,
        crossAxisAlignment: "center",
        children: [
          {
            type: "TextField",
            key: "q",
            kind: "text",
            value: query,
            ...twin("brSearchHint", "labelText"),
            maxLength: 100,
            autofocus: true,
            weight: 1
          },
          {
            type: "ElevatedButton",
            key: "searchGo",
            ...twin("brSearch", "labelText"),
            icon: "search",
            submit: true
          }
        ]
      }
    ] : [
      {
        type: "TextField",
        key: "q",
        kind: "text",
        value: query,
        ...twin("brSearchHint", "labelText"),
        maxLength: 100,
        autofocus: true
      },
      {
        type: "ElevatedButton",
        key: "searchGo",
        ...twin("brSearch", "labelText"),
        icon: "search",
        submit: true
      }
    ]
  });
  const body = tv ? [] : [searchForm()];
  if (status === "fail") {
    body.push({
      type: "MaterialBanner",
      key: "searchFailed",
      role: "error",
      ...twin("brSearchFailed"),
      action: { ...twin("brRetry", "label"), onTap: "sretry" }
    });
  } else if (status === "done" && items) {
    if (items.length === 0) {
      body.push({ type: "Text", ...twin("brNoResults", "text"), color: "muted" });
    } else {
      body.push({
        type: "titleGrid",
        key: "results",
        columns: { compact: 3, expanded: 6 },
        items: items.slice(0, SEARCH_CAP)
      });
    }
  } else if (status !== "idle") {
    body.push(gridSkeleton());
  } else if (history && history.length > 0) {
    body.push({ type: "Text", ...twin("brSearchedBefore", "text"), style: "h4" });
    body.push({
      type: "titleGrid",
      key: "history",
      columns: { compact: 3, expanded: 6 },
      items: history.slice(0, SEARCH_CAP)
    });
  }
  return {
    type: "Scaffold",
    appBar: {
      type: "AppBar",
      mergeWithKinoBar: true,
      dense: true,
      divider: false,
      leading: {
        type: "IconButton",
        key: "back",
        icon: "arrow_back",
        ...twin("brBack", "labelText"),
        ...twin("brBack", "tooltip"),
        onPressed: "back"
      },
      ...tv ? { title: searchForm() } : twin("brSearchTitle", "title")
    },
    body: {
      type: "SingleChildScrollView",
      key: "search-page",
      children: [
        {
          type: "Column",
          padding: { compact: 12, expanded: 24 },
          gap: 16,
          children: body
        }
      ]
    },
    ...status === "loading" ? { every: { ms: 1e3, event: "stick" } } : {}
  };
}

// src/browse/metaCache.js
var KEY = "hdfull_meta1";
var MAX = 260;
var CONCURRENCY = 3;
var HTTPS2 = /^https?:\/\//;
function makeMetaCache({ kino: kino2, clock = { now: () => Date.now() } }) {
  const usable = () => {
    try {
      return typeof kino2.meta === "function" && kino2.meta.byTitle === true;
    } catch (_) {
      return false;
    }
  };
  let book = null;
  function read() {
    if (book) return book;
    try {
      const o = JSON.parse(kino2.storage.get(KEY) || "null");
      book = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch (_) {
      book = {};
    }
    return book;
  }
  function write() {
    try {
      const ids = Object.keys(book);
      if (ids.length > MAX) {
        for (const id of ids.slice(0, ids.length - MAX)) delete book[id];
      }
      kino2.storage.set(KEY, JSON.stringify(book));
    } catch (_) {
    }
  }
  function known(id) {
    const e = read()[id];
    if (!e) return {};
    return {
      ...e.t > 0 ? { tmdb: e.t } : {},
      ...e.l && HTTPS2.test(e.l) ? { logo: e.l } : {},
      ...e.b && HTTPS2.test(e.b) ? { backdrop: e.b } : {},
      ...e.o ? { overview: e.o } : {}
    };
  }
  const asked = (id) => Object.hasOwn(read(), id);
  function dress(cards) {
    return cards.map((c) => {
      const k = known(c.id);
      const withId = k.tmdb && !(c.ids && c.ids.tmdb) ? { ...c, ids: { ...c.ids || {}, tmdb: k.tmdb } } : c;
      const withBackdrop = k.backdrop && !withId.backdrop ? { ...withId, backdrop: k.backdrop } : withId;
      return k.logo && !withBackdrop.logo ? { ...withBackdrop, logo: k.logo } : withBackdrop;
    });
  }
  async function fill(cards, budgetMs) {
    if (!usable()) return 0;
    const start = clock.now();
    let count = 0;
    const pending = cards.filter((c) => !asked(c.id));
    for (let i = 0; i < pending.length; i += CONCURRENCY) {
      if (clock.now() - start >= budgetMs) break;
      const slice = pending.slice(i, i + CONCURRENCY);
      await Promise.all(
        slice.map(async (c) => {
          try {
            const type = c.kind === "series" ? "series" : "movie";
            const yearNum = c.year ? parseInt(c.year, 10) : void 0;
            const res = await kino2.meta({
              type,
              title: c.title,
              ...yearNum && yearNum > 1900 ? { year: yearNum } : {}
            });
            count++;
            if (!res) {
              read()[c.id] = { t: 0, l: "" };
            } else {
              const tmdbId = res.ids && res.ids.tmdb || res.id || 0;
              read()[c.id] = {
                t: tmdbId,
                l: res.logo || "",
                b: res.backdrop || "",
                o: res.overview || ""
              };
            }
          } catch (_) {
          }
        })
      );
    }
    if (count > 0) write();
    return count;
  }
  return { usable, known, asked, dress, fill };
}

// src/browse/index.js
var TAB_KEY = "hdfull_browseTab";
var SNAP_PREFIX = "hdfull_browse1:";
var SNAP_TTL_MS = 12 * 3600 * 1e3;
var SNAP_MAX = 24 * 1024;
var RECENT_KEY = "hdfull_recent1";
var RECENT_MAX = 16;
var HIST_KEY = "hdfull_searchHist1";
var HIST_MAX = 24;
var MAX_META_TICKS = 30;
var MAX_LOAD_TRIES = 3;
function metaAsk(c) {
  const title = String(c.title).replace(/\s*[([][^)\]]*[)\]]/g, "").replace(/\s+/g, " ").trim() || String(c.title);
  const y = /\((19|20)\d{2}\)/.exec(String(c.title));
  return { id: c.id, title, kind: c.kind, ...y ? { year: parseInt(y[0].slice(1, 5), 10) } : {} };
}
function makeBrowse({ kino: kino2, loadTab: loadTab2, searchTitles }) {
  const meta = makeMetaCache({ kino: kino2 });
  const slidesFrom = (rails) => {
    const out = [];
    for (const r of rails) {
      for (const c of r.items) {
        if (out.length >= 6) return out;
        const k = meta.known(c.id);
        const img = k.backdrop || c.poster;
        if (!img || out.some((s) => s.id === c.id)) continue;
        out.push({
          id: c.id,
          ref: c.ref,
          kind: c.kind,
          title: c.title,
          image: img,
          text: k.overview || (c.badges ? c.badges.join(" \xB7 ") : ""),
          ...k.logo ? { logo: k.logo } : {}
        });
      }
    }
    return out;
  };
  const uniform = (items) => items.every((i) => i.backdrop) ? items : items.map(({ backdrop, ...rest }) => rest);
  const enrich = (data) => data ? {
    slides: data.slides.length > 0 ? data.slides.map((s) => {
      const k = meta.known(s.id);
      return k.logo ? { ...s, logo: k.logo } : s;
    }) : slidesFrom(data.rails),
    rails: data.rails.map((r) => ({ ...r, items: uniform(meta.dress(r.items)) }))
  } : data;
  const metaTries = /* @__PURE__ */ new Map();
  const memo = /* @__PURE__ */ new Map();
  const log2 = (...a) => {
    try {
      kino2.log("[HDFull]", ...a);
    } catch (_) {
    }
  };
  const get = (k) => {
    try {
      return kino2.storage.get(k);
    } catch (_) {
      return null;
    }
  };
  const set = (k, v, opts) => {
    try {
      kino2.storage.set(k, v, opts);
    } catch (_) {
    }
  };
  function readSnap(tab) {
    try {
      const o = JSON.parse(get(SNAP_PREFIX + tab) || "null");
      return o && Date.now() - o.at < SNAP_TTL_MS && o.data && Array.isArray(o.data.rails) ? o.data : null;
    } catch (_) {
      return null;
    }
  }
  function writeSnap(tab, data) {
    for (let max = 20; max >= 6; max -= 2) {
      try {
        const slim = {
          slides: data.slides.slice(0, 5),
          rails: data.rails.map((r) => ({ ...r, items: r.items.slice(0, max) }))
        };
        const s = JSON.stringify({ at: Date.now(), data: slim });
        if (s.length <= SNAP_MAX) {
          set(SNAP_PREFIX + tab, s);
          return;
        }
      } catch (_) {
      }
    }
  }
  function dataOf(tab) {
    const m = memo.get(tab);
    if (m) return m.data;
    const s = readSnap(tab);
    if (s) {
      memo.set(tab, { data: s, whole: false });
      return s;
    }
    return null;
  }
  const stored = () => {
    const t = get(TAB_KEY);
    return TAB_IDS.includes(t) ? t : null;
  };
  const remember = (tab) => {
    set(TAB_KEY, tab);
  };
  function readKeys() {
    try {
      const a = JSON.parse(get(RECENT_KEY) || "[]");
      return Array.isArray(a) ? a.filter((k) => typeof k === "string") : [];
    } catch (_) {
      return [];
    }
  }
  function notePlayed(ref) {
    const k = playedKey(ref);
    if (!k) return;
    const prior = readKeys().filter((x) => x !== k);
    try {
      set(RECENT_KEY, JSON.stringify([k, ...prior].slice(0, RECENT_MAX)));
    } catch (_) {
    }
  }
  function readHistory() {
    try {
      const a = JSON.parse(get(HIST_KEY) || "[]");
      return Array.isArray(a) ? a.filter((c) => c && typeof c.id === "string" && typeof c.ref === "string" && typeof c.title === "string").slice(0, HIST_MAX) : [];
    } catch (_) {
      return [];
    }
  }
  function rememberFound(cards) {
    try {
      const fresh = cards.slice(0, 12).map((c) => ({
        id: c.id,
        ref: c.ref,
        title: c.title,
        kind: c.kind,
        poster: c.poster,
        year: c.year,
        rating: c.rating
      }));
      const ids = new Set(fresh.map((c) => c.id));
      set(HIST_KEY, JSON.stringify([...fresh, ...readHistory().filter((c) => !ids.has(c.id))].slice(0, HIST_MAX)));
    } catch (_) {
    }
  }
  let found = null;
  const tabFromArgs = (route) => {
    const a = route && route.args && typeof route.args === "object" ? route.args : {};
    return TAB_IDS.includes(a.tab) ? a.tab : null;
  };
  function needed(tab, device) {
    const order = [tab, ...TAB_IDS.filter((t) => t !== tab)];
    return order.filter((t, i) => (i === 0 || device !== "tv") && !(memo.get(t) && memo.get(t).whole));
  }
  function view(ctx) {
    const st = ctx.state && typeof ctx.state === "object" ? ctx.state : {};
    if (ctx.route && ctx.route.name === "settings") return settingsView();
    if (ctx.route && ctx.route.name === "search") {
      const query = typeof st.sq === "string" ? st.sq : "";
      const items = found && found.q === query ? found.items : null;
      const status = query === "" ? "idle" : st.sstate === "fail" ? "fail" : items ? "done" : "loading";
      return searchView({ query, status, items, history: query === "" ? readHistory() : [], device: ctx.device });
    }
    const tab = TAB_IDS.includes(st.tab) ? st.tab : tabFromArgs(ctx.route) ?? stored() ?? TAB_IDS[0];
    const data = enrich(dataOf(tab));
    const loaded = TAB_IDS.map((t) => memo.get(t)).filter(Boolean).map((m) => m.data);
    const pending = Array.isArray(st.pending) && st.pending.length > 0;
    return browseView({
      tab,
      data,
      recent: uniform(meta.dress(recentOf(readKeys(), loaded))),
      pending,
      failed: !!(st.failed && st.failed[tab]),
      device: ctx.device
    });
  }
  async function load(tab) {
    const page = await loadTab2(tab);
    const data = tabOf(page);
    if (data) {
      memo.set(tab, { data, whole: true });
      writeSnap(tab, data);
    }
    return data !== null;
  }
  const loadTries = /* @__PURE__ */ new Map();
  function failLoad(tab, rest, failed) {
    const n = (loadTries.get(tab) || 0) + 1;
    loadTries.set(tab, n);
    if (n < MAX_LOAD_TRIES) rest.push(tab);
    else {
      failed[tab] = true;
      loadTries.delete(tab);
    }
  }
  const events = {
    open({ route, state, device }) {
      const tab = tabFromArgs(route) ?? (TAB_IDS.includes(state.tab) ? state.tab : stored() ?? TAB_IDS[0]);
      for (const t of TAB_IDS) dataOf(t);
      return { state: { tab, pending: needed(tab, device), failed: null } };
    },
    tab({ value, arg, state }) {
      const tab = TAB_IDS.includes(value) ? value : TAB_IDS.includes(arg) ? arg : null;
      if (!tab) return null;
      remember(tab);
      dataOf(tab);
      const failed = { ...state.failed || {} };
      delete failed[tab];
      const pending = [tab, ...Array.isArray(state.pending) ? state.pending.filter((t) => t !== tab) : []];
      return { state: { tab, pending: memo.get(tab) && memo.get(tab).whole ? pending.slice(1) : pending, failed } };
    },
    retry({ state, device }) {
      const tab = TAB_IDS.includes(state.tab) ? state.tab : TAB_IDS[0];
      return { state: { failed: null, pending: [tab, ...needed(tab, device).filter((t) => t !== tab)] } };
    },
    async tick({ state }) {
      const pending = Array.isArray(state.pending) ? state.pending : [];
      if (pending.length === 0) return null;
      const [next, ...rest] = pending;
      const failed = { ...state.failed || {} };
      if (next.startsWith("meta:")) {
        const tabId = next.slice(5);
        const m = memo.get(tabId);
        if (!m) return { state: { pending: rest } };
        const cards = [
          ...m.data.slides,
          ...m.data.rails.flatMap((r) => r.items.slice(0, 6)),
          ...m.data.rails.flatMap((r) => r.items.slice(6))
        ];
        const asked = await meta.fill(cards.map(metaAsk), 12e3);
        const made = slidesFrom(m.data.rails);
        if (made.length > m.data.slides.length) {
          m.data = { ...m.data, slides: made.map(({ logo: logo2, ...rest2 }) => rest2) };
          writeSnap(tabId, m.data);
        }
        const tries = (metaTries.get(tabId) || 0) + 1;
        metaTries.set(tabId, tries);
        if (asked > 0 && tries < MAX_META_TICKS && cards.some((c) => !meta.asked(c.id))) {
          return { state: { pending: [next, ...rest] } };
        }
        return { state: { pending: rest } };
      }
      try {
        const ok = await load(next);
        if (!ok) failLoad(next, rest, failed);
        else delete failed[next];
        if (ok && meta.usable()) rest.unshift("meta:" + next);
      } catch (e) {
        log2("browse tab error", e && e.message || "error");
        failLoad(next, rest, failed);
      }
      return { state: { pending: rest, failed } };
    },
    openSearch() {
      return { route: { push: "search" }, state: { sq: "", sstate: null } };
    },
    search({ value, route }) {
      const q = value && typeof value.q === "string" ? value.q.trim().slice(0, 100) : "";
      if (q === "") return null;
      const state = { sq: q, sstate: "loading" };
      return route && route.name === "search" ? { state } : { route: { push: "search" }, state };
    },
    async stick({ state }) {
      const q = typeof state.sq === "string" ? state.sq : "";
      if (q === "" || state.sstate !== "loading") return null;
      try {
        const out = await searchTitles(q);
        found = { q, items: (Array.isArray(out) ? out : []).slice(0, 60).map(cardOf) };
        rememberFound(found.items);
        return { state: { sstate: "done" } };
      } catch (e) {
        log2("browse search error", e && e.message || "error");
        return { state: { sstate: "fail" } };
      }
    },
    sretry({ state }) {
      return typeof state.sq === "string" && state.sq !== "" ? { state: { sstate: "loading" } } : null;
    },
    go({ arg }) {
      return arg === "settings" ? { route: { push: "settings" }, state: { fromBrowse: true } } : null;
    },
    back({ state, route }) {
      if (route && route.name === "settings" && !state.fromBrowse) return { close: true };
      return { route: { pop: true }, state: { sq: null, sstate: null } };
    }
  };
  async function event(ev) {
    const handler = Object.hasOwn(events, ev.name) ? events[ev.name] : null;
    return handler ? await handler({ ...ev, state: ev.state || {} }) ?? null : null;
  }
  return { view, event, notePlayed };
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
var VERSION = "1.0.4";
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
