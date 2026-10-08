"use strict";
/* ---------- 2. BLOQUES ---------- */
function BlocksGame(ctx, W, H, hud) {
  const COLS = 10, ROWS = 20, S = 24, OX = 12, OY = 0;
  const SHAPES = { I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1],[0,0,0]], S: [[0,1,1],[1,1,0],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]], J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]] };
  const COL = { I: CY, O: YE, T: MG, S: GR, Z: RD, J: BL, L: OR };
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const P = Particles();
  let bag = [], piece, next, acc = 0, score = 0, lines = 0, level = 1, dead = false, soft = false, clearFx = 0;
  const randType = () => { if (!bag.length) bag = Object.keys(SHAPES).sort(() => Math.random() - .5); return bag.pop(); };
  const rot = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
  function collide(m, x, y) {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) if (m[r][c]) {
      const nx = x + c, ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
    return false;
  }
  function spawn() {
    const t = next || randType(); next = randType();
    piece = { t, m: SHAPES[t].map(r => r.slice()), x: t === "O" ? 4 : 3, y: t === "I" ? -1 : 0 };
    if (collide(piece.m, piece.x, piece.y)) { dead = true; hud.over(score); }
  }
  function lock() {
    let top = false;
    piece.m.forEach((row, r) => row.forEach((v, c) => { if (v) { const y = piece.y + r; if (y < 0) top = true; else board[y][piece.x + c] = COL[piece.t]; } }));
    if (top) { dead = true; hud.over(score); return; }
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        for (let x = 0; x < COLS; x++) P.add(OX + x * S + S / 2, OY + y * S + S / 2, board[y][x], 3, 120);
        board.splice(y, 1); board.unshift(Array(COLS).fill(null)); cleared++; y++;
      }
    }
    if (cleared) {
      score += [0, 100, 300, 500, 800][cleared] * level; lines += cleared; clearFx = .25;
      const nl = Math.floor(lines / 10) + 1; if (nl !== level) { level = nl; hud.level(level); }
      hud.score(score);
    }
    spawn();
  }
  function move(dx) { if (!collide(piece.m, piece.x + dx, piece.y)) piece.x += dx; }
  function rotate() {
    const m = rot(piece.m);
    for (const k of [0, -1, 1, -2, 2]) if (!collide(m, piece.x + k, piece.y)) { piece.m = m; piece.x += k; return; }
  }
  function down() { if (!collide(piece.m, piece.x, piece.y + 1)) { piece.y++; return true; } lock(); return false; }
  function ghostY() { let y = piece.y; while (!collide(piece.m, piece.x, y + 1)) y++; return y; }
  function cell(x, y, color, alpha = 1, size = S) {
    ctx.globalAlpha = alpha; neon(ctx, color, 10);
    ctx.fillStyle = color + "40"; ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    ctx.globalAlpha = 1;
  }
  spawn(); hud.score(0); hud.lives(1); hud.level(1);
  return {
    key(k, isDown, repeat) {
      if (dead) return;
      if (k === "down") { soft = isDown; return; }
      if (!isDown) return;
      if (k === "left") move(-1);
      else if (k === "right") move(1);
      else if (k === "up" && !repeat) rotate();
      else if (k === "fire" && !repeat) { let n = 0; while (down()) n++; score += n * 2; hud.score(score); }
    },
    update(dt) {
      P.update(dt); clearFx = Math.max(0, clearFx - dt); if (dead) return;
      acc += dt; const iv = soft ? .04 : Math.max(.08, .8 - (level - 1) * .07);
      while (acc >= iv) { acc -= iv; if (soft && down()) { score += 1; hud.score(score); } else if (!soft) down(); if (dead) break; }
    },
    render() {
      bgClear(ctx, W, H, "rgba(0,0,0,0)");
      ctx.strokeStyle = "rgba(0,245,255,.07)"; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= COLS; x++) { ctx.moveTo(OX + x * S + .5, OY); ctx.lineTo(OX + x * S + .5, OY + ROWS * S); }
      for (let y = 0; y <= ROWS; y++) { ctx.moveTo(OX, OY + y * S + .5); ctx.lineTo(OX + COLS * S, OY + y * S + .5); }
      ctx.stroke();
      neon(ctx, CY, 12); ctx.lineWidth = 2; ctx.strokeRect(OX - 1, OY - 1, COLS * S + 2, ROWS * S + 2); ctx.shadowBlur = 0;
      board.forEach((row, y) => row.forEach((c, x) => { if (c) cell(OX + x * S, OY + y * S, c); }));
      if (!dead && piece) {
        const gy = ghostY();
        piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && gy + r >= 0) { ctx.globalAlpha = .25; ctx.strokeStyle = COL[piece.t]; ctx.lineWidth = 2; ctx.strokeRect(OX + (piece.x + c) * S + 3, OY + (gy + r) * S + 3, S - 6, S - 6); ctx.globalAlpha = 1; } }));
        piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && piece.y + r >= 0) cell(OX + (piece.x + c) * S, OY + (piece.y + r) * S, COL[piece.t]); }));
      }
      P.draw(ctx);
      if (clearFx > 0) { ctx.fillStyle = `rgba(255,255,255,${clearFx * .5})`; ctx.fillRect(OX, OY, COLS * S, ROWS * S); }
      const sx = OX + COLS * S + 22, cx = sx + (W - sx) / 2 - 6;
      pixText(ctx, "SIG.", cx, 36, 10, YE);
      if (next) { const m = SHAPES[next], ms = 18; const w = m[0].length * ms; m.forEach((row, r) => row.forEach((v, c) => { if (v) cell(cx - w / 2 + c * ms, 62 + r * ms, COL[next], 1, ms); })); }
      pixText(ctx, "LÍNEAS", cx, 170, 8, "#8a93ad"); pixText(ctx, String(lines), cx, 194, 14, CY);
      pixText(ctx, "NIVEL", cx, 240, 8, "#8a93ad"); pixText(ctx, String(level), cx, 264, 14, MG);
    }
  };
}
