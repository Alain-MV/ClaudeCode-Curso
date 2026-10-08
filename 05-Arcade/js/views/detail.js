"use strict";
/* =====================================================================
   VISTA: DETALLE
   ===================================================================== */
function lbItems(list, highlight) {
  if (!list.length) return `<p style="color:var(--muted);margin:0">Nadie ha jugado todavía. Tu nombre puede ser el primero.</p>`;
  return `<ol class="lb">${list.map((e, i) => `<li class="${["g", "si", "b"][i] || ""} ${highlight && e.name === highlight ? "me" : ""}">
    <span class="r">${String(i + 1).padStart(2, "0")}</span><span class="n">${esc(e.name)}</span><span class="s">${fmt(e.score)}</span><span class="d">${fmtDate(e.date)}</span></li>`).join("")}</ol>`;
}
function renderDetail(app, g) {
  app.innerHTML = `
  <section class="view detail" style="--accent:${g.accent}">
    <div>
      <button class="back-link" data-go="#/">← Biblioteca</button>
      <div class="detail-cover"><canvas id="dc" aria-hidden="true"></canvas></div>
      <h1 class="glow-title">${g.title}</h1>
      <p class="desc">${g.desc}</p>
      <div class="controls-box">${g.controls}</div>
      <div class="actions">
        <button class="btn big solid pulse" style="--c:${g.accent}" id="playNow">JUGAR AHORA</button>
        <button class="btn ghost" data-go="#/">VOLVER AL VAULT</button>
      </div>
    </div>
    <aside class="panel">
      <h2>MEJORES PUNTUACIONES</h2>
      <div id="lb"><div class="spinner" aria-label="Cargando"><i></i><i></i><i></i><i></i></div></div>
      <p style="margin:18px 0 0;font-size:14px;color:var(--muted)">${Session.isMember() ? `Tu mejor marca: <b style="color:var(--yel)">${fmt(personalBest(g.id))}</b>` : `Las partidas como invitado no entran en esta tabla. <a href="#/acceso" style="color:var(--cyan)">Inicia sesión</a> para competir.`}</p>
    </aside>
  </section>`;
  drawCover(g.id, $("#dc"));
  $("#playNow").onclick = () => { location.hash = `#/jugar/${g.id}`; };
  API.getLeaderboard(g.id).then(list => { const el = $("#lb"); if (el) el.innerHTML = lbItems(list, Session.isMember() ? Session.name() : null); });
}
