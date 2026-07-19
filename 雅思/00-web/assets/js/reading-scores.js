const scoreList = document.querySelector("#reading-score-list");
const scoreData = window.readingScoreData || [];
const params = new URLSearchParams(window.location.search);

const renderResult = (result) => {
  const section = document.createElement("section");
  section.className = "score-test-card is-reading-test";
  section.id = `c${result.book}-test${result.test}`;

  const passageLinks = result.passages.map((passage) => `
    <a class="score-part" href="reading-detail.html?id=${encodeURIComponent(passage.id)}&view=review&from=scores&book=${result.book}&test=${result.test}">
      <span>Passage ${passage.passage}</span>
      <strong>${passage.correct}<small> / ${passage.maximum}</small></strong>
      <em>${passage.title}</em>
      <time datetime="${passage.reviewDate || ""}">复盘时间：${passage.reviewDate || "未记录"}</time>
      <b>查看复盘 →</b>
    </a>
  `).join("");

  section.innerHTML = `
    <div class="score-test-heading">
      <div>
        <span>Academic reading test</span>
        <h2>剑雅${result.book} Test ${result.test}</h2>
        <time datetime="${result.reviewDate || ""}">复盘完成：${result.reviewDate || "未记录"}</time>
      </div>
      <div class="score-total"><strong>${result.correct}<small> / ${result.maximum}</small></strong><em>Band ${Number(result.band).toFixed(1)}</em></div>
    </div>
    <div class="score-parts reading-score-passages">${passageLinks}</div>
  `;
  scoreList.appendChild(section);
};

if (!scoreData.length) {
  scoreList.innerHTML = '<p class="empty-score">目前还没有完成三个 Passage 复盘的整套成绩。</p>';
} else {
  const requestedBook = Number(params.get("book"));
  const requestedTest = Number(params.get("test"));
  const requestedResult = scoreData.find((result) =>
    result.book === requestedBook && result.test === requestedTest
  );

  if (requestedResult) {
    renderResult(requestedResult);
  } else {
    scoreData.forEach(renderResult);
  }
}
