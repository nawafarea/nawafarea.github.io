Get-ChildItem content/posts -Directory -Filter "test-post-*" | Remove-Item -Recurse -Force

Write-Host "Deleted all test posts"