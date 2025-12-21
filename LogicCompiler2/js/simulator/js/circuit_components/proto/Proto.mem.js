import { LogicProto } from "./Proto.core.js";

/* ============================================================
  ROM
============================================================ */



LogicProto.prototype.updateROM = function () {

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
