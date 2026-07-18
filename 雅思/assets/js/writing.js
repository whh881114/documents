const versionParams = new URLSearchParams(window.location.search);
const versionCategoryKey = versionParams.get("category") || "T1-01-折线图";
const versionQuestionId = versionParams.get("id") || "C19-Test1-Task1";
const versionCategory = (window.writingCatalog || []).find((item) => item.key === versionCategoryKey);
const versionQuestion = versionCategory?.questions.find((item) => item.id === versionQuestionId);
const versions = [...(versionQuestion?.versions || [])].sort((a, b) => a.version - b.version);
let currentIndex = 0;

const elements = {
  count: document.querySelector("#version-count"),
  select: document.querySelector("#version-select"),
  number: document.querySelector("#version-number"),
  title: document.querySelector("#version-title"),
  date: document.querySelector("#version-date"),
  essay: document.querySelector("#version-essay"),
  thoughts: document.querySelector("#version-thoughts"),
  feedback: document.querySelector("#version-feedback"),
  revision: document.querySelector("#version-revision"),
  previous: document.querySelector("#previous-version"),
  next: document.querySelector("#next-version"),
  pages: document.querySelector("#page-numbers")
};

function renderMarkdown(target, markdown) {
  target.replaceChildren();
  const lines = (markdown || "").replace(/\r/g, "").split("\n");
  let paragraph = [];
  let list = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    const element = document.createElement("p");
    element.textContent = paragraph.join(" ");
    target.append(element);
    paragraph = [];
  }

  function closeList() {
    list = null;
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      return;
    }

    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const element = document.createElement("h5");
      element.textContent = heading[1];
      target.append(element);
      return;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (!list) {
        list = document.createElement("ul");
        target.append(list);
      }
      const item = document.createElement("li");
      item.textContent = bullet[1];
      list.append(item);
      return;
    }

    if (line.startsWith(">")) {
      flushParagraph();
      closeList();
      const quote = document.createElement("blockquote");
      quote.textContent = line.replace(/^>\s?/, "");
      target.append(quote);
      return;
    }

    paragraph.push(line);
  });

  flushParagraph();
  if (!target.hasChildNodes()) {
    const empty = document.createElement("p");
    empty.className = "placeholder-text";
    empty.textContent = "本部分尚未填写。";
    target.append(empty);
  }
}

function renderPageButtons() {
  elements.pages.replaceChildren();
  versions.forEach((version, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(version.version).padStart(2, "0");
    button.setAttribute("aria-label", `查看版本 ${version.version}`);
    if (index === currentIndex) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => showVersion(index));
    elements.pages.append(button);
  });
}

function showVersion(index) {
  currentIndex = Math.max(0, Math.min(index, versions.length - 1));
  const version = versions[currentIndex];
  const paddedVersion = String(version.version).padStart(2, "0");

  elements.number.textContent = `版本 ${paddedVersion} / ${versions.length}`;
  elements.title.textContent = version.filename;
  elements.date.textContent = version.date;
  elements.select.value = String(currentIndex);
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === versions.length - 1;

  renderMarkdown(elements.essay, version.essay);
  renderMarkdown(elements.thoughts, version.thoughts);
  renderMarkdown(elements.feedback, version.feedback);
  renderMarkdown(elements.revision, version.revision_notes);
  renderPageButtons();
}

versions.forEach((version, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = `版本 ${String(version.version).padStart(2, "0")}`;
  elements.select.append(option);
});

elements.count.textContent = versions.length > 0 ? `共 ${versions.length} 个版本，每页显示 1 个` : "尚无作文版本";

if (versions.length > 0) {
  elements.select.addEventListener("change", (event) => showVersion(Number(event.target.value)));
  elements.previous.addEventListener("click", () => showVersion(currentIndex - 1));
  elements.next.addEventListener("click", () => showVersion(currentIndex + 1));
  showVersion(0);
} else {
  document.querySelector(".version-card").innerHTML = '<p class="empty-history">尚未创建版本文件。请从写作模板复制并创建 V01。</p>';
  elements.select.closest("label").hidden = true;
  document.querySelector(".pagination").hidden = true;
}
