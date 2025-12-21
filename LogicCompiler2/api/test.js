const protoTextArea = document.getElementById("protoText");

async function buildProtoPanel() {
  const panel = document.getElementById("protoPanel");
  panel.innerHTML = "Chargement...";

  try {
    const res = await fetch("/LogicCompiler2/api/list_protos.php");
    const groups = await res.json();

    panel.innerHTML = "";

    for (const group of groups) {

      const details = document.createElement("details");
      details.open = false;

      const summary = document.createElement("summary");
      summary.textContent = group.title;
      details.appendChild(summary);

      const box = document.createElement("div");
      box.className = "proto-box";

      for (const name of group.files) {
        const btn = document.createElement("button");
        btn.className = "proto-btn";
        btn.textContent = name;

        const path = `${group.folder}/${name}.txt`;
        btn.onclick = () => loadProto(path);

        box.appendChild(btn);
      }

      details.appendChild(box);
      panel.appendChild(details);
    }

  } catch (e) {
    panel.innerHTML = "Erreur chargement prototypes";
    console.error(e);
  }
}

async function loadProto(path) {
  try {
    const res = await fetch(`/LogicCompiler2/prototypes/${path}`);
    const txt = await res.text();

    protoTextArea.value =
      `# ${path}\n\n` + txt;

  } catch (e) {
    protoTextArea.value = "Erreur chargement : " + path;
  }
}

buildProtoPanel();
