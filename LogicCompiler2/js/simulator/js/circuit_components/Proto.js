import { currMouseAction } from "../menutools.js";
import { MouseAction } from "./Enums.js";
import { Node } from "./Node.js";
import { colorMouseOver } from "../simulator.js";

/**
 * Prototype generic component
 * Parent of several nodes
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

    constructor(x, y, type="UNDEFINED", label = "PROTO") {
  
        this.icon = null;
        this.posX = x;
        this.posY = y;

        this.label = label;
        this.type = type;

        this.isSpawned = true;
        this.isMoving = false;
        this.offsetMouseX = 0;
        this.offsetMouseY = 0;

        /** @type {Node[]} */
        this.nodes = [];
        
        this.width = 60;
        this.height = 40;
        this.nodeStartID = null;

        loadProtoIcon(this.type, img => {
     		this.icon = img;
  	});


    }


    /* ============================================================
       NODE MANAGEMENT
       ============================================================ */
   
 fixNodeIDs() {
    if (this.nodeStartID == null) return;

    let currentID = this.nodeStartID;

    // entrées dans l'ordre du proto.txt
    for (const n of this.nodes.filter(n => !n.isOutput)) {
        n.setID(currentID++);
    }

    // sorties dans l'ordre du proto.txt
    for (const n of this.nodes.filter(n => n.isOutput)) {
        n.setID(currentID++);
    }
}
    /**
     * Add a node relative to the component
     * @param {Node} node
     * @param {number} dx
     * @param {number} dy
     */
    addNode(node, dx, dy) {
        node.parent = this;
        node.localX = dx;
        node.localY = dy;
        this.nodes.push(node);
        this.updateNodes();
    }

    /**
     * Update absolute position of nodes
     */
    updateNodes() {
        for (const n of this.nodes) {
            n.updatePosition(
                this.posX + n.localX,
                this.posY + n.localY
            );
        }
    }


clone() {
  const c = new LogicProto(this.posX, this.posY, this.type, this.label);

  // dimensions
  c.width  = this.width;
  c.height = this.height;

  // état
  c.isSpawned = false;
  c.isMoving  = false;

  // recréer les nodes (CLÉ)
  c.nodes = this.nodes.map(n => {
    const nn = new Node(
      0, 0,
      n.isOutput,
      n.value
    );

    nn.localX     = n.localX;
    nn.localY     = n.localY;
    nn.signal     = n.signal;      // sera renommé ensuite
    nn.inputState = n.inputState;

    nn.id = null;                  // IMPORTANT
    return nn;
  });

  c.nodeStartID = null;

  return c;
}

refreshNodes() {

}

    destroy() {
        for (const n of this.nodes) {
            n.destroy();
        }
        this.nodes.length = 0;
    }

    /* ============================================================
       DRAW
       ============================================================ */
draw() {

    if (this.isMoving) {
        this.posX = mouseX + this.offsetMouseX;
        this.posY = mouseY + this.offsetMouseY;
        this.updateNodes();
    }

    push();

if (this.isMouseOver())
  stroke(colorMouseOver[0], colorMouseOver[1], colorMouseOver[2]);
else
  stroke(0);


// SVG PAR-DESSUS le fond
if (this.icon) {
  image(
    this.icon,
    this.posX - this.width/2 ,
    this.posY - this.height/2,
    this.width,
    this.height
  );
}
else {
   strokeWeight(3);
   fill(240);
   rectMode(CENTER);
   rect(this.posX, this.posY, this.width, this.height, 6);

  // label optionnel
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(this.label, this.posX, this.posY);
}

pop();

    // nodes dessinés avec l'état "normal"
    for (const n of this.nodes) {
        n.draw();
    }
}


    /* ============================================================
       HIT TEST
       ============================================================ */

    isMouseOver() {
        return (
            mouseX > this.posX - this.width / 2 &&
            mouseX < this.posX + this.width / 2 &&
            mouseY > this.posY - this.height / 2 &&
            mouseY < this.posY + this.height / 2
        );
    }

    /* ============================================================
       MOUSE EVENTS
       ============================================================ */

    mousePressed() {
        //if (currMouseAction !== MouseAction.EDIT)
        //    return;

        if (this.isMouseOver()) {
            this.isMoving = true;
            this.offsetMouseX = this.posX - mouseX;
            this.offsetMouseY = this.posY - mouseY;
        }
    }

    mouseReleased() {
        if (this.isMoving)
            this.isMoving = false;
    }

    mouseDragged() {
        return true;
     }


    mouseClicked() {
        // delegate click to nodes for wiring
        for (const n of this.nodes) {
            if (n.isMouseOver()) {
                n.mouseClicked();
                return true;
            }
        }
        return false;
    }
}
