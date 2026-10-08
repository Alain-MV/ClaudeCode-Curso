"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => Number(n).toLocaleString("es-MX");
const fmtDate = iso => { const d = new Date(iso); return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" }); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = n => Math.floor(Math.random() * n);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CY = "#00f5ff", MG = "#ff006e", YE = "#f5ff00", GR = "#39ff14", OR = "#ff9f43", BL = "#4d7cff", RD = "#ff3b3b";

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) { let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0; return "x" + h; }
}
