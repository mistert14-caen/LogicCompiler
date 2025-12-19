import { LogicProto } from "./Proto.core.js";

  /* ============================================================
     HIT TEST / EVENTS
     ============================================================ */

  

   LogicProto.prototype.renameLabelSignal = function (newName) {

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

 LogicProto.prototype.onDblClickROM = function () {

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


LogicProto.prototype.onDblClickLBL = function () {

  const newName = prompt("Nom du signal :", this.label);
  if (!newName || newName === this.label) return true;

  this.renameLabelSignal(newName);
  return true;
}

LogicProto.prototype.getDoubleClickHandler = function () {
  switch (this.type) {
    case "LBL":  return this.onDblClickLBL;
    case "ROM":  return this.onDblClickROM;
    //case "DICE": return this.onDblClickDICE; // optionnel
    default:     return null;
  }
}

LogicProto.prototype.doubleClicked = function () {
  if (!this.isMouseOver()) return false;

  const handler = this.getDoubleClickHandler();
  if (!handler) return false;

  return handler.call(this);
}

  LogicProto.prototype.mousePressed = function () {
    if (this.isMouseOver()) {
      this.isMoving = true;
      this.offsetMouseX = this.posX - mouseX;
      this.offsetMouseY = this.posY - mouseY;
    }
  }

  LogicProto.prototype.mouseReleased = function () {
    this.isMoving = false;
  }

  LogicProto.prototype.mouseDragged = function () {
    return true;
  }

  LogicProto.prototype.mouseClicked = function () {
    for (const n of this.nodes) {
      if (n.isMouseOver()) {
        n.mouseClicked();
        return true;
      }
    }
    return false;
  }

