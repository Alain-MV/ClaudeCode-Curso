"use strict";
/* Portadas generadas en canvas */
function drawCover(id, canvas) {
  const W = 320, H = 180, dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b0b18"); g.addColorStop(1, "#05050a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,0,110,.18)"; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = -10; i <= 10; i++) { ctx.moveTo(W / 2 + i * 14, H * .62); ctx.lineTo(W / 2 + i * 60, H); }
  for (let y = H * .62, s = 4; y < H; s *= 1.45, y += s) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  if (id === "serpiente") {
    const path = [[3,7],[4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[8,5],[9,5],[10,5],[11,5],[11,6],[11,7],[12,7],[13,7]];
    path.forEach(([x, y], i) => { neon(ctx, i === path.length - 1 ? YE : CY, 12); ctx.fillRect(x * 16 + 2, y * 16 - 30, 13, 13); });
    neon(ctx, MG, 18); ctx.fillRect(17 * 16 + 4, 7 * 16 - 28, 9, 9);
  } else if (id === "bloques") {
    const C = { a: CY, b: MG, c: YE, d: GR, e: BL, f: OR }, S = 16, ox = 96;
    const stack = ["......c...", "f..c.ccc.e", "ff.bbddd.e", "afbbddcc.e", "aaaddffcce", "bbbbddffce"];
    stack.forEach((row, r) => [...row].forEach((k, c) => { if (C[k]) { neon(ctx, C[k], 8); ctx.fillStyle = C[k] + "55"; ctx.fillRect(ox + c * S + 1, 70 + r * S + 1, S - 2, S - 2); ctx.strokeRect(ox + c * S + 2, 70 + r * S + 2, S - 4, S - 4); } }));
    [[4, 0], [5, 0], [6, 0], [5, 1]].forEach(([c, r]) => { neon(ctx, MG, 12); ctx.fillRect(ox + c * S + 1, 18 + r * S + 1, S - 2, S - 2); });
  } else if (id === "rompemuros") {
    const cols = [MG, OR, YE, GR];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { if ((r + c) % 7 === 3) continue; neon(ctx, cols[r], 8); ctx.fillStyle = cols[r] + "44"; ctx.fillRect(26 + c * 30, 20 + r * 13, 27, 10); ctx.strokeRect(27 + c * 30, 21 + r * 13, 25, 8); }
    neon(ctx, CY, 14); ctx.fillRect(140, 150, 60, 7);
    neon(ctx, YE, 14); ctx.beginPath(); ctx.arc(200, 108, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(245,255,0,.35)"; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(170, 148); ctx.lineTo(200, 108); ctx.stroke(); ctx.setLineDash([]);
  } else if (id === "invasores") {
    const cols = [MG, YE, GR];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) drawSprite(ctx, ALIEN[(r + c) % 2], 62 + c * 34, 18 + r * 26, 2.5, cols[r]);
    neon(ctx, CY, 14); ctx.beginPath(); ctx.moveTo(160, 138); ctx.lineTo(174, 158); ctx.lineTo(146, 158); ctx.closePath(); ctx.fill();
    neon(ctx, YE, 10); ctx.fillRect(159, 104, 3, 12);
  } else if (id === "asteroides") {
    const rock = (x, y, r, c) => { neon(ctx, c, 10); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, v = r * (.75 + ((i * 37) % 10) / 30); ctx.lineTo(x + Math.cos(a) * v, y + Math.sin(a) * v); } ctx.closePath(); ctx.stroke(); };
    rock(70, 60, 32, MG); rock(250, 50, 24, OR); rock(230, 130, 14, YE); rock(100, 140, 12, YE);
    neon(ctx, CY, 14); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(176, 84); ctx.lineTo(150, 100); ctx.lineTo(158, 88); ctx.lineTo(150, 74); ctx.closePath(); ctx.stroke();
    neon(ctx, YE, 8); ctx.fillRect(196, 76, 3, 3); ctx.fillRect(214, 70, 3, 3);
  } else if (id === "tenis") {
    ctx.fillStyle = "rgba(230,244,255,.3)"; for (let y = 6; y < H; y += 18) ctx.fillRect(158, y, 4, 9);
    neon(ctx, CY, 14); ctx.fillRect(28, 50, 8, 48);
    neon(ctx, MG, 14); ctx.fillRect(284, 90, 8, 48);
    neon(ctx, YE, 14); ctx.fillRect(196, 66, 10, 10);
    pixText(ctx, "7", 130, 26, 14, CY); pixText(ctx, "4", 190, 26, 14, MG);
  }
  ctx.shadowBlur = 0;
}
