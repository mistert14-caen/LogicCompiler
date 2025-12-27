import { LogicProto } from "./Proto.core.js";

/* ============================================================
  ROM
============================================================ */

function getWordBytes(mem) {
  if (mem instanceof Uint8Array)  return 1;
  if (mem instanceof Uint16Array) return 2;
  if (mem instanceof Uint32Array) return 4;
  return 1;
}


LogicProto.prototype.onDblClickROM = function () {

  if (!this.mem || !ArrayBuffer.isView(this.mem)) return true;

  const mem = this.mem;
  const wordBytes = getWordBytes(mem);
  const size = mem.length;

  // 🔹 texte initial cohérent avec l’affichage
  const initTxt = Array.from(mem).map(v => {
    let out = [];
    for (let i = wordBytes - 1; i >= 0; i--) {
      out.push(((v >> (i * 8)) & 0xFF).toString(16).padStart(2, "0"));
    }
    return out.join(" ");
  }).join(" ");

  const txt = prompt(
    `Programme HEXA (${size} mots × ${wordBytes} octets)`,
    initTxt
  );

  if (!txt) return true;

  // 🔹 lecture octets
  const bytes = txt
    .replace(/[^0-9A-Fa-f]/g, " ")
    .trim()
    .split(/\s+/)
    .map(v => parseInt(v, 16));

  // 🔹 reconstruction des mots
  for (let i = 0; i < size; i++) {
    let value = 0;
    for (let b = 0; b < wordBytes; b++) {
      value = (value << 8) | (bytes[i * wordBytes + b] ?? 0);
    }
    mem[i] = value;
  }

  return true;
};



LogicProto.prototype.updateROM = function () {

  if (!window.engine) return;

  let ce = engine.get(`${this.name}_CE`);
  if (ce > 0) {
    this.activeAddr = null;
    return;
  }

  const addr = engine.get(`${this.name}_A`) & 0xFF;
  const value = this.mem[addr];
  engine.set(`${this.name}_D`, value);
  this.activeAddr = addr;
}

function formatWord(value, nbBits) {
  const nbBytes = nbBits / 8;
  let out = [];

  for (let i = nbBytes - 1; i >= 0; i--) {
    const b = (value >> (i * 8)) & 0xFF;
    out.push(b.toString(16).toUpperCase().padStart(2, "0"));
  }

  return out.join(" ");
}


LogicProto.prototype.drawROM = function () {

  //if (this.type === "ROMT") {
  //  return;
  //}

  if (!this.mem || !ArrayBuffer.isView(this.mem)) return;

  const mem = this.mem;
  const nbWords = mem.length;

  // largeur mot
  let nbBits = 8;
  if (mem instanceof Uint16Array) nbBits = 16;
  if (mem instanceof Uint32Array) nbBits = 32;

  // -----------------------------
  // Colonnes / lignes
  // -----------------------------
  let nbCols;
  if (nbBits === 16) {
    nbCols = 4;               // 🔒 règle demandée
  } else {
    nbCols = 4;               // ROM8 reste aussi à 4 (SAP-1)
  }

  const nbRows = Math.ceil(nbWords / nbCols);

  // -----------------------------
  // Géométrie
  // -----------------------------
  const x = this.posX;
  const y = this.posY;
  const w = this.width;
  const h = this.height;

  const headerH = 18;
  const verticalCompress = 0.85;   // 🔧 resserrement vertical

  const cellW = w / nbCols;
  const cellH = ((h - headerH) / nbRows) * verticalCompress;

  // boîte
  stroke(0);
  strokeWeight(2);
  fill(0);
  rectMode(CENTER);
  rect(x, y, w, h, 8);

  textAlign(CENTER, CENTER);
  textSize(11);

  // -----------------------------
  // Cellules
  // -----------------------------
  for (let i = 0; i < nbWords; i++) {

    const col = i % nbCols;
    const row = Math.floor(i / nbCols);

    const cx = x - w / 2 + cellW / 2 + col * cellW;
    const cy = y - h / 2 + headerH + cellH / 2 + row * cellH;

    if (this.activeAddr === i) {
      fill(255, 240, 180);
      rect(cx, cy, cellW - 6, cellH - 2, 4);
      fill(255);
    } else {
      fill(255);
    }

    text(
      formatWord(mem[i], nbBits),   // "00" ou "00 00"
      cx,
      cy
    );
  }

  // label
  textAlign(CENTER, TOP);
  fill(250);
  text(this.name, x, y + h / 2 + 4);
};

LogicProto.prototype.onDblClickROMT = function () {

  if (!this.mem || !(this.mem instanceof Uint8Array)) return true;

  const size = this.mem.length; // 256

  // �� texte initial depuis la ROM
  let initTxt = "";
  for (let i = 0; i < size; i++) {
    const v = this.mem[i];
    if (v === 0) break;
    initTxt += String.fromCharCode(v);
  }

  const txt = prompt(
    `Message ASCII (max ${size} caractères)\n\\0 = fin`,
    initTxt
  );

  if (txt === null) return true;

  // 🔹 écriture ASCII + padding 0
  for (let i = 0; i < size; i++) {
    if (i < txt.length) {
      this.mem[i] = txt.charCodeAt(i) & 0xFF;
    } else {
      this.mem[i] = 0;
    }
  }

  return true;
};

