"use strict";
/* =====================================================================
   ARRANQUE
   ===================================================================== */
seedScores();
route();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { $$("canvas[data-cover]").forEach(c => drawCover(c.dataset.cover, c)); const dc = $("#dc"); if (dc) { const g = gameById(parseHash()[1]); if (g) drawCover(g.id, dc); } });
