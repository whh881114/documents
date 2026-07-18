const detailLayout = document.querySelector(".detail-layout");
const panelResizer = document.querySelector("#panel-resizer");
const savedPanelWidth = Number(localStorage.getItem("ielts-question-panel-width"));

function setQuestionPanelWidth(percent) {
  const width = Math.max(28, Math.min(72, percent));
  detailLayout.style.setProperty("--question-panel-width", `${width}%`);
  panelResizer.setAttribute("aria-valuenow", String(Math.round(width)));
  localStorage.setItem("ielts-question-panel-width", String(width));
}

if (savedPanelWidth) setQuestionPanelWidth(savedPanelWidth);

panelResizer.addEventListener("pointerdown", (event) => {
  if (window.innerWidth <= 1100) return;
  panelResizer.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing");
});

panelResizer.addEventListener("pointermove", (event) => {
  if (!panelResizer.hasPointerCapture(event.pointerId)) return;
  const bounds = detailLayout.getBoundingClientRect();
  setQuestionPanelWidth(((event.clientX - bounds.left) / bounds.width) * 100);
});

panelResizer.addEventListener("pointerup", (event) => {
  if (panelResizer.hasPointerCapture(event.pointerId)) panelResizer.releasePointerCapture(event.pointerId);
  document.body.classList.remove("is-resizing");
});

panelResizer.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const current = parseFloat(getComputedStyle(detailLayout).getPropertyValue("--question-panel-width")) || 46;
  setQuestionPanelWidth(current + (event.key === "ArrowRight" ? 2 : -2));
});

const imageDialog = document.querySelector("#image-dialog");
const questionImage = document.querySelector("#question-image");
const originalImage = document.querySelector("#original-image");

const openOriginalImage = document.querySelector("#open-original-image");
const closeOriginalImage = document.querySelector("#close-original-image");

if (imageDialog && questionImage && originalImage && openOriginalImage && closeOriginalImage) {
  openOriginalImage.addEventListener("click", () => {
    originalImage.src = questionImage.currentSrc || questionImage.src;
    originalImage.alt = questionImage.alt;
    imageDialog.showModal();
  });

  closeOriginalImage.addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });
}
