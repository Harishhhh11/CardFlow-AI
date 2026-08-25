# CardFlow AI automatic Git sync
# Run from the project root.

$ErrorActionPreference = "Continue"

# Automatically detect the currently checked-out branch
$branch = git branch --show-current

if (-not $branch) {

    Write-Host ""
    Write-Host "Error: Unable to detect the current Git branch." -ForegroundColor Red

    exit

}

Write-Host ""
Write-Host "CardFlow AI Auto Sync Started" -ForegroundColor Green
Write-Host "Tracking branch: $branch" -ForegroundColor Cyan
Write-Host ""

while ($true) {

    try {

        # Check for changed files
        $status = git status --porcelain

        if ($status) {

            Write-Host ""
            Write-Host "Local changes detected..." -ForegroundColor Cyan

            # Stage all changes
            git add .

            # Create timestamp
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            # Commit changes
            git commit -m "Auto sync: $timestamp"

            if ($LASTEXITCODE -eq 0) {

                Write-Host ""
                Write-Host "Changes committed successfully." -ForegroundColor Green

                # Push to the CURRENT branch
                git push origin $branch

                if ($LASTEXITCODE -eq 0) {

                    Write-Host ""
                    Write-Host "Changes pushed to GitHub." -ForegroundColor Green

                }
                else {

                    Write-Host ""
                    Write-Host "Push failed. Remote changes may exist." -ForegroundColor Red

                }

            }

        }
        else {

            Write-Host "No local changes to sync." -ForegroundColor DarkGray

        }

    }
    catch {

        Write-Host ""
        Write-Host "Git sync error: $($_.Exception.Message)" -ForegroundColor Red

        Write-Host "No automatic force push will be performed." -ForegroundColor Yellow

    }

    Start-Sleep -Seconds 30

}