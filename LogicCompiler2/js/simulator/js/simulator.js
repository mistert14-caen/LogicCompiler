import { activeTool, currMouseAction } from "./menutools.js"
import { MouseAction } from "./circuit_components/Enums.js"
import { WireManager } from "./circuit_components/Wire.js";
import { FileManager } from "./FileManager.js"
import { LogicInput } from "./circuit_components/LogicInput.js";
import { LogicOutput } from "./circuit_components/LogicOutput.js";
import { LogicValue } from "./circuit_components/LogicValue.js";
//import { LogicProto } from "./circuit_components/proto/Proto.core.js";
import "./circuit_components/proto/index.js";

import { Node as LogicNode } from "./circuit_components/Node.js";
import { INPUT_STATE } from "./circuit_components/Enums.js";


export let protoIMG = []; // gates images


export let logicInput = [];
export let logicOutput = [];
export let logicValue = [];
export let logicLabel = [];
export let logicClock = [];
export let wireMng;
export let colorMouseOver = [0 ,0x7B, 0xFF];
export let fileManager = new FileManager();

export const logicProto = [];

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
        const cx = 100 / 2 + index * 40;
        const cy = 100 / 2 + index * 40;
        engine.buildProtoNodes(cx,cy,engine.proto, logicProto);

        // ? CRUCIAL : reset pour autoriser re-import du même fichier
        e.target.value = "";
        };
       reader.readAsText(file);
    };
}
export const PROTO_IMG = {};


/**
 * @todo TODO
 */
export function setup() {
    const canvHeight = windowHeight - 90;
    let canvas = createCanvas(windowWidth - 115, canvHeight, P2D);

    canvas.parent('canvas-sim');
    document.getElementsByClassName("tools")[0].style.height = canvHeight;

    wireMng = new WireManager();
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
export function draw() {
  background(0xFF);

  if (window.engine) {
    engine.pushInputsToEngine(logicProto);
    engine.step();
    engine.pullOutputsFromEngine(logicProto);
  }

  wireMng.draw();
  //console.log("WIRE OBJ:", wireMng);

  
  for (let li of logicInput) li.draw();
  for (let lo of logicOutput) lo.draw();
  for (let lv of logicValue) lv.draw();
  for (let c of logicClock) c.draw();
  for (const comp of logicProto) comp.draw();


}



/**
 * While mouse is pressed:
 *  
 */

export function mousePressed() {
    /** Check gate[] mousePressed funtion*/
   
   
    for (let i = 0; i < logicInput.length; i++)
        logicInput[i].mousePressed();

    for (let i = 0; i < logicOutput.length; i++)
        logicOutput[i].mousePressed();

    for (let i = 0; i < logicValue.length; i++)
        logicValue[i].mousePressed();

    for (let i = 0; i < logicClock.length; i++)
        logicClock[i].mousePressed();

    for (const comp of logicProto)
        comp.mousePressed();
  

}

/**
 * @todo TODO
 */
export function mouseReleased() {

   for (let i = 0; i < logicInput.length; i++)
        logicInput[i].mouseReleased();

   for (let i = 0; i < logicOutput.length; i++)
        logicOutput[i].mouseReleased();
   for (let i = 0; i < logicValue.length; i++)
        logicValue[i].mouseReleased();
   for (let i = 0; i < logicClock.length; i++)
        logicClock[i].mouseReleased();
   for (const comp of logicProto)
        comp.mouseReleased();
}

/**
 * @todo TODO
 */
export function doubleClicked() {
    for (let i = 0; i < logicInput.length; i++)
        logicInput[i].doubleClicked();
    for (let i = 0; i < logicValue.length; i++)
        logicValue[i].doubleClicked();
     for (let i = 0; i < logicProto.length; i++)
        logicProto[i].doubleClicked();



}

/**
 * Override mouseClicked Function
 * 
 */
//export function mouseDragged() {
//    for (const comp of logicProto)
//            comp.mouseDragged();
//}

export function mouseClicked() {
    //Check current selected option
    if (currMouseAction == MouseAction.EDIT) {
        //If action is EDIT, check every class. 
        for (let i = 0; i < logicInput.length; i++)
            logicInput[i].mouseClicked();


        for (let i = 0; i < logicOutput.length; i++)
            logicOutput[i].mouseClicked();
        for (let i = 0; i < logicValue.length; i++)
            logicValue[i].mouseClicked();
        for (let i = 0; i < logicClock.length; i++)
            logicClock[i].mouseClicked();
        for (const comp of logicProto)
            comp.mouseClicked();

    } else if (currMouseAction == MouseAction.DELETE) {
        //
        

        for (let i = 0; i < logicInput.length; i++) {
            if (logicInput[i].mouseClicked()) {
                logicInput[i].destroy();
                delete logicInput[i];
                logicInput.splice(i, 1);
            }
        }

        for (let i = 0; i < logicValue.length; i++) {
            if (logicValue[i].mouseClicked()) {
                logicValue[i].destroy();
                delete logicValue[i];
                logicValue.splice(i, 1);
            }
        }

       


        for (let i = 0; i < logicOutput.length; i++) {
            if (logicOutput[i].mouseClicked()) {
                logicOutput[i].destroy();
                delete logicOutput[i];
                logicOutput.splice(i, 1);
            }
        }

        for (let i = 0; i < logicClock.length; i++) {
            if (logicClock[i].mouseClicked()) {
                logicClock[i].destroy();
                delete logicClock[i];
                logicClock.splice(i, 1);
            }
        }
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

if (projectFile) projectFile.addEventListener("change", fileManager.loadFile, false);
if (saveLink) saveLink.addEventListener("click", fileManager.saveFile, false);

/**
 * Call FileManager.saveFile
 */
export function saveFile()
{
    fileManager.saveFile();
}
