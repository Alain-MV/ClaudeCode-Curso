"use strict";
/* =====================================================================
   🔌 CAPA DE DATOS — PUNTO DE CONEXIÓN CON EL BACKEND
   Hoy todo vive en localStorage. En producción, sustituye el cuerpo de
   cada método por tu backend real (REST o Supabase), por ejemplo:
     login        → supabase.auth.signInWithPassword({ email, password })
     register     → supabase.auth.signUp({ email, password, options:{ data:{ username } } })
     socialLogin  → supabase.auth.signInWithOAuth({ provider: 'google' | 'github' })
     getLeaderboard → supabase.from('scores').select('username,score,created_at')
                        .eq('game_id', id).order('score',{ascending:false}).limit(10)
     submitScore  → supabase.from('scores').insert({ game_id, username, score })
     // o con REST: fetch(`/api/games/${id}/scores`, { method:'POST', body:... })
   Las puntuaciones de invitados se quedan siempre en localStorage.
   ===================================================================== */
const K = { users: "av_users", session: "av_session", scores: "av_scores", guest: "av_guest_best", seed: "av_seed_v1" };

const API = {
  async login(username, password) {
    await sleep(350);
    const users = store.get(K.users, {});
    const u = users[username.toLowerCase()];
    if (!u || u.hash !== await sha256(password)) throw new Error("Usuario o contraseña incorrectos.");
    return { name: u.name, email: u.email, guest: false };
  },
  async register(username, email, password) {
    await sleep(400);
    const users = store.get(K.users, {});
    if (users[username.toLowerCase()]) throw new Error("Ese nombre de usuario ya está en uso.");
    users[username.toLowerCase()] = { name: username, email, hash: await sha256(password) };
    store.set(K.users, users);
    return { name: username, email, guest: false };
  },
  async socialLogin(provider) {
    // 🔌 BACKEND: aquí iría el flujo OAuth del proveedor
    throw new Error(`El acceso con ${provider} necesita un backend con OAuth configurado.`);
  },
  async getLeaderboard(gameId, limit = 10) {
    await sleep(220);
    return (store.get(K.scores, {})[gameId] || []).slice(0, limit);
  },
  getAllScoresSync(gameId) { return store.get(K.scores, {})[gameId] || []; },
  async submitScore(gameId, username, score) {
    await sleep(450);
    const all = store.get(K.scores, {});
    const list = all[gameId] || [];
    list.push({ name: username, score, date: new Date().toISOString() });
    list.sort((a, b) => b.score - a.score);
    all[gameId] = list.slice(0, 100);
    store.set(K.scores, all);
    return list.findIndex(e => e.name === username && e.score === score) + 1;
  }
};

/* Puntuaciones de ejemplo para que el Salón de la Fama no arranque vacío */
function seedScores() {
  if (store.get(K.seed, false)) return;
  const names = ["NEONKAT", "PIXELRAY", "BYTEQUEEN", "LUPITA_8B", "ZETA99", "CHIPTUNE", "MAX_ARC", "RETRO_RO", "VOLTAJE", "GLITCHY", "TOÑO_64", "SPRITEX"];
  const ranges = { serpiente: [180, 2600], bloques: [2400, 64000], rompemuros: [900, 16000], invasores: [1200, 22000], asteroides: [1500, 30000], tenis: [300, 5600] };
  const all = {};
  for (const [g, [lo, hi]] of Object.entries(ranges)) {
    const pool = [...names].sort(() => Math.random() - .5).slice(0, 10);
    all[g] = pool.map((name, i) => {
      const t = Math.pow(1 - i / 10, 1.6);
      const score = Math.round((lo + (hi - lo) * t) / 10) * 10;
      const d = new Date(2026, rnd(9), 1 + rnd(28));
      return { name, score, date: d.toISOString() };
    }).sort((a, b) => b.score - a.score);
  }
  store.set(K.scores, all); store.set(K.seed, true);
}
