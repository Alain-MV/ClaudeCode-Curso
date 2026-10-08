"use strict";
/* =====================================================================
   MOTOR DE JUEGOS
   Cada juego: create(ctx, W, H, hud) → { update(dt), render(), key(k, down, repeat), pointer?(x, y, type) }
   hud: score(n), lives(n), level(n), over(finalScore)
   ===================================================================== */
function Particles() {
  let list = [];
  return {
    add(x, y, color, n = 12, sp = 160) {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = sp * (.3 + Math.random() * .7); list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: .5 + Math.random() * .4, c: color }); }
    },
    update(dt) { for (const p of list) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.t -= dt; } list = list.filter(p => p.t > 0); },
    draw(ctx) { for (const p of list) { ctx.globalAlpha = clamp(p.t * 2, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); } ctx.globalAlpha = 1; }
  };
}
function bgClear(ctx, W, H, gridColor = "rgba(0,245,255,.05)") {
  ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.fillStyle = "#05050a"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0; x <= W; x += 24) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
  for (let y = 0; y <= H; y += 24) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
  ctx.stroke();
}
function neon(ctx, color, blur = 12) { ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.fillStyle = color; ctx.strokeStyle = color; }
function pixText(ctx, txt, x, y, size, color, align = "center") {
  ctx.font = `${size}px "Press Start 2P", monospace`; ctx.textAlign = align; ctx.textBaseline = "middle"; neon(ctx, color, 10); ctx.fillText(txt, x, y); ctx.shadowBlur = 0;
}
/* Sprite original: criatura de un solo ojo con tentáculos */
const ALIEN = [
  ["..XXXX..", ".XXXXXX.", "XXX..XXX", "XXX..XXX", ".XXXXXX.", "X.X..X.X"],
  ["..XXXX..", ".XXXXXX.", "XXX..XXX", "XXX..XXX", ".XXXXXX.", ".X.XX.X."]
];
function drawSprite(ctx, map, x, y, s, color) {
  neon(ctx, color, 8);
  map.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === "X") ctx.fillRect(x + c * s, y + r * s, s, s); });
  ctx.shadowBlur = 0;
}
