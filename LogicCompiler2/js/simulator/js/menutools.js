import { logicProto } from "./simulator.js";
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
  const cx = 50;
  const cy = 50;

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

       elTool.classList.add('active');
  }

}

function resetElements() {
    currMouseAction = MouseAction.EDIT;
    let activeElements = document.getElementsByClassName("active");

    for (let i = 0; i < activeElements.length; i++) {
        activeElements[i].classList.remove('active')
    }
    document.getElementById("canvas-sim").style.cursor = "default";
}

export function backToEdit() {
    resetElements();
    document.getElementsByClassName("Edit")[0].classList.add("active");
    currMouseAction = MouseAction.EDIT;
}

export function save() {
    //
}
