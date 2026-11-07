// Controlador de la pantalla declarativa para HDFull.
import { tabOf, cardOf, TAB_IDS } from "./model.js";
import { renderView } from "./view.js";

const TAB_KEY = "hdfull_tab";

export function makeBrowse({ kino, loadTab, searchTitles }) {
  const cache = new Map();

  function getStoredTab() {
    try {
      const t = kino?.storage?.get(TAB_KEY);
      return TAB_IDS.includes(t) ? t : "inicio";
    } catch (_) {
      return "inicio";
    }
  }

  function storeTab(t) {
    try {
      kino?.storage?.set(TAB_KEY, t);
    } catch (_) {}
  }

  function view(ctx) {
    const st = ctx?.state && typeof ctx.state === "object" ? ctx.state : {};
    const tab = TAB_IDS.includes(st.tab) ? st.tab : getStoredTab();

    // Inyectar datos en caché si existen
    const tabsData = {
      inicio: cache.get("inicio") || { slides: [], rails: [] },
      peliculas: cache.get("peliculas") || { slides: [], rails: [] },
      series: cache.get("series") || { slides: [], rails: [] },
    };

    return renderView({
      state: { ...st, tab, tabs: tabsData },
      device: ctx?.device || "tv",
      route: ctx?.route,
    });
  }

  async function load(tab) {
    try {
      const page = await loadTab(tab);
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
      const pending = [currentTab, ...TAB_IDS.filter(t => t !== currentTab && !cache.has(t))];
      return {
        state: { tab: currentTab, pending },
        view: view({ state: { tab: currentTab, pending }, device: ev.device }),
      };
    }

    if (name === "nav.tab") {
      const target = TAB_IDS.includes(ev.tab) ? ev.tab : "inicio";
      storeTab(target);
      const pending = cache.has(target) ? [] : [target];
      return {
        state: { tab: target, pending },
        view: view({ state: { tab: target, pending }, device: ev.device }),
      };
    }

    if (name === "tick") {
      const pending = Array.isArray(st.pending) ? [...st.pending] : [];
      if (!pending.length) return null;
      const next = pending.shift();
      await load(next);
      return {
        state: { ...st, pending },
        view: view({ state: { ...st, pending }, device: ev.device }),
      };
    }

    return null;
  }

  return { view, event };
}
