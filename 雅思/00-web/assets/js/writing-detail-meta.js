const detailParams = new URLSearchParams(window.location.search);
const detailCategoryKey = detailParams.get("category") || "T1-01-折线图";
const detailQuestionId = detailParams.get("id") || "C19-Test1-Task1";
const detailView = detailParams.get("view") || "record";
const detailCategory = (window.writingCatalog || []).find((item) => item.key === detailCategoryKey);
const detailQuestion = detailCategory?.questions.find((item) => item.id === detailQuestionId);

function renderInstructions(target, instructions) {
  target.replaceChildren();
  (instructions || "").split(/\r?\n\s*\r?\n/).filter(Boolean).forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text.replace(/\s*\r?\n\s*/g, " ");
    target.append(paragraph);
  });
}

function renderQuestionMaterial(target, markdown) {
  target.replaceChildren();
  const lines = (markdown || "").replace(/\r/g, "").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const element = document.createElement("h3");
      element.textContent = heading[1];
      target.append(element);
      index += 1;
      continue;
    }

    const nextLine = (lines[index + 1] || "").trim();
    if (line.startsWith("|") && /^\|?\s*:?-+/.test(nextLine)) {
      const rows = [];
      const alignments = nextLine.split("|").filter(Boolean).map((cell) => {
        const marker = cell.trim();
        if (marker.startsWith(":") && marker.endsWith(":")) return "center";
        if (marker.endsWith(":")) return "right";
        return "left";
      });
      const headers = line.split("|").filter(Boolean).map((cell) => cell.trim());
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(lines[index].split("|").filter(Boolean).map((cell) => cell.trim()));
        index += 1;
      }

      const scroll = document.createElement("div");
      scroll.className = "table-scroll";
      const table = document.createElement("table");
      const thead = table.createTHead();
      const headerRow = thead.insertRow();
      headers.forEach((text, column) => {
        const cell = document.createElement("th");
        cell.textContent = text;
        cell.style.textAlign = alignments[column] || "left";
        headerRow.append(cell);
      });
      const tbody = table.createTBody();
      rows.forEach((row) => {
        const tableRow = tbody.insertRow();
        row.forEach((text, column) => {
          const cell = tableRow.insertCell();
          cell.textContent = text;
          cell.style.textAlign = alignments[column] || "left";
        });
      });
      scroll.append(table);
      target.append(scroll);
      continue;
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    target.append(paragraph);
    index += 1;
  }

  target.hidden = !target.hasChildNodes();
}

if (detailCategory) {
  const subtitle = document.querySelector("#detail-subtitle");
  const backLink = document.querySelector("#detail-back-link");
  const image = document.querySelector("#question-image");
  const imageWrap = document.querySelector(".question-image-wrap");
  const questionCopy = document.querySelector("#question-copy");
  const questionMaterial = document.querySelector("#question-material");
  const hasMaterialImage = /!\[[^\]]*\]\([^)]+\)/.test(detailQuestion?.material || "");

  document.title = `${detailQuestionId}｜写作记录`;
  const showRecord = detailView === "record" && detailQuestion?.written;
  document.querySelector(".page-title h1").textContent = showRecord ? "写作记录" : "写作原题";
  subtitle.textContent = `${detailQuestionId.replaceAll("-", " · ")} · ${detailCategory.name}`;
  backLink.href = `writing-category.html?category=${encodeURIComponent(detailCategory.key)}`;
  backLink.textContent = `← 返回${detailCategory.name}题目列表`;
  renderInstructions(questionCopy, detailQuestion?.instructions);
  renderQuestionMaterial(questionMaterial, hasMaterialImage ? "" : detailQuestion?.material);

  if (detailCategory.task === 1 && (!detailQuestion?.material || hasMaterialImage)) {
    image.src = `../writing/${detailCategory.key}/images/${detailQuestionId}.png`;
    image.alt = `${detailQuestionId} 原题图片`;
    image.hidden = false;
    imageWrap.hidden = false;
  } else {
    image.hidden = true;
    imageWrap.hidden = true;
  }

  if (!showRecord) {
    document.querySelector(".history-section").hidden = true;
    document.querySelector("#panel-resizer").hidden = true;
    document.querySelector(".detail-layout").classList.add("is-transcript-only");
  }
}
