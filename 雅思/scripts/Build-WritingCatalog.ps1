$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$writingRoot = Join-Path $repoRoot 'writing'
$outputDir = Join-Path $repoRoot 'assets\data'
$outputFile = Join-Path $outputDir 'writing-catalog.js'

$catalog = Get-ChildItem -LiteralPath $writingRoot -Directory |
    Where-Object { $_.Name -match '^T[12]-\d{2}-' } |
    Sort-Object Name |
    ForEach-Object {
        $categoryDirectory = $_
        $parts = $categoryDirectory.Name -split '-', 3
        $essayDirectory = Join-Path $categoryDirectory.FullName 'essays'
        $questions = Get-ChildItem -LiteralPath $categoryDirectory.FullName -File -Filter '*.md' |
            Sort-Object Name |
            ForEach-Object {
                $questionId = $_.BaseName
                $versionFiles = if (Test-Path -LiteralPath $essayDirectory) {
                    @(Get-ChildItem -LiteralPath $essayDirectory -File -Filter ($questionId + '-Essay-V*.md') | Sort-Object Name)
                } else {
                    @()
                }
                [ordered]@{
                    id = $questionId
                    written = ($versionFiles.Count -gt 0)
                    version_count = $versionFiles.Count
                    versions = @($versionFiles | ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/') })
                }
            }

        [ordered]@{
            key = $categoryDirectory.Name
            task = [int]$parts[0].Substring(1)
            name = $parts[2]
            total = @($questions).Count
            written = @($questions | Where-Object { $_.written }).Count
            questions = @($questions)
        }
    }

if (-not (Test-Path -LiteralPath $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$json = @($catalog) | ConvertTo-Json -Depth 5 -Compress
[System.IO.File]::WriteAllText($outputFile, "window.writingCatalog = $json;", [System.Text.UTF8Encoding]::new($false))
Write-Output "Generated $outputFile"
