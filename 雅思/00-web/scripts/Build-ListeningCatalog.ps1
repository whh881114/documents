$ErrorActionPreference = "Stop"

$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$listeningRoot = Join-Path $repoRoot "listening"
$outputPath = Join-Path $webRoot "assets/data/listening-catalog.js"
$reviewOutputPath = Join-Path $webRoot "assets/data/listening-review-data.js"
$scoreOutputPath = Join-Path $webRoot "assets/data/listening-score-data.js"
$parts = @()
$reviews = @()
$scoreEntries = @()

function Get-ListeningBand([int]$score) {
  if ($score -ge 39) { return 9.0 }
  if ($score -ge 37) { return 8.5 }
  if ($score -ge 35) { return 8.0 }
  if ($score -ge 32) { return 7.5 }
  if ($score -ge 30) { return 7.0 }
  if ($score -ge 26) { return 6.5 }
  if ($score -ge 23) { return 6.0 }
  if ($score -ge 18) { return 5.5 }
  if ($score -ge 16) { return 5.0 }
  if ($score -ge 13) { return 4.5 }
  if ($score -ge 10) { return 4.0 }
  if ($score -ge 8) { return 3.5 }
  if ($score -ge 6) { return 3.0 }
  if ($score -ge 4) { return 2.5 }
  return 2.0
}

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
      $reviewText = if ($reviewed) { [string](Get-Content -LiteralPath $reviewPath -Encoding UTF8 -Raw) } else { "" }
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

      if ($reviewed) {
        $scoreMatch = [regex]::Match($reviewText, '(?m)^-\s*[^\r\n]*?(\d+)\s*/\s*(\d+)\s*$')
        if ($scoreMatch.Success) {
          $scoreEntries += [ordered]@{
            id = $itemId
            title = $title
            source = $source
            book = [int]([regex]::Match($source, '^\D*(\d+)').Groups[1].Value)
            test = [int]([regex]::Match($source, 'Test\s*(\d+)').Groups[1].Value)
            part = $partNumber
            correct = [int]$scoreMatch.Groups[1].Value
            maximum = [int]$scoreMatch.Groups[2].Value
          }
        }
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
        review = $reviewText
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

$scoreTests = @()
foreach ($group in ($scoreEntries | Group-Object { "$($_['book'])-$($_['test'])" })) {
  $testParts = @($group.Group | Sort-Object { [int]$_['part'] })
  if ($testParts.Count -ne 4 -or @($testParts | ForEach-Object { $_['part'] } | Select-Object -Unique).Count -ne 4) {
    continue
  }

  $totalCorrect = [int](($testParts | ForEach-Object { [int]$_['correct'] } | Measure-Object -Sum).Sum)
  $totalMaximum = [int](($testParts | ForEach-Object { [int]$_['maximum'] } | Measure-Object -Sum).Sum)
  $scoreTests += [ordered]@{
    book = $testParts[0]['book']
    test = $testParts[0]['test']
    label = "Cambridge IELTS $($testParts[0]['book']) Test $($testParts[0]['test'])"
    correct = $totalCorrect
    maximum = $totalMaximum
    band = Get-ListeningBand $totalCorrect
    parts = $testParts
  }
}
$scoreTests = @($scoreTests | Sort-Object @{Expression = { [int]$_['book'] }; Descending = $true}, @{Expression = { [int]$_['test'] }; Descending = $true})

$json = $parts | ConvertTo-Json -Depth 8
$content = "// Generated from listening/Part1-Part4. Do not edit directly.`nwindow.listeningCatalog = $json;`n"
[IO.File]::WriteAllText($outputPath, $content, (New-Object Text.UTF8Encoding($false)))
$reviewJson = ConvertTo-Json -InputObject @($reviews) -Depth 6
$reviewContent = "// Generated from all listening transcripts and available reviews. Do not edit directly.`nwindow.listeningReviewData = $reviewJson;`n"
[IO.File]::WriteAllText($reviewOutputPath, $reviewContent, (New-Object Text.UTF8Encoding($false)))
$scoreJson = ConvertTo-Json -InputObject @($scoreTests) -Depth 6
$scoreContent = "// Generated from complete listening review score sets. Do not edit directly.`nwindow.listeningScoreData = $scoreJson;`n"
[IO.File]::WriteAllText($scoreOutputPath, $scoreContent, (New-Object Text.UTF8Encoding($false)))
Write-Output "Generated $outputPath"
Write-Output "Generated $reviewOutputPath"
Write-Output "Generated $scoreOutputPath"
