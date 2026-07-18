const versions = window.writingVersions || [];
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
  previous: document.querySelector("#previous-version"),
  next: document.querySelector("#next-version"),
  pages: document.querySelector("#page-numbers")
};

function renderParagraphs(target, paragraphs) {
  target.replaceChildren();
  paragraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    if (text.startsWith("这里")) paragraph.className = "placeholder-text";
    target.append(paragraph);
  });
}

function renderPageButtons() {
  elements.pages.replaceChildren();
  versions.forEach((version, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `查看版本 ${index + 1}：${version.title}`);
    if (index === currentIndex) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => showVersion(index));
    elements.pages.append(button);
  });
}

function showVersion(index) {
  currentIndex = Math.max(0, Math.min(index, versions.length - 1));
  const version = versions[currentIndex];

  elements.number.textContent = `版本 ${currentIndex + 1} / ${versions.length}`;
  elements.title.textContent = version.title;
  elements.date.textContent = version.date;
  elements.select.value = String(currentIndex);
  elements.previous.disabled = currentIndex === 0;
  elements.next.disabled = currentIndex === versions.length - 1;

  renderParagraphs(elements.essay, version.essay);
  renderParagraphs(elements.thoughts, version.thoughts);
  renderParagraphs(elements.feedback, version.feedback);
  renderPageButtons();
}

versions.forEach((version, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = `版本 ${index + 1} · ${version.title}`;
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
