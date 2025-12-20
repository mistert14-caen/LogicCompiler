/* =======================
   LogicCompiler V2
   ======================= */

import { LogicProto } from "./circuit_components/proto/index.js";
import { Node as LogicNode } from "./circuit_components/Node.js";
import { INPUT_STATE } from "./circuit_components/Enums.js";


class LogicPrototype {
  constructor(name) {
    // Nom du composant (ex: AND0, NOT1)
    
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
 
buildProtoNodes(cx,cy,proto, lP) {

  


  // proto.name est DÉJÀ PATCHÉ
  //console.log(proto);
  const comp = new LogicProto(cx, cy, proto.type, proto.name);
  comp.type = proto.type;
  comp.width = proto.width;
  comp.height = proto.height;
  if (proto.label) comp.label = proto.label;
  comp.dy = proto.dy;
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
  console.trace("MODULE:",m);
  const baseName = m ? m[1] : "PROTO";

  // --- compteur par type ---
  const n = (this._instanceCounter[baseName] ?? 0) + 1;
  this._instanceCounter[baseName] = n;

  const compName = baseName.replace("#", n);

  // --- CACHE : mémoriser le TEXTE BRUT ---
  if (!this.protoCache[baseName]) {
    this.protoCache[baseName] = text;   // ?? texte avec AND#
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

  step() {
    this.last = structuredClone(this.signals);

    let changed, iter = 0;
    do {
      changed = false;
      for (let eq of this.equations) {
        const v = eq.eval(this.signals, this.last);
        if (this.signals[eq.output] !== v) {
          this.signals[eq.output] = v;
          changed = true;
        }
      }
      iter++;
    } while (changed && iter < 10);
   //console.trace("SIGNAL",this.signals); 
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


parseEquation(line) {
  const [lhs, rhs] = line.split("=");

  return new LogicEquation(
    lhs.trim(),
    toRPN(tokenize(rhs.trim()))
  );
}
  
}
window.engine = new LogicCompiler();
