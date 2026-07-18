const catalog = window.writingCatalog || [];

document.querySelectorAll("[data-category]").forEach((card) => {
  const category = catalog.find((item) => item.key === card.dataset.category);
  if (!category) return;

  card.href = `writing-category.html?category=${encodeURIComponent(category.key)}`;
  const count = card.querySelector("[data-count]");
  if (count) count.innerHTML = `<strong>${category.written}</strong>/${category.total}`;
});
