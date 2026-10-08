"use strict";
/* ---------- 3. ROMPEMUROS ---------- */
function BreakoutGame(ctx, W, H, hud) {
  const P = Particles(); const ROWC = [MG, OR, YE, GR, CY, BL];
  let paddle = { x: W / 2, y: H - 30, w: 84 }, ball, bricks, score = 0, lives = 3, level = 1, dead = false, held = {}, banner = 1.2;
  function build() {
    bricks = []; const cols = 10, bw = 44, bh = 16, gap = 4, left = (W - (cols * bw + (cols - 1) * gap)) / 2;
    const rows = Math.min(6, 4 + level);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (level % 2 === 0 && (r + c) % 5 === 0) continue;
      bricks.push({ x: left + c * (bw + gap), y: 60 + r * (bh + gap), w: bw, h: bh, row: r, hp: (level >= 3 && r === 0) ? 2 : 1 });
    }
  }
  function newBall() { ball = { x: paddle.x, y: paddle.y - 10, vx: 0, vy: 0, r: 6, stuck: true }; }
  function launch() { if (!ball.stuck) return; const sp = 280 + level * 30, a = (Math.random() * .6 - .3); ball.vx = Math.sin(a) * sp; ball.vy = -Math.cos(a) * sp; ball.stuck = false; }
  build(); newBall(); hud.score(0); hud.lives(lives); hud.level(level);
  return {
    key(k, down) { held[k] = down; if (down && (k === "fire" || k === "up")) launch(); },
    pointer(x, y, type) { paddle.x = clamp(x, paddle.w / 2, W - paddle.w / 2); if (type === "down") launch(); },
    update(dt) {
      P.update(dt); banner = Math.max(0, banner - dt); if (dead) return;
      if (held.left) paddle.x -= 460 * dt; if (held.right) paddle.x += 460 * dt;
      paddle.x = clamp(paddle.x, paddle.w / 2, W - paddle.w / 2);
      if (ball.stuck) { ball.x = paddle.x; ball.y = paddle.y - 10; return; }
      const sp = Math.hypot(ball.vx, ball.vy), steps = Math.ceil(sp * dt / 4);
      for (let i = 0; i < steps; i++) {
        ball.x += ball.vx * dt / steps; ball.y += ball.vy * dt / steps;
        if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
        if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
        if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y + ball.r <= paddle.y + 14 && Math.abs(ball.x - paddle.x) <= paddle.w / 2 + ball.r) {
          const rel = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1), a = rel * 1.05, ns = Math.min(sp * 1.015, 640);
          ball.vx = Math.sin(a) * ns; ball.vy = -Math.cos(a) * ns; ball.y = paddle.y - ball.r; P.add(ball.x, paddle.y, CY, 6, 90);
        }
        for (const b of bricks) {
          const cx = clamp(ball.x, b.x, b.x + b.w), cy = clamp(ball.y, b.y, b.y + b.h), dx = ball.x - cx, dy = ball.y - cy;
          if (dx * dx + dy * dy <= ball.r * ball.r) {
            const ox = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r)), oy = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
            if (ox < oy) ball.vx *= -1; else ball.vy *= -1;
            b.hp--; P.add(b.x + b.w / 2, b.y + b.h / 2, ROWC[b.row], b.hp ? 5 : 14);
            if (b.hp <= 0) { b.dead = true; score += (6 - b.row) * 10 * level; hud.score(score); }
            break;
          }
        }
        bricks = bricks.filter(b => !b.dead);
      }
      if (ball.y > H + 20) {
        lives--; hud.lives(lives);
        if (lives <= 0) { dead = true; hud.over(score); return; }
        newBall();
      }
      if (!bricks.length) { level++; hud.level(level); build(); newBall(); banner = 1.2; }
    },
    render() {
      bgClear(ctx, W, H);
      for (const b of bricks) { const c = ROWC[b.row]; neon(ctx, c, 10); ctx.fillStyle = c + (b.hp > 1 ? "aa" : "33"); ctx.fillRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 2; ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2); }
      ctx.shadowBlur = 0;
      neon(ctx, CY, 16); ctx.fillRect(paddle.x - paddle.w / 2, paddle.y, paddle.w, 10);
      neon(ctx, YE, 16); ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      P.draw(ctx);
      if (ball.stuck && !dead) pixText(ctx, banner > 0 ? `NIVEL ${level}` : "ESPACIO PARA LANZAR", W / 2, H / 2 + 40, 10, banner > 0 ? MG : "#8a93ad");
    }
  };
}
