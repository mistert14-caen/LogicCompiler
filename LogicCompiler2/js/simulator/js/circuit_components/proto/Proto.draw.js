import { colorMouseOver } from "../../simulator.js";

import { LogicProto } from "./Proto.core.js";
import {FONT14_ASCII} from "./index.js";

 /* ============================================================
     DRAW
     ============================================================ */

LogicProto.prototype.dec2hex = function (val) {

    // sécurité
    val = Number(val) || 0;

    // largeur automatique (multiple de 8)
    const bits = (val === 0)
        ? 8
        : Math.ceil(Math.log2(val + 1) / 8) * 8;

    const hexDigits = bits / 4;
    const mask = (bits >= 32)
        ? null
        : (1 << bits) - 1;

    const v = mask ? (val & mask) : val;

    const dec = v.toString(10);
    const hex = v.toString(16).toUpperCase().padStart(hexDigits, "0");

    return `${dec}\n(0x${hex})`;
};

LogicProto.prototype.draw = function () {
    

    if (this.isMoving) {
      this.posX = mouseX + this.offsetMouseX;
      this.posY = mouseY + this.offsetMouseY;
      this.updateNodes();
    }

    push();

    stroke(this.isMouseOver()
      ? colorMouseOver
      : 0
    );

   if (this.type === "NOTE") {
       this.drawNOTE();
   } else
    
    if (this.type === "SEG") {
      this.drawSEG();
    } else if (this.type === "SEG14A") {
      this.drawSEG14A();
    }
    else if (this.type === "SEG14R") {
      this.drawSEG14R();
    }

      else if (this.type === "DICE") {
      this.drawDICE();
    }  else if (this.type === "LED") {
      this.drawLED();
    } else if (this.type === "ROM") {
        this.updateROM();
        this.drawROM();
    }
   

    
    else {
      this.drawDefaultProto();
    }
    pop();

    for (const n of this.nodes) {
      n.draw();
    }
  }



LogicProto.prototype.drawLED = function () {

  const w = this.width  ?? 30;
  const h = this.height ?? 30;

  const x = this.posX;
  const y = this.posY;

  // --- lecture moteur ---
  let v = 0;
  if (window.engine && this.nodes?.length) {
    const n = this.nodes.find(n => !n.isOutput && n.signal);
    if (n) v = engine.get(n.signal) ?? 0;
  }

  // --- boîtier ---
  push();
  rectMode(CENTER);
  noStroke();
  fill(30);
  rect(x, y, w, h, 6);

  // --- LED ---
  const r = Math.min(w, h) * 0.33;
  fill(v ? color(0, 220, 0) : color(0, 80, 0));
  stroke(0);
  ellipse(x, y, r * 2, r * 2);
  pop();


};


 LogicProto.prototype.drawDefaultProto = function (show = true) {

  // ======================
  // 1. Fond / icône
  // ======================
  if (this.icon) {
    image(
      this.icon,
      this.posX - this.width / 2,
      this.posY - this.height / 2,
      this.width,
      this.height
    );
  } else {
    strokeWeight(3);
    fill(30);
    rectMode(CENTER);
    rect(this.posX, this.posY, this.width, this.height, 6);
  }

  // ======================
  // 2. Nom du bloc (haut)
  // ======================
  push();
  noStroke();
  fill(30);
  textAlign(CENTER, TOP);
  textSize(8);

  const title = this.name;
  text(
    title,
    this.posX,
    this.posY - this.height / 2 -10
  );
  pop();
  
 // ======================
// 3. Contenu central (EXCEPTIONS)
// ======================
let content = null;
textAlign(CENTER, CENTER);

if (this.type === "ROMT") this.updateROM();   

if (this.type === "LBL") {
  content = this.label;
}
else if (this.type === "DEC") {
  const v = engine.signals[this.name + "_A"] ?? 0;
  content = this.dec2hex(v);
}
else if (this.type === "VAL" || this.type === "OCST") {
  content = this.dec2hex(this.value);
}

if (content !== null) {
  push();
  noStroke();
  fill(255);
  textSize(12);
  textLeading(12);        // 🔑 espace entre les lignes
  text(content, this.posX, this.posY + 2);
  pop();
}
}



LogicProto.prototype.drawDICE = function () {

  const x = this.posX;
  const y = this.posY;
  const w = this.width;
  const h = this.height;

  // fond noir
  stroke(0);
  strokeWeight(2);
  fill(30);
  rectMode(CENTER);
  rect(x, y, w, h, 12);

  // lecture valeur binaire (000?101 = 1?6)
  let v = 0;
  if (window.engine) {
    v =
      (engine.get(`${this.name}_A`) << 2) |
      (engine.get(`${this.name}_B`) << 1) |
       engine.get(`${this.name}_C`);
  }

  if (v < 0 || v > 5) return;

  // positions normalisées
  const P = {
    TL: [-0.25, -0.25],
    TR: [ 0.25, -0.25],
    ML: [-0.25,  0.00],
    MR: [ 0.25,  0.00],
    BL: [-0.25,  0.25],
    BR: [ 0.25,  0.25],
    C : [ 0.00,  0.00],
  };

  // faces du dé (CORRIGÉES)
  const faces = [
    ["C"],                                   // 1
    ["TR", "BL"],                            // 2  ? diagonale correcte
    ["TR", "C", "BL"],                       // 3
    ["TL", "TR", "BL", "BR"],                // 4
    ["TL", "TR", "C", "BL", "BR"],            // 5
    ["TL", "TR", "ML", "MR", "BL", "BR"],     // 6
  ];

  const r = Math.min(w, h) * 0.06;

  // points blancs
  fill(255);
  noStroke();

  for (const p of faces[v]) {
    const [dx, dy] = P[p];
    circle(
      x + dx * w,
      y + dy * h,
      r * 2
    );
  }

  // label
  fill(180);
  textAlign(CENTER, TOP);
  textSize(12);
  text(this.name, x, y + h/2 + 4);
}


  /* ============================================================
     DRAW : 7 SEGMENTS
     ============================================================ */

