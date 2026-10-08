"use strict";
/* Modal de fin de partida */
function showGameOver(state) {
  const g = state.meta, score = state.score, best = personalBest(g.id), member = Session.isMember();
  const back = document.createElement("div"); back.className = "modal-back";
  back.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="goT">
      <h2 id="goT">FIN DEL JUEGO</h2>
      <p class="lbl">PUNTUACIÓN FINAL</p>
      <div class="final">${fmt(score)}</div>
      ${score > best && score > 0 ? `<p class="record">¡NUEVA MEJOR MARCA!</p>` : ""}
      <div class="typer" id="typer" aria-live="polite"></div>
      <p class="save-note" id="saveNote">${member ? `Se guardará como <b>${esc(Session.name())}</b> en el Salón de la Fama.` : `Como invitado, se guarda solo en este dispositivo.`}</p>
      <div class="stack">
        <button class="btn yel" id="saveBtn" ${score <= 0 ? "disabled" : ""}>GUARDAR PUNTUACIÓN</button>
        <div class="row">
          <button class="btn" id="againBtn">JUGAR DE NUEVO</button>
          <button class="btn ghost" id="vaultBtn">VOLVER AL VAULT</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(back);
  $("#saveBtn").focus();
  $("#saveBtn").onclick = async e => {
    const btn = e.currentTarget; btn.disabled = true; btn.textContent = "GUARDANDO…";
    let note;
    if (member) {
      const rank = await API.submitScore(g.id, Session.name(), score);
      note = rank && rank <= 10 ? `¡Entraste al top 10 en el puesto ${rank}!` : `Puesto ${rank} en ${g.title}.`;
    } else {
      const gb = store.get(K.guest, {}); gb[g.id] = Math.max(gb[g.id] || 0, score); store.set(K.guest, gb);
      note = `Guardada en este dispositivo. <a href="#/acceso" style="color:var(--cyan)">Crea una cuenta</a> para entrar al Salón de la Fama.`;
    }
    btn.remove(); $("#saveNote").innerHTML = "";
    await typewriter($("#typer"), "PUNTUACIÓN GUARDADA");
    const n = $("#saveNote"); if (n) n.innerHTML = note;
  };
  $("#againBtn").onclick = () => { back.remove(); renderPlayer($("#app"), g); };
  $("#vaultBtn").onclick = () => { location.hash = "#/"; };
  back.addEventListener("click", e => { if (e.target.closest("a")) back.remove(); });
}
async function typewriter(el, text) {
  if (!el) return; el.textContent = "";
  for (const ch of text) { if (!el.isConnected) return; el.textContent += ch; await sleep(55); }
}
