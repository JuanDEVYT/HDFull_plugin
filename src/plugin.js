const VERSION = "1.0.0";
const PREFIX = `[HDFull v${VERSION}]`;
const BASE = "https://www3.hdfull.one";
const LOGIN = `${BASE}/login`;
console.log(`${PREFIX} Creado por JuandreXter`);
const log = (...x) => console.log(PREFIX, ...x);

function session() {
  try { return String(kino?.config?.get?.("hdfullCookies") || "").trim(); } catch (_) { return ""; }
}
function signedIn() { return !!session(); }
function msg(title, body, action) {
  const children = [
    { type: "Icon", name: "lock", size: 54, color: "error" },
    { type: "Text", text: title, style: "h1", textAlign: "center" },
    { type: "Text", text: body, textAlign: "center", color: "muted" },
  ];
  if (action) children.push({ type: "Button", label: action.label, onPressed: { event: action.event }, autofocus: true });
  return {
    type: "Scaffold",
    appBar: { type: "AppBar", title: "HDFull" },
    body: { type: "SingleChildScrollView", padding: 32, children: [{ type: "Column", mainAxisAlignment: "center", crossAxisAlignment: "center", gap: 24, children }] },
  };
}
function loginView() {
  return msg("Inicio de sesión requerido", "HDFull requiere una cuenta. Pulsa el botón, inicia sesión directamente en la ventana segura de HDFull y vuelve a Kino.", {label:"Abrir inicio de sesión",event:"hdfull.login"});
}
function unavailableView() {
  return msg("Navegador visual no disponible", "Actualiza Kino a la versión compatible con Navegador visual o abre HDFull desde un dispositivo móvil/tablet.");
}

export async function screen() {
  log("screen(): comprobando sesión");
  if (!signedIn()) return loginView();
  return msg("Sesión vinculada", "Tu sesión de HDFull está guardada. El catálogo se habilitará al confirmar que la web acepte la sesión.", {label:"Actualizar sesión",event:"hdfull.login"});
}

export async function screenEvent(ev) {
  const e = typeof ev === "string" ? JSON.parse(ev) : ev || {};
  log(`screenEvent(ev="${e.name}")`);
  if (e.name === "hdfull.login") {
    if (!kino?.visualBrowser?.available) return { view: unavailableView(), state:{ loginError:"visualBrowser_unavailable" } };
    const result = await kino.visualBrowser.open({
      url: LOGIN,
      title: "Iniciar sesión en HDFull",
      collect: {
        cookies: ["PHPSESSID", "session", "remember", "remember_token", "XSRF-TOKEN"],
        storeAs: { setting:"hdfullCookies", format:"header", thenEvent:"hdfull.loggedIn" },
        finalUrl: true
      },
      userAgent: "browser",
      timeoutMs: 600000
    });
    if (result.status === "done" && result.stored) return { view: msg("Sesión guardada", "La sesión se guardó de forma cifrada. Actualizando HDFull..."), state:{loggedIn:true} };
    if (result.status === "timeout") return { view: loginView(), message:"El inicio de sesión tardó demasiado. Inténtalo otra vez." };
    return { view: loginView() };
  }
  if (e.name === "hdfull.loggedIn") return { view: await screen(), state:{loggedIn:true}, message:"Sesión de HDFull vinculada" };
  return null;
}

function requireLogin() { if (!signedIn()) { const e=new Error("Inicio de sesión requerido en HDFull"); e.code="auth_required"; throw e; } }
export async function search() { requireLogin(); throw new Error("Catálogo pendiente de verificación tras login"); }
export async function home() { requireLogin(); throw new Error("Catálogo pendiente de verificación tras login"); }
export async function browse() { requireLogin(); throw new Error("Catálogo pendiente de verificación tras login"); }
export async function episodes() { requireLogin(); throw new Error("Catálogo pendiente de verificación tras login"); }
export async function resolve() { requireLogin(); throw new Error("Reproductor pendiente de verificación tras login"); }
