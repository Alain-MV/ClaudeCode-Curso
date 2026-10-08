"use strict";
/* =====================================================================
   VISTA: ACCESO
   ===================================================================== */
function renderAuth(app) {
  let mode = "login";
  app.innerHTML = `
  <section class="view auth-wrap">
    <div class="auth">
      <p class="logo-sm">ARCADE<br><span>VAULT</span></p>
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-mode="login">INICIAR SESIÓN</button>
        <button role="tab" aria-selected="false" data-mode="register">CREAR CUENTA</button>
      </div>
      <form id="authForm" novalidate>
        <div class="f"><label for="aUser">Usuario</label><input class="input" id="aUser" autocomplete="username" maxlength="16" placeholder="Tu alias de jugador"></div>
        <div class="f" id="emailF" hidden><label for="aEmail">Correo electrónico</label><input class="input" id="aEmail" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com"></div>
        <div class="f"><label for="aPass">Contraseña</label><input class="input" id="aPass" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres"></div>
        <p class="err" id="aErr" role="alert"></p>
        <button class="btn solid big" style="width:100%" id="aSubmit" type="submit">ENTRAR</button>
      </form>
      <div class="divider">o continúa con</div>
      <div class="social">
        <button class="btn ghost" data-social="Google">Google</button>
        <button class="btn ghost" data-social="GitHub">GitHub</button>
      </div>
      <button class="btn mag guest" id="guestBtn">JUGAR COMO INVITADO</button>
      <p class="note">Sin cuenta puedes jugar todo, pero tus puntuaciones no entran al Salón de la Fama.</p>
    </div>
  </section>`;
  const setMode = m => {
    mode = m;
    $$(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.mode === m));
    $("#emailF").hidden = m !== "register";
    $("#aSubmit").textContent = m === "login" ? "ENTRAR" : "CREAR CUENTA";
    $("#aPass").autocomplete = m === "login" ? "current-password" : "new-password";
    $("#aErr").textContent = "";
  };
  $$(".tabs button").forEach(b => b.onclick = () => setMode(b.dataset.mode));
  $("#authForm").onsubmit = async e => {
    e.preventDefault();
    const user = $("#aUser").value.trim(), pass = $("#aPass").value, email = $("#aEmail").value.trim(), err = $("#aErr");
    if (!/^[\wÁÉÍÓÚÑáéíóúñ.-]{3,16}$/.test(user)) { err.textContent = "El usuario necesita de 3 a 16 caracteres, sin espacios."; $("#aUser").focus(); return; }
    if (mode === "register" && !/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "Escribe un correo electrónico válido."; $("#aEmail").focus(); return; }
    if (pass.length < 6) { err.textContent = "La contraseña necesita al menos 6 caracteres."; $("#aPass").focus(); return; }
    const btn = $("#aSubmit"); btn.disabled = true; btn.textContent = "CONECTANDO…"; err.textContent = "";
    try {
      const s = mode === "login" ? await API.login(user, pass) : await API.register(user, email, pass);
      Session.set(s); toast(mode === "login" ? `¡Bienvenido de vuelta, ${s.name}!` : `Cuenta creada. ¡A jugar, ${s.name}!`);
      location.hash = "#/";
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.textContent = mode === "login" ? "ENTRAR" : "CREAR CUENTA"; }
  };
  $$("[data-social]").forEach(b => b.onclick = async () => { try { await API.socialLogin(b.dataset.social); } catch (ex) { toast(ex.message); } });
  $("#guestBtn").onclick = () => { Session.set({ name: "INVITADO", guest: true }); toast("Jugando como invitado."); location.hash = "#/"; };
}
