import { logicProto, wireMng } from "./simulator.js"
import { PROTO_PATH, SVGS, LogicProto, autoResize } from "./circuit_components/proto/index.js";
import { IC_type } from "./circuit_components/Enums.js";
import { currentID, nodeList, resetNodeIDs } from "./circuit_components/Node.js";
import { Wire } from "./circuit_components/Wire.js";


let eventHistory = [];

function romtToString(mem) {
  let s = "";
  for (let i = 0; i < mem.length; i++) {
    if (mem[i] === 0) break;
    s += String.fromCharCode(mem[i]);
  }
  return s;
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


async function loadProtosOnly(p) {
  console.log("LOAD PROTO:", p);

  let text;

  // 🔹 CAS USER
  if (p.folder === "USER") {
    const baseName = p.type + "#";

    text =
      engine.protoCache[baseName] ||
      localStorage.getItem("proto_USER_" + baseName);

    if (!text) {
      console.error("Prototype USER introuvable :", p.type);
      return;
    }

  } else {

    // 🔹 CAS SYSTEME
    const res = await fetch(
      PROTO_PATH + '/prototypes/' + p.folder + '/' + p.type + '.txt'
    );
    text = await res.text();
  }

  // 🔹 Import logique (identique)
  const proto = engine.importPrototype(text);
  
  proto.folder = p.folder;

  // 🔹 Reconstruction UI
  engine.buildProtoNodes(p.posX, p.posY, proto, logicProto);

  // 🔹 Instance UI réellement créée
  const ui = logicProto[logicProto.length - 1];

    


    if (p.note) { ui.note = p.note; autoResize(ui);}
    if (p.type === "ROMT") {
      ui.mem = new Uint8Array(256);
    }

    if (p.type === "ROM") {
      ui.mem = new Uint8Array(16);
    }

    if (p.type === "RAM8") {
      ui.mem = new Uint8Array(256);
    }
    if (p.type === "RAM16") {
      ui.mem = new Uint16Array(65536);
    }

    if ((p.type === "ROM" || p.type === "RAM8" || p.type === "RAM16") && p.rom) {
       Object.entries(p.rom).forEach(([i, v]) => {
         ui.mem[+i] = v;
       });
    }
    if (p.type === "ROMT" && typeof p.romt === "string") {
         const txt  = p.romt;
         const size = ui.mem.length;

         for (let i = 0; i < size; i++) {
         if (i < txt.length) {
           ui.mem[i] = txt.charCodeAt(i) & 0xFF;
         } else {
           ui.mem[i] = 0;
         }
      }
    }

    // 🔹 Cas particulier : LABEL
    if (p.type === "LBL") {
      const signalName = p.label;

      ui.renameLabelSignal(signalName);

      if (window.engine && engine.signals && !(signalName in engine.signals)) {
        engine.set(signalName, 0);
     }
    }
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
    async loadWorkspace(ws) {
    engine.reset();
    this.isLoadingState = true;

    wireMng.wire.length = 0;
    logicProto.length = 0;
    nodeList.length = 0;

    resetNodeIDs();

    await loadAllProtos(ws);
    

    this.isLoadingState = false;
    restoreWires?.(ws);
  }

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
  engine.reset();
  const file = e.target.files.item(0);
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    const ws = JSON.parse(reader.result);
    await this.loadWorkspace(ws);   // ? MAINTENANT EXISTE
  };

  reader.readAsText(file);
}
 
     
async loadFromServer(id) {
  engine.reset();
  if (!id) return;

  const url = `https://mistert.freeboxos.fr/${PROTO_PATH}/examples/${id}.json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn("Aucun fichier serveur pour id =", id);
      this.currentWorkspaceId = id;   // mémorisé pour sauvegarde future
      return;
    }

    const ws = await res.json();
    await this.loadWorkspace(ws);

    this.currentWorkspaceId = id;

  } catch (err) {
    console.error("Erreur chargement serveur :", err);
    this.currentWorkspaceId = id;
  }
}

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
  let workspace = {};

  workspace.logicProto = logicProto.map(p => {

    const o = {
      type: p.type,
      folder: p.folder,
      posX: p.posX,
      posY: p.posY
    };

    // ---------- ROM classique ----------
     if ((p.type === "ROM" || p.type === "RAM8" || p.type === "RAM16")) {
       o.rom = {};
       p.mem.forEach((v, i) => {
         if (v !== 0) o.rom[i] = v;
       });
    }

    // ---------- ROM TEXTE ----------
    if (p.type === "ROMT" && p.mem instanceof Uint8Array) {
      const txt = romtToString(p.mem);
      if (txt.length > 0) {
        o.romt = txt;
      }
    }

    // ---------- LABEL ----------
    if (p.type === "LBL" && p.label) {
      o.label = p.label;
    }

    // ---------- NOTE ----------
    if (p.type === "NOTE" && p.note) {
      o.note = p.note;
    }

    return o;
  });

  // ---------- WIRES ----------
  workspace.wire = wireMng.wire.map(w => ({
    startID: w.startNode.id,
    endID:   w.endNode.id,
    width:   w.width ?? 1,
    endX:    w.endX ?? w.p2?.x,
    endY:    w.endY ?? w.p2?.y
  }));

  return JSON.stringify(workspace, null, "\t");
}


}


