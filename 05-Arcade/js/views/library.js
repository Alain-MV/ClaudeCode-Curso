"use strict";
/* =====================================================================
   VISTA: BIBLIOTECA
   ===================================================================== */
function renderLibrary(app) {
  app.innerHTML = `
  <section class="view">
    <header class="hero">
      <h1 class="logo-big flicker">ARCADE<span class="v">VAULT</span></h1>
      <p class="insert">INSERTA UNA MONEDA PARA JUGAR<span class="blink">_</span></p>
    </header>
    <div class="toolbar">
      <div class="field">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/></svg>
        <label class="sr" for="q">Buscar juego</label>
        <input id="q" type="search" placeholder="Busca por nombre o categoría…" value="${esc(filterState.q)}" autocomplete="off">
      </div>
      <div class="chips" role="group" aria-label="Filtrar por categoría">
        ${CATS.map(c => `<button class="chip" data-cat="${c}" aria-pressed="${filterState.cat === c}">${c}</button>`).join("")}
      </div>
    </div>
    <div class="cards" id="cards"></div>
    <div class="empty" id="empty" hidden><b>SIN RESULTADOS</b>Ningún juego coincide con tu búsqueda. Prueba otro nombre o elige “Todos”.</div>
  </section>`;
  const paint = () => {
    const q = filterState.q.trim().toLowerCase();
    const list = GAMES.filter(g => (filterState.cat === "Todos" || g.cat === filterState.cat) && (!q || g.title.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q) || g.short.toLowerCase().includes(q)));
    $("#cards").innerHTML = list.map(g => {
      const top = (API.getAllScoresSync(g.id)[0] || { score: 0 }).score;
      return `<article class="card" data-id="${g.id}" style="--accent:${g.accent}">
        <div class="cover"><canvas data-cover="${g.id}" aria-hidden="true"></canvas><span class="cat">${g.cat}</span></div>
        <div class="card-body">
          <h3>${g.title}</h3>
          <p>${g.short}</p>
          <div class="card-foot">
            <div class="badge"><small>MEJOR PUNTUACIÓN</small><b>${fmt(top)}</b></div>
            <button class="btn sm" data-play="${g.id}" aria-label="Jugar ${g.title}">JUGAR</button>
          </div>
        </div>
      </article>`;
    }).join("");
    $("#empty").hidden = list.length > 0;
    $$("canvas[data-cover]").forEach(c => drawCover(c.dataset.cover, c));
    bindTilt();
  };
  $("#q").addEventListener("input", e => { filterState.q = e.target.value; paint(); });
  $$(".chip").forEach(b => b.onclick = () => { filterState.cat = b.dataset.cat; $$(".chip").forEach(x => x.setAttribute("aria-pressed", x === b)); paint(); });
  $("#cards").addEventListener("click", e => {
    const card = e.target.closest(".card"); if (!card) return;
    location.hash = `#/juego/${card.dataset.id}`;
  });
  paint();
}
function bindTilt() {
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  $$(".card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty("--tf", `translateY(-8px) scale(1.03) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`);
    });
    card.addEventListener("pointerleave", () => card.style.removeProperty("--tf"));
  });
}
