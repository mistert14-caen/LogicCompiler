import { logicInput, logicOutput, logicValue, logicProto, logicClock, wireMng } from "./simulator.js"
import { LogicInput } from "./circuit_components/LogicInput.js"
import { LogicOutput } from "./circuit_components/LogicOutput.js";
import { LogicProto } from "./circuit_components/Proto.js";
import { LogicValue } from "./circuit_components/LogicValue.js";
import { Clock } from "./circuit_components/Clock.js";
import { IC_type } from "./circuit_components/Enums.js";
import { currentID, nodeList, resetNodeIDs } from "./circuit_components/Node.js";
import { Wire } from "./circuit_components/Wire.js";


let eventHistory = [];

function loadLogicClocks(ws) {
    if (!ws.logicClock) return;
    for (const obj of ws.logicClock) {
      const clk = new Clock({ deserialize: true });
      Object.assign(clk, obj);
      logicClock.push(clk);
    }
}

function restoreWires(ws) {
  if (!ws.wire) return;

  // sécurité : on sort de tout mode "linking"
  wireMng.isOpened = false;

  for (const w of ws.wire) {
    const startNode = nodeList[w.startID];
    const endNode   = nodeList[w.endID];

    if (!startNode || !endNode) {
      console.warn("Wire ignoré (node manquant)", w);
      continue;
    }

    // ?? création déclarative : wire déjà fermé
    const wire = new Wire(startNode).close(endNode);
    wireMng.wire.push(wire);
  }
}


function loadLogicInputs(ws) {
    if (!ws.logicInput) return;

    for (const obj of ws.logicInput) {
      const inp = new LogicInput({ deserialize: true });
      Object.assign(inp, obj);
      logicInput.push(inp);
    }
}

function loadLogicOutputs(ws) {
    if (!ws.logicOutput) return;

    for (const obj of ws.logicOutput) {
      const inp = new LogicOutput({ deserialize: true });
      Object.assign(inp, obj);
      logicOutput.push(inp);
    }
}

function loadLogicValues(ws) {
    if (!ws.logicValue) return;

    for (const obj of ws.logicValue) {
      const inp = new LogicValue({ deserialize: true });
      Object.assign(inp, obj);
      logicValue.push(inp);
    }
}


async function loadProtosOnly(p) {
  console.log(p);

  // p.type = "AND", "NOT", etc.
  const res = await fetch('/LogicCompiler2/prototypes/' + p.type + '.txt');
  const text = await res.text();

  //console.log("AVANT import", currentID);

  // ?? import avec cache
  const proto = engine.importPrototype(text);

  //console.log("AVANT build", currentID);

  // ?? création d'une INSTANCE UI à partir du proto logique
  engine.buildProtoNodes(p.posX, p.posY, proto, logicProto);
  // ?? CAS SPÉCIAL : LBL
  if (p.type === "LBL") {

    const signalName = p.label;

    // 1. forcer le signal sur tous les nodes du LBL
    for (const n of ui.nodes) {
      n.signal = signalName;
    }

    // 2. recréer la variable moteur si absente
    if (engine.signals && !(signalName in engine.signals)) {
      engine.set(signalName, 0);
    }
  }

  //console.log("APRES build", currentID);
  //console.log(logicProto);
}
async function loadAllProtos(ws) {
  for (const p of ws.logicProto) {
    await loadProtosOnly(p);   // ?? ATTENTE RÉELLE
  }
}



/**
 * @todo TODO
 */
export class FileManager {

    /**
     * @todo TODO
     */
    constructor()
    {
        this.isLoadingState = false;
    }

    /**
     * @todo TODO
     */
    saveState() {
        /* TODO
        if(this.isLoadingState)
            return;
        
        eventHistory.unshift(FileManager.getJSON_Workspace());
        if (eventHistory.length > 10) {
            delete eventHistory[10];
            eventHistory.length = 10;
        }
        console.log(eventHistory);*/
    }

    /**
     * @todo TODO
     */
    
 



async loadFile(e) {

      this.isLoadingState = true;

      wireMng.wire.length = 0;
      logicClock.length = 0;
      logicInput.length = 0;
      logicOutput.length = 0;
      logicValue.length = 0;
      logicProto.length = 0;
      nodeList.length = 0;

      resetNodeIDs();

      const file = e.target.files.item(0);
      const reader = new FileReader();

      reader.onload = async () => {

      const ws = JSON.parse(reader.result);

      // 1?? PROTOS EN PREMIER (BLOQUANT)
      await loadAllProtos(ws);

      // 2?? ENSUITE SEULEMENT
      loadLogicInputs(ws);
      loadLogicValues(ws);
      loadLogicOutputs(ws);
      loadLogicClocks?.(ws);

      // 3?? FIN DU LOAD
      this.isLoadingState = false;
      restoreWires(ws); // plus tard
     };

     reader.readAsText(file);
  
}//fin classe

      

    /**
     * @todo TODO
     */
    saveFile(e) {

        let jsonWorkspace = FileManager.getJSON_Workspace();
        let blob = new Blob([jsonWorkspace], { type: 'application/json' });
        saveProjectFile.href = URL.createObjectURL(blob);
        //console.log(jsonWorkspace);
    }

    /**
     * @todo TODO
     */
    static getJSON_Workspace() {
        let workspace = new Object();

        workspace["logicProto"] = logicProto;
        workspace["logicInput"] = logicInput;
        workspace["logicOutput"] = logicOutput;
        workspace["logicValue"] = logicValue;
        workspace["logicClock"] = logicClock;
        workspace["wire"] = wireMng.wire;

        let jsonWorkspace = JSON.stringify(workspace,
            function (key, value) {
                switch (key) {
                    case "_pixelsState":
                         return;
                    case "parent":
                         return undefined;
                    case "protoCache":
                    case "engine":
    			 return undefined;
                    case "output":
                    case "input":
                    case "nodeSet":
                    case "nodeReset":
                    case "nodeClock":
                    case "nodeD":
                    case "nodeT":
                    case "nodeJ":
                    case "nodeK":
                    case "nodeQ":
                    case "nodeNotQ":
                    case "andGate_NotQ":
                    case "andGate_Q":
                    case "ff_D":
                    case "orGate":
                    case "gateSet":
                    case "gateReset":
                    case "asyncLatch":
                    case "master":
                    case "slave":
                    case "srLatchSync":
                    case "startNode":
                    case "endNode":
                        return undefined;
                }

                // other things which is not possible to export on JSON
                return value;
            }, '\t');
        return jsonWorkspace;
    }
}
