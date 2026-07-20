# Speaking 资料处理规则

本目录继承仓库根目录的通用规则。用户明确要求处理其下载到本地的 Speaking 原始文件时，按本文件执行。

## 适用范围

- 用户放入 `speaking/` 的 HTML、MHTML、PDF、图片或文本文件视为待处理的本地原始资料，可以读取和解析。
- 只处理用户指定的册号、Test 和输入目录，不把一次授权自动扩展到其他资料。
- 仅提取页面实际显示的 IELTS Speaking 标题、考试说明、题卡提示和问题列表；网页导航、登录按钮、广告、分析脚本、样式和其他无关内容不得写入 Markdown。

## 原始文件

- 每次先枚举输入目录中的原始文件及配套资源目录，确认文件数量、格式和命名。
- 原始下载文件默认保留在原位置。除非用户明确要求，否则不得删除、覆盖、重命名或移动 HTML 及其配套 `_files` 目录。
- HTML 文件名只能作为线索，不能作为 Part 分类的最终依据。

## Part 识别与异常处理

1. 读取每个 HTML 中页面实际显示的 `PART 1`、`PART 2` 或 `PART 3`。
2. 同时提取正文主标题、说明文字、加粗提示和问题列表，用它们交叉检查分类。
3. 如果文件名、HTML `<title>` 与正文显示的 Part 或题目不一致，以正文中显示的 Part 和内容为准。
4. 如果多个 HTML 实际包含相同内容，应识别为重复来源，不把重复题目写入最终结果。
5. 如果某一 Part 的 HTML 缺失或保存错误，不得声称该内容来自 HTML。用户提供了清晰截图、PDF或文本时，可以据此整理，并在交付说明中注明实际来源。
6. 无法可靠判断 Part 或正文不完整时，停止处理该文件并向用户报告，不自行猜测或补写。

## 目录、分类与文件名

- 三个 Part 均依据新东方雅思对应的“话题练习”本地页面进行分类，并按分类题目数量从多到少添加两位目录序号：

```text
speaking/
  part1/
    01-个人喜好类/
    02-休闲活动类/
    03-个人信息类/
    04-抽象类/
    05-技能类/
  part2/
    01-事件/
    02-人物/
    03-物品/
    04-地点/
  part3/
    01-事件/
    02-人物/
    03-物品/
    04-地点/
```

- 分类优先按新东方本地 HTML 中的剑雅册号和 Test 对应。剑雅 12 在来源页面中使用 Test 5–8 编号，应依次对应到本地 Test 1–4；跨册重复标题不得只按标题分类。
- 新东方页面使用 `C18T1S1` 等占位标题时，以册号和 Test 对应关系为准，不要求标题相同。
- 每个 Part 的完整分类映射分别记录在 `part1/CLASSIFICATION.md`、`part2/CLASSIFICATION.md`、`part3/CLASSIFICATION.md`。
- 新增或重新生成文件时，应先读取对应 Part 的分类索引并写入已有分类目录；无法对应时不得猜测，应列为待确认。
- 每套 Part 题目与 Reading 一样使用独立目录，题目正文固定命名为 `script.md`。目录名包含册号、Test、Part 和英文主题标题：

```text
part1/01-个人喜好类/C20-Test1-Part1-Walking in Daily Life and Beyond/script.md
part2/01-事件/C20-Test1-Part2-A play or a film you have seen that you would like to see again with friends/script.md
part3/02-人物/C20-Test1-Part3-Theatre in Your Country-Plays, Tickets, Young Audiences, and Acting Careers/script.md
```

- 目录名中的册号统一使用 `C<册号>`；Test 和 Part 使用 `Test<号>`、`Part<号>`，不再使用 `IELTS-<册号>-Test<号>-Part<号>.md` 的平铺形式。
- 英文标题取自 `script.md` 中代表该 Part 主题的一级标题。Windows 文件名不允许的字符 `< > : " / \\ | ? *` 替换为连字符，去除目录名末尾的空格和句点；不得因此改写 `script.md` 内的题目标题。
- `script.md` 保留该 Part 的完整考试说明、题卡提示和问题列表，内容格式继续遵守下方 Markdown 转换规则。

