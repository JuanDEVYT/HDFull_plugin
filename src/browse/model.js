// Modelos y transformaciones para la navegación de HDFull.

export const TAB_IDS = ["inicio", "peliculas", "series"];

export function cardOf(x) {
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
    overview: x.overview || "",
  };
}

export function tabOf(page) {
  if (!page || !Array.isArray(page.rows)) return null;
  const rails = [];
  const slides = [];

  for (const r of page.rows) {
    const items = (Array.isArray(r.items) ? r.items : []).map(cardOf).filter(Boolean);
    if (!items.length) continue;
    rails.push({
      id: r.id || r.ref || "rail",
      title: r.title || "Destacados",
      items,
    });
    if (!slides.length && items.length) {
      slides.push(items[0]);
    }
  }

  return { slides, rails };
}

export function recentOf(keys, loaded) {
  return [];
}

export function playedKey(ref) {
  return ref ? String(ref) : null;
}
