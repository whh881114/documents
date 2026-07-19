$ErrorActionPreference = "Stop"
$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$readingRoot = Join-Path $repoRoot "reading"
$outputPath = Join-Path $webRoot "assets/data/reading-catalog.js"
$categories = @()

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
    $items += [ordered]@{
      id = "$($categoryDir.Name)/$folderName"; title = $title
      source = "C$($sourceMatch.Groups[1].Value) · Test $($sourceMatch.Groups[2].Value) · Passage $($sourceMatch.Groups[3].Value)"
      book = [int]$sourceMatch.Groups[1].Value; test = [int]$sourceMatch.Groups[2].Value; passage = [int]$sourceMatch.Groups[3].Value
      assetBase = ([Uri]::EscapeUriString($relativeDirectory) + "/"); content = $body
      reviewed = $reviewed
      review = if ($reviewed) { [string](Get-Content -LiteralPath $reviewPath -Encoding UTF8 -Raw) } else { "" }
    }
  }
  $items = @($items | Sort-Object @{Expression = { [int]$_['book'] }; Descending = $true}, @{Expression = { [int]$_['test'] }; Ascending = $true}, @{Expression = { [int]$_['passage'] }; Ascending = $true}, title)
  $categories += [ordered]@{ key = $categoryDir.Name; number = $categoryNumber; name = $categoryName; items = $items }
}
$json = ConvertTo-Json -InputObject @($categories) -Depth 7
$content = "// Generated from reading topic directories. Do not edit directly.`nwindow.readingCatalog = $json;`n"
[IO.File]::WriteAllText($outputPath, $content, (New-Object Text.UTF8Encoding($false)))
Write-Output "Generated $outputPath"
