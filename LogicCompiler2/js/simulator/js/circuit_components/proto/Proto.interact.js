import { LogicProto } from "./Proto.core.js";

  /* ============================================================
     HIT TEST / EVENTS
     ============================================================ */

LogicProto.prototype.isMouseOver = function () {
    return (
      mouseX > this.posX - this.width / 2  - 20 &&
      mouseX < this.posX + this.width / 2 &&
      mouseY > this.posY - this.height / 2 &&
      mouseY < this.posY + this.height / 2
    );
  }  

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

LogicProto.prototype.onDblClickVAL = function () {
 
 this.value = 0;

  if (window.engine) {
    engine.signals[this.name+'_OUT']= 0;
  }
};

LogicProto.prototype.onDblClickOCST = function () {
 
 const newValue = prompt("Octet entre 0 et 255 :", this.value);


  if (window.engine) {
    engine.signals[this.name+'_VAL']= newValue;
    this.value=newValue;
  }
};


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
    case "VAL":  return this.onDblClickVAL;
    case "OCST":  return this.onDblClickOCST;

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

LogicProto.prototype.onClickBTN = function () {
   if (!window.engine) return;

    const sig = this.name+'_S';
    const curr = engine.get(sig) ?? 0;
    const next = curr ? 0 : 1;
    engine.set(sig, next);

    
};


LogicProto.prototype.onClickVAL = function () {
  this.value = (this.value + 1) & 0xFF;
  
  if (window.engine) {
    engine.set(this.name+'_OUT', this.value);
  }
};


  LogicProto.prototype.mouseClicked = function () {
    
   if (!this.isMouseOver()) return;
    if (this.type=="VAL") this.onClickVAL();
    if (this.type=="BTN") this.onClickBTN();

    for (const n of this.nodes) {
      if (n.isMouseOver()) {
        n.mouseClicked();
        return true;
      }
    }
    return false;
  }

