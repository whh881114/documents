# IELTS Listening Scripts Processing Guide

本目录用于按课题整理雅思听力真题及其英文原文（script）。后续处理本目录中的课题时，统一遵循以下流程和格式。

## 一、目录与文件规则

- 课题目录保持 `NN-XXXX` 格式，例如 `01-Human Geography`。
- 每篇听力原文保存到对应课题目录下，文件名统一为 `script.md`。
- 不修改已经确认过的课题目录名称。
- 默认只保存英文原文，不混入中文翻译。
- 文件编码使用 UTF-8。

## 二、打开页面的流程

使用用户已经登录的新东方雅思网站会话，不读取或导出 Cookie、密码、浏览器配置或其他登录数据。

1. 打开真题课题列表：
   `https://ieltscat.xdf.cn/practice/listen/topic`
2. 在列表中找到与目标课题对应的真题。
3. 点击该真题的“开始做题”，进入类似下面的页面：
   `https://ieltscat.xdf.cn/practice/check/listen/{question_id}`
4. 点击做题页右上角的“精听本文”，进入类似下面的页面：
   `https://ieltscat.xdf.cn/intensive/intensive/{intensive_id}/2/1`
5. 如果已经从可靠页面获得准确的精听地址，可以直接打开该地址，不必重复绕过题目列表和做题页。
6. 不猜测或批量尝试 `question_id`、`intensive_id`。必须从当前页面的可见链接或实际跳转结果取得准确地址。

示例：

- 课题：Human Geography
- 真题：剑雅20 Test 2-Section 3
- 做题页：`https://ieltscat.xdf.cn/practice/check/listen/8540`
- 精听页：`https://ieltscat.xdf.cn/intensive/intensive/1824/2/1`

## 三、显示并提取 script

1. 进入精听页后，确认页面标题中的真题名称与目标课题相符。
2. 切换到“全文精听”。
3. 点击“点击显示原文”或使用页面上的“显示原文”开关，确保英文原文已实际展开。
4. 页面通常同时显示英文原文和中文译文。只提取每个句子条目中的英文段落。
5. 按页面句子列表的原始顺序提取，不合并、改写、翻译或擅自补全文本。
6. 保留说话人名称、原始拼写、标点、英式拼写和省略号。
7. 如果来源页的最后一句本身被截断，照原样保存，并在文件末尾注明，不根据上下文补写。
8. 删除独立出现的 `Section N`、`Part N`（大小写不限）等页面结构标签；这些标签不属于听力正文。

## 四、完整性检查

保存前后都要检查：

- 删除 `Section N`、`Part N` 等结构标签后，其余英文条目数量与提取结果一致。
- 第一条和最后一条均已提取。
- 页面正文条目顺序必须连续，没有重复或遗漏。含说话人姓名的对话稿只在姓名前显示连续序号；整篇没有说话人姓名的独白稿则为每个正文条目显示连续序号。
- 每条至少包含一段英文内容。
- 没有混入中文翻译、按钮文字、快捷键说明或音频控件文字。
- 文件中的来源名称和精听页 URL 正确。

最终 CSS Grid 数量应等于页面英文条目数减去已删除的 `Section N`、`Part N` 等结构标签数。没有说话人姓名的续句仍需保留，但其编号列和说话人列留空。不能因为最后一句不完整而删除它。

## 五、句子拆分规则

- 一个完整句子占一行，便于阅读和后续分析。
- 同一位说话人的一段话可能包含多个完整句子；这些句子仍属于同一个编号和同一个说话人。
- 不要为了拆行而改变原文标点或措辞。
- 页面原文本身若包含句子片段，保留该片段，不擅自合并或补全。

## 六、`script.md` 的固定格式

文件头使用以下结构：

```markdown
# Human Geography

- Source: 剑雅20 Test 2-Section 3
- Script: https://ieltscat.xdf.cn/intensive/intensive/1824/2/1
- Sentence count: 40

## Transcript
```

正文不能使用 Markdown 表格，也不能依靠普通空格或 `&nbsp;` 猜测缩进。编号位数会变化，Markdown 还会重新处理空格，无法保证对齐。

每个保留的正文条目使用一个无边框 CSS Grid。固定分成三列：编号、说话人、正文。对话稿只有明确出现说话人姓名的条目才显示连续序号，没有姓名的续句将编号列和说话人列留空；整篇没有说话人姓名的独白稿则为每个正文条目显示连续序号，说话人列留空。

单句示例：

```html
<div style="display:grid;grid-template-columns:2.5em 6em minmax(0,1fr);column-gap:0.25em;margin:0.35em 0;">
  <div style="text-align:right;">1.</div>
  <div style="white-space:nowrap;"><strong>ROSIE:</strong></div>
  <div>Colin, I’m really struggling to think of a topic for our human geography assignment.</div>
</div>
```

同一位说话人包含多个句子时，后续句子的编号列和说话人列留空：

```html
<div style="display:grid;grid-template-columns:2.5em 6em minmax(0,1fr);column-gap:0.25em;margin:0.35em 0;">
  <div style="text-align:right;">2.</div>
  <div style="white-space:nowrap;"><strong>COLIN:</strong></div>
  <div>Me too, Rosie.</div>
  <div></div>
  <div></div>
  <div>I’ll tell you what, let’s think about the different aspects of human geography, and see if we can narrow the topic down a bit to help us decide.</div>
</div>
```

必须保持以下样式值一致：

- `grid-template-columns:2.5em 6em minmax(0,1fr)`
- `column-gap:0.25em`
- `margin:0.35em 0`
- 编号列使用 `text-align:right`
- 说话人使用 `<strong>NAME:</strong>`，冒号放在加粗内容内
- 说话人列使用 <div style="white-space:nowrap;">，确保姓名和冒号永不换行
- 独立的 `Section N`、`Part N` 页面标签必须删除，不生成 CSS Grid，也不计入 `Sentence count`
- 纯独白稿（整篇没有 `<strong>NAME:</strong>`）必须为每个正文 Grid 显示连续序号

这种格式看起来仍是普通的“编号 + 说话人 + 原文”，但可以保证：

- 一位数和两位数编号右对齐；
- `ROSIE:` 与 `COLIN:` 位于固定列；
- 每个后续句子的首字母与第一句正文的首字母严格对齐；
- 长句可以在正文列内自然换行，不会跑到说话人列下面。

## 七、截断原文的注记

如果来源页面的原文确实截断，在全部正文之后添加：

```markdown
> Note: Sentence 40 is truncated this way on the source page.
```

把句子编号替换为实际编号。只有来源页确实截断时才添加，不能把页面尚未加载完整误判为原文截断。

## 八、交付前验证

完成一篇后至少验证以下内容：

1. `script.md` 已写入正确的 `NN-XXXX` 目录。
2. 元数据中的课题、真题名称、URL 和句子数正确。
3. CSS Grid 条目数量与页面句子数量一致。
4. 文件内不存在 Markdown 表格行。
5. 文件内不存在用于对齐的 `&nbsp;`。
6. 随机检查一个多句条目，确认后续句子使用两个空 `<div>` 后再写正文。
7. 检查两位数编号（如 11、12）与一位数编号的正文起点一致。

先完成并验证一篇样例；得到用户确认后，再按完全相同的流程和格式批量处理其余课题。