- 用户要求完整版本时，另外在 `speaking/` 中生成合并文件，例如：

```text
IELTS-20-Test1-Questions.md
```

- 合并文件严格按照 Part 1、Part 2、Part 3 的顺序拼接，不改变各部分正文。
- 不覆盖已有同名结果；需要更新时，先检查 Git 改动和现有内容，确认本次修改不会覆盖用户记录。
## Markdown 转换规则

- 网页的 `PART 1`、`PART 2`、`PART 3` 转为一级标题。
- 页面中的主题标题保留为醒目的 Markdown 标题，不改写措辞或大小写。
- 普通说明文字保留为普通段落。
- 网页中的粗体文字使用 `**粗体**`；斜体文字使用 `*斜体*`；同时粗斜体使用 `***粗斜体***`。
- 问题和题卡提示项保持原顺序并使用无序列表。
- Part 3 页面中分开的讨论问题组，在 Markdown 中保留空行分组。
- 英文弯引号、撇号、连字符和标点应忠实保留，不擅自纠错、翻译、概括或补充答案。
- 最终 Markdown 的可见内容应与原网页一致；允许变化的只有 HTML 到 Markdown 所必需的格式表达。

## IELTS Speaking 模拟考试协议

当用户明确要求“模拟考试”“模拟考官”或开始一场 Speaking mock test 时，代理应进入考官模式，并遵守以下规则。普通题目讲解、答案修改和自由练习不自动进入该模式。

### 开考前

- 先确认使用实时语音、逐条语音/文字，还是整段录音。实时语音可以到点打断；逐条消息或整段录音无法在用户发送途中打断，应记录可观察的时间并在该轮结束后指出超时。
- 询问用户要练习完整考试、指定 Part，还是指定剑雅册号和 Test；用户没有指定题目时，从本目录题库中选择一套完整且 Part 2 与 Part 3 主题关联的题目。
- 告知用户正式模拟开始后，考官只说必要的考试指令和问题，不在考试途中纠错、提示词汇、评价答案或闲聊。
- 建立本场计时记录，至少记录各 Part 开始/结束时间、Part 2 准备开始/结束时间、Part 2 作答开始/结束时间，以及打断或超时情况。

### 考官行为与提问

- 按真实顺序进行 Part 1、Part 2、Part 3，每次只给当前应出现的指令或问题；不要一次展示后续全部问题。
- Part 1 使用熟悉话题，逐题提问；通常控制在 4–5 分钟。回答明显过长、偏题或影响整体时间时，使用自然考官话术礼貌打断并进入下一题，例如：`Thank you. Let's move on to the next question.`
- Part 2 先展示完整题卡，再明确宣布有 **1 分钟准备时间**，允许用户做笔记。准备时间到后立即提示开始。作答目标为 1–2 分钟；到 1 分钟前不因短暂停顿主动结束，到 2 分钟必须打断，例如：`Thank you. That's the end of Part 2.` 随后可按题目情况问一至两个简短收尾问题。Part 2 整体约 3–4 分钟（包含准备时间）。
- Part 3 围绕 Part 2 的主题提出更抽象的问题，逐题进行并根据回答自然追问；通常控制在 4–5 分钟。需要时礼貌打断，以保证总时长。
- 完整 Speaking 模拟总时长目标为 11–14 分钟。不要为了问完题库中的所有问题而突破时间；时间到时优先保持考试结构。
- 用户没有听清时可以请求重复。接受 `I didn't catch up with you. Could you please say again, thank you.`，但考官只重复或等义重述一次，不在考试中纠正句子。复盘时建议更自然的表达：`Sorry, I didn't catch that. Could you repeat the question, please?`
- 用户请求解释 Part 2 题卡中的某个词时，可像真实考官一样做最小必要解释；不得提供答案思路、示例答案或可直接套用的词汇。
- 除非设备或连接问题导致语音缺失，否则不要假装听见、计时或分析代理实际没有收到的音频。

