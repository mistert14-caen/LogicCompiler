/* =======================
   LogicCompiler V2
   ======================= */

import { LogicProto } from "./circuit_components/proto/index.js";
import { Node as LogicNode } from "./circuit_components/Node.js";
import { INPUT_STATE } from "./circuit_components/Enums.js";
import { logicProto } from "./simulator.js";


class LogicPrototype {
  constructor(name,folder=null) {
    // Nom du composant (ex: AND0, NOT1)
    
    this.folder = folder;  
    this.name = name;
    this.type=null;
    this.label='LBL';

    // Signaux
    this.inputs = [];
    this.outputs = [];
    this.internals = [];

    // Équations associées au composant
    this.equations = [];
    this.width  = 60;
    this.height = 40;
    this.dy=15;
  }
}

class LogicEquation {
  constructor(output, tokens) {
    this.output = output;
    this.tokens = tokens;
  }

  bit(v) {
    return v ? 1 : 0;
  }
  eval(curr, last) {
    return evalRPN(this.tokens, name => {
      if (name.startsWith("@")) {
        return last[name.slice(1)] ?? 0;
      }
      return curr[name] ?? 0;
    });
  }
}

class LogicCompiler {
  

constructor() {
    this.protos = [];        // prototypes instanciés (V2)
    this.protoCache = {};
    this.proto = null;      // proto VIRTUEL exposé à l’UI
    this.signals = {};
    this.last = {};
    this.equations = [];
    this.seqEqs = [];
    this.combEqs = [];
    this.isUserImporting = false;
    this._instanceCounter = {}; // ?? clé = baseName, valeur = compteur
 
}


  /* =======================
     API PUBLIQUE (inchangée)
     ======================= */

