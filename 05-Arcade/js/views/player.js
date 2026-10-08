"use strict";
/* =====================================================================
   VISTA: REPRODUCTOR
   ===================================================================== */
let current = null;
const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", " ": "fire" };

function renderPlayer(app, g) {
  app.innerHTML = `
  <section class="view player">
    <div class="hud" role="region" aria-label="Marcador">
      <div class="hud-stats">
        <div><small>PUNTUACIÓN</small><b id="hScore">0</b></div>
        <div class="lives"><small>VIDAS</small><b id="hLives">-</b></div>
        <div class="lvl"><small>NIVEL</small><b id="hLevel">1</b></div>
        <div class="pl"><small>JUGADOR</small><b>${esc(Session.name())}</b></div>
      </div>
      <div class="hud-actions">
        <button class="btn sm yel" id="btnPause">PAUSA</button>
        <button class="btn sm mag" id="btnExit">SALIR</button>
      </div>
    </div>
    <div class="cabinet" style="--ar:${g.w / g.h}">
      <div class="bezel">
        <div class="screen" id="screen">
          <canvas id="gameCanvas" aria-label="Pantalla de ${g.title}"></canvas>
          <div class="crt"></div>
          <div class="overlay-msg" id="pauseMsg" hidden><div>PAUSA<small>Pulsa P o el botón para seguir</small></div></div>
          <div class="loader" id="loader"><p>CARGANDO<span class="blink">…</span></p></div>
        </div>
      </div>
      <p class="bezel-label">ARCADE VAULT · ${g.title}</p>
    </div>
    <div class="pad" id="pad" aria-hidden="true">
      <div class="dpad">
        <button class="u" data-k="up">▲</button><button class="l" data-k="left">◀</button><button class="r" data-k="right">▶</button><button class="d" data-k="down">▼</button>
      </div>
      <button class="fire" data-k="fire">ACCIÓN</button>
    </div>
    <p class="hint">${g.controls} <b>P</b> pausa.</p>
  </section>`;
  $("#btnPause").onclick = e => { e.currentTarget.blur(); togglePause(); };
  $("#btnExit").onclick = () => { location.hash = `#/juego/${g.id}`; };
  $$("#pad button").forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); b.classList.add("on"); if (current && !current.paused && !current.ended) current.game.key(k, true, false); };
    const off = () => { b.classList.remove("on"); if (current) current.game.key(k, false, false); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  setTimeout(() => { if (currentRoute() === "player") startGame(g); }, 650);
}

function startGame(g) {
  const loader = $("#loader"); if (loader) loader.remove();
  if (g.src) { loadExternal(g); return; }
  const canvas = $("#gameCanvas"), dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = g.w * dpr; canvas.height = g.h * dpr;
  const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const state = { meta: g, score: 0, paused: false, ended: false, endTimer: 0, raf: 0, last: performance.now() };
  const hud = {
    score: v => { state.score = v; const el = $("#hScore"); if (el) el.textContent = fmt(v); },
    lives: v => { const el = $("#hLives"); if (el) el.textContent = v > 0 ? "♥".repeat(Math.min(v, 6)) : "0"; },
    level: v => { const el = $("#hLevel"); if (el) el.textContent = v; },
    over: s => { state.score = s; state.ended = true; state.endTimer = .9; }
  };
  state.game = g.create(ctx, g.w, g.h, hud);
  const toLogical = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * g.w, (e.clientY - r.top) / r.height * g.h]; };
  canvas.onpointerdown = e => { if (state.paused || state.ended || !state.game.pointer) return; canvas.setPointerCapture?.(e.pointerId); state.game.pointer(...toLogical(e), "down"); };
  canvas.onpointermove = e => { if (state.paused || state.ended || !state.game.pointer) return; if (e.pointerType === "mouse" || e.buttons) state.game.pointer(...toLogical(e), "move"); };
  const tick = t => {
    if (current !== state) return;
    const dt = Math.min(.05, (t - state.last) / 1000); state.last = t;
    if (!state.paused) state.game.update(dt);
    state.game.render();
    if (state.ended) { state.endTimer -= dt; if (state.endTimer <= 0) { showGameOver(state); return; } }
    state.raf = requestAnimationFrame(tick);
  };
  current = state; state.raf = requestAnimationFrame(tick);
}

/* Juegos HTML externos en iframe aislado.
   Protocolo: el juego envía window.parent.postMessage({ type:'av:score', value }),
   { type:'av:lives', value }, { type:'av:level', value } y { type:'av:over', value }. */
function loadExternal(g) {
  const screen = $("#screen"), frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts"); frame.title = g.title;
  frame.style.cssText = `display:block;width:100%;aspect-ratio:${g.w}/${g.h};border:0;background:#05050a`;
  if (g.src.trim().startsWith("<")) frame.srcdoc = g.src; else frame.src = g.src;
  $("#gameCanvas").replaceWith(frame);
  const state = { meta: g, score: 0, paused: false, ended: false, external: frame, game: { key() {} } };
  state.onMsg = e => {
    if (e.source !== frame.contentWindow || !e.data || typeof e.data !== "object") return;
    const { type, value } = e.data;
    if (type === "av:score") { state.score = value; $("#hScore").textContent = fmt(value); }
    if (type === "av:lives") $("#hLives").textContent = "♥".repeat(Math.max(0, Math.min(value, 6)));
    if (type === "av:level") $("#hLevel").textContent = value;
    if (type === "av:over") { state.score = value ?? state.score; state.ended = true; showGameOver(state); }
  };
  window.addEventListener("message", state.onMsg); current = state;
}

function stopGame() {
  if (!current) return;
  cancelAnimationFrame(current.raf);
  if (current.onMsg) window.removeEventListener("message", current.onMsg);
  current = null; $(".modal-back")?.remove();
}
function togglePause(force) {
  if (!current || current.ended) return;
  current.paused = force !== undefined ? force : !current.paused;
  $("#pauseMsg").hidden = !current.paused;
  $("#btnPause").textContent = current.paused ? "SEGUIR" : "PAUSA";
  current.external?.contentWindow?.postMessage({ type: current.paused ? "av:pause" : "av:resume" }, "*");
}
document.addEventListener("keydown", e => {
  if (!current || current.ended || e.target.closest("input")) return;
  if (e.key === "p" || e.key === "P" || e.key === "Escape") { e.preventDefault(); togglePause(); return; }
  const k = KEYMAP[e.key];
  if (k) { e.preventDefault(); if (!current.paused) current.game.key(k, true, e.repeat); }
});
document.addEventListener("keyup", e => { const k = KEYMAP[e.key]; if (k && current && current.game) current.game.key(k, false, false); });
document.addEventListener("visibilitychange", () => { if (document.hidden && current && !current.ended) togglePause(true); });
