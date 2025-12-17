import { currMouseAction, backToEdit } from "../menutools.js"
import { MouseAction } from "./Enums.js";
import { Node, fillValue } from "./Node.js";
import { colorMouseOver, fileManager } from "../simulator.js"

/**
 * @todo TODO
 */
export class LogicOutput {
    constructor() {
        this.value = false;
        this.posX = mouseX;
        this.posY = mouseY;
        this.diameter = 35;
        this.isSpawned = false;
        this.isMoving = false;
        this.offsetMouseX = 0;
        this.offsetMouseY = 0;
        this.input = new Node(this.posX - 30, this.posY, false, this.value);
        //this.label='S';
        this.input.signal = this.label; // "Q"
        this.nodeStartID = this.input.id;
        this.isSaved = false;
    }

    /**
     * @todo TODO
     */
    destroy() {
        this.input.destroy();
        delete this.input;
    }

    /**
     * @todo TODO
     */
    draw() {
        if (!this.isSpawned) {
            this.posX = mouseX;
            this.posY = mouseY;
        }else if(!this.isSaved)
        {
            fileManager.saveState();
            this.isSaved = true;
        }

        if (this.isMoving) {
            this.posX = mouseX + this.offsetMouseX;
            this.posY = mouseY + this.offsetMouseY;
        }

        this.input.updatePosition(this.posX - 30, this.posY);

        //this.value = this.input.getValue();
        const v = this.input.value;

        fillValue(v);
        
        if(this.isMouseOver())
            stroke(colorMouseOver[0], colorMouseOver[1], colorMouseOver[2]);
        else
            stroke(0);
    

        strokeWeight(4);
        line(this.posX, this.posY, this.posX - 30, this.posY);
        circle(this.posX, this.posY, this.diameter);

        this.input.draw();

        noStroke();
        fill(0);
        textSize(8);
        textStyle(NORMAL);
        text('LOG. OUTPUT', this.posX - 20, this.posY + 25);

        textSize(12);

        if (v) {
            textStyle(BOLD);
           const textVal = String(v);
           textSize(18);               // ou adapte si besoin
           textStyle(NORMAL);

           const tw = textWidth(textVal);
           const textX = this.posX - tw / 2;
           const textY = this.posY + textAscent() / 2;

           fill(v ? 0 : 255);
           text(textVal, textX, textY);
	   
        }
    }

    /**
     * @todo TODO
     */
    refreshNodes()
    {
        let currentID = this.nodeStartID;
        this.input.setID(currentID);
    }

    /**
     * @todo TODO
     */
    isMouseOver() {
        if (dist(mouseX, mouseY, this.posX, this.posY) < this.diameter / 2)
            return true;
        return false;
    }

    /**
     * @todo TODO
     */
    mousePressed() {
        if (!this.isSpawned) {
            this.posX = mouseX;
            this.posY = mouseY;
            this.isSpawned = true;
            backToEdit();
            return;
        }

        if (this.isMouseOver() || currMouseAction == MouseAction.MOVE) {
            this.isMoving = true;
            this.offsetMouseX = this.posX - mouseX;
            this.offsetMouseY = this.posY - mouseY;
        }
    }

    /**
     * @todo TODO
     */
    mouseReleased() {
        if (this.isMoving) {
            this.isMoving = false;
        }

    }

    /**
     * @todo TODO
     */
    mouseClicked() {
        if (this.isMouseOver() || this.input.isMouseOver()) {
            this.input.mouseClicked();
            return true;
        }
        return false;
    }
}
