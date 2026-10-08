'use strict';

// ----- Configuración general -----
const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );
const W = canvas.width;
const H = canvas.height;

const PADDLE_W = 104;
const PADDLE_H = 16;
const PADDLE_Y = H - 40;
const PADDLE_SPEED = 8;

const BALL_SIZE = 14;
const BALL_SPEED = 5;

const COLS = 10;
const BRICK_W = 70;
const BRICK_H = 24;
const BRICK_GAP = 5;
const GRID_TOP = 50;
const GRID_LEFT = ( W - ( COLS * BRICK_W + ( COLS - 1 ) * BRICK_GAP ) ) / 2;

// Disposición de filas por nivel: cada letra es un color de bloque.
const LEVELS = [
  [ 'red', 'red', 'yellow', 'yellow', 'green' ],
  [ 'hotpink', 'magenta', 'cyan', 'cyan', 'green', 'yellow' ],
  [ 'red', 'hotpink', 'magenta', 'cyan', 'green', 'yellow', 'red', 'cyan' ],
];

// ----- Sonidos -----
const sndBounce = new Audio( 'assets/sounds/ball-bounce.mp3' );
const sndBreak = new Audio( 'assets/sounds/break-sound.mp3' );
sndBounce.volume = 0.5;
sndBreak.volume = 0.6;

function play( sound ) {
  try {
    sound.currentTime = 0;
    sound.play().catch( () => {} );
  } catch ( e ) { /* ignorar */ }
}

// ----- Estado del juego -----
const State = { MENU: 'menu', READY: 'ready', PLAYING: 'playing', OVER: 'over', WIN: 'win' };

let state = State.MENU;
let score = 0;
let lives = 3;
let level = 0;
let bricks = [];
let explosions = [];
let ssReady = false;

const paddle = { x: ( W - PADDLE_W ) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };
const ball = { x: 0, y: 0, vx: 0, vy: 0, size: BALL_SIZE };

const keys = { left: false, right: false };
let mouseX = null;

// ----- Elementos de interfaz -----
const scoreEl = document.getElementById( 'score' );
const livesEl = document.getElementById( 'lives' );
const levelEl = document.getElementById( 'level' );
const overlay = document.getElementById( 'overlay' );
const overlayTitle = document.getElementById( 'overlayTitle' );
const overlayText = document.getElementById( 'overlayText' );
const startBtn = document.getElementById( 'startBtn' );

function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level + 1;
}

function showOverlay( title, text, button ) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startBtn.textContent = button;
  overlay.classList.remove( 'hidden' );
}

function hideOverlay() {
  overlay.classList.add( 'hidden' );
}

// ----- Construcción de niveles -----
function buildLevel( idx ) {
  bricks = [];
  explosions = [];
  const rows = LEVELS[ idx ];
  for ( let r = 0; r < rows.length; r++ ) {
    for ( let c = 0; c < COLS; c++ ) {
      bricks.push( {
        x: GRID_LEFT + c * ( BRICK_W + BRICK_GAP ),
        y: GRID_TOP + r * ( BRICK_H + BRICK_GAP ),
        w: BRICK_W,
        h: BRICK_H,
        color: rows[ r ],
        alive: true,
      } );
    }
  }
}

function resetBall() {
  ball.x = paddle.x + paddle.w / 2 - ball.size / 2;
  ball.y = paddle.y - ball.size - 2;
  ball.vx = 0;
  ball.vy = 0;
  state = State.READY;
}

function launchBall() {
  if ( state !== State.READY ) return;
  const angle = ( Math.random() * 0.5 - 0.25 ) * Math.PI; // ±45° respecto a la vertical
  ball.vx = BALL_SPEED * Math.sin( angle );
  ball.vy = -BALL_SPEED * Math.cos( angle );
  state = State.PLAYING;
}

function startGame() {
  score = 0;
  lives = 3;
  level = 0;
  buildLevel( level );
  paddle.x = ( W - PADDLE_W ) / 2;
  resetBall();
  updateHUD();
  hideOverlay();
}

function nextLevelOrWin() {
  if ( level + 1 < LEVELS.length ) {
    level++;
    buildLevel( level );
    paddle.x = ( W - PADDLE_W ) / 2;
    resetBall();
    updateHUD();
  } else {
    state = State.WIN;
    showOverlay( '¡Ganaste!', `Completaste todos los niveles con ${ score } puntos.`, 'Jugar de nuevo' );
  }
}

function loseLife() {
  lives--;
  updateHUD();
  if ( lives <= 0 ) {
    state = State.OVER;
    showOverlay( 'Game Over', `Puntuación final: ${ score }.`, 'Reintentar' );
  } else {
    resetBall();
  }
}

