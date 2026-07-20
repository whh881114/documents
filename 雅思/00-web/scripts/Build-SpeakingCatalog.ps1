$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$speakingRoot = Join-Path $repoRoot "speaking"
$outputPath = Join-Path $webRoot "assets/data/speaking-catalog.js"
$parts = @()
foreach ($partNumber in 1..3) {
  $categories = @()
  foreach ($categoryDir in Get-ChildItem -LiteralPath (Join-Path $speakingRoot "part$partNumber") -Directory | Sort-Object Name) {
    if ($categoryDir.Name -notmatch '^(\d{2})-(.+)$') { continue }
    $number = $Matches[1]; $name = $Matches[2]; $items = @()
    foreach ($file in Get-ChildItem -LiteralPath $categoryDir.FullName -Filter '*.md' -File) {
      if ($file.Name -notmatch '^IELTS-(\d+)-Test(\d+)-Part(\d+)\.md$') { continue }
      $book = [int]$Matches[1]; $test = [int]$Matches[2]
      if ([int]$Matches[3] -ne $partNumber) { throw "Part mismatch: $($file.FullName)" }
      $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
      $headings = @([regex]::Matches($text, '(?m)^#\s+(.+)$') | ForEach-Object { $_.Groups[1].Value.Trim() })
      $title = if ($headings.Count -gt 1) { $headings[1] } else { "剑雅 $book Test $test Part $partNumber" }
      $items += [ordered]@{ id = "c$book-t$test-p$partNumber"; book = $book; test = $test; title = $title; content = $text.Trim() }
    }
    $items = @($items | Sort-Object @{Expression={$_.book};Descending=$true}, @{Expression={$_.test};Ascending=$true})
    $categories += [ordered]@{ key=$categoryDir.Name; number=$number; name=$name; items=$items }
  }
  $parts += [ordered]@{ part=$partNumber; categoryCount=$categories.Count; itemCount=@($categories | ForEach-Object {$_.items}).Count; categories=$categories }
}
$json = ConvertTo-Json -InputObject @($parts) -Depth 8
$content = "// Generated from speaking/part1-part3. Do not edit directly.`nwindow.speakingCatalog = $json;`n"
[IO.File]::WriteAllText($outputPath, $content, (New-Object Text.UTF8Encoding($false)))
Write-Output "Generated $outputPath"