LogicProto.prototype.drawSEG = function (){

  const x = this.posX;
  const y = this.posY;
  const w = this.width;
  const h = this.height;

  // fond
  stroke(0);
  strokeWeight(2);
  fill(30);
  rectMode(CENTER);
  rect(x, y, w, h, 8);

  // positions des segments
  const seg = {
    SA: [0, -h*0.35, w*0.5, h*0.08],
    SB: [ w*0.25, -h*0.15, w*0.08, h*0.35],
    SC: [ w*0.25,  h*0.15, w*0.08, h*0.35],
    SD: [0,  h*0.35, w*0.5, h*0.08],
    SE: [-w*0.25,  h*0.15, w*0.08, h*0.35],
    SF: [-w*0.25, -h*0.15, w*0.08, h*0.35],
    SG: [0, 0, w*0.5, h*0.08],
  };

  noStroke();

  for (const [port, [dx, dy, sw, sh]] of Object.entries(seg)) {

    const signal = `${this.name}_${port}`;

    const on = (window.engine)
      ? engine.get(signal)
      : 0;

    fill(on ? color(255, 0, 0) : 60);
    rect(x + dx, y + dy, sw, sh, 4);
  }

  // label
  fill(200);
  textAlign(CENTER, TOP);
  textSize(12);
  text(this.name, x, y + h/2 + 4);
}


LogicProto.prototype.drawSeg14 = function (id, on) {
  if (!on) return;

  stroke(255, 0, 0);
  strokeWeight(4);

  // géométrie volontairement simple (exemples)
 LogicProto.prototype.drawSeg14 = function (id, on) {
  if (!on) return;

  stroke(255, 0, 0);
  strokeWeight(4);

  switch (id) {

    // ===== Segments horizontaux / verticaux =====
    case 0: line(-20, -50,  20, -50); break; // A
    case 1: line( 25, -45,  25, -10); break; // B
    case 2: line( 25,  10,  25,  45); break; // C
    case 3: line(-20,  50,  20,  50); break; // D
    case 4: line(-25,  10, -25,  45); break; // E
    case 5: line(-25, -45, -25, -10); break; // F

    // centre (double)
    case 6: line(-20,   0,   0,   0); break; // G1
    case 7: line(  0,   0,  20,   0); break; // G2

    // ===== Diagonales =====
   case 8:  line(-22, -42,  0,   0); break; // H (haut-gauche -> centre)
   case 10: line(  0,   0, 22,  42); break; // J (centre -> bas-droit)
   case 9:  line( 22, -42,  0,   0); break; // I (haut-droit -> centre)
   case 11: line(  0,   0,-22,  42); break; // K (centre -> bas-gauche)

    // ===== Verticaux centraux (pour M, N, W) =====
    case 12: line(  0, -45,   0, -10); break; // L (haut-centre)
    case 13: line(  0,  10,   0,  45); break; // M (bas-centre)
  }
};
};

LogicProto.prototype.drawSEG14R = function () {

  if (!window.engine) return;

  push();
  translate(this.posX, this.posY);

  // fond
  rectMode(CENTER);
  stroke(0);
  fill(0);
  rect(0, 0, this.width, this.height, 6);

  // lire directement les 14 entrées
  const names = [
    "A","B","C","D","E","F",
    "G1","G2",
    "H","I","J","K",
    "L","M"
  ];

  for (let i = 0; i < 14; i++) {
    const v = engine.get(this.name + "_" + names[i]) ? 1 : 0;
    this.drawSeg14(i, v);
  }

  pop();
};


LogicProto.prototype.drawSEG14A = function () {

  if (!window.engine) return;

  const en  = engine.get(this.name + "_EN") ?? 1;
  const dp  = engine.get(this.name + "_DP") ?? 0;
  let chr   = engine.get(this.name + "_CHR") | 0;
  //alert(chr);
  // fond
  push();
  translate(this.posX, this.posY);
  rectMode(CENTER);
  stroke(0);
  fill(0);
  rect(0, 0, this.width, this.height, 6);

  let mask = 0;

  if (en) {
    // normalisation minuscules → majuscules
    if (chr >= 97 && chr <= 122) chr -= 32;

    mask = FONT14_ASCII[chr] ?? 0;
   
  }

  // dessiner les 14 segments
  for (let i = 0; i < 14; i++) {
    this.drawSeg14(i, (mask >> i) & 1);
  }

  // point décimal
  if (dp) {
    fill(255, 0, 0);
    noStroke();
    circle(this.width / 2 - 8, this.height / 2 - 8, 6);
  }

  pop();
};
