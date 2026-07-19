const categories = window.readingCatalog || [];
const tabsContainer = document.querySelector("#reading-tabs");
const categoryList = document.querySelector("#reading-category-list");
const summary = document.querySelector("#reading-summary");
const articleCount = categories.reduce((total, category) => total + category.items.length, 0);
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

summary.textContent = `${categories.length} 个话题 · ${articleCount} 篇文章`;

if (!categories.length) {
  categoryList.innerHTML = '<p class="empty-history">暂无阅读资料，请先生成阅读目录数据。</p>';
} else {
  const requestedCategory = decodeURIComponent(window.location.hash.slice(1));
  let activeIndex = Math.max(0, categories.findIndex((category) => category.key === requestedCategory));
  const tabs = [];
  const panels = [];

  const selectCategory = (index, updateHash = true) => {
    activeIndex = index;
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
    if (updateHash) history.replaceState(null, "", `#${encodeURIComponent(categories[index].key)}`);
  };

  categories.forEach((category, index) => {
    const displayNumber = String(index + 1).padStart(2, "0");
    const tab = document.createElement("button");
    tab.className = "category-tab";
    tab.type = "button";
    tab.id = `reading-tab-${index}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `reading-panel-${index}`);
    tab.innerHTML = `<span>${displayNumber}</span><strong>${escapeHtml(category.name)}</strong><em>${category.items.length}</em>`;
    tab.addEventListener("click", () => selectCategory(index));
    tabsContainer.appendChild(tab);
    tabs.push(tab);

    const section = document.createElement("section");
    section.className = "reading-category";
    section.id = `reading-panel-${index}`;
    section.setAttribute("role", "tabpanel");
    section.setAttribute("aria-labelledby", tab.id);
    section.innerHTML = `
      <div class="listening-category-heading">
        <div><span>${displayNumber}</span><h2>${escapeHtml(category.name)}</h2></div>
        <p>${category.items.length} 篇</p>
      </div>
      <div class="listening-rows">${category.items.map((item) => `
        <a class="listening-row is-clickable${item.reviewed ? " is-reviewed-row" : ""}" href="reading-detail.html?id=${encodeURIComponent(item.id)}">
          <span>${escapeHtml(item.source)}</span><strong>${escapeHtml(item.title)}</strong><em class="${item.reviewed ? "is-reviewed" : "is-unreviewed"}">${item.reviewed ? "已复盘" : "未复盘"}</em>
        </a>`).join("")}</div>`;
    categoryList.appendChild(section);
    panels.push(section);
  });

  tabsContainer.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") activeIndex = 0;
    else if (event.key === "End") activeIndex = tabs.length - 1;
    else if (event.key === "ArrowLeft") activeIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    else activeIndex = (activeIndex + 1) % tabs.length;
    selectCategory(activeIndex);
    tabs[activeIndex].focus();
  });
  selectCategory(activeIndex, false);
}
