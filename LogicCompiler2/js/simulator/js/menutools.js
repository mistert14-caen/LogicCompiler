import { logicProto } from "./simulator.js";
import { MouseAction, syncType } from "./circuit_components/Enums.js"
import { PROTO_PATH, LogicProto } from "./circuit_components/proto/index.js";

export let currMouseAction = MouseAction.EDIT;

/**
 * @todo TODO
 */



async function loadProtosOnly(f, m) {
  //console.trace("LOAD:", f, m);

  let text;

  // 🔹 CAS USER : depuis le cache / localStorage
  if (f === "USER") {

    const baseName = m + "#";

    text =
      engine.protoCache[baseName] ||
      localStorage.getItem("proto_USER_" + baseName);

    if (!text) {
      console.error("Prototype USER introuvable :", m);
      return;
    }

  } else {

    // 🔹 CAS NORMAL : fetch serveur
    const res = await fetch(PROTO_PATH + '/prototypes/' + f + '/' + m + '.txt');
    text = await res.text();
  }

  // 🔹 Import logique (identique dans les deux cas)
  const proto = engine.importPrototype(text);
  proto.folder = f;

  const cx = 250;
  const cy = 50;

  engine.buildProtoNodes(cx, cy, proto, logicProto);
}

export function activeTool(elTool) {
    resetElements();

    if (elTool.getAttribute("tool") === "PROTO") {
         //alert('proto');
         const t = elTool.getAttribute("model");
         const f = elTool.getAttribute("folder") ?? null;
         //console.log(f);

         loadProtosOnly(f,t).catch(err => {
         console.error("Erreur chargement proto", f +'/'+ t, err);
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
