$ErrorActionPreference = "Continue"

# Automatically detect the currently checked-out branch
$branch = git branch --show-current

if (-not $branch) {

    Write-Host ""
    Write-Host "Error: Unable to detect the current Git branch." -ForegroundColor Red

    exit

}

Write-Host ""
Write-Host "CardFlow AI Auto Pull Started" -ForegroundColor Green
Write-Host "Tracking branch: $branch" -ForegroundColor Cyan
Write-Host ""

while ($true) {

    try {

        # Check for local uncommitted changes
        $status = git status --porcelain

        if ($status) {

            Write-Host ""
            Write-Host "Local changes detected. Skipping auto-pull to prevent conflicts." -ForegroundColor Yellow

        }
        else {

            # Fetch the latest data for the CURRENT branch
            git fetch origin $branch

            # Get the current local commit
            $local = git rev-parse HEAD

            # Get the latest remote commit
            $remote = git rev-parse "origin/$branch"

            # Compare commits
            if ($local -ne $remote) {

                Write-Host ""
                Write-Host "New changes detected on GitHub..." -ForegroundColor Cyan

                # Pull only if fast-forward is possible
                git pull --ff-only origin $branch

                if ($LASTEXITCODE -eq 0) {

                    Write-Host ""
                    Write-Host "VS Code project updated from GitHub." -ForegroundColor Green

                }
                else {

                    Write-Host ""
                    Write-Host "Unable to automatically update the project." -ForegroundColor Red

                }

            }
            else {

                Write-Host "No new GitHub changes." -ForegroundColor DarkGray

            }

        }

    }
    catch {

        Write-Host ""
        Write-Host "Auto-pull error: $($_.Exception.Message)" -ForegroundColor Red

    }

    Start-Sleep -Seconds 30

}