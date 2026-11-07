// Vista declarativa para HDFull.
import { LOGO_DATA } from "./logo.js";


const TABS = {
  inicio: "tabHome",
  peliculas: "tabMovies",
  series: "tabSeries",
};

export function renderView({ state = {}, device = "tv", focusId, route }) {
  const currentTab = state.tab || "inicio";

  const navItems = [
    { id: "tab-inicio", label: "Inicio", icon: "home", selected: currentTab === "inicio" },
    { id: "tab-peliculas", label: "Películas", icon: "movie", selected: currentTab === "peliculas" },
    { id: "tab-series", label: "Series", icon: "tv", selected: currentTab === "series" },
  ];

  const appBar = {
    type: "AppBar",
    title: "HDFull",
    leading: {
      type: "Image",
      src: LOGO_DATA,
      width: 32,
      height: 32,
    },
    actions: [
      {
        type: "IconButton",
        icon: "refresh",
        tooltip: "Volver a iniciar sesión o actualizar cookies",
        onPressed: { event: "hdfull.login" },
      },
    ],
  };

  const body = [];

  // Selector de pestañas
  body.push({
    type: "Row",
    padding: { top: 8, bottom: 16, left: 16, right: 16 },
    gap: 12,
    children: navItems.map(item => ({
      type: "FilterChip",
      id: item.id,
      label: item.label,
      selected: item.selected,
      leading: { type: "Icon", name: item.icon, size: 18 },
      onPressed: { event: "nav.tab", tab: item.id.replace("tab-", "") },
    })),
  });

  const tabData = state.tabs?.[currentTab] || { slides: [], rails: [] };

  // Si aún está cargando o no hay slides ni rails
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
            { type: "Text", text: "Cargando catálogo de HDFull...", color: "muted" },
          ],
        },
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
            { type: "Text", text: "Sesión de Cloudflare o HDFull expirada", style: "h2" },
            {
              type: "Text",
              text: "Cloudflare o HDFull requieren renovar las cookies seguras para acceder al catálogo.",
              color: "muted",
              textAlign: "center",
            },
            {
              type: "Button",
              label: "Renovar sesión en el navegador",
              onPressed: { event: "hdfull.login" },
              autofocus: true,
            },
          ],
        },
      });
    }

    return {
      type: "Scaffold",
      appBar,
      body: {
        type: "SingleChildScrollView",
        children: body,
      },
    };
  }

  // Si hay contenido, renderizar HeroCard destacado
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
        action: { event: "play", ref: hero.ref, id: hero.id },
      },
      secondaryAction: {
        id: `info-${hero.id}`,
        label: "Detalles",
        icon: "info",
        action: { event: "details", ref: hero.ref, id: hero.id },
      },
    });
  }

  // Rieles de contenido
  for (const rail of tabData.rails) {
    if (!rail.items?.length) continue;
    body.push({
      type: "TitleRail",
      id: `rail-${rail.id}`,
      title: rail.title,
      items: rail.items.map(card => ({
        id: card.id,
        title: card.title,
        poster: card.poster,
        year: card.year,
        kind: card.kind,
        action: { event: "details", ref: card.ref, id: card.id },
      })),
    });
  }

  return {
    type: "Scaffold",
    appBar,
    body: {
      type: "SingleChildScrollView",
      children: body,
    },
  };
}
