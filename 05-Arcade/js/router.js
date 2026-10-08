"use strict";
/* =====================================================================
   ROUTER
   ===================================================================== */
function parseHash() { return (location.hash.replace(/^#/, "") || "/").split("/").filter(Boolean); }
function currentRoute() {
  const p = parseHash();
  if (!p.length) return "library";
  return { juego: "detail", jugar: "player", acceso: "auth", salon: "fame" }[p[0]] || "library";
}
let filterState = { q: "", cat: "Todos" };

function route() {
  stopGame(); closeDrawer(); $("#userMenu")?.remove();
  const p = parseHash(), r = currentRoute(), app = $("#app");
  document.body.classList.toggle("playing", r === "player");
  renderNav();
  if (r === "detail" && gameById(p[1])) renderDetail(app, gameById(p[1]));
  else if (r === "player" && gameById(p[1])) renderPlayer(app, gameById(p[1]));
  else if (r === "auth") renderAuth(app);
  else if (r === "fame") renderFame(app, gameById(p[1]) || GAMES[0]);
  else renderLibrary(app);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
