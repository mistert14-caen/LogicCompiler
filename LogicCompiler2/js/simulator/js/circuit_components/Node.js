import { INPUT_STATE } from "./Enums.js";
import { wireMng } from "../simulator.js";
import { SVGS } from "../circuit_components/proto/index.js";

export let nodeList = [];

export let currentID = 0;

export function resetNodeIDs() {
   currentID = 0;
}


/**
 * @todo TODO
 */
export class Node {
    constructor(posX, posY, isOutput = false, value = false) {
        //console.trace("NEW NODE", currentID);
        this.diameter = 10;
        this.value = value;
        this.posX = posX;
        this.posY = posY;
        this.isOutput = isOutput;
        this.hitRange = this.diameter + 10;
        this.signal = null;
        // only once input per node
        this.inputState = INPUT_STATE.FREE;

        this.isAlive = true; // not destroyed
        this.brotherNode = null; // for short circuit

        this.id = currentID;
        currentID++;

        nodeList[this.id] = this;
        //console.log(nodeList);
    }

    /**
     * @todo TODO
     */
    destroy() {
        this.isAlive = false;
        delete nodeList[this.id];
    }

    /**
     * @todo TODO
     */

shortSignalName(sig) {
    const i = sig.lastIndexOf("_");
    return (i >= 0) ? sig.slice(i + 1) : sig;
}

pinTextSize(type) {
    if (!type) return 6;

    if (SVGS.includes(type))
        return 0;
    return 12;
}


draw() {
    fillValue(this.value);

    stroke(0);
    strokeWeight(4);
    circle(this.posX, this.posY, this.diameter);

    if (this.isMouseOver()) {
        fill(128, 128);
        noStroke();
        circle(this.posX, this.posY, this.hitRange);
    }

    if (this.isMoving) {
        const X = mouseX + this.offsetMouseX;
        const Y = mouseY + this.offsetMouseY;
        this.updatePosition(X, Y);
    }

    // ==========================
    // Nom de la broche (signal)
    // ==========================
    if (this.signal) {

    const label = this.shortSignalName(this.signal);
    const size  = this.pinTextSize(this.parent?.type);

    
    // Option : masquer totalement pour certains blocs
    if (SVGS.includes(this.parent?.type) && size < 7)
        return;
     if (this.parent?.type == 'LBL')
        return;

    push();
    noStroke();
    fill(200);
    textSize(size);

    if (this.isOutput) {
        textAlign(RIGHT, CENTER);
        text(label, this.posX - this.diameter / 2 - 4, this.posY);
    } else {
        textAlign(LEFT, CENTER);
        text(label, this.posX + this.diameter / 2 + 4, this.posY);
    }
    pop();
}

    /*
    // debug optionnel
    noStroke();
    fill(0);
    textSize(12);
    textStyle(NORMAL);
    text(this.id, this.posX - 20, this.posY + 25);
    */
}

    /**
     * @todo TODO
     */
    setID(newID)
    {
        //console.trace("SET currentID =", newID);
        delete nodeList[this.id];
        this.id = newID;
        nodeList[this.id] = this;

        //update max id
        if(this.id > currentID)
            currentID = this.id + 1;
    }

    /**
     * @todo TODO
     */
    setInputState(state) {
        this.inputState = state;
    }

    /**
     * @todo TODO
     */
    setBrother(brotherNode) {
        this.brotherNode = brotherNode;
    }

    /**
     * @todo TODO
     */
    getBrother() {
        return this.brotherNode;
    }

    /**
     * @todo TODO
     */
    getValue() {
        return this.value;
    }

    /**
     * @todo TODO
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * @todo TODO
     */
    updatePosition(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }

    /**
     * 
     * 
     */
    isMouseOver() {
        if (dist(mouseX, mouseY, this.posX, this.posY) < (this.hitRange) / 2)
            return true;
        return false;
    }

    /**
     * @todo TODO
     */
    mouseClicked() {
        //console.log(this);
        if (this.isMouseOver() && (this.inputState == INPUT_STATE.FREE || this.isOutput)) {

            wireMng.addNode(this);
            return true;
        }
        return false;
    }

   



};

/**
 * 
 * @param {*} value 
 */

export function fillValue(value) {
    //console.log(value);
    if (value)
        fill(255, 193, 7);
    else
        fill(255, 255, 255);
}