### 严格计时

- 有可靠的实时语音和时间戳时，以实际经过时间为准，并在规定时间到达时当场提示或打断。
- 只有文字消息、非实时语音或整段录音时，不得声称进行了精确的实时打断。可以使用消息/音频可见时长计时，并在成绩报告中注明计时方式及限制。
- Part 2 准备计时必须单独记录。宣布开始准备后计时 60 秒；用户提前表示准备好，可以提前开始作答，但不得把未使用的准备时间加到两分钟作答时间中。
- 计时记录用于控制流程和复盘，不把“说满两分钟”本身当作独立评分项；评分依据仍是整场语言表现。

### 模考转写、版本与拆分保存

- 用户通过麦克风作答时，保存的是应用传给代理的语音转写文本，不得声称它是逐字准确的原始录音转录。疑似识别错误应保留原转写，并用“疑似转写错误”单独标注，不静默改成理想答案。
- 考官的每个问题、用户的每次转写回答、请求重复、考官打断和可观察的计时信息都应进入记录。不得只保存修改后的答案而丢失用户原话。
- `speaking/IELTS-<册号>-Test<号>-Questions.md` 是由三个 Part 原题合并而成的原始题目文件。模拟考试不得覆盖、重命名或改写它。
- 每次完整模考在 `speaking/` 根目录新增一个完整版本文件，命名为：

```text
speaking/IELTS-5-Test1-Questions-V01.md
speaking/IELTS-5-Test1-Questions-V02.md
speaking/IELTS-5-Test1-Questions-V03.md
```

- 版本号固定使用两位数字 `V01`、`V02`、`V03`。开始保存前，同时检查根目录的 `Questions-VNN.md` 和三个题目目录中的 `review-VNN.md`，取已经存在的最大版本号加一；不得覆盖旧版本，也不得因为某个版本文件缺失而复用其编号。
- 完整 `Questions-VNN.md` 必须保留本次模考使用的原始 Part 1、Part 2、Part 3 题目，并按考试顺序记录完整 Examiner/Candidate transcript、各 Part 计时、Part 2 准备与作答计时、请求重复、考官打断、四项评分、综合模拟分和优先改进事项。
- 生成完整版本文件后，再将同一次模考按 Part 拆分到对应题目目录。拆分文件直接与 `script.md` 同级，命名为 `review-VNN.md`，不使用日期作为文件名，也不放入 `reviews/` 子目录：

```text
speaking/
  IELTS-5-Test1-Questions.md
  IELTS-5-Test1-Questions-V01.md
  IELTS-5-Test1-Questions-V02.md
  part1/<分类>/C5-Test1-Part1-<标题>/
    script.md
    review-V01.md
    review-V02.md
  part2/<分类>/C5-Test1-Part2-<标题>/
    script.md
    review-V01.md
    review-V02.md
  part3/<分类>/C5-Test1-Part3-<标题>/
    script.md
    review-V01.md
    review-V02.md
```

