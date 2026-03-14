param(
    [Parameter(Mandatory = $false)]
    [string]$InputFile = ".\urls.txt",

    [Parameter(Mandatory = $false)]
    [string]$OutputFile = ".\references.md"
)

function Get-PageTitle {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{
            "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
        } -TimeoutSec 20

        $content = $response.Content

        if ([string]::IsNullOrWhiteSpace($content)) {
            return $null
        }

        # 1) حاول og:title أول
        $ogMatch = [regex]::Match(
            $content,
            '<meta\s+(?:property|name)=["'']og:title["'']\s+content=["''](.*?)["'']',
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
        if ($ogMatch.Success) {
            return ($ogMatch.Groups[1].Value -replace '\s+', ' ').Trim()
        }

        # 2) ثم title
        $titleMatch = [regex]::Match(
            $content,
            '<title[^>]*>(.*?)</title>',
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )
        if ($titleMatch.Success) {
            $title = ($titleMatch.Groups[1].Value -replace '\s+', ' ').Trim()
            if (-not [string]::IsNullOrWhiteSpace($title)) {
                return $title
            }
        }

        return $null
    }
    catch {
        Write-Warning "Failed: $Url"
        return $null
    }
}

function Escape-MarkdownText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text
    )

    # هروب بسيط للأقواس المربعة
    return $Text.Replace('[', '\[').Replace(']', '\]')
}

if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

$urls = Get-Content $InputFile |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and ($_ -match '^https?://') }

if (-not $urls -or $urls.Count -eq 0) {
    Write-Error "No valid URLs found in $InputFile"
    exit 1
}

$results = New-Object System.Collections.Generic.List[string]

foreach ($url in $urls) {
    Write-Host "Processing: $url" -ForegroundColor Cyan

    $title = Get-PageTitle -Url $url

    if ([string]::IsNullOrWhiteSpace($title)) {
        $results.Add("- <$url>")
    }
    else {
        $safeTitle = Escape-MarkdownText -Text $title
        $results.Add("- [$safeTitle]($url)")
    }

    Start-Sleep -Milliseconds 300
}

$results | Set-Content -Path $OutputFile -Encoding UTF8

Write-Host ""
Write-Host "Done. Output saved to: $OutputFile" -ForegroundColor Green