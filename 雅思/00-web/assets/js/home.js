const renderScorePreview = ({ targetId, scores, href, emptyText, cardClass = "" }) => {
  const target = document.querySelector(targetId);
  if (!target) return;

  if (!scores.length) {
    target.innerHTML = `<p class="empty-score">${emptyText}</p>`;
    return;
  }

  const topScores = [...scores].sort((a, b) =>
    b.correct - a.correct || b.book - a.book || a.test - b.test
  );

  topScores.slice(0, 3).forEach((result) => {
    const link = document.createElement("a");
    link.className = `home-score-card ${cardClass}`.trim();
    link.href = `${href}?book=${result.book}&test=${result.test}`;
    link.innerHTML = `
      <span>剑雅${result.book} Test ${result.test}</span>
      <strong>${result.correct}<small> / ${result.maximum}</small></strong>
      <em>Band ${Number(result.band).toFixed(1)} · ${result.reviewDate || "未记录日期"}</em>
    `;
    target.appendChild(link);
  });
};

renderScorePreview({
  targetId: "#home-score-preview",
  scores: window.listeningScoreData || [],
  href: "listening-scores.html",
  emptyText: "完成一整套四个 Part 的复盘后，成绩会自动显示在这里。"
});

renderScorePreview({
  targetId: "#home-reading-score-preview",
  scores: window.readingScoreData || [],
  href: "reading-scores.html",
  emptyText: "完成一整套三个 Passage 的复盘后，成绩会自动显示在这里。",
  cardClass: "is-reading-score"
});
