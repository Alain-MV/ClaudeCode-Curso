"use strict";
/* ---------- 6. TENIS NEÓN ---------- */
function TennisGame(ctx, W, H, hud) {
  const PH = 72, PW = 10, LX = 24, RX = W - 34; const P = Particles();
  let py = H / 2, ay = H / 2, ball, score = 0, lives = 5, level = 1, points = 0, serve = 0, held = {}, dead = false, pointerY = null;
  function newBall(d) { ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 7, d }; serve = .9; }
  function launch() { const sp = 260 + level * 28, a = Math.random() * .8 - .4; ball.vx = Math.cos(a) * sp * ball.d; ball.vy = Math.sin(a) * sp; }
  newBall(1); hud.score(0); hud.lives(lives); hud.level(level);
  return {
    key(k, down) { held[k] = down; if (down && (k === "up" || k === "down")) pointerY = null; },
    pointer(x, y) { pointerY = y; },
    update(dt) {
      P.update(dt); if (dead) return;
      if (pointerY !== null) py += clamp(pointerY - py, -700 * dt, 700 * dt);
      if (held.up) py -= 380 * dt; if (held.down) py += 380 * dt;
      py = clamp(py, PH / 2, H - PH / 2);
      const target = ball.vx > 0 ? ball.y : H / 2, ms = 160 + level * 32;
      ay = clamp(ay + clamp(target - ay, -ms * dt, ms * dt), PH / 2, H - PH / 2);
      if (serve > 0) { serve -= dt; if (serve <= 0) launch(); return; }
      const steps = Math.ceil(Math.hypot(ball.vx, ball.vy) * dt / 4);
      for (let i = 0; i < steps; i++) {
        ball.x += ball.vx * dt / steps; ball.y += ball.vy * dt / steps;
        if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
        if (ball.y > H - ball.r) { ball.y = H - ball.r; ball.vy = -Math.abs(ball.vy); }
        const hit = (px, cy, dirOut) => {
          const rel = clamp((ball.y - cy) / (PH / 2), -1, 1), sp = Math.min(Math.hypot(ball.vx, ball.vy) * 1.05, 720);
          ball.vx = Math.cos(rel * 1.0) * sp * dirOut; ball.vy = Math.sin(rel * 1.0) * sp; P.add(px, ball.y, dirOut > 0 ? CY : MG, 8, 120);
        };
        if (ball.vx < 0 && ball.x - ball.r <= LX + PW && ball.x - ball.r >= LX - 6 && Math.abs(ball.y - py) < PH / 2 + ball.r) { ball.x = LX + PW + ball.r; hit(LX + PW, py, 1); }
        if (ball.vx > 0 && ball.x + ball.r >= RX && ball.x + ball.r <= RX + PW + 6 && Math.abs(ball.y - ay) < PH / 2 + ball.r) { ball.x = RX - ball.r; hit(RX, ay, -1); }
      }
      if (ball.x < -20) {
        lives--; hud.lives(lives); P.add(10, ball.y, MG, 20);
        if (lives <= 0) { dead = true; hud.over(score); return; }
        newBall(1);
      } else if (ball.x > W + 20) {
        points++; score += 100 * level; hud.score(score); P.add(W - 10, ball.y, YE, 20);
        if (points % 3 === 0) { level++; hud.level(level); }
        newBall(-1);
      }
    },
    render() {
      bgClear(ctx, W, H, "rgba(0,245,255,.035)");
      neon(ctx, "rgba(230,244,255,.35)", 0); for (let y = 8; y < H; y += 24) ctx.fillRect(W / 2 - 2, y, 4, 12);
      pixText(ctx, String(points), W / 2 - 50, 36, 22, CY); pixText(ctx, String(5 - lives), W / 2 + 50, 36, 22, MG);
      neon(ctx, CY, 16); ctx.fillRect(LX, py - PH / 2, PW, PH);
      neon(ctx, MG, 16); ctx.fillRect(RX, ay - PH / 2, PW, PH);
      neon(ctx, YE, 16); ctx.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);
      ctx.shadowBlur = 0; P.draw(ctx);
      if (serve > 0 && !dead) pixText(ctx, "¡SAQUE!", W / 2, H / 2 + 50, 10, "#8a93ad");
    }
  };
}
