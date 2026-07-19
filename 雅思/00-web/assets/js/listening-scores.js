const scoreList = document.querySelector("#listening-score-list");
const scoreTabs = document.querySelector("#score-test-tabs");
const scoreData = window.listeningScoreData || [];
const params = new URLSearchParams(window.location.search);

const findRequestedIndex = () => {
  const book = Number(params.get("book"));
  const test = Number(params.get("test"));
  const index = scoreData.findIndex((result) => result.book === book && result.test === test);
  return index >= 0 ? index : 0;
};

const renderResult = (result) => {
  scoreList.replaceChildren();
  const section = document.createElement("section");
  section.className = "score-test-card";
  section.id = `c${result.book}-test${result.test}`;

  const partLinks = result.parts.map((part) => `
    <a class="score-part" href="listening-detail.html?id=${encodeURIComponent(part.id)}&view=review&from=scores&book=${result.book}&test=${result.test}">
      <span>Part ${part.part}</span>
      <strong>${part.correct}<small> / ${part.maximum}</small></strong>
      <em>${part.title}</em>
      <time datetime="${part.reviewDate || ""}">复盘时间：${part.reviewDate || "未记录"}</time>
      <b>查看复盘 →</b>
    </a>
  `).join("");

  section.innerHTML = `
    <div class="score-test-heading">
      <div>
        <span>Listening test</span>
        <h2>剑雅${result.book} Test ${result.test}</h2>
        <time datetime="${result.reviewDate || ""}">复盘完成：${result.reviewDate || "未记录"}</time>
      </div>
      <div class="score-total"><strong>${result.correct}<small> / ${result.maximum}</small></strong><em>Band ${Number(result.band).toFixed(1)}</em></div>
    </div>
    <div class="score-parts">${partLinks}</div>
  `;
  scoreList.appendChild(section);
};

const selectResult = (index, updateUrl = true) => {
  const result = scoreData[index];
  if (!result) return;
  [...scoreTabs.children].forEach((tab, tabIndex) => {
    tab.setAttribute("aria-selected", String(tabIndex === index));
  });
  renderResult(result);
  if (updateUrl) history.replaceState(null, "", `?book=${result.book}&test=${result.test}`);
};

if (!scoreData.length) {
  scoreList.innerHTML = '<p class="empty-score">目前还没有完成四个 Part 复盘的整套成绩。</p>';
} else {
  scoreData.forEach((result, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "score-test-tab";
    tab.setAttribute("role", "tab");
    tab.innerHTML = `<span>剑雅${result.book} Test ${result.test}</span><strong>${result.correct}/40</strong><em>Band ${Number(result.band).toFixed(1)}</em>`;
    tab.addEventListener("click", () => selectResult(index));
    scoreTabs.appendChild(tab);
  });
  selectResult(findRequestedIndex(), false);
}
