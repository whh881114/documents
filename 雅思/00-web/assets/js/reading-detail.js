const categories = window.readingCatalog || [];
const params = new URLSearchParams(window.location.search);
const requestedView = params.get("view") || "review";
const returnToScores = params.get("from") === "scores";
const record = categories.flatMap((category) => category.items.map((item) => ({ ...item, category })))
  .find((item) => item.id === params.get("id"));
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const inlineMarkdown = (value) => escapeHtml(value)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>");

function renderArticle(markdown, assetBase) {
  return markdown.replace(/\r/g, "").split(/\n\s*\n/).map((block) => {
    const trimmed = block.trim();
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) return `<figure><img src="${assetBase}${encodeURI(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`;
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) return `<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`;
    return `<p>${inlineMarkdown(trimmed).replaceAll("\n", "<br>")}</p>`;
  }).join("");
}

function renderReview(markdown) {
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
      html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
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
  document.querySelector("#reading-title").textContent = "未找到文章";
  document.querySelector("#reading-meta").textContent = "请返回阅读列表重新选择。";
  document.querySelector("#reading-body").innerHTML = '<p class="placeholder-text">暂无内容。</p>';
  document.querySelector("#review-card").hidden = true;
  document.querySelector("#empty-review").hidden = false;
} else {
  document.title = `${record.title}｜IELTS 阅读`;
  document.querySelector("#reading-title").textContent = record.title;
  document.querySelector("#reading-meta").textContent = `${record.source} · ${record.category.name}`;
  document.querySelector("#article-meta").textContent = `${record.source} · ${record.title}`;
  document.querySelector("#reading-body").innerHTML = renderArticle(record.content, record.assetBase);
  const backLink = document.querySelector("#reading-detail-back");
  if (returnToScores) {
    const book = params.get("book") || "";
    const test = params.get("test") || "";
    backLink.textContent = "← 返回阅读成绩";
    backLink.href = `reading-scores.html?book=${encodeURIComponent(book)}&test=${encodeURIComponent(test)}`;
  } else {
    backLink.href = `reading.html#${encodeURIComponent(record.category.key)}`;
  }
  const showReview = requestedView === "review" && record.reviewed;
  if (showReview) {
    document.querySelector("#review-card-title").textContent = record.title;
    document.querySelector("#review-body").innerHTML = renderReview(record.review);
    const date = record.review.match(/(?:复盘日期|日期)：?\s*([^\n]+)/)?.[1]?.trim() || "";
    document.querySelector("#review-date").textContent = date;
  } else {
    document.querySelector(".history-section").hidden = true;
    document.querySelector("#panel-resizer").hidden = true;
    document.querySelector(".detail-layout").classList.add("is-transcript-only");
  }
}
