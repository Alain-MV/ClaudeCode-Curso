"use strict";
/* ---------- 1. SERPIENTE ---------- */
function SnakeGame(ctx, W, H, hud) {
  const N = 20, C = W / N; const P = Particles();
  let snake, dir, nextDir, food, acc = 0, score = 0, lives = 3, level = 1, eaten = 0, dead = false, flash = 0, pulse = 0;
  function reset() { snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; dir = { x: 1, y: 0 }; nextDir = dir; placeFood(); acc = -0.4; }
  function placeFood() { do { food = { x: rnd(N), y: rnd(N) }; } while (snake.some(s => s.x === food.x && s.y === food.y)); }
  function tick() {
    dir = nextDir;
    const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some(s => s.x === h.x && s.y === h.y)) {
      P.add(snake[0].x * C + C / 2, snake[0].y * C + C / 2, MG, 24);
      lives--; hud.lives(lives); flash = .35;
      if (lives <= 0) { dead = true; hud.over(score); return; }
      reset(); return;
    }
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      eaten++; score += 10 * level; hud.score(score); P.add(food.x * C + C / 2, food.y * C + C / 2, YE, 14);
      if (eaten % 5 === 0) { level++; hud.level(level); }
      placeFood();
    } else snake.pop();
  }
  reset(); hud.score(0); hud.lives(lives); hud.level(level);
  return {
    key(k, down) {
      if (!down) return;
      const m = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } }[k];
      if (m && (m.x !== -dir.x || m.y !== -dir.y)) nextDir = m;
    },
    update(dt) {
      P.update(dt); flash = Math.max(0, flash - dt); pulse += dt; if (dead) return;
      acc += dt; const interval = Math.max(.055, .14 - (level - 1) * .011);
      while (acc >= interval) { acc -= interval; tick(); if (dead) break; }
    },
    render() {
      bgClear(ctx, W, H);
      ctx.strokeStyle = CY; ctx.lineWidth = 2; neon(ctx, CY, 10); ctx.strokeRect(1, 1, W - 2, H - 2); ctx.shadowBlur = 0;
      const fp = 3 + Math.sin(pulse * 6) * 1.5;
      neon(ctx, MG, 16); ctx.fillRect(food.x * C + fp, food.y * C + fp, C - fp * 2, C - fp * 2);
      snake.forEach((s, i) => {
        const col = i === 0 ? YE : CY; neon(ctx, col, i === 0 ? 14 : 8);
        ctx.globalAlpha = i === 0 ? 1 : Math.max(.45, 1 - i / (snake.length + 6));
        ctx.fillRect(s.x * C + 2, s.y * C + 2, C - 4, C - 4);
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; P.draw(ctx);
      if (flash > 0) { ctx.fillStyle = `rgba(255,0,110,${flash})`; ctx.fillRect(0, 0, W, H); }
    }
  };
}
