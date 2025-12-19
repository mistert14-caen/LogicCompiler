import { currMouseAction } from "../menutools.js";
import { MouseAction } from "./Enums.js";
import { Node } from "./Node.js";
import { colorMouseOver } from "../simulator.js";

/**
 * Prototype generic component
 */

const protoSvgCache = {};

function loadProtoIcon(type, cb) {
  if (protoSvgCache[type] !== undefined) {
    cb(protoSvgCache[type]);
    return;
  }

  const path = `js/simulator/img/${type}.svg`;

  loadImage(
    path,
    img => {
      protoSvgCache[type] = img;
      cb(img);
    },
    () => {
      protoSvgCache[type] = null;
      cb(null);
    }
  );
}

export class LogicProto {

  constructor(x, y, type = "UNDEFINED", name = "PROTO") {

    this.posX = x;
    this.posY = y;

    this.type  = type;
    this.name  = name;   // nom du proto
    this.label = name;   // nom logique / signal (LBL)

    this.icon = null;

    this.width  = 60;
    this.height = 40;

    this.nodes = [];
    this.nodeStartID = null;

    this.isSpawned = true;
    this.isMoving  = false;
    this.offsetMouseX = 0;
    this.offsetMouseY = 0;

    if (this.type === "ROM") {
       this.mem = new Uint8Array(16); // 16 mots de 8 bits
    }

    loadProtoIcon(this.type, img => {
      this.icon = img;
    });
  }

  /* ============================================================
     NODE MANAGEMENT
     ============================================================ */

  addNode(node, dx, dy) {
    node.parent = this;
    node.localX = dx;
    node.localY = dy;
    this.nodes.push(node);
    this.updateNodes();
  }

  updateNodes() {
    for (const n of this.nodes) {
      n.updatePosition(
        this.posX + n.localX,
        this.posY + n.localY
      );
    }
  }

  destroy() {
    for (const n of this.nodes) n.destroy();
    this.nodes.length = 0;
  }

  /* ============================================================
     DRAW
     ============================================================ */

  draw() {

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


  drawDefaultProto() {

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
      fill(240);
      rectMode(CENTER);
      rect(this.posX, this.posY, this.width, this.height, 6);

      noStroke();
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(12);

      if (this.type === "LBL")
        text(this.label, this.posX, this.posY);
      else
        text(this.name, this.posX, this.posY);
    }

  }

drawROM() {

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


drawDICE() {

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

drawSEG() {

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

/* ============================================================
  ROM
============================================================ */



updateROM() {

  if (!window.engine) return;

  let ce = engine.get(`${this.name}_CE`);
  //ce = 0;
  // ROM désactivée
  if (ce > 0) {
    engine.set(`${this.name}_D`, 0);
    this.activeAddr = null;
    return;
  }

  const addr = engine.get(`${this.name}_A`) & 0x0F;
  const value = this.mem[addr];

  engine.set(`${this.name}_D`, value);
  this.activeAddr = addr;
}


  /* ============================================================
     HIT TEST / EVENTS
     ============================================================ */

  isMouseOver() {
    return (
      mouseX > this.posX - this.width / 2 &&
      mouseX < this.posX + this.width / 2 &&
      mouseY > this.posY - this.height / 2 &&
      mouseY < this.posY + this.height / 2
    );
  }

  renameLabelSignal(newName) {

    this.label = newName;

    for (const n of this.nodes) {
      n.signal = newName;
    }

    if (window.engine && engine.signals) {
      if (!(newName in engine.signals)) {
        engine.set(newName, 0);
      }
    }
  }

onDblClickROM() {

  const txt = prompt(
    "Programme HEXA (16 octets)",
    this.mem.map(v => v.toString(16).padStart(2,"0")).join(" ")
  );

  if (!txt) return true;

  const bytes = txt
    .replace(/[^0-9A-Fa-f]/g, " ")
    .trim()
    .split(/\s+/)
    .map(v => parseInt(v, 16));

  for (let i = 0; i < 16; i++) {
    this.mem[i] = bytes[i] ?? 0;
  }

  return true;
}


onDblClickLBL() {

  const newName = prompt("Nom du signal :", this.label);
  if (!newName || newName === this.label) return true;

  this.renameLabelSignal(newName);
  return true;
}

getDoubleClickHandler() {
  switch (this.type) {
    case "LBL":  return this.onDblClickLBL;
    case "ROM":  return this.onDblClickROM;
    //case "DICE": return this.onDblClickDICE; // optionnel
    default:     return null;
  }
}

doubleClicked() {
  if (!this.isMouseOver()) return false;

  const handler = this.getDoubleClickHandler();
  if (!handler) return false;

  return handler.call(this);
}

  mousePressed() {
    if (this.isMouseOver()) {
      this.isMoving = true;
      this.offsetMouseX = this.posX - mouseX;
      this.offsetMouseY = this.posY - mouseY;
    }
  }

  mouseReleased() {
    this.isMoving = false;
  }

  mouseDragged() {
    return true;
  }

  mouseClicked() {
    for (const n of this.nodes) {
      if (n.isMouseOver()) {
        n.mouseClicked();
        return true;
      }
    }
    return false;
  }
}
