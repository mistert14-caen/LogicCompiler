import { colorMouseOver } from "../../simulator.js";

import { LogicProto } from "./Proto.core.js";

 /* ============================================================
     DRAW
     ============================================================ */

  
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

    if (this.type === "SEG") {
      this.drawSEG();
    } else if (this.type === "DICE") {
      this.drawDICE();
    }  else if (this.type === "VAL") {
      this.drawVAL();
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


  LogicProto.prototype.drawDefaultProto = function () {

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

      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(12);

      if (this.type === "LBL")
        text(this.label, this.posX, this.posY);
      else
        text(this.name, this.posX, this.posY);
    }

  }

LogicProto.prototype.drawVAL = function () {
if (!window.engine) return;

    const sig = this.name+'_VAL';
    const curr = engine.get(sig) ?? 0;
     {
      strokeWeight(3);
      fill(30);
      rectMode(CENTER);
      rect(this.posX, this.posY, this.width, this.height, 6);

      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(12);

      text(curr, this.posX, this.posY);
     }

    
}

LogicProto.prototype.drawROM = function () {

  const x = this.posX;
  const y = this.posY;
  const w = this.width;
  const h = this.height;

  stroke(0);
  strokeWeight(2);
  fill(245);
  rectMode(CENTER);
  rect(x, y, w, h, 8);

  textAlign(CENTER, CENTER);
  textSize(12);

  const cols = 4;
  const rows = 4;
  const cellW = w / cols;
  const cellH = (h - 20) / rows;

  for (let i = 0; i < 16; i++) {

    const cx = x - w/2 + cellW/2 + (i % cols) * cellW;
    const cy = y - h/2 + 20 + cellH/2 + Math.floor(i / cols) * cellH;

    // ?? surlignage si adresse active
    if (this.activeAddr === i) {
      fill(255, 240, 180); // jaune pâle
      rectMode(CENTER);
      rect(cx, cy, cellW - 4, cellH - 4, 4);
      fill(0);
    } else {
      fill(0);
    }

    const v = this.mem[i]
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

    text(v, cx, cy);
  }

  // label
  textAlign(CENTER, TOP);
  fill(0);
  text(this.name, x, y + h/2 + 4);
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