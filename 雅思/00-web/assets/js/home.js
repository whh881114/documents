const scorePreview = document.querySelector("#home-score-preview");
const listeningScores = window.listeningScoreData || [];

if (scorePreview) {
  if (!listeningScores.length) {
    scorePreview.innerHTML = '<p class="empty-score">完成一整套四个 Part 的复盘后，成绩会自动显示在这里。</p>';
  } else {
    listeningScores.slice(0, 3).forEach((result) => {
      const link = document.createElement("a");
      link.className = "home-score-card";
      link.href = `listening-scores.html?book=${result.book}&test=${result.test}`;
      link.innerHTML = `
        <span>剑雅${result.book} Test ${result.test}</span>
        <strong>${result.correct}<small> / ${result.maximum}</small></strong>
        <em>Band ${Number(result.band).toFixed(1)} · ${result.reviewDate || "未记录日期"}</em>
      `;
      scorePreview.appendChild(link);
    });
  }
}
