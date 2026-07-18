const detailParams = new URLSearchParams(window.location.search);
const detailCategoryKey = detailParams.get("category") || "T1-01-折线图";
const detailQuestionId = detailParams.get("id") || "C19-Test1-Task1";
const detailCategory = (window.writingCatalog || []).find((item) => item.key === detailCategoryKey);

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

  if (detailCategory.task === 1) {
    image.src = `writing/${detailCategory.key}/images/${detailQuestionId}.png`;
    image.alt = `${detailQuestionId} 原题图片`;
    image.hidden = false;
    imageWrap.hidden = false;
    questionCopy.innerHTML = `
      <p>You should spend about 20 minutes on this task.</p>
      <p class="placeholder-text">当前为样式假数据。正式接入后，这里显示 ${detailQuestionId} 的完整英文题目。</p>
      <p>Summarize the information by selecting and reporting the main features and make comparisons where relevant.</p>
      <p>Write at least 150 words.</p>`;
  } else {
    image.hidden = true;
    imageWrap.hidden = true;
    questionCopy.innerHTML = `
      <p>You should spend about 40 minutes on this task.</p>
      <p class="placeholder-text">当前为样式假数据。正式接入后，这里显示 ${detailQuestionId} 的完整 Task 2 题目。</p>
      <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
      <p>Write at least 250 words.</p>`;
  }
}
