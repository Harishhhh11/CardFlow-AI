# CardFlow AI automatic Git sync
# Run from the project root.

$ErrorActionPreference = "Stop"

while ($true) {

    try {

        # Check whether local files changed
        $status = git status --porcelain

        if ($status) {

            Write-Host ""
            Write-Host "Changes detected..." -ForegroundColor Cyan

            git add .

            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            git commit -m "Auto sync: $timestamp"

            git push origin main

            Write-Host ""
            Write-Host "Changes pushed to GitHub." -ForegroundColor Green
        }

    }
    catch {

        Write-Host ""
        Write-Host "Git sync error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "No automatic force push will be performed." -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 30
}