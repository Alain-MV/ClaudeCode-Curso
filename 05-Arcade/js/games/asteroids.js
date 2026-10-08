"use strict";
/* ---------- 5. ASTEROIDES ---------- */
function AsteroidsGame(ctx, W, H, hud) {
  const P = Particles(); const RAD = [40, 22, 12], PTS = [20, 50, 100];
  let ship = null, bullets = [], rocks = [], score = 0, lives = 3, level = 1, dead = false, held = {}, cool = 0, respawn = 0, banner = 1.2;
  const wrap = o => { if (o.x < -20) o.x += W + 40; if (o.x > W + 20) o.x -= W + 40; if (o.y < -20) o.y += H + 40; if (o.y > H + 20) o.y -= H + 40; };
  function newShip() { ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, inv: 2.5, thrust: false }; }
  function rock(x, y, size) {
    const n = 11, verts = []; for (let i = 0; i < n; i++) verts.push(RAD[size] * (.72 + Math.random() * .38));
    const a = Math.random() * Math.PI * 2, sp = (35 + Math.random() * 45) * (1 + size * .45) * (1 + level * .07);
    return { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: RAD[size], size, verts, rot: 0, vr: (Math.random() - .5) * 1.6 };
  }
  function spawnLevel() {
    rocks = []; const cx = ship ? ship.x : W / 2, cy = ship ? ship.y : H / 2;
    for (let i = 0; i < 2 + level; i++) { let x, y; do { x = Math.random() * W; y = Math.random() * H; } while (Math.hypot(x - cx, y - cy) < 140); rocks.push(rock(x, y, 0)); }
  }
  newShip(); spawnLevel(); hud.score(0); hud.lives(lives); hud.level(level);
  return {
    key(k, down) { held[k] = down; },
    update(dt) {
      P.update(dt); banner = Math.max(0, banner - dt);
      for (const r of rocks) { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt; wrap(r); }
      if (dead) return;
      if (respawn > 0) { respawn -= dt; if (respawn <= 0) newShip(); }
      cool -= dt;
      if (ship) {
        if (held.left) ship.a -= 4.2 * dt; if (held.right) ship.a += 4.2 * dt;
        ship.thrust = !!held.up;
        if (ship.thrust) { ship.vx += Math.cos(ship.a) * 300 * dt; ship.vy += Math.sin(ship.a) * 300 * dt; }
        const d = Math.pow(.45, dt); ship.vx *= d; ship.vy *= d;
        ship.x += ship.vx * dt; ship.y += ship.vy * dt; wrap(ship); ship.inv = Math.max(0, ship.inv - dt);
        if (held.fire && cool <= 0 && bullets.length < 6) {
          bullets.push({ x: ship.x + Math.cos(ship.a) * 14, y: ship.y + Math.sin(ship.a) * 14, vx: Math.cos(ship.a) * 470 + ship.vx, vy: Math.sin(ship.a) * 470 + ship.vy, life: .85 }); cool = .2;
        }
      }
      for (const b of bullets) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrap(b); }
      const born = [];
      for (const b of bullets) for (const r of rocks) {
        if (b.life > 0 && !r.dead && Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
          b.life = 0; r.dead = true; score += PTS[r.size] * level; hud.score(score); P.add(r.x, r.y, r.size ? YE : MG, 10 + (2 - r.size) * 6);
          if (r.size < 2) born.push(rock(r.x, r.y, r.size + 1), rock(r.x, r.y, r.size + 1));
        }
      }
      bullets = bullets.filter(b => b.life > 0); rocks = rocks.filter(r => !r.dead).concat(born);
      if (ship && ship.inv <= 0) for (const r of rocks) {
        if (Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 9) {
          P.add(ship.x, ship.y, CY, 36, 240); ship = null; lives--; hud.lives(lives);
          if (lives <= 0) { dead = true; hud.over(score); return; }
          respawn = 1.4; break;
        }
      }
      if (!rocks.length) { level++; hud.level(level); spawnLevel(); banner = 1.2; }
    },
    render() {
      bgClear(ctx, W, H, "rgba(255,0,110,.035)");
      ctx.lineWidth = 2;
      for (const r of rocks) {
        neon(ctx, r.size === 0 ? MG : r.size === 1 ? OR : YE, 10); ctx.beginPath();
        r.verts.forEach((v, i) => { const a = r.rot + i / r.verts.length * Math.PI * 2, x = r.x + Math.cos(a) * v, y = r.y + Math.sin(a) * v; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.closePath(); ctx.stroke();
      }
      neon(ctx, YE, 8); for (const b of bullets) ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      if (ship && (ship.inv <= 0 || Math.floor(ship.inv * 10) % 2)) {
        const { x, y, a } = ship, p = (ang, d) => [x + Math.cos(a + ang) * d, y + Math.sin(a + ang) * d];
        neon(ctx, CY, 14); ctx.beginPath(); ctx.moveTo(...p(0, 15)); ctx.lineTo(...p(2.5, 12)); ctx.lineTo(...p(Math.PI, 5)); ctx.lineTo(...p(-2.5, 12)); ctx.closePath(); ctx.stroke();
        if (ship.thrust && Math.random() > .3) { neon(ctx, MG, 12); ctx.beginPath(); ctx.moveTo(...p(2.8, 8)); ctx.lineTo(...p(Math.PI, 14 + Math.random() * 6)); ctx.lineTo(...p(-2.8, 8)); ctx.stroke(); }
      }
      ctx.shadowBlur = 0; P.draw(ctx);
      if (banner > 0 && !dead) pixText(ctx, `NIVEL ${level}`, W / 2, H / 2 - 50, 14, CY);
    }
  };
}
