import { logicInput, logicOutput, logicValue, logicProto, gate, flipflop, logicClock, srLatch, wireMng } from "./simulator.js"
import { LogicInput } from "./circuit_components/LogicInput.js"
import { LogicOutput } from "./circuit_components/LogicOutput.js";
import { LogicProto } from "./circuit_components/Proto.js";

import { LogicValue } from "./circuit_components/LogicValue.js";
import { Clock } from "./circuit_components/Clock.js";
import { Gate } from "./circuit_components/Gate.js";
import { Integrated } from "./circuit_components/Integrated.js";
import { IC_type } from "./circuit_components/Enums.js";
import { FF_D_Single, FF_D_MasterSlave } from "./circuit_components/FF_D.js";
import { FF_T } from "./circuit_components/FF_T.js";
import { FF_JK } from "./circuit_components/FF_JK.js";
import { SR_LatchAsync, SR_LatchSync, SR_Latch } from "./circuit_components/SR_Latch.js";
import { currentID, nodeList, resetNodeIDs } from "./circuit_components/Node.js";
import { Wire } from "./circuit_components/Wire.js";


let eventHistory = [];

/*
 

            if ("gate" in JSON.parse(contentFile)) {
                for (let i = 0; i < contentFile.length; i++) {

                    let objectParsed = JSON.parse(contentFile).gate[i];

                    if (objectParsed == undefined)
                        break;

                    console.log(objectParsed);
                    gate.push(new Gate(JSON.parse(contentFile).gate[i].strType));
                    Object.assign(gate[i], objectParsed);
                    //gate[i].refreshNodes();
                }
            }
*/

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

  const res = await fetch('/LogicCompiler/prototypes/' + p.type + '.txt');
  const pro = await res.text();

  console.log("AVANT import", currentID);
  engine.importPrototype(pro);

  console.log("AVANT build", currentID);
  engine.buildProtoNodes(p.posX, p.posY, engine.proto, logicProto);

  console.log("APRES build", currentID);
  console.log(logicProto);
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

      flipflop.length = 0;
      srLatch.length = 0;
      gate.length = 0;
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

      //this.refreshNodes();     // ? maintenant seulement
      restoreWires(ws); // plus tard
     };

     reader.readAsText(file);
  
}//fin classe

/*
             

           

            if ("srLatch" in JSON.parse(contentFile)) {
                for (let i = 0; i < contentFile.length; i++) {

                    let objectParsed = JSON.parse(contentFile).srLatch[i];

                    if (objectParsed == undefined)
                        break;

                    console.log(objectParsed);

                    switch (JSON.parse(contentFile).srLatch[i].type) {
                        case IC_type.SR_LATCH_ASYNC:
                            srLatch.push(new SR_LatchAsync(JSON.parse(contentFile).srLatch[i].gateType,
                                JSON.parse(contentFile).srLatch[i].stabilize));
                            break;
                        case IC_type.SR_LATCH_SYNC:
                            srLatch.push(new SR_LatchSync(JSON.parse(contentFile).srLatch[i].gateType,
                                JSON.parse(contentFile).srLatch[i].stabilize));
                            break;
                    }
                    Object.assign(srLatch[i], objectParsed);
                    //srLatch[i].refreshNodes();
                }
            }

            if ("flipflop" in JSON.parse(contentFile)) {
                for (let i = 0; i < contentFile.length; i++) {

                    let objectParsed = JSON.parse(contentFile).flipflop[i];

                    if (objectParsed == undefined)
                        break;

                    console.log(objectParsed);

                    switch (JSON.parse(contentFile).flipflop[i].type) {
                        case IC_type.FF_D_SINGLE:
                            flipflop.push(new FF_D_Single(JSON.parse(contentFile).flipflop[i].type));
                            break;
                        case IC_type.FF_D_MASTERSLAVE:
                            flipflop.push(new FF_D_MasterSlave(JSON.parse(contentFile).flipflop[i].type));
                            break;
                        case IC_type.FF_T:
                            flipflop.push(new FF_T(JSON.parse(contentFile).flipflop[i].type));
                            break;
                        case IC_type.FF_JK:
                            flipflop.push(new FF_JK(JSON.parse(contentFile).flipflop[i].type));
                            break;
                    }
                    Object.assign(flipflop[i], objectParsed);
                    //flipflop[i].refreshNodes();
                }
            }
           
           if ("wire" in JSON.parse(contentFile)) {
                for (let i = 0; i < contentFile.length; i++) {
                    let objectParsed = JSON.parse(contentFile).wire[i];

                    if (objectParsed == undefined)
                        break;

                    console.log(objectParsed);

                    wireMng.addNode(nodeList[objectParsed.startID]);
                    wireMng.addNode(nodeList[objectParsed.endID]);
                    //Object.assign(gate[i], objectParsed);
                }
            }
 */
           
      

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
        workspace["flipflop"] = flipflop;
        workspace["logicClock"] = logicClock;
        workspace["gate"] = gate;
        workspace["srLatch"] = srLatch;
        workspace["wire"] = wireMng.wire;

        let jsonWorkspace = JSON.stringify(workspace,
            function (key, value) {
                switch (key) {
                    case "parent":
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
