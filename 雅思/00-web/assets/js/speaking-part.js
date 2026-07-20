const catalog = window.speakingCatalog || [];
const params = new URLSearchParams(location.search);
const part = catalog.find((item) => item.part === Number(params.get("part")));
const title = document.querySelector("#part-title");
const summary = document.querySelector("#part-summary");
const categoryTabs = document.querySelector("#category-tabs");
const categoryList = document.querySelector("#category-list");
if (!part) { title.textContent = "未找到该 Part"; summary.textContent = "请返回口语首页重新选择。"; }
else {
  document.title = `口语 Part ${part.part}｜IELTS 学习`; title.textContent = `Part ${part.part}`; summary.textContent = `${part.categoryCount} 个分类 · ${part.itemCount} 套题目`;
  const categories = part.categories; const requested = decodeURIComponent(location.hash.slice(1)); let activeIndex = Math.max(0, categories.findIndex((category) => category.key === requested)); const tabs = []; const panels = [];
  const selectCategory = (index, updateHash = true) => { activeIndex = index; tabs.forEach((tab, tabIndex) => { const selected = tabIndex === index; tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1; panels[tabIndex].hidden = !selected; }); if (updateHash) history.replaceState(null, "", `#${encodeURIComponent(categories[index].key)}`); };
  categories.forEach((category, index) => {
    const tab = document.createElement("button"); tab.className = "category-tab"; tab.type = "button"; tab.id = `category-tab-${index}`; tab.setAttribute("role", "tab"); tab.setAttribute("aria-controls", `category-panel-${index}`); tab.innerHTML = `<span>${category.number}</span><strong>${category.name}</strong><em>${category.items.length}</em>`; tab.addEventListener("click", () => selectCategory(index)); categoryTabs.appendChild(tab); tabs.push(tab);
    const section = document.createElement("section"); section.className = "listening-category"; section.id = `category-panel-${index}`; section.setAttribute("role", "tabpanel"); section.setAttribute("aria-labelledby", tab.id); section.innerHTML = `<div class="listening-category-heading"><div><span>${category.number}</span><h2>${category.name}</h2></div><p>${category.items.length} 套</p></div><div class="listening-rows">${category.items.map((item) => `<a class="listening-row is-clickable" href="speaking-detail.html?id=${encodeURIComponent(item.id)}"><span>剑雅 ${item.book} · Test ${item.test}</span><strong>${item.title}</strong><em>查看题目 →</em></a>`).join("")}</div>`; categoryList.appendChild(section); panels.push(section);
  });
  categoryTabs.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); if (event.key === "Home") activeIndex = 0; else if (event.key === "End") activeIndex = tabs.length - 1; else activeIndex = (activeIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; selectCategory(activeIndex); tabs[activeIndex].focus(); }); selectCategory(activeIndex, false);
}