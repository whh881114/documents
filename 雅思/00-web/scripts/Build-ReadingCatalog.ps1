$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$readingRoot = Join-Path $repoRoot "reading"
$outputPath = Join-Path $webRoot "assets/data/reading-catalog.js"
$scoreOutputPath = Join-Path $webRoot "assets/data/reading-score-data.js"
$categories = @()
$scoreEntries = @()

function Get-AcademicReadingBand([int]$score) {
  if ($score -ge 39) { return 9.0 }
  if ($score -ge 37) { return 8.5 }
  if ($score -ge 35) { return 8.0 }
  if ($score -ge 33) { return 7.5 }
  if ($score -ge 30) { return 7.0 }
  if ($score -ge 27) { return 6.5 }
  if ($score -ge 23) { return 6.0 }
  if ($score -ge 19) { return 5.5 }
  if ($score -ge 15) { return 5.0 }
  if ($score -ge 13) { return 4.5 }
  if ($score -ge 10) { return 4.0 }
  if ($score -ge 8) { return 3.5 }
  if ($score -ge 6) { return 3.0 }
  if ($score -ge 4) { return 2.5 }
  return 2.0
}

foreach ($categoryDir in Get-ChildItem -LiteralPath $readingRoot -Directory | Sort-Object Name) {
  if ($categoryDir.Name -notmatch '^(\d{2})-(.+)$') { continue }
  $categoryNumber = $Matches[1]
  $categoryName = $Matches[2]
  $items = @()
  foreach ($script in Get-ChildItem -LiteralPath $categoryDir.FullName -Filter "script.md" -File -Recurse) {
    $text = Get-Content -LiteralPath $script.FullName -Encoding UTF8 -Raw
    $titleMatch = [regex]::Match($text, '(?m)^#\s+(.+)$')
    if (-not $titleMatch.Success) { throw "Missing article title: $($script.FullName)" }
    $title = $titleMatch.Groups[1].Value.Trim()
    $body = $text.Remove($titleMatch.Index, $titleMatch.Length).Trim()
    $folderName = $script.Directory.Name
    $sourceMatch = [regex]::Match($folderName, '^C(\d+)-Test(\d+)-Passage(\d+)-')
    if (-not $sourceMatch.Success) { throw "Unexpected article directory: $($script.Directory.FullName)" }
    $baseUri = New-Object Uri(($webRoot.TrimEnd('\') + '\'))
    $directoryUri = New-Object Uri(($script.Directory.FullName.TrimEnd('\') + '\'))
    $relativeDirectory = [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($directoryUri).ToString()).TrimEnd('/')
    $reviewPath = Join-Path $script.Directory.FullName "review.md"
    $reviewed = Test-Path -LiteralPath $reviewPath
    $reviewText = if ($reviewed) { [string](Get-Content -LiteralPath $reviewPath -Encoding UTF8 -Raw) } else { "" }
    $items += [ordered]@{
      id = "$($categoryDir.Name)/$folderName"; title = $title
      source = "C$($sourceMatch.Groups[1].Value) · Test $($sourceMatch.Groups[2].Value) · Passage $($sourceMatch.Groups[3].Value)"
      book = [int]$sourceMatch.Groups[1].Value; test = [int]$sourceMatch.Groups[2].Value; passage = [int]$sourceMatch.Groups[3].Value
      assetBase = ([Uri]::EscapeUriString($relativeDirectory) + "/"); content = $body
      reviewed = $reviewed
      review = $reviewText
    }

    if ($reviewed) {
      $scoreMatch = [regex]::Match($reviewText, '(?m)^-\s*[^\r\n]*?(\d+)\s*/\s*(\d+)\s*$')
      if ($scoreMatch.Success) {
        $dateMatch = [regex]::Match($reviewText, '(?m)^-\s*[^\r\n]*?(\d{4}-\d{2}-\d{2})')
        $scoreEntries += [ordered]@{
          id = "$($categoryDir.Name)/$folderName"
          title = $title
          book = [int]$sourceMatch.Groups[1].Value
          test = [int]$sourceMatch.Groups[2].Value
          passage = [int]$sourceMatch.Groups[3].Value
          correct = [int]$scoreMatch.Groups[1].Value
          maximum = [int]$scoreMatch.Groups[2].Value
          reviewDate = if ($dateMatch.Success) { $dateMatch.Groups[1].Value } else { "" }
        }
      }
    }
  }
  $items = @($items | Sort-Object @{Expression = { [int]$_['book'] }; Descending = $true}, @{Expression = { [int]$_['test'] }; Ascending = $true}, @{Expression = { [int]$_['passage'] }; Ascending = $true}, title)
  $categories += [ordered]@{ key = $categoryDir.Name; number = $categoryNumber; name = $categoryName; items = $items }
}

$scoreTests = @()
foreach ($group in ($scoreEntries | Group-Object { "$($_['book'])-$($_['test'])" })) {
  $testPassages = @($group.Group | Sort-Object { [int]$_['passage'] })
  if ($testPassages.Count -ne 3 -or @($testPassages | ForEach-Object { $_['passage'] } | Select-Object -Unique).Count -ne 3) {
    continue
  }

  $totalCorrect = [int](($testPassages | ForEach-Object { [int]$_['correct'] } | Measure-Object -Sum).Sum)
  $totalMaximum = [int](($testPassages | ForEach-Object { [int]$_['maximum'] } | Measure-Object -Sum).Sum)
  $completedDate = @($testPassages | ForEach-Object { $_['reviewDate'] } | Where-Object { $_ } | Sort-Object -Descending | Select-Object -First 1)
  $scoreTests += [ordered]@{
    book = $testPassages[0]['book']
    test = $testPassages[0]['test']
    correct = $totalCorrect
    maximum = $totalMaximum
    band = Get-AcademicReadingBand $totalCorrect
    reviewDate = if ($completedDate.Count) { $completedDate[0] } else { "" }
    passages = $testPassages
  }
}
$scoreTests = @($scoreTests | Sort-Object @{Expression = { [int]$_['book'] }; Descending = $true}, @{Expression = { [int]$_['test'] }; Ascending = $true})

$json = ConvertTo-Json -InputObject @($categories) -Depth 7
$content = "// Generated from reading topic directories. Do not edit directly.`nwindow.readingCatalog = $json;`n"
[IO.File]::WriteAllText($outputPath, $content, (New-Object Text.UTF8Encoding($false)))
$scoreJson = ConvertTo-Json -InputObject @($scoreTests) -Depth 6
$scoreContent = "// Generated from complete reading review score sets. Do not edit directly.`nwindow.readingScoreData = $scoreJson;`n"
[IO.File]::WriteAllText($scoreOutputPath, $scoreContent, (New-Object Text.UTF8Encoding($false)))
Write-Output "Generated $outputPath"
Write-Output "Generated $scoreOutputPath"
