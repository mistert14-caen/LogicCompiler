import { LogicProto } from "./Proto.core.js";

LogicProto.prototype.initNOTE = function () {
  this.note = this.note ?? "Double clic pour éditer";
  this.minHeight = 40;
  autoResize(this);
};

LogicProto.prototype.onDblClickNOTE = function () {
  openNoteEditor(this);
};

function drawStyledLine(line, x, y) {
  let cursorX = x;
  let i = 0;

  while (i < line.length) {
    if (line.startsWith("**", i)) {
      // 🔥 texte en gras
      const j = line.indexOf("**", i + 2);
      if (j !== -1) {
        const boldText = line.slice(i + 2, j);
        textStyle(BOLD);
        text(boldText, cursorX, y);
        cursorX += textWidth(boldText);
        i = j + 2;
        continue;
      }
    }

    // texte normal (1 caractère)
    textStyle(NORMAL);
    const ch = line[i];
    text(ch, cursorX, y);
    cursorX += textWidth(ch);
    i++;
  }
}


function openNoteEditor(proto) {
  const ta = document.createElement("textarea");

  ta.value = proto.note ?? "";
  ta.style.position = "absolute";
  ta.style.left = (proto.posX - proto.width / 2) + "px";
  ta.style.top  = (proto.posY - proto.height / 2) + "px";
  ta.style.width  = proto.width + "px";
  ta.style.height = "120px";
  ta.style.zIndex = 1000;

  document.body.appendChild(ta);
  ta.focus();

  let canceled = false;
  let closed   = false;   // 🔑 garde-fou

  function close(save) {
    if (closed) return;   // ✅ empêche double exécution
    closed = true;

    if (save && !canceled) {
      proto.note = ta.value ?? "";
      autoResize(proto);
    }

    if (ta.parentNode) {
      ta.parentNode.removeChild(ta);  // ✅ safe
    }
  }

  ta.addEventListener("blur", () => close(true));

  ta.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      canceled = true;
      ta.blur();
    }
    if (e.key === "Enter" && e.ctrlKey) {
      ta.blur();
    }
  });
}

function parseTitle(line) {
  if (line.startsWith("## ")) {
    return { level: 2, text: line.slice(3) };
  }
  if (line.startsWith("# ")) {
    return { level: 1, text: line.slice(2) };
  }
  return null;
}


function autoResize(proto) {
  const text = proto.note ?? "";
  const lines = text.split("\n");

  proto.height = Math.max(
    proto.minHeight ?? 40,
    lines.length * 16 + 10
  );
}

LogicProto.prototype.drawNOTE = function () {
  const lines = (this.note ?? "").split("\n");

  // fond NOTE
  fill(255, 255, 200);
  stroke(0);
  rect(
    this.posX - this.width / 2,
    this.posY - this.height / 2,
    this.width,
    this.height,
    4
  );

  noStroke();
  textAlign(LEFT, TOP);

  let y = this.posY - this.height / 2 + 6;
  const x = this.posX - this.width / 2 + 6;

  for (const line of lines) {

    const title = parseTitle(line);

    if (title) {
      // 🔵 TITRE
      fill(20, 40, 120);        // bleu foncé
      textStyle(BOLD);
      textSize(title.level === 1 ? 14 : 13);

      text(title.text, x, y);
      y += title.level === 1 ? 18 : 16;

    } else {
      // 🖤 TEXTE NORMAL (+ gras inline)
      fill(0);
      textSize(12);
      drawStyledLine(line, x, y);  // ta fonction **gras**
      y += 14;
    }
  }

  // reset état global canvas
  textStyle(NORMAL);
  fill(0);
};
