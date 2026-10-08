"use strict";
/* ---------- 4. INVASORES ---------- */
function InvadersGame(ctx, W, H, hud) {
  const COLS = 8, ROWS = 4, SX = 44, SY = 34, PS = 3, AW = 8 * PS, AH = 6 * PS, ROWC = [MG, YE, GR, CY];
  const P = Particles();
  let player = { x: W / 2, y: H - 36 }, shots = [], bombs = [], aliens = [], dir = 1, speed = 30, bombT = 1.5;
  let score = 0, lives = 3, level = 1, dead = false, inv = 0, held = {}, cool = 0, frameT = 0, frame = 0, wavePause = 0;
  const stars = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + .5 }));
  function wave() {
    aliens = []; const top = 56 + Math.min(level - 1, 4) * 12, left = (W - ((COLS - 1) * SX + AW)) / 2;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) aliens.push({ x: left + c * SX, y: top + r * SY, r, c, alive: true });
    dir = 1; speed = 26 + level * 8; bombT = 1.5; shots = []; bombs = [];
  }
  function over() { dead = true; hud.over(score); }
  wave(); hud.score(0); hud.lives(lives); hud.level(level);
  return {
    key(k, down) { held[k] = down; },
    update(dt) {
      P.update(dt); for (const s of stars) { s.y += s.s * 12 * dt; if (s.y > H) s.y = 0; }
      if (dead) return;
      if (wavePause > 0) { wavePause -= dt; if (wavePause <= 0) wave(); return; }
      frameT += dt; if (frameT > .45) { frameT = 0; frame ^= 1; }
      inv = Math.max(0, inv - dt); cool -= dt;
      if (held.left) player.x -= 250 * dt; if (held.right) player.x += 250 * dt;
      player.x = clamp(player.x, 20, W - 20);
      if ((held.fire || held.up) && cool <= 0 && shots.length < 2) { shots.push({ x: player.x, y: player.y - 14 }); cool = .32; }
      for (const s of shots) s.y -= 500 * dt;
      shots = shots.filter(s => s.y > -10);
      let alive = aliens.filter(a => a.alive);
      const sp = speed * (1 + (COLS * ROWS - alive.length) / (COLS * ROWS) * 2.6);
      let minX = Infinity, maxX = -Infinity;
      for (const a of alive) { a.x += dir * sp * dt; minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x + AW); }
      if ((dir > 0 && maxX > W - 10) || (dir < 0 && minX < 10)) { dir *= -1; for (const a of alive) { a.y += 14; a.x += dir * 3; } }
      bombT -= dt;
      if (bombT <= 0 && alive.length) {
        const pick = alive[rnd(alive.length)], col = alive.filter(a => a.c === pick.c).sort((a, b) => b.y - a.y)[0];
        bombs.push({ x: col.x + AW / 2, y: col.y + AH }); bombT = Math.max(.35, 1.3 - level * .12) * (.6 + Math.random() * .8);
      }
      for (const b of bombs) b.y += (180 + level * 15) * dt;
      bombs = bombs.filter(b => b.y < H + 10);
      for (const s of shots) for (const a of alive) {
        if (a.alive && !s.dead && s.x > a.x - 2 && s.x < a.x + AW + 2 && s.y > a.y && s.y < a.y + AH) {
          a.alive = false; s.dead = true; score += (ROWS - a.r) * 10 * level; hud.score(score); P.add(a.x + AW / 2, a.y + AH / 2, ROWC[a.r], 16);
        }
      }
      shots = shots.filter(s => !s.dead);
      alive = aliens.filter(a => a.alive);
      if (inv <= 0) for (const b of bombs) {
        if (Math.abs(b.x - player.x) < 15 && b.y > player.y - 10 && b.y < player.y + 12) {
          lives--; hud.lives(lives); inv = 1.6; bombs = []; P.add(player.x, player.y, CY, 30, 220);
          if (lives <= 0) { over(); return; }
          break;
        }
      }
      if (alive.some(a => a.y + AH >= player.y - 14)) { lives = 0; hud.lives(0); P.add(player.x, player.y, CY, 30, 220); over(); return; }
      if (!alive.length) { level++; hud.level(level); wavePause = 1.2; }
    },
    render() {
      bgClear(ctx, W, H, "rgba(0,0,0,0)");
      ctx.fillStyle = "rgba(230,244,255,.5)"; for (const s of stars) ctx.fillRect(s.x, s.y, s.s, s.s);
      for (const a of aliens) if (a.alive) drawSprite(ctx, ALIEN[frame], a.x, a.y, PS, ROWC[a.r]);
      neon(ctx, YE, 10); for (const s of shots) ctx.fillRect(s.x - 1.5, s.y - 8, 3, 12);
      neon(ctx, MG, 10); for (const b of bombs) { ctx.fillRect(b.x - 2, b.y - 6, 4, 4); ctx.fillRect(b.x - 2 + (Math.floor(b.y / 6) % 2 ? 2 : -2), b.y - 2, 4, 4); }
      if (!dead && (inv <= 0 || Math.floor(inv * 10) % 2)) {
        neon(ctx, CY, 14); ctx.beginPath();
        ctx.moveTo(player.x, player.y - 14); ctx.lineTo(player.x + 16, player.y + 10); ctx.lineTo(player.x + 6, player.y + 6); ctx.lineTo(player.x - 6, player.y + 6); ctx.lineTo(player.x - 16, player.y + 10); ctx.closePath(); ctx.fill();
      }
      ctx.shadowBlur = 0; neon(ctx, GR, 6); ctx.fillRect(0, H - 12, W, 2); ctx.shadowBlur = 0;
      P.draw(ctx);
      if (wavePause > 0) pixText(ctx, `OLEADA ${level}`, W / 2, H / 2, 16, MG);
    }
  };
}