- 同一次完整模考的根目录文件和三个 Part 文件必须使用完全相同的 `VNN`。例如根目录为 `IELTS-5-Test1-Questions-V02.md` 时，三个题目目录都必须生成 `review-V02.md`；不得出现 Part 之间版本号错位。
- 每个 `review-VNN.md` 只保存对应 Part 的内容，至少包括：本次日期、册号与 Test、该 Part 的原始题目、完整 Examiner/Candidate transcript、该 Part 计时、请求重复或被打断情况、该 Part 的具体问题、纠正建议和可归属于该 Part 的评分证据。
- 完整根文件是本场考试的主记录，三个 `review-VNN.md` 是为了按 Part 复盘生成的拆分副本；两者都必须保留，不能只生成其中一种。
- 写入后必须核对四个版本文件均存在、版本号一致，并确认每个 Part 的 transcript 与完整根文件对应内容一致。若写入中断或某个 Part 无法定位，应报告这一组版本尚不完整，不得声称保存成功。
- 日期统一写为 `YYYY-MM-DD`；文件名排序只依赖 `VNN`，同一天多次练习仍继续递增版本号。
- Pronunciation 只有在代理实际收到可听音频时才能评价。只有语音转写文本时，在完整文件和 Part review 中都必须标为“无法可靠评分”。
- 生成文件前先询问用户是否保存；用户已在开始考试时明确要求自动保存的，结束后可直接生成并报告完整文件及三个拆分文件的路径。
- 模考记录属于用户个人学习历史。像 Writing 作文版本一样，每次练习新增版本文件，不覆盖、重命名或编辑以前的版本；用户明确要求补充某次评分或纠正转写时除外。
### 考后即时评分

- 最后一题结束前不提供任何分数或纠错。考试结束后立即切换为反馈模式，并明确说明成绩是依据公开 IELTS 标准作出的 **模拟估分，不是官方成绩**。
- 按四项标准分别给出 0–9 分，可使用 0.5 分档：
  1. Fluency and Coherence（流利度与连贯性）
  2. Lexical Resource（词汇资源）
  3. Grammatical Range and Accuracy（语法多样性与准确性）
  4. Pronunciation（发音）
- 综合分以四项平均分为基础，按 IELTS 的半分/整分方式报告，同时结合用户在三个 Part 的平均表现；不得只凭某一个精彩或失误回答定分。
- 如果输入只有文字而没有可听音频，Pronunciation 必须标为“无法可靠评分”，不得伪造发音分。此时可以给出其余三项分数和“非完整总分估计”，不能冒充完整 Speaking Band。
- 每个分项必须给出对应证据：引用用户的短语、句型、停顿/自我修正、衔接方式或可观察的发音现象。不要只给笼统评价。
- 反馈按以下稳定结构输出：

```text
Estimated overall band: X.X（模拟估分）

Fluency and Coherence: X.X
Lexical Resource: X.X
Grammatical Range and Accuracy: X.X
Pronunciation: X.X / 无法可靠评分

Timing record
- Part 1: ...
- Part 2 preparation: ...
- Part 2 response: ...
- Part 3: ...
- Total: ...

What you did well
- ...

Problems found
- 原话：...
  问题：...
  建议：...

Priority improvements
1. ...
2. ...
3. ...
```

- 指出问题时区分影响理解的错误、反复出现的系统性错误和偶发口误；优先给出最影响提分的 3 项，不要把每个小错误都堆成清单。
- 评分参照 IELTS 官方公开的 Speaking Band Descriptors 和四项评分标准；若标准更新，应以 IELTS 官方最新版为准。

官方参考：

- IELTS Speaking Band Descriptors: https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf
- IELTS Speaking Key Assessment Criteria: https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf
- IELTS Speaking Part 2 preparation guidance: https://ielts.org/news-and-insights/how-to-use-the-preparation-time-in-ielts-speaking-part-2
## 验证与交付

完成后至少检查：

- 三个 Part 是否均有对应结果，缺失项是否已明确说明来源或异常。
- 每个 Part 的标题、说明、题目数量、顺序、分组和强调是否与原始页面一致。
- 是否存在重复题目、遗漏、导航噪声、HTML 标签残留或网页脚本内容。
- 所有文本是否为 UTF-8，是否含 Unicode 乱码替换字符 `U+FFFD`。
- 原始下载文件是否仍然完整存在。
- 交付时说明生成了哪些文件、各 Part 的实际来源、发现的文件名或内容异常，以及是否修改了原始文件。
