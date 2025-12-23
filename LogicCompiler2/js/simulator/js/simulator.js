import { activeTool, currMouseAction } from "./menutools.js"
import { MouseAction } from "./circuit_components/Enums.js"
import { WireManager } from "./circuit_components/Wire.js";
import { FileManager } from "./FileManager.js"
//import "./circuit_components/proto/index.js";
import { PROTO_PATH , SVGS, LogicProto} from "./circuit_components/proto/index.js";

import { Node as LogicNode } from "./circuit_components/Node.js";
import { INPUT_STATE } from "./circuit_components/Enums.js";

export let wireMng;
export let colorMouseOver = [0 ,0x7B, 0xFF];
export let fileManager = new FileManager();

export let logicTimer = null;
export const logicProto = [];
export let started=false;

window.protoIndex = [];
/**
 * @todo TODO
 */

const protoFile = document.getElementById("protoFile");

if (protoFile) {
    document.getElementById("protoFile").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        engine.importPrototype(reader.result);
        const index = logicProto.length;
        const cx = 350;
        const cy = 50;
        engine.buildProtoNodes(cx,cy,engine.proto, logicProto);

        // ? CRUCIAL : reset pour autoriser re-import du même fichier
        e.target.value = "";
        };
       reader.readAsText(file);
    };
}

function engineTick() {
  engine.pushInputsToEngine(logicProto);
  engine.tickSequential();
  engine.pullOutputsFromEngine(logicProto);
}

function startLogicClock(hz) {
  stopLogicClock();
  logicTimer = setInterval(engineTick, 1000 / hz);
}

function stopLogicClock() {
  if (logicTimer) {
    clearInterval(logicTimer);
    logicTimer = null;
  }
}

/**
 * @todo TODO
 */
function injectProtoPanel(groups) {
  const panel = document.getElementById("protoPanel");
  if (!panel) return;

  panel.innerHTML = "";

  for (const group of groups) {

    const details = document.createElement("details");
    details.classList.add("cat-" + group.folder);

    const summary = document.createElement("summary");
    summary.textContent = group.title;
    details.appendChild(summary);

    const box = document.createElement("div");
    box.setAttribute("class",'"proto-box">');



    for (const model of group.files) {
      const btn = document.createElement("button");
      


      // ✅ attributs simples
      btn.setAttribute("folder", group.folder);
      btn.setAttribute("model", model);
      btn.setAttribute("tool", "PROTO");
      btn.setAttribute("onclick", 'activeTool(this);');
      btn.className="btn proto-btn";
      
     
     const test =  SVGS.includes(model);
     //console.log(model,'',test);
      if (test) {
      	// SVG si présent
        const img = document.createElement("img");
        img.src = PROTO_PATH+`/js/simulator/img/${model}.svg`;
        img.alt = model;
        img.title = model;
        img.onload = () => btn.appendChild(img);
     } else {
          btn.textContent = model;
      }
      box.appendChild(btn);
    }

    details.appendChild(box);
    panel.appendChild(details);
  }
}


async function setup() {

 
  const canvHeight = windowHeight - 90;
  let canvas = createCanvas(windowWidth - 115, canvHeight, P2D);
  canvas.parent('canvas-sim');
  document.getElementsByClassName("tools")[0].style.height = canvHeight;

  try {
    const res = await fetch(
      "https://mistert.freeboxos.fr/"+PROTO_PATH+"/api/list_protos.php"
    );

    window.protoIndex = await res.json();   // ✅ ICI le vrai fix
    //console.log(window.protoIndex);          // Array(7)

    // initialisation UI une fois les protos chargés
    injectProtoPanel(window.protoIndex);
    started = true; 
    

  } catch (e) {
    console.error("Erreur chargement prototypes", e);
  }

  wireMng = new WireManager();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  startLogicClock(5);
  if (id) {
    fileManager.loadFromServer(id);
  }
}

/**
 * @todo TODO
 */
export function windowResized() {
    const canvHeight = windowHeight - 90;
    resizeCanvas(windowWidth - 115, canvHeight);
    document.getElementsByClassName("tools")[0].style.height = canvHeight;
}


/**
 * @todo TODO
 */
function draw() {

 if (!started) return false;
  
  background(0xFF);

  if (window.engine) {
    engine.pushInputsToEngine(logicProto);
    engine.step();
    engine.pullOutputsFromEngine(logicProto);
  }

  wireMng.draw();
  //console.log("WIRE OBJ:", wireMng);
 
  for (const comp of logicProto) comp.draw();

}



/**
 * While mouse is pressed:
 *  
 */

export function mousePressed() {
    /** Check gate[] mousePressed funtion*/
   
   
   for (const comp of logicProto)
        comp.mousePressed();
  

}

/**
 * @todo TODO
 */
export function mouseReleased() {

   for (const comp of logicProto)
        comp.mouseReleased();
}

/**
 * @todo TODO
 */
export function doubleClicked() {
    
     for (let i = 0; i < logicProto.length; i++)
        logicProto[i].doubleClicked();

}

/**
 * Override mouseClicked Function
 * 
 */

export function mouseClicked() {
    //Check current selected option
    if (currMouseAction == MouseAction.EDIT) {
        //If action is EDIT, check every class. 
       
       for (const comp of logicProto)
            comp.mouseClicked();

    } else if (currMouseAction == MouseAction.DELETE) {
        //
        
 
       for (let i = 0; i < logicProto.length; i++) {
            if (logicProto[i].mouseClicked()) {
                logicProto[i].destroy();
                delete logicProto[i];
                logicProto.splice(i, 1);
            }
        }

        
    }
    wireMng.mouseClicked();
}

//window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
window.doubleClicked = doubleClicked;
window.mouseClicked = mouseClicked;
//window.mouseDragged = mouseDragged;

window.activeTool = activeTool;

const projectFile = document.getElementById("projectFile");
const saveLink = document.getElementById("saveProjectFile");


if (projectFile) {
  projectFile.addEventListener("change", (e) => fileManager.loadFile(e), false);
}

if (saveLink) {
  saveLink.addEventListener("click", (e) => fileManager.saveFile(e), false);
}

/**
 * Call FileManager.saveFile
 */
export function saveFile()
{
    fileManager.saveFile();
}
