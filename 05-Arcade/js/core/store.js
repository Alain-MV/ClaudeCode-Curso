"use strict";
/* Almacenamiento local con respaldo en memoria (por si el navegador lo bloquea) */
const memStore = {};
const store = {
  get(k, fb) {
    try { const v = localStorage.getItem(k); if (v !== null) return JSON.parse(v); } catch (e) {}
    return k in memStore ? memStore[k] : fb;
  },
  set(k, v) { memStore[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { delete memStore[k]; try { localStorage.removeItem(k); } catch (e) {} }
};
