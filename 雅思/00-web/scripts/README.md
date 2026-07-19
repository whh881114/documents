# 写作目录生成脚本

新增、删除或修改作文 Markdown 后，需要重新生成网页使用的写作目录数据。

## Windows

在 IELTS 仓库根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\00-web\scripts\Build-WritingCatalog.ps1
```

## macOS / Linux

在 IELTS 仓库根目录运行：

```bash
bash ./00-web/scripts/Build-WritingCatalog.sh
```

Shell 版本需要系统已安装 `python3`，不需要安装第三方 Python 包。

两个脚本都会读取根目录的 `writing/`，并更新：

```text
00-web/assets/data/writing-catalog.js
```

`writing-catalog.js` 是自动生成文件。需要调整作文、思考或 ChatGPT 点评时，请修改对应的 Markdown，而不是直接修改生成数据。
# Listening catalog and reviews

Run `Build-ListeningCatalog.ps1` after renaming or adding listening scripts, and after adding or editing any listening `review.md`. It scans `listening/Part1` through `Part4` and rebuilds both:

```text
assets/data/listening-catalog.js
assets/data/listening-review-data.js
```

The listening pages read these generated JavaScript files rather than loading Markdown directly. On Windows, run this command from the IELTS repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\00-web\scripts\Build-ListeningCatalog.ps1
```

# Reading catalog

Run `Build-ReadingCatalog.ps1` after adding, removing, or renaming reading articles or their `review.md` files. It scans the topic directories under `reading/`, records each article's review status and rebuilds `assets/data/reading-catalog.js` without changing the source material.