 integrateProto(proto) {

  const inputs    = Array.isArray(proto.inputs)    ? proto.inputs    : [];
  const outputs   = Array.isArray(proto.outputs)   ? proto.outputs   : [];
  const internals = Array.isArray(proto.internals) ? proto.internals : [];

  for (const s of [...inputs, ...outputs, ...internals]) {
    if (!s || s.endsWith("_")) continue;
    if (!(s in this.signals)) {
      this.signals[s] = 0;
    }
  }

  if (Array.isArray(proto.equations)) {
    for (const eq of proto.equations) {
      this.equations.push(eq);
    }
  }
}
 

buildProtoNodes(cx, cy, proto, lP) {

  const comp = new LogicProto(cx, cy, proto.type, proto.name);
  comp.type   = proto.type;
  comp.width  = proto.width;
  comp.height = proto.height;
  if (proto.label) comp.label = proto.label;
  comp.dy     = proto.dy;
  comp.folder = proto.folder;

  const DY = comp.dy;
  const inputs  = proto.inputs  || [];
  const outputs = proto.outputs || [];

  const isRail = s => (s === "G" || s === "P" || s === "GND" || s === "VCC");
  const full   = s => proto.name + "_" + s;

  // ======================================================
  // CAS 1 : PINOUT défini
  // ======================================================
  if (proto.pinout && proto.left && proto.right) {

    // ---------- LEFT (ordre normal)
    let y0 = -((proto.left.length - 1) * DY) / 2;

    proto.left.forEach((name, i) => {
      if (!name) return;

      const y = y0 + i * DY;

      // rail → occupe la place, pas de node
      if (isRail(name)) return;

      const f = full(name);

      if (inputs.includes(f)) {
        const n = new LogicNode(0, 0, false, 0);
        n.inputState = INPUT_STATE.FREE;
        n.signal = f;
        comp.addNode(n, -comp.width / 2, y);
        return;
      }

      if (outputs.includes(f)) {
        const n = new LogicNode(0, 0, true, 0);
        n.inputState = INPUT_STATE.FREE;
        n.signal = f;
        comp.addNode(n, -comp.width / 2, y);
        return;
      }

      // NC / autre → ignoré silencieusement
      return;
    });

    // ---------- RIGHT (ordre inversé)
    y0 = -((proto.right.length - 1) * DY) / 2;
    const nR = proto.right.length;

    proto.right.forEach((name, i) => {
      if (!name) return;

      const ii = nR - 1 - i;   // 🔑 inversion verticale
      const y  = y0 + ii * DY;

      // rail → occupe la place, pas de node
      if (isRail(name)) return;

      const f = full(name);

      if (inputs.includes(f)) {
        const n = new LogicNode(0, 0, false, 0);
        n.inputState = INPUT_STATE.FREE;
        n.signal = f;
        comp.addNode(n, comp.width / 2, y);
        return;
      }

      if (outputs.includes(f)) {
        const n = new LogicNode(0, 0, true, 0);
        n.inputState = INPUT_STATE.FREE;
        n.signal = f;
        comp.addNode(n, comp.width / 2, y);
        return;
      }

      // NC / autre → ignoré
      return;
    });

  }

  // ======================================================
  // CAS 2 : pas de PINOUT → comportement historique
  // ======================================================
  else {

    // INPUTS à gauche
    let y0 = -((inputs.length - 1) * DY) / 2;
    inputs.forEach((name, i) => {
      if (!name || name.endsWith("_")) return;

      const n = new LogicNode(0, 0, false, 0);
      n.inputState = INPUT_STATE.FREE;
      n.signal = name;
      comp.addNode(n, -comp.width / 2, y0 + i * DY);
    });

    // OUTPUTS à droite
    y0 = -((outputs.length - 1) * DY) / 2;
    outputs.forEach((name, i) => {
      if (!name || name.endsWith("_")) return;

      const n = new LogicNode(0, 0, true, 0);
      n.inputState = INPUT_STATE.FREE;
      n.signal = name;
      comp.addNode(n, comp.width / 2, y0 + i * DY);
    });
  }

  lP.push(comp);
}


/*
buildProtoNodes(cx,cy,proto, lP) {

  


  // proto.name est DÉJÀ PATCHÉ
  //console.log(proto);
  const comp = new LogicProto(cx, cy, proto.type, proto.name);
  comp.type = proto.type;
  comp.width = proto.width;
  comp.height = proto.height;
  if (proto.label) comp.label = proto.label;
  comp.dy = proto.dy;
  comp.folder = proto.folder;
  const DY = comp.dy;
  // --- INPUTS ---
  let y0 = -((proto.inputs.length - 1) * DY) / 2;
  proto.inputs.forEach((name, i) => {
    if (!name || name.endsWith("_")) return;
    const n = new LogicNode(0, 0, false, 0);
    n.inputState = INPUT_STATE.FREE;

    // ?? name est déjà du type AND0_A
    n.signal = name;

    comp.addNode(n, -comp.width / 2 , y0 + i * DY);
  });

  // --- OUTPUTS ---
  y0 = -((proto.outputs.length - 1) * DY) / 2;
  proto.outputs.forEach((name, i) => {
    if (!name || name.endsWith("_")) return;
    const n = new LogicNode(0, 0, true, 0);
    n.inputState = INPUT_STATE.FREE;

    // ?? name est déjà du type AND0_Y
    n.signal = name;

    comp.addNode(n, comp.width / 2 , y0 + i * DY);
  });

  lP.push(comp);
}

*/

pushInputsToEngine(lP,lB) {
    
  
  for (const comp of lP) {
    for (const n of comp.nodes) {

      // uniquement les entrées libres
      if (!n.isOutput && n.signal) {
        this.set(n.signal, n.value);      
      }
   }
  }
 

  
}

pullOutputsFromEngine(lP,lB) {
    // Proto components outputs
  for (const comp of lP) {
    for (const n of comp.nodes) {
      if (n.isOutput && n.signal) {
        n.value = this.get(n.signal);
      }
    }
  }
 

}

importPrototype(text) {

  // --- extraction du nom de bloc ---
  const m = text.match(/\[BLOCK\s+([^\]]+)\]/);
  //console.trace("MODULE:",m);
  const baseName = m ? m[1] : "PROTO";

  // --- compteur par type ---
  const n = (this._instanceCounter[baseName] ?? 0) + 1;
  this._instanceCounter[baseName] = n;

  const compName = baseName.replace("#", n);

  // --- CACHE : mémoriser le TEXTE BRUT ---
  if (!this.protoCache[baseName]) {
    this.protoCache[baseName] = text;   // ?? texte avec AND#
  }
  //AJOUT : persistance USER
  if (this.isUserImporting) {
    localStorage.setItem("proto_USER_" + baseName, text);
  }

  // --- PATCH TOUJOURS AVANT PARSE ---
  const patchedText = this.patchProtoText(this.protoCache[baseName], compName);

  // --- parse instance ---
  const proto = this.parsePrototype(patchedText, compName);

  // --- intégration moteur ---
  this.integrateProto(proto);
  this.proto = proto;
  this.protos.push(proto);
  return proto;
}

  set(name, v) { this.signals[name] = Number(v); }
  get(name) { return this.signals[name] ?? 0; }

