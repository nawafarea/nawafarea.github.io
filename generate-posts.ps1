$count = 15
$sourceImage = "cover.jpg"

if (!(Test-Path $sourceImage)) {
    Write-Host "cover.jpg not found in this folder"
    exit
}

for ($i = 1; $i -le $count; $i++) {

    $rand = Get-Random -Minimum 1000 -Maximum 9999
    $slug = "test-post-$rand"
    $folder = "content/posts/$slug"

    if (Test-Path $folder) { continue }

    New-Item -ItemType Directory -Force -Path $folder | Out-Null

    $date = Get-Date -Format "yyyy-MM-dd"

$content = @"
---
title: "Test Post $rand"
date: $date
draft: false
generated: true
---

# Test Post $rand

This is a generated test article.

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## More Content

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
"@

    $content | Set-Content "$folder/index.md"
    Copy-Item $sourceImage "$folder/cover.jpg"

    Write-Host "Created $slug"
}

Write-Host "Done generating posts"