import { currMouseAction, backToEdit } from "../menutools.js";
import { MouseAction } from "./Enums.js";
import { Node } from "./Node.js";
import { colorMouseOver, fileManager } from "../simulator.js";

export class LogicValue {
    constructor(options = {}) {
        this.value = options.value ?? 0;     // valeur décimale
        this.step  = options.step  ?? 1;     // incrément
        this.min   = options.min   ?? 0;
        this.max   = options.max   ?? 255;
        this.diameter = 25;

        this.posX = mouseX;
        this.posY = mouseY;
        this.size = 30;

        this.isSpawned = false;
        this.isMoving = false;
        this.offsetMouseX = 0;
        this.offsetMouseY = 0;

        // sortie uniquement
        this.output = new Node(this.posX + 30, this.posY, true, this.value);
        this.output.signal = this.label;

        this.nodeStartID = this.output.id;
        this.isSaved = false;
    }

    draw() {
        if (!this.isSpawned) {
            this.posX = mouseX;
            this.posY = mouseY;
        }else if(!this.isSaved)
        {
            fileManager.saveState();
            this.isSaved = true;
        }

        fill(255);

        if (this.isMoving) {
            this.posX = mouseX + this.offsetMouseX;
            this.posY = mouseY + this.offsetMouseY;
        }

        if(this.isMouseOver())
            stroke(colorMouseOver[0], colorMouseOver[1], colorMouseOver[2]);
        else
            stroke(0);
        
        strokeWeight(4);
        line(this.posX, this.posY, this.posX + 30, this.posY);
        circle(this.posX, this.posY, this.diameter);


        this.output.updatePosition(this.posX + 30, this.posY);
        this.output.setValue(this.value);
        this.output.draw();

        //this.printInfo();

        textSize(18);

        if (this.value) {
            textStyle(BOLD);
            text(String(this.value), this.posX - this.diameter / 4, this.posY + this.diameter / 4);
        }
        else {
            textStyle(NORMAL);
            fill(255);
            text('0', this.posX - this.diameter / 4, this.posY + this.diameter / 4);
        }
    }



    destroy() {
        this.output.destroy();
        delete this.output;
    }

doubleClicked() {
    if (this.isMouseOver()) {
        this.setValue(0);
        return true;
    }
    return false;
}


draw() {
    if (!this.isSpawned) {
        this.posX = mouseX;
        this.posY = mouseY;
    } else if (!this.isSaved) {
        fileManager.saveState();
        this.isSaved = true;
    }

    if (this.isMoving) {
        this.posX = mouseX + this.offsetMouseX;
        this.posY = mouseY + this.offsetMouseY;
    }

    this.output.updatePosition(this.posX + 30, this.posY);
    this.output.setValue(this.value);

    // ===== DESSIN HARMONISÉ =====
    push();

    const diameter = 35;

    if (this.isMouseOver())
        stroke(colorMouseOver[0], colorMouseOver[1], colorMouseOver[2]);
    else
        stroke(0);

    strokeWeight(4);
    fill(240);
    circle(this.posX, this.posY, diameter);

    // valeur centrée
    fill(0);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14);

    const txt = String(this.value);
    let sz = 14;
    textSize(sz);
    while (textWidth(txt) > diameter - 6 && sz > 8) {
        sz--;
        textSize(sz);
    }

    text(txt, this.posX, this.posY + 1);

    pop();

    // liaison + node
    strokeWeight(4);
    line(this.posX, this.posY, this.posX + 30, this.posY);

    this.output.draw();
}
    

    // ======================
    // Interaction
    // ======================

    mousePressed() {
        if (!this.isSpawned) {
            this.isSpawned = true;
            backToEdit();
            return;
        }

        if (this.isMouseOver() || currMouseAction === MouseAction.MOVE) {
            this.isMoving = true;
            this.offsetMouseX = this.posX - mouseX;
            this.offsetMouseY = this.posY - mouseY;
        }
    }

    mouseReleased() {
        this.isMoving = false;
    }

    mouseClicked() {
        if (this.isMouseOver()) {
            // clic = +step
            this.setValue(this.value + this.step);
            return true;
        }

        if (this.output.isMouseOver()) {
            this.output.mouseClicked();
            return true;
        }
        return false;
    }

    mouseWheel(event) {
        this.setValue(this.value + Math.sign(event.delta) * this.step);
    }

    setValue(v) {
        this.value = Math.max(this.min, Math.min(this.max, v));
    }

    isMouseOver() {
        return (
            mouseX > this.posX - this.size &&
            mouseX < this.posX + this.size &&
            mouseY > this.posY - this.size / 2 &&
            mouseY < this.posY + this.size / 2
        );
    }

    refreshNodes() {
        this.output.setID(this.nodeStartID);
    }
}
