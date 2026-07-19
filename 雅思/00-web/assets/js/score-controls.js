window.createScoreControls = ({ container, list, scores, renderResult }) => {
  const books = [...new Set(scores.map((result) => result.book))].sort((a, b) => b - a);
  container.hidden = false;
  container.innerHTML = `
    <label class="score-control">
      <span>筛选剑雅</span>
      <select data-score-filter>
        <option value="all">全部剑雅</option>
        ${books.map((book) => `<option value="${book}">剑雅${book}</option>`).join("")}
      </select>
    </label>
    <label class="score-control">
      <span>排序方式</span>
      <select data-score-sort>
        <option value="book">按剑雅册号</option>
        <option value="score">按正确题数</option>
      </select>
    </label>
    <p class="score-result-count" aria-live="polite"></p>
  `;

  const filter = container.querySelector("[data-score-filter]");
  const sort = container.querySelector("[data-score-sort]");
  const count = container.querySelector(".score-result-count");

  const update = () => {
    const selectedBook = filter.value;
    const visible = scores.filter((result) =>
      selectedBook === "all" || result.book === Number(selectedBook)
    );
    visible.sort(sort.value === "score"
      ? (a, b) => b.correct - a.correct || b.book - a.book || a.test - b.test
      : (a, b) => b.book - a.book || a.test - b.test
    );
    list.replaceChildren();
    visible.forEach(renderResult);
    count.textContent = `共 ${visible.length} 套`;
  };

  filter.addEventListener("change", update);
  sort.addEventListener("change", update);
  update();
};
