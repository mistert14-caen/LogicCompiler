// ui.js  (MODULE)

// état local UI
let engine = null;
let proto  = null;

// DOM
const protoText = document.getElementById("protoText");
const inputsDiv = document.getElementById("inputs");
const ledsDiv   = document.getElementById("leds");
const btnLoad   = document.getElementById("btnLoad");
const btnStep   = document.getElementById("btnStep");
const btnStepSeq= document.getElementById("btnStepSeq");

/* ============================================================
   ENGINE ACCESS
   ============================================================ */

function getEngine() {
  if (!engine && window.engine) {
    engine = window.engine;
    console.log("Engine connecté");
  }
  if (!engine) {
    console.warn("Engine non prêt");
    return null;
  }
  return engine;
}

/* ============================================================
   LOAD PROTOTYPE
   ============================================================ */

function loadPrototype() {
  const eng = getEngine();
  if (!eng) return;

  eng.reset?.();                 // optionnel
  eng.loadPrototype(protoText.value);

  proto = eng.proto;
  drawInputs();
  render();
}

/* ============================================================
   INPUT BUTTONS
   ============================================================ */

function drawInputs() {
  inputsDiv.innerHTML = "";
  if (!proto || !proto.inputs) return;

  for (const name of proto.inputs) {
    const b = document.createElement("button");
    b.textContent = name;
    b.onclick = () => toggleInput(name);
    inputsDiv.appendChild(b);
  }
}

function toggleInput(name) {
  const eng = getEngine();
  if (!eng) return;

  eng.set(name, eng.get(name) ^ 1);
  render();
}

/* ============================================================
   STEPS
   ============================================================ */

function stepComb() {
  const eng = getEngine();
  if (!eng) return;

  eng.step();
  render();
}

function stepSeq(n = 1) {
  const eng = getEngine();
  if (!eng) return;
  for( let i = 0;i<n;i++) eng.step(true);

}

/* ============================================================
   RENDER
   ============================================================ */

function render() {
  const eng = getEngine();
  if (!eng) return;

  ledsDiv.innerHTML = "";

  for (const k in eng.signals) {
    const v = eng.get(k);
    const d = document.createElement("div");
    d.className = "led" + (v ? " on" : "");
    d.textContent = k + " = " + v;
    ledsDiv.appendChild(d);
  }
}

/* ============================================================
   UI BINDING
   ============================================================ */

btnLoad.onclick    = loadPrototype;
btnStep.onclick    = stepComb;
btnStepSeq.onclick = stepSeq;

console.log("ui.js chargé");
