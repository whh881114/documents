const params = new URLSearchParams(window.location.search);
const requestedKey = params.get("category") || "T1-01-折线图";
const category = (window.writingCatalog || []).find((item) => item.key === requestedKey);

function questionOrder(question) {
  const match = question.id.match(/^C(\d+)-Test(\d+)-Task(\d+)$/i);
  return match
    ? { book: Number(match[1]), test: Number(match[2]), task: Number(match[3]) }
    : { book: 0, test: 999, task: 999 };
}

function compareQuestions(left, right) {
  const a = questionOrder(left);
  const b = questionOrder(right);
  return b.book - a.book || a.test - b.test || a.task - b.task;
}

if (category) {
  document.title = `${category.name}｜写作列表`;
  document.querySelector("#category-title").textContent = category.name;
  document.querySelector("#category-progress").textContent = `Task ${category.task} · 已写 ${category.written} / ${category.total}`;
  document.querySelector("#category-en").textContent = `Writing Task ${category.task}`;

  const list = document.querySelector("#question-list");
  [...category.questions].sort(compareQuestions).forEach((question) => {
    const row = document.createElement(question.written ? "a" : "div");
    row.className = `question-row${question.written ? " is-written" : ""}`;
    if (row.tagName === "A") {
      row.href = `writing-detail.html?category=${encodeURIComponent(category.key)}&id=${encodeURIComponent(question.id)}`;
    }

    const displayId = question.id.replace(/-Task\d$/, "").replace("-Test", " · Test ").replace(/^C/, "C");
    row.innerHTML = `<span>${displayId}</span><strong>${question.id}</strong><em>${question.written ? "已写 · 查看 →" : "未写"}</em>`;
    list.append(row);
  });
} else {
  document.querySelector("#category-title").textContent = "未找到题型";
  document.querySelector("#category-progress").textContent = "请返回题型列表重新选择。";
}
