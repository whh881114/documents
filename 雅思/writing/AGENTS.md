# IELTS Writing 真题整理规范

本目录用于按题型整理 Cambridge IELTS Academic Writing 真题。新增或修改真题时，遵循以下规则。

## 范围

- 只整理 Academic Writing。
- 每册通常包含 4 套 Test；每套分别整理 Task 1 和 Task 2。
- 题目正文保持英文原文，不添加范文、解析或自行改写的题目。
- 优先使用用户指定的新东方剑雅写作题库核对题号，并以可靠的原题来源交叉校验。

## 文件命名

- Task 1：`C{册号}-Test{测试号}-Task1.md`
- Task 2：`C{册号}-Test{测试号}-Task2.md`
- Task 1 图片：`images/C{册号}-Test{测试号}-Task1.png`
- 示例：`C20-Test2-Task1.md`、`images/C20-Test2-Task1.png`
- 同一道题只保留一份 Markdown；移动分类时同时移动对应图片。

## Task 1 分类

- 折线图 → `T1-01-折线图`
- 柱状图 → `T1-02-柱状图`
- 两种或以上视觉形式，或一道题包含多类图表 → `T1-03-组合图`
- 表格 → `T1-04-表格`
- 饼图 → `T1-05-饼图`
- 地图、平面图、地点前后变化 → `T1-06-地图`
- 流程、生命周期、生产过程、工作原理 → `T1-07-流程图`
- 散点图不单独建目录；出现时归入组合图。

即使表格数据可以完整转录，Task 1 也应优先保留原始视觉材料。地图、流程图和组合图必须保存图片并在 Markdown 中使用相对路径引用。

## Task 2 分类

- Agree/Disagree、To what extent、单独的 Positive/Negative Development → `T2-01-观点题`
- Discuss both views（通常要求给出个人观点）→ `T2-02-讨论题`
- Advantages/Disadvantages、Do benefits/advantages outweigh drawbacks/disadvantages → `T2-03-利弊题`
- Causes/Problems and Solutions/Measures → `T2-04-问题解决题`
- 两个需要分别作答的直接问题 → `T2-05-双问题`

分类以题目实际要求为准，不只依赖关键词。若题目同时包含两个独立问题，即使第二问要求判断正负发展，也归入双问题。

## Markdown 模板

每份文件包含：

1. `Cambridge IELTS {册号} · Test {测试号} · Writing Task {任务号}` 标题；
2. 题号，如 `C20T2W1`；
3. 中文题型分类；
4. 原题来源链接；
5. `Instructions` 小节，保留时间、题干、作答要求和最低字数；
6. Task 1 的 `Visual` 小节及本地图片引用。

不要把网站范文、用户答案、评分或广告内容写入真题文件。

## 图片规则

- 图片放在对应题型目录的 `images` 子目录。
- 使用 PNG；优先保存完整题图，不截断标题、图例、坐标轴、单位或注释。
- Markdown 使用相对路径，例如：

  `![Beechwood Farm in 1950 and today](images/C20-Test2-Task1.png)`

- 不使用会失效的远程图片链接。
- 不放大伪造清晰度；只在必要时进行裁切、旋转、透视校正和适度增强。

## 完成前检查

- 每册应有 `Test1` 至 `Test4`，共 4 个 Task 1 和 4 个 Task 2 文件。
- 题号、册号、Test 和 Task 必须与文件名一致。
- 所有图片能正常解码，且宽高大于 0。
- 所有 Markdown 本地图片引用必须存在。
- 检查重复题、错误分类、缺失题干、乱码和无关网页内容。
- Git 工作区存在其他用户改动时，只暂存本次真题整理涉及的文件。
