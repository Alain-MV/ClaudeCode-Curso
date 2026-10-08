"use strict";
/* Sesión */
const Session = {
  get() { return store.get(K.session, null); },
  set(s) { store.set(K.session, s); renderNav(); },
  clear() { store.del(K.session); renderNav(); },
  name() { const s = this.get(); return s ? s.name : "INVITADO"; },
  isMember() { const s = this.get(); return !!(s && !s.guest); }
};
function personalBest(gameId) {
  if (Session.isMember()) {
    const me = Session.name();
    const mine = API.getAllScoresSync(gameId).filter(e => e.name === me);
    return mine.length ? mine[0].score : 0;
  }
  return (store.get(K.guest, {})[gameId]) || 0;
}
