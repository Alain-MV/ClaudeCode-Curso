"use strict";
/* =====================================================================
   NAVEGACIÓN
   ===================================================================== */
const AV_COLORS = [CY, MG, YE, GR, OR];
const avColor = n => AV_COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length];

function renderNav() {
  const s = Session.get(), right = $("#navRight");
  if (s && !s.guest) {
    right.innerHTML = `<button class="avatar-btn" id="avBtn" aria-haspopup="true" aria-expanded="false"><span class="avatar" style="--av:${avColor(s.name)}">${esc(s.name[0].toUpperCase())}</span><b>${esc(s.name)}</b></button>`;
    $("#avBtn").onclick = e => {
      e.stopPropagation(); let m = $("#userMenu");
      if (m) { m.remove(); e.currentTarget.setAttribute("aria-expanded", "false"); return; }
      e.currentTarget.setAttribute("aria-expanded", "true");
      m = document.createElement("div"); m.className = "menu"; m.id = "userMenu";
      m.innerHTML = `<button data-go="#/salon">Mis puntuaciones</button><button data-logout>Cerrar sesión</button>`;
      $(".nav").appendChild(m);
    };
  } else {
    right.innerHTML = `${s && s.guest ? '<span class="guest-chip">Jugando como invitado</span>' : ""}<a class="btn sm" href="#/acceso">Iniciar Sesión</a>`;
  }
  const route = currentRoute();
  $$(".nav-links a").forEach(a => a.classList.toggle("active", a.dataset.nav === route));
  $("#drawerBody").innerHTML = `
    <a href="#/" class="${route === "library" ? "active" : ""}">Biblioteca</a>
    <a href="#/salon" class="${route === "fame" ? "active" : ""}">Salón de la Fama</a>
    ${s && !s.guest ? `<p style="margin:22px 0 6px;color:var(--muted)">Sesión iniciada como <b style="color:var(--text)">${esc(s.name)}</b></p><button class="dbtn" data-logout>Cerrar sesión</button>` : `<a href="#/acceso">Iniciar Sesión</a>`}`;
}
document.addEventListener("click", e => {
  const lo = e.target.closest("[data-logout]");
  if (lo) { Session.clear(); closeDrawer(); $("#userMenu")?.remove(); toast("Sesión cerrada."); route(); return; }
  const go = e.target.closest("[data-go]");
  if (go) { $("#userMenu")?.remove(); location.hash = go.dataset.go; return; }
  if (!e.target.closest("#userMenu")) $("#userMenu")?.remove();
  if (e.target.closest(".drawer a")) closeDrawer();
});
function openDrawer() { $("#drawer").classList.add("open"); $("#drawerBack").classList.add("open"); $("#burger").setAttribute("aria-expanded", "true"); }
function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawerBack").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false"); }
$("#burger").onclick = openDrawer; $("#drawerClose").onclick = closeDrawer; $("#drawerBack").onclick = closeDrawer;
