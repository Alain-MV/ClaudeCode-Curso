"use strict";
/* =====================================================================
   VISTA: SALÓN DE LA FAMA
   ===================================================================== */
function renderFame(app, g) {
  app.innerHTML = `
  <section class="view">
    <header class="fame-head">
      <h1 class="glow-title">SALÓN DE LA FAMA</h1>
      <p>Las diez mejores puntuaciones de cada juego.</p>
    </header>
    <div class="gtabs" role="tablist" aria-label="Elegir juego">
      ${GAMES.map(x => `<button class="gtab" role="tab" style="--accent:${x.accent}" aria-selected="${x.id === g.id}" data-g="${x.id}">${x.title}</button>`).join("")}
    </div>
    <div class="panel" id="famePanel"></div>
    <div id="myBest"></div>
  </section>`;
  $$(".gtab").forEach(b => b.onclick = () => { history.replaceState(null, "", `#/salon/${b.dataset.g}`); renderFameTable(gameById(b.dataset.g)); $$(".gtab").forEach(x => x.setAttribute("aria-selected", x === b)); });
  renderFameTable(g);
}
async function renderFameTable(g) {
  const panel = $("#famePanel"), mine = $("#myBest");
  panel.innerHTML = `<div class="spinner" aria-label="Cargando"><i></i><i></i><i></i><i></i></div>`; mine.innerHTML = "";
  const list = await API.getLeaderboard(g.id, 10);
  if (!$("#famePanel")) return;
  const me = Session.isMember() ? Session.name() : null;
  panel.innerHTML = !list.length ? `<p class="empty">Nadie ha jugado ${g.title} todavía.</p>` : `
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">RANGO</th><th scope="col">JUGADOR</th><th scope="col">PUNTUACIÓN</th><th scope="col">FECHA</th></tr></thead>
      <tbody>${list.map((e, i) => `<tr class="row-in ${i < 3 ? "t" + (i + 1) : ""} ${me && e.name === me ? "me" : ""}" style="--i:${i}">
        <td class="rk">${["1º", "2º", "3º"][i] || (i + 1) + "º"}</td>
        <td>${esc(e.name)}${me && e.name === me && list.findIndex(x => x.name === me) === i ? '<span class="me-tag">TU MEJOR MARCA</span>' : ""}</td>
        <td class="sc">${fmt(e.score)}</td><td class="dt">${fmtDate(e.date)}</td></tr>`).join("")}</tbody>
    </table></div>`;
  if (me) {
    const all = API.getAllScoresSync(g.id), idx = all.findIndex(e => e.name === me);
    if (idx >= 10) mine.innerHTML = `<div class="my-best"><div><small>TU MEJOR MARCA</small><br><span>Puesto ${idx + 1} · ${fmtDate(all[idx].date)}</span></div><b>${fmt(all[idx].score)}</b></div>`;
    else if (idx < 0) mine.innerHTML = `<div class="my-best"><div><small>TU MEJOR MARCA</small><br><span>Aún no tienes puntuación en ${g.title}.</span></div><a class="btn sm yel" href="#/juego/${g.id}">JUGAR</a></div>`;
  } else {
    mine.innerHTML = `<div class="my-best"><div><small>TU MEJOR MARCA</small><br><span>Inicia sesión para aparecer en esta tabla.</span></div><a class="btn sm yel" href="#/acceso">Iniciar Sesión</a></div>`;
  }
}
