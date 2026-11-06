// src/plugin.js
var VERSION = "1.0.0";
var PREFIX = `[HDFull v${VERSION}]`;
var BASE = "https://www3.hdfull.one";
var LOGIN = `${BASE}/login`;
console.log(`${PREFIX} Creado por JuandreXter`);
var log = (...x) => console.log(PREFIX, ...x);
function session() {
  try {
    return String(kino?.config?.get?.("hdfullCookies") || "").trim();
  } catch (_) {
    return "";
  }
}
function signedIn() {
  return !!session();
}
function msg(title, body, action) {
  const children = [
    { type: "Icon", name: "lock", size: 54, color: "error" },
    { type: "Text", text: title, style: "h1", textAlign: "center" },
    { type: "Text", text: body, textAlign: "center", color: "muted" }
  ];
  if (action) children.push({ type: "Button", label: action.label, onPressed: { event: action.event }, autofocus: true });
  return {
    type: "Scaffold",
    appBar: { type: "AppBar", title: "HDFull" },
    body: { type: "SingleChildScrollView", padding: 32, children: [{ type: "Column", mainAxisAlignment: "center", crossAxisAlignment: "center", gap: 24, children }] }
  };
}
function loginView() {
  return msg("Inicio de sesi\xF3n requerido", "HDFull requiere una cuenta. Pulsa el bot\xF3n, inicia sesi\xF3n directamente en la ventana segura de HDFull y vuelve a Kino.", { label: "Abrir inicio de sesi\xF3n", event: "hdfull.login" });
}
function unavailableView() {
  return msg("Navegador visual no disponible", "Actualiza Kino a la versi\xF3n compatible con Navegador visual o abre HDFull desde un dispositivo m\xF3vil/tablet.");
}
async function screen() {
  log("screen(): comprobando sesi\xF3n");
  if (!signedIn()) return loginView();
  return msg("Sesi\xF3n vinculada", "Tu sesi\xF3n de HDFull est\xE1 guardada. El cat\xE1logo se habilitar\xE1 al confirmar que la web acepte la sesi\xF3n.", { label: "Actualizar sesi\xF3n", event: "hdfull.login" });
}
async function screenEvent(ev) {
  const e = typeof ev === "string" ? JSON.parse(ev) : ev || {};
  log(`screenEvent(ev="${e.name}")`);
  if (e.name === "hdfull.login") {
    if (!kino?.visualBrowser?.available) return { view: unavailableView(), state: { loginError: "visualBrowser_unavailable" } };
    const result = await kino.visualBrowser.open({
      url: LOGIN,
      title: "Iniciar sesi\xF3n en HDFull",
      collect: {
        cookies: ["PHPSESSID", "session", "remember", "remember_token", "XSRF-TOKEN"],
        storeAs: { setting: "hdfullCookies", format: "header", thenEvent: "hdfull.loggedIn" },
        finalUrl: true
      },
      userAgent: "browser",
      timeoutMs: 6e5
    });
    if (result.status === "done" && result.stored) return { view: msg("Sesi\xF3n guardada", "La sesi\xF3n se guard\xF3 de forma cifrada. Actualizando HDFull..."), state: { loggedIn: true } };
    if (result.status === "timeout") return { view: loginView(), message: "El inicio de sesi\xF3n tard\xF3 demasiado. Int\xE9ntalo otra vez." };
    return { view: loginView() };
  }
  if (e.name === "hdfull.loggedIn") return { view: await screen(), state: { loggedIn: true }, message: "Sesi\xF3n de HDFull vinculada" };
  return null;
}
function requireLogin() {
  if (!signedIn()) {
    const e = new Error("Inicio de sesi\xF3n requerido en HDFull");
    e.code = "auth_required";
    throw e;
  }
}
async function search() {
  requireLogin();
  throw new Error("Cat\xE1logo pendiente de verificaci\xF3n tras login");
}
async function home() {
  requireLogin();
  throw new Error("Cat\xE1logo pendiente de verificaci\xF3n tras login");
}
async function browse() {
  requireLogin();
  throw new Error("Cat\xE1logo pendiente de verificaci\xF3n tras login");
}
async function episodes() {
  requireLogin();
  throw new Error("Cat\xE1logo pendiente de verificaci\xF3n tras login");
}
async function resolve() {
  requireLogin();
  throw new Error("Reproductor pendiente de verificaci\xF3n tras login");
}
export {
  browse,
  episodes,
  home,
  resolve,
  screen,
  screenEvent,
  search
};
