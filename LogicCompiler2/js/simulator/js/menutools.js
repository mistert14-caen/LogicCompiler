import { Clock } from "./circuit_components/Clock.js";
import { logicInput, logicOutput, logicClock, logicValue, logicProto, logicLabel } from "./simulator.js";
import { LogicInput } from "./circuit_components/LogicInput.js";
import { LogicOutput } from "./circuit_components/LogicOutput.js";
import { LogicValue } from "./circuit_components/LogicValue.js";
import { MouseAction, syncType } from "./circuit_components/Enums.js"
import { LogicProto } from "./circuit_components/proto/index.js";


export let currMouseAction = MouseAction.EDIT;

/**
 * @todo TODO
 */



async function loadProtosOnly(m) {
  console.trace("LOAD:",m);

  const res = await fetch('/LogicCompiler2/prototypes/' + m + '.txt');
  const text = await res.text();

  // ?? récupération EXPLICITE du prototype logique
  const proto = engine.importPrototype(text);

  const index = logicProto.length;
  const cx = 100 / 2 + index * 40;
  const cy = 100 / 2 + index * 40;

  // ?? on passe le proto explicitement
 
  engine.buildProtoNodes(cx, cy, proto, logicProto);
}

export function activeTool(elTool) {
    resetElements();

    if (elTool.getAttribute("tool") === "PROTO") {
         const t = elTool.getAttribute("model");
         loadProtosOnly(t).catch(err => {
         console.error("Erreur chargement proto", t, err);
       });
       return;
    }

     if (elTool.getAttribute("tool") === "LOAD") {
        document.getElementById("protoFile").click();  
       return;
    }


    switch (elTool.getAttribute("tool")) {
        case "Edit":
            resetElements();
            break;

        case "Move":
            currMouseAction = MouseAction.MOVE;
            document.getElementById("canvas-sim").style.cursor = "move";
            break;

        case "Delete":
            currMouseAction = MouseAction.DELETE;
            break;

        case "LogicInput":
            logicInput.push(new LogicInput());
            console.log(JSON.stringify({ logicInput }, ['logicInput', 'posX', 'posY', 'value']));
            break;

        case "LogicOutput":
            logicOutput.push(new LogicOutput());
            break;

        case "LogicValue":
            logicValue.push(new LogicValue());
            break;
        case "LogicLabel":
            logicLabel.push(new LogicLabel());
            break;


        case "Clock":
            let period = document.getElementsByClassName("period")[0].value;
            let dutycycle = document.getElementsByClassName("duty-cycle")[0].value;
            logicClock.push(new Clock(period, dutycycle));
            break;

       }

    elTool.classList.add('active');

}

/**
 * @todo this doc
 */
function resetElements() {
    currMouseAction = MouseAction.EDIT;
    let activeElements = document.getElementsByClassName("active");

    for (let i = 0; i < activeElements.length; i++) {
        activeElements[i].classList.remove('active')
    }
    document.getElementById("canvas-sim").style.cursor = "default";
}

/**
 * Reset Element
 * then set current action to EDIT 
 */
export function backToEdit() {
    resetElements();
    document.getElementsByClassName("Edit")[0].classList.add("active");
    currMouseAction = MouseAction.EDIT;
}

/**
 * Save Option
 * Export All logic input and output on console
 */
export function save() {

    for (let i = 0; i < logicInput.length; i++) {
        console.log(logicInput[i].export());
    }
}
