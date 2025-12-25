import { currMouseAction } from "../../menutools.js";
import { MouseAction } from "../Enums.js";
import { Node } from "../Node.js";
import { colorMouseOver } from "../../simulator.js";
/**
 * Prototype generic component
 */

const protoSvgCache = {};

function loadProtoIcon(type, cb) {
  if (protoSvgCache[type] !== undefined) {
    cb(protoSvgCache[type]);
    return;
  }

  const path = `js/simulator/img/${type}.svg`;

  loadImage(
    path,
    img => {
      protoSvgCache[type] = img;
      cb(img);
    },
    () => {
      protoSvgCache[type] = null;
      cb(null);
    }
  );
}

export class LogicProto {

  constructor(x, y, type = "UNDEFINED", name = "PROTO") {

    this.posX = x;
    this.posY = y;
    this.note = "Double clic pour éditer";
    this.type  = type;
    this.name  = name;   // nom du proto
    this.label = name;   // nom logique / signal (LBL)
    this.value = 0;  

    this.icon = null;

    this.width  = 60;
    this.height = 40;

    this.nodes = [];
    this.nodeStartID = null;

    this.isSpawned = true;
    this.isMoving  = false;
    this.offsetMouseX = 0;
    this.offsetMouseY = 0;

    if (this.type === "ROM") {
       this.mem = new Uint8Array(16); // 16 mots de 8 bits
    }

    loadProtoIcon(this.type, img => {
      this.icon = img;
    });
  }

  /* ============================================================
     NODE MANAGEMENT
     ============================================================ */

  addNode(node, dx, dy) {
    node.parent = this;
    node.localX = dx;
    node.localY = dy;
    this.nodes.push(node);
    this.updateNodes();
  }

  updateNodes() {
    for (const n of this.nodes) {
      n.updatePosition(
        this.posX + n.localX,
        this.posY + n.localY
      );
    }
  }

  destroy() {
    for (const n of this.nodes) n.destroy();
    this.nodes.length = 0;
  }


 


 }



