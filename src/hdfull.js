export const BASE_URL = "https://www3.hdfull.one";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export function getSessionCookie() {
  try {
    return String(kino?.config?.get?.("hdfullCookies") || "").trim();
  } catch (_) {
    return "";
  }
}

export function isAuthorized() {
  return !!getSessionCookie();
}

export function makeHeaders() {
  const cookie = getSessionCookie();
  return {
    "User-Agent": USER_AGENT,
    "Referer": BASE_URL + "/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    ...(cookie ? { "Cookie": cookie } : {}),
  };
}

export async function fetchHtml(url) {
  const fetcher = typeof kino !== "undefined" ? kino.fetch : globalThis.fetch;
  const target = url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  const res = await fetcher(target, {
    headers: makeHeaders(),
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

export function parseCards(html) {
  const items = [];
  const seen = new Set();

  // Find all links to movies and series
  const linkRegex = /<a\b[^>]*\bhref=["']([^"']*(?:\/pelicula\/|\/serie\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(linkRegex)) {
    const rawHref = m[1];
    const inner = m[2];
    const fullTag = m[0];

    const href = absUrl(rawHref);
    if (seen.has(href)) continue;

    // Check title in title attribute, inner img alt, or inner text
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

    // Poster
    let poster = "";
    const imgMatch = inner.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
    if (imgMatch) {
      poster = absUrl(imgMatch[1]);
    }

    seen.add(href);
    const isSeries = href.includes("/serie/");
    const yMatch = title.match(/\((\d{4})\)/);
    const year = yMatch ? parseInt(yMatch[1], 10) : undefined;
    const cleanTitle = title.replace(/\s*\(\d{4}\).*$/, "").trim();

    items.push({
      id: href,
      ref: href,
      title: cleanTitle,
      kind: isSeries ? "series" : "movie",
      type: isSeries ? "series" : "movie",
      poster,
      art: poster,
      year,
    });
  }

  return items;
}