// ----- Actualización de física -----
function update( now ) {
  // Movimiento del paddle
  if ( mouseX !== null ) {
    paddle.x = mouseX - paddle.w / 2;
  }
  if ( keys.left ) paddle.x -= PADDLE_SPEED;
  if ( keys.right ) paddle.x += PADDLE_SPEED;
  paddle.x = Math.max( 0, Math.min( W - paddle.w, paddle.x ) );

  if ( state === State.READY ) {
    ball.x = paddle.x + paddle.w / 2 - ball.size / 2;
    return;
  }
  if ( state !== State.PLAYING ) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Paredes laterales
  if ( ball.x <= 0 ) { ball.x = 0; ball.vx = -ball.vx; play( sndBounce ); }
  if ( ball.x + ball.size >= W ) { ball.x = W - ball.size; ball.vx = -ball.vx; play( sndBounce ); }
  // Techo
  if ( ball.y <= 0 ) { ball.y = 0; ball.vy = -ball.vy; play( sndBounce ); }

  // Caída: pérdida de vida
  if ( ball.y > H ) { loseLife(); return; }

  // Colisión con el paddle
  if ( ball.vy > 0 &&
       ball.y + ball.size >= paddle.y &&
       ball.y + ball.size <= paddle.y + paddle.h + Math.abs( ball.vy ) &&
       ball.x + ball.size >= paddle.x &&
       ball.x <= paddle.x + paddle.w ) {
    ball.y = paddle.y - ball.size;
    // El ángulo depende de dónde golpea en el paddle
    const hit = ( ball.x + ball.size / 2 - paddle.x ) / paddle.w; // 0..1
    const angle = ( hit - 0.5 ) * ( Math.PI * 0.7 ); // ±63°
    ball.vx = BALL_SPEED * Math.sin( angle );
    ball.vy = -BALL_SPEED * Math.cos( angle );
    play( sndBounce );
  }

  // Colisión con bloques
  for ( const b of bricks ) {
    if ( !b.alive ) continue;
    if ( ball.x + ball.size > b.x && ball.x < b.x + b.w &&
         ball.y + ball.size > b.y && ball.y < b.y + b.h ) {
      b.alive = false;
      score += 10;
      updateHUD();
      play( sndBreak );
      spawnExplosion( b, now );

      // Determina el eje de rebote según el solapamiento menor
      const overlapX = Math.min( ball.x + ball.size - b.x, b.x + b.w - ball.x );
      const overlapY = Math.min( ball.y + ball.size - b.y, b.y + b.h - ball.y );
      if ( overlapX < overlapY ) ball.vx = -ball.vx;
      else ball.vy = -ball.vy;
      break;
    }
  }

  // ¿Nivel completado?
  if ( bricks.every( b => !b.alive ) ) {
    nextLevelOrWin();
  }
}

// ----- Animación de explosión -----
function spawnExplosion( brick, now ) {
  explosions.push( { x: brick.x, y: brick.y, w: brick.w, h: brick.h, color: brick.color, start: now } );
}

function drawExplosions( now ) {
  const frames = EXPLOSION_FRAMES;
  explosions = explosions.filter( ex => {
    const elapsed = now - ex.start;
    if ( elapsed >= EXPLOSION_DURATION ) return false;
    const list = frames[ ex.color ] || frames.red;
    // Clamp al rango válido: `elapsed` puede ser ligeramente negativo en el
    // frame de creación (el timestamp del rAF es anterior a `now` de spawn).
    const raw = Math.floor( ( elapsed / EXPLOSION_DURATION ) * list.length );
    const idx = Math.max( 0, Math.min( list.length - 1, raw ) );
    drawFrame( ctx, list[ idx ], ex.x, ex.y, ex.w, ex.h );
    return true;
  } );
}

// ----- Dibujo -----
function draw( now ) {
  ctx.clearRect( 0, 0, W, H );

  // Bloques
  for ( const b of bricks ) {
    if ( b.alive ) drawSprite( ctx, 'block_' + b.color, b.x, b.y, b.w, b.h );
  }

  drawExplosions( now );

  // Paddle
  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );

  // Bola
  if ( state === State.READY || state === State.PLAYING ) {
    drawSprite( ctx, 'ball', ball.x, ball.y, ball.size, ball.size );
  }

  // Mensaje de "lanza la bola"
  if ( state === State.READY ) {
    ctx.fillStyle = 'rgba(232, 236, 255, 0.85)';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText( 'Clic o barra espaciadora para lanzar', W / 2, H - 70 );
  }
}

// ----- Bucle principal -----
function loop( now ) {
  update( now );
  draw( now );
  requestAnimationFrame( loop );
}

// ----- Entrada del usuario -----
canvas.addEventListener( 'mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = ( e.clientX - rect.left ) * ( W / rect.width );
} );

canvas.addEventListener( 'mouseleave', () => { mouseX = null; } );

canvas.addEventListener( 'click', () => {
  if ( state === State.READY ) launchBall();
} );

document.addEventListener( 'keydown', e => {
  if ( e.key === 'ArrowLeft' ) { keys.left = true; mouseX = null; }
  if ( e.key === 'ArrowRight' ) { keys.right = true; mouseX = null; }
  if ( e.key === ' ' || e.code === 'Space' ) {
    e.preventDefault();
    if ( state === State.READY ) launchBall();
  }
} );

document.addEventListener( 'keyup', e => {
  if ( e.key === 'ArrowLeft' ) keys.left = false;
  if ( e.key === 'ArrowRight' ) keys.right = false;
} );

startBtn.addEventListener( 'click', () => {
  if ( !ssReady ) return;
  startGame();
} );

// ----- Arranque -----
showOverlay( 'Arkanoid', 'Rompe todos los bloques con la bola sin dejarla caer. ¡Tienes 3 vidas!', 'Cargando…' );
loadSpritesheet( () => {
  ssReady = true;
  startBtn.textContent = 'Jugar';
} );
requestAnimationFrame( loop );
