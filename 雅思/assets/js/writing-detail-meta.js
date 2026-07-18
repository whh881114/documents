const detailParams = new URLSearchParams(window.location.search);
const detailCategoryKey = detailParams.get("category") || "T1-01-折线图";
const detailQuestionId = detailParams.get("id") || "C19-Test1-Task1";
const detailCategory = (window.writingCatalog || []).find((item) => item.key === detailCategoryKey);
const detailQuestion = detailCategory?.questions.find((item) => item.id === detailQuestionId);

function renderInstructions(target, instructions) {
  target.replaceChildren();
  (instructions || "").split(/\r?\n\s*\r?\n/).filter(Boolean).forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text.replace(/\s*\r?\n\s*/g, " ");
    target.append(paragraph);
  });
}

if (detailCategory) {
  const subtitle = document.querySelector("#detail-subtitle");
  const backLink = document.querySelector("#detail-back-link");
  const image = document.querySelector("#question-image");
  const imageWrap = document.querySelector(".question-image-wrap");
  const questionCopy = document.querySelector("#question-copy");

  document.title = `${detailQuestionId}｜写作记录`;
  subtitle.textContent = `${detailQuestionId.replaceAll("-", " · ")} · ${detailCategory.name}`;
  backLink.href = `writing-category.html?category=${encodeURIComponent(detailCategory.key)}`;
  backLink.textContent = `← 返回${detailCategory.name}题目列表`;
  renderInstructions(questionCopy, detailQuestion?.instructions);

  if (detailCategory.task === 1) {
    image.src = `writing/${detailCategory.key}/images/${detailQuestionId}.png`;
    image.alt = `${detailQuestionId} 原题图片`;
    image.hidden = false;
    imageWrap.hidden = false;
  } else {
    image.hidden = true;
    imageWrap.hidden = true;
  }
}
