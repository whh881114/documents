const reviewData = window.listeningReviewData || [];
const params = new URLSearchParams(window.location.search);
const record = reviewData.find((item) => item.id === params.get("id"));
const requestedView = params.get("view") || "review";

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const inlineMarkdown = (value) => escapeHtml(value)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let listType = "";

  const closeList = () => {
    if (listType) html.push(`</${listType}>`);
    listType = "";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) { closeList(); continue; }

    if (line.startsWith("| ") && lines[index + 1]?.match(/^\|[\s:|-]+\|$/)) {
      closeList();
      const headers = line.split("|").slice(1, -1).map((cell) => cell.trim());
      html.push(`<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>`);
      index += 2;
      while (index < lines.length && lines[index].startsWith("|")) {
        const cells = lines[index].split("|").slice(1, -1).map((cell) => cell.trim());
        html.push(`<tr>${cells.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`);
        index += 1;
      }
      index -= 1;
      html.push("</tbody></table>");
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) { closeList(); listType = nextType; html.push(`<${listType}>`); }
      html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList();
  return html.join("");
}

if (!record) {
  document.querySelector("#listening-detail-subtitle").textContent = "未找到复盘记录";
  document.querySelector("#transcript-body").textContent = "请返回听力列表重新选择。";
  document.querySelector("#review-body").textContent = "暂无内容。";
} else {
  const hasReview = Boolean(record.review.trim());
  const showReview = requestedView === "review" && hasReview;
  document.title = `${record.title}｜${showReview ? "听力复盘" : "听力原文"}`;
  document.querySelector(".page-title h1").textContent = showReview ? "听力复盘" : "听力原文";
  document.querySelector("#listening-detail-subtitle").textContent = `${record.source} · Part ${record.part} · ${record.categoryName}`;
  document.querySelector("#transcript-meta").textContent = `${record.source} · ${record.title}`;
  document.querySelector("#transcript-body").innerHTML = record.transcript;
  if (showReview) {
    document.querySelector("#review-card-title").textContent = record.title;
    document.querySelector("#review-body").innerHTML = renderMarkdown(record.review);
    const date = record.review.match(/复盘日期：([^\n]+)/)?.[1]?.trim() || "";
    document.querySelector("#review-date").textContent = date;
  } else {
    document.querySelector(".history-section").hidden = true;
    document.querySelector("#panel-resizer").hidden = true;
    document.querySelector(".detail-layout").classList.add("is-transcript-only");
  }
  document.querySelector("#listening-detail-back").href = `listening-part.html?part=${record.part}#${encodeURIComponent(record.categoryKey)}`;
}
