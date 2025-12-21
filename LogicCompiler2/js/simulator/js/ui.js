// ui.js (MODULE)

let engine = null;
let proto = null;

const protoText = document.getElementById("protoText");
const inputs    = document.getElementById("inputs");
const leds      = document.getElementById("leds");

// attendre que engine soit prêt
function getEngine() {
  if (!engine) engine = window.engine;
  return engine;
}

export function loadPrototype() {
  const eng = getEngine();
  if (!eng) return;

  eng.loadPrototype(protoText.value);
  proto = eng.proto;
  drawInputs();
  render();
}

function drawInputs() {
  inputs.innerHTML = "";
  for (let i of proto.inputs) {
    const b = document.createElement("button");
    b.textContent = i;
    b.onclick = () => toggle(i);
    inputs.appendChild(b);
  }
}

function toggle(name) {
  const eng = getEngine();
  eng.set(name, eng.get(name) ^ 1);
  render();
}

export function step() {
  const eng = getEngine();
  eng.step();
  render();
}

function render() {
  const eng = getEngine();
  leds.innerHTML = "";

  for (let k in eng.signals) {
    const on = eng.get(k);
    leds.innerHTML += `<div class="led ${on ? "on" : ""}">${k}</div>`;
  }
}

// exposer seulement ce qui est appelé depuis HTML
window.loadPrototype = loadPrototype;
window.step = step;