updateMem() {

  //return false;
  // ===== ÉCRITURE RAM / ROM (STA) =====
  for (const p of logicProto) {

    if (p.type == "ROM" || p.type == "RAM8" || p.type == "RAM16") { 
      const mask = p.mem.length - 1;
      const sigA  = p.name + '_A';
      const sigCE = p.name + '_CE';
      const sigWE = p.name + '_WE';
      const sigWD = p.name + '_WD';

      if (engine.get(sigCE) !== 0) continue;
      if (sigWE && engine.get(sigWE) === 1) {
        const addr = engine.get(sigA) & mask;
        const data = engine.get(sigWD);
        p.mem[addr] = data;
      }
    }
  }
}

tickSequential() {
  const prev = structuredClone(this.signals);
  const next = structuredClone(this.signals);

  for (let eq of this.seqEqs) {
    const v = eq.eval(prev, prev);
    next[eq.output] = v;
  }

  this.last = prev;
  this.signals = next;
  this.updateMem();
}

  

  step() {
    for (let eq of this.combEqs) {
       const v = eq.eval(this.signals, this.signals);
       this.signals[eq.output] = v;
    }
  }
 

  /* =======================
     Parsing / patch (V1 OK)
     ======================= */

  patchProtoText(text, prefix) {

    const patchList = (key) => {
      text = text.replace(
        new RegExp(`^${key}=(.*)$`, 'm'),
        (_, s) => `${key}=` + s.split(';').map(n => `${prefix}_${n}`).join(';')
      );
    };

    patchList("INPUTS");
    patchList("OUTPUTS");
    patchList("INTERNALS");

    text = text.replace(/^EQUATIONS=(.*)$/gm, (_, s) =>
      "EQUATIONS=" + s.replace(/\b([A-Za-z]\w*)\b/g, `${prefix}_$1`)
    );

    return text;
  }

  parsePrototype(text, name) {
    const lines = text.split('\n').map(l => l.trim());
    const p = new LogicPrototype(name);
 
    for (let l of lines) {
      if (!l || l.startsWith('#')) continue;

       // SUPPRESSION DES COMMENTAIRES INLINE
       l = l.split('#')[0].trim();
       if (!l) continue;

      if (l.startsWith('INPUTS='))       p.inputs    = l.slice(7).split(';');
      else if (l.startsWith('SYMBOL='))  p.type    = l.slice(7).trim();
      else if (l.startsWith('OUTPUTS='))  p.outputs   = l.slice(8).split(';');
      else if (l.startsWith('INTERNALS='))p.internals = l.slice(10).split(';');
      else if (l.startsWith('EQUATIONS='))p.equations.push(this.parseEquation(l.slice(10)));
      else if (l.startsWith("WIDTH=")) p.width = parseInt(l.split("=")[1], 10);
      else if (l.startsWith("HEIGHT=")) p.height = parseInt(l.split("=")[1], 10);
      else if (l.startsWith("DY=")) p.dy = parseInt(l.split("=")[1], 10);
      else if (l.startsWith('PINOUT=')) {
        p.pinout = parseInt(l.split('=')[1], 10);
      }
      else if (l.startsWith('LEFT=')) {
        p.left = l.slice(5).split(';');
      }
      else if (l.startsWith('RIGHT=')) {
        p.right = l.slice(6).split(';');
      }


    }
    //console.log(p);
    return p;
  }

loadPrototype(text, compName) {

     this.proto = this.parsePrototype(text, compName);
     // init signaux
     this.signals = {};
     [...this.proto.inputs, ...this.proto.outputs, ...this.proto.internals]
       .forEach(s => this.set(s, 0));
     this.equations = this.proto.equations;
  }


reset = function () {
    this.protos = [];        // prototypes instanciés (V2)
    this.protoCache = {};
    this.proto = null;      // proto VIRTUEL exposé à l’UI
    this.signals = {};
    this.last = {};
    this.equations = [];
    this.seqEqs = [];
    this.combEqs = [];
    this.isUserImporting = false;
    this._instanceCounter = {}; // ?? clé = baseName, valeur = compteur
};

parseEquation(line) {
  const idx = line.indexOf("=");

  if (idx < 0) {
    throw new Error("Invalid equation (missing '='): " + line);
  }

  const lhs = line.slice(0, idx).trim();
  const rhs = line.slice(idx + 1).trim();

  const tokens = toRPN(tokenize(rhs));
  const isSeq  = rhs.includes("CLK");

  const eq = new LogicEquation(lhs, tokens);

  if (isSeq) this.seqEqs.push(eq);
  else       this.combEqs.push(eq);

  return eq;
}
}
window.engine = new LogicCompiler();

