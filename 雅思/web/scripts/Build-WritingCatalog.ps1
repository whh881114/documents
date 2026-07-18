$ErrorActionPreference = 'Stop'

$webRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $webRoot
$writingRoot = Join-Path $repoRoot 'writing'
$outputDir = Join-Path $webRoot 'assets\data'
$outputFile = Join-Path $outputDir 'writing-catalog.js'

function Get-MarkdownSection {
    param(
        [string]$Text,
        [string]$Heading
    )

    $escapedHeading = [regex]::Escape($Heading)
    $match = [regex]::Match($Text, "(?ms)^##\s+$escapedHeading\s*\r?\n(.*?)(?=^##\s+|\z)")
    if ($match.Success) { return $match.Groups[1].Value.Trim() }
    return ''
}

function Format-Json {
    param([string]$Json)

    $builder = [System.Text.StringBuilder]::new()
    $indent = 0
    $insideString = $false
    $escaped = $false

    for ($index = 0; $index -lt $Json.Length; $index++) {
        $character = $Json[$index]

        if ($insideString) {
            [void]$builder.Append($character)
            if ($escaped) {
                $escaped = $false
            } elseif ($character -eq '\') {
                $escaped = $true
            } elseif ($character -eq '"') {
                $insideString = $false
            }
            continue
        }

        if ($character -eq '"') {
            $insideString = $true
            [void]$builder.Append($character)
            continue
        }

        if ([char]::IsWhiteSpace($character)) { continue }

        switch ($character) {
            { $_ -eq '{' -or $_ -eq '[' } {
                [void]$builder.Append($character)
                $next = if ($index + 1 -lt $Json.Length) { $Json[$index + 1] } else { $null }
                if (($character -eq '{' -and $next -ne '}') -or ($character -eq '[' -and $next -ne ']')) {
                    $indent++
                    [void]$builder.Append("`n" + ('  ' * $indent))
                }
            }
            { $_ -eq '}' -or $_ -eq ']' } {
                $previous = if ($index -gt 0) { $Json[$index - 1] } else { $null }
                if (($character -eq '}' -and $previous -ne '{') -or ($character -eq ']' -and $previous -ne '[')) {
                    $indent--
                    [void]$builder.Append("`n" + ('  ' * $indent))
                }
                [void]$builder.Append($character)
            }
            ',' {
                [void]$builder.Append(",`n" + ('  ' * $indent))
            }
            ':' {
                [void]$builder.Append(': ')
            }
            default {
                [void]$builder.Append($character)
            }
        }
    }

    return $builder.ToString()
}

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
                $questionText = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
                $versionFiles = if (Test-Path -LiteralPath $essayDirectory) {
                    @(Get-ChildItem -LiteralPath $essayDirectory -File -Filter ($questionId + '-Essay-V*.md') | Sort-Object Name)
                } else {
                    @()
                }
                $versions = @($versionFiles | ForEach-Object {
                    $versionFile = $_
                    $versionText = [System.IO.File]::ReadAllText($versionFile.FullName, [System.Text.Encoding]::UTF8)
                    $versionNumber = if ($versionFile.BaseName -match '-V(\d+)$') { [int]$Matches[1] } else { 0 }
                    [ordered]@{
                        version = $versionNumber
                        filename = $versionFile.Name
                        date = $versionFile.LastWriteTime.ToString('yyyy-MM-dd')
                        essay = Get-MarkdownSection -Text $versionText -Heading 'Essay'
                        thoughts = Get-MarkdownSection -Text $versionText -Heading 'My thoughts'
                        feedback = Get-MarkdownSection -Text $versionText -Heading 'ChatGPT feedback'
                        revision_notes = Get-MarkdownSection -Text $versionText -Heading 'Revision notes'
                    }
                })
                [ordered]@{
                    id = $questionId
                    written = ($versionFiles.Count -gt 0)
                    version_count = $versionFiles.Count
                    instructions = Get-MarkdownSection -Text $questionText -Heading 'Instructions'
                    versions = $versions
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

$json = Format-Json -Json (@($catalog) | ConvertTo-Json -Depth 8 -Compress)
$fileContent = @"
// Generated by web/scripts/Build-WritingCatalog.ps1 or Build-WritingCatalog.sh.
// Edit the source Markdown files under writing, then rebuild. Do not edit this generated data directly.
window.writingCatalog = $json;
"@
[System.IO.File]::WriteAllText($outputFile, $fileContent, [System.Text.UTF8Encoding]::new($false))
Write-Output "Generated $outputFile"
