const scoreList = document.querySelector("#listening-score-list");
const scoreControls = document.querySelector("#listening-score-controls");
const scoreData = window.listeningScoreData || [];
const params = new URLSearchParams(window.location.search);

const renderResult = (result) => {
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

if (!scoreData.length) {
  scoreList.innerHTML = '<p class="empty-score">目前还没有完成四个 Part 复盘的整套成绩。</p>';
} else {
  const requestedBook = Number(params.get("book"));
  const requestedTest = Number(params.get("test"));
  const requestedResult = scoreData.find((result) =>
    result.book === requestedBook && result.test === requestedTest
  );

  if (requestedResult) {
    renderResult(requestedResult);
  } else {
    window.createScoreControls({ container: scoreControls, list: scoreList, scores: scoreData, renderResult });
  }
}
