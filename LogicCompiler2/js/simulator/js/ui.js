
/* =======================
   UI glue
   ======================= */

//let engine = null;
//let proto = null;

function loadPrototype() {
  
  engine.loadPrototype(protoText.value);

  proto = engine.proto;
  drawInputs();
  render();
}



function drawInputs() {
  inputs.innerHTML = "";
  for (let i of proto.inputs) {
    inputs.innerHTML += `<button onclick="toggle('${i}')">${i}</button>`;
  }
}

function toggle(name) {
  engine.set(name, engine.get(name)^1);
  render();
}

function step() {
  engine.step();
  render();
}

function render() {
  leds.innerHTML = "";
  for (let k in engine.signals) {
    const on = engine.get(k);
    leds.innerHTML += `<div class="led ${on?'on':''}">${k}</div>`;
  }
}

//window.engine = new LogicCompiler();


