const scoreList = document.querySelector("#listening-score-list");
const scoreData = window.listeningScoreData || [];

if (!scoreData.length) {
  scoreList.innerHTML = '<p class="empty-score">目前还没有完成四个 Part 复盘的整套成绩。</p>';
} else {
  scoreData.forEach((result) => {
    const section = document.createElement("section");
    section.className = "score-test-card";
    section.id = `c${result.book}-test${result.test}`;

    const partLinks = result.parts.map((part) => `
      <a class="score-part" href="listening-detail.html?id=${encodeURIComponent(part.id)}&view=review">
        <span>Part ${part.part}</span>
        <strong>${part.correct}<small> / ${part.maximum}</small></strong>
        <em>${part.title}</em>
        <b>查看复盘 →</b>
      </a>
    `).join("");

    section.innerHTML = `
      <div class="score-test-heading">
        <div><span>Listening test</span><h2>剑雅${result.book} Test ${result.test}</h2></div>
        <div class="score-total"><strong>${result.correct}<small> / ${result.maximum}</small></strong><em>Band ${Number(result.band).toFixed(1)}</em></div>
      </div>
      <div class="score-parts">${partLinks}</div>
    `;
    scoreList.appendChild(section);
  });
}
