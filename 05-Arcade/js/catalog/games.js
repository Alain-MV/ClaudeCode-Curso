"use strict";
/* =====================================================================
   CATÁLOGO
   (src opcional: URL o srcdoc de un juego HTML externo; ver loadExternal)
   ===================================================================== */
const GAMES = [
  { id: "serpiente", title: "SERPIENTE", cat: "Clásicos", accent: CY, w: 480, h: 480, create: SnakeGame,
    short: "Come, crece y no choques contigo misma.",
    desc: "Guía a la serpiente de neón por la rejilla y devora cada píxel brillante. Cada bocado te hace más larga y cada cinco, más rápida. Un solo error y vuelves a empezar desde el centro.",
    controls: "<b>Flechas / WASD</b> para girar." },
  { id: "bloques", title: "BLOQUES", cat: "Puzle", accent: MG, w: 380, h: 480, create: BlocksGame,
    short: "Encaja las piezas y limpia líneas.",
    desc: "Las piezas caen sin descanso dentro del pozo. Gíralas y acomódalas para completar filas horizontales y hacerlas desaparecer. Limpia cuatro de golpe para la máxima puntuación.",
    controls: "<b>← →</b> mover · <b>↑</b> girar · <b>↓</b> bajar rápido · <b>Espacio</b> caída instantánea." },
  { id: "rompemuros", title: "ROMPEMUROS", cat: "Habilidad", accent: YE, w: 480, h: 480, create: BreakoutGame,
    short: "Rebota la bola y derriba cada ladrillo.",
    desc: "Controla la barra y mantén viva la bola mientras pulverizas el muro de ladrillos. El ángulo depende de dónde golpees. Los muros resistentes aparecen a partir del nivel tres.",
    controls: "<b>← →</b> o arrastra para mover · <b>Espacio</b> o toca para lanzar." },
  { id: "invasores", title: "INVASORES", cat: "Disparos", accent: GR, w: 480, h: 480, create: InvadersGame,
    short: "Detén la flota antes de que aterrice.",
    desc: "Una flota de criaturas tuertas desciende fila por fila. Dispara desde tu nave y esquiva sus bombas. Cuantas menos queden, más rápido se mueven.",
    controls: "<b>← →</b> mover · <b>Espacio</b> disparar." },
  { id: "asteroides", title: "ASTEROIDES", cat: "Disparos", accent: OR, w: 480, h: 480, create: AsteroidsGame,
    short: "Pulveriza rocas a la deriva en el vacío.",
    desc: "Tu nave flota en un campo de asteroides que se parten en pedazos más pequeños y veloces con cada disparo. Gira, acelera y dispara sin perder el control de la inercia.",
    controls: "<b>← →</b> girar · <b>↑</b> acelerar · <b>Espacio</b> disparar." },
  { id: "tenis", title: "TENIS NEÓN", cat: "Habilidad", accent: BL, w: 480, h: 360, create: TennisGame,
    short: "Devuelve cada bola contra la máquina.",
    desc: "Un duelo de reflejos contra una máquina que no se cansa. Cada punto que ganas suma y acelera el juego; cada bola que se te escapa te cuesta una vida.",
    controls: "<b>↑ ↓</b> o arrastra para mover la paleta." }
];
const CATS = ["Todos", "Clásicos", "Puzle", "Disparos", "Habilidad"];
const gameById = id => GAMES.find(g => g.id === id);
