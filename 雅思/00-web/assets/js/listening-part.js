const catalog = window.listeningCatalog || [];
const params = new URLSearchParams(window.location.search);
const partNumber = Number(params.get("part"));
const part = catalog.find((item) => item.part === partNumber);
const title = document.querySelector("#part-title");
const summary = document.querySelector("#part-summary");
const categoryTabs = document.querySelector("#category-tabs");
const categoryList = document.querySelector("#category-list");

if (!part) {
  title.textContent = "未找到该 Part";
  summary.textContent = "请返回听力首页重新选择。";
} else {
  document.title = `听力 Part ${part.part}｜IELTS 学习`;
  title.textContent = `Part ${part.part}`;
  summary.textContent = `${part.categoryCount} 个分类 · ${part.itemCount} 篇原文`;

  const categories = [...part.categories].sort((first, second) => {
    const countDifference = second.items.length - first.items.length;
    return countDifference || first.number.localeCompare(second.number);
  });
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
    const reviewedCount = category.items.filter((item) => item.reviewed).length;
    const tab = document.createElement("button");
    tab.className = "category-tab";
    tab.type = "button";
    tab.id = `category-tab-${index}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `category-panel-${index}`);
    tab.innerHTML = `<span>${displayNumber}</span><strong>${category.name}</strong><em>${reviewedCount}/${category.items.length}</em>`;
    tab.addEventListener("click", () => selectCategory(index));
    categoryTabs.appendChild(tab);
    tabs.push(tab);

    const section = document.createElement("section");
    section.className = "listening-category";
    section.id = `category-panel-${index}`;
    section.setAttribute("role", "tabpanel");
    section.setAttribute("aria-labelledby", tab.id);
    const rows = category.items.map((item) => {
      const detailUrl = `listening-detail.html?id=${encodeURIComponent(item.id)}`;
      return `
      <div class="listening-row${item.reviewed ? " is-reviewed-row" : ""}">
        <span>${item.source}</span>
        <strong>${item.title}</strong>
        <div class="row-actions">
          <a class="row-action" href="${detailUrl}&view=transcript">查看原文</a>
          ${item.reviewed ? `<a class="row-action row-action-secondary" href="${detailUrl}&view=review#review-title">查看复盘</a>` : ""}
          <em class="${item.reviewed ? "is-reviewed" : "is-unreviewed"}">${item.reviewed ? "已复盘" : "未复盘"}</em>
        </div>
      </div>
    `;
    }).join("");
    section.innerHTML = `
      <div class="listening-category-heading">
        <div><span>${displayNumber}</span><h2>${category.name}</h2></div>
        <p>${category.items.length} 篇</p>
      </div>
      <div class="listening-rows">${rows}</div>
    `;
    categoryList.appendChild(section);
    panels.push(section);
  });

  categoryTabs.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
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
