$ErrorActionPreference = "Continue"

while ($true) {

    try {

        # Check the latest changes from GitHub
        git fetch origin main

        # Check whether local files have uncommitted changes
        $status = git status --porcelain

        if ($status) {

            Write-Host ""
            Write-Host "Local changes detected. Skipping auto-pull to prevent conflicts." -ForegroundColor Yellow

        }
        else {

            # Compare local main with GitHub main
            $local = git rev-parse HEAD
            $remote = git rev-parse origin/main

            if ($local -ne $remote) {

                Write-Host ""
                Write-Host "New changes detected on GitHub..." -ForegroundColor Cyan

                git pull --ff-only origin main

                Write-Host ""
                Write-Host "VS Code project updated from GitHub." -ForegroundColor Green

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