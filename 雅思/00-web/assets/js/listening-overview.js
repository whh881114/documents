const catalog = window.listeningCatalog || [];
const partList = document.querySelector("#part-list");

catalog.forEach((part) => {
  const link = document.createElement("a");
  link.className = "part-card";
  link.href = `listening-part.html?part=${part.part}`;
  link.innerHTML = `
    <span class="part-number">0${part.part}</span>
    <div><small>Listening</small><h2>Part ${part.part}</h2></div>
    <p>${part.categoryCount} 个分类 · ${part.itemCount} 篇原文</p>
    <em>进入 →</em>
  `;
  partList.appendChild(link);
});
