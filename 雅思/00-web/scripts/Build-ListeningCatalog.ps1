$ErrorActionPreference = "Stop"

$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$listeningRoot = Join-Path $repoRoot "listening"
$outputPath = Join-Path $webRoot "assets/data/listening-catalog.js"
$reviewOutputPath = Join-Path $webRoot "assets/data/listening-review-data.js"
$parts = @()
$reviews = @()

foreach ($partNumber in 1..4) {
  $partPath = Join-Path $listeningRoot "Part$partNumber"
  $categories = @()

  foreach ($categoryDir in Get-ChildItem -LiteralPath $partPath -Directory | Sort-Object Name) {
    if ($categoryDir.Name -notmatch '^(\d{2})-(.+)$') {
      throw "Unexpected category directory: $($categoryDir.FullName)"
    }

    $items = @()
    foreach ($script in Get-ChildItem -LiteralPath $categoryDir.FullName -Filter "script.md" -File -Recurse | Sort-Object DirectoryName) {
      $text = Get-Content -LiteralPath $script.FullName -Encoding UTF8 -Raw
      $title = [regex]::Match($text, '(?m)^#\s+(.+)$').Groups[1].Value.Trim()
      $source = [regex]::Match($text, '(?m)^- Source:\s*(.+)$').Groups[1].Value.Trim()
      if (-not $title -or -not $source) {
        throw "Missing title or source: $($script.FullName)"
      }

      $baseUri = New-Object Uri(($webRoot.TrimEnd('\') + '\'))
      $scriptUri = New-Object Uri($script.FullName)
      $relativePath = [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($scriptUri).ToString())
      $reviewPath = Join-Path $script.Directory.FullName "review.md"
      $reviewed = Test-Path -LiteralPath $reviewPath
      $itemId = $script.Directory.Name
      $items += [ordered]@{
        id = $itemId
        title = $title
        source = $source
        book = [int]([regex]::Match($source, '^\D*(\d+)').Groups[1].Value)
        test = [int]([regex]::Match($source, 'Test\s*(\d+)').Groups[1].Value)
        reviewed = $reviewed
        scriptPath = [Uri]::EscapeUriString($relativePath)
      }

      $transcriptMarker = "## Transcript"
      $transcriptIndex = $text.IndexOf($transcriptMarker)
      $transcript = if ($transcriptIndex -ge 0) { $text.Substring($transcriptIndex + $transcriptMarker.Length).Trim() } else { "" }
      $reviews += [ordered]@{
        id = $itemId
        title = $title
        source = $source
        part = $partNumber
        categoryKey = $categoryDir.Name
        categoryName = $Matches[2]
        transcript = $transcript
        review = if ($reviewed) { [string](Get-Content -LiteralPath $reviewPath -Encoding UTF8 -Raw) } else { "" }
      }
    }

    $items = @($items | Sort-Object @{Expression = { [int]$_['book'] }; Descending = $true}, @{Expression = { [int]$_['test'] }; Ascending = $true})

    $categories += [ordered]@{
      key = $categoryDir.Name
      number = $Matches[1]
      name = $Matches[2]
      items = $items
    }
  }

  $parts += [ordered]@{
    part = $partNumber
    categoryCount = $categories.Count
    itemCount = @($categories | ForEach-Object { $_.items }).Count
    categories = $categories
  }
}

$json = $parts | ConvertTo-Json -Depth 8
$content = "// Generated from listening/Part1-Part4. Do not edit directly.`nwindow.listeningCatalog = $json;`n"
[IO.File]::WriteAllText($outputPath, $content, (New-Object Text.UTF8Encoding($false)))
$reviewJson = ConvertTo-Json -InputObject @($reviews) -Depth 6
$reviewContent = "// Generated from all listening transcripts and available reviews. Do not edit directly.`nwindow.listeningReviewData = $reviewJson;`n"
[IO.File]::WriteAllText($reviewOutputPath, $reviewContent, (New-Object Text.UTF8Encoding($false)))
Write-Output "Generated $outputPath"
Write-Output "Generated $reviewOutputPath"
