$ErrorActionPreference = "Continue"

$branch = git branch --show-current

if (-not $branch) {

    Write-Host ""
    Write-Host "Error: Unable to detect the current Git branch." -ForegroundColor Red

    exit

}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CardFlow AI Automatic Git Sync" -ForegroundColor Green
Write-Host " Branch: $branch" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {

    try {

        # --------------------------------
        # STEP 1: CHECK LOCAL CHANGES
        # --------------------------------

        $status = git status --porcelain

        if ($status) {

            Write-Host ""
            Write-Host "Local changes detected..." -ForegroundColor Cyan

            git add .

            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            git commit -m "Auto sync: $timestamp"

            if ($LASTEXITCODE -eq 0) {

                Write-Host "Changes committed." -ForegroundColor Green

                git push origin $branch

                if ($LASTEXITCODE -eq 0) {

                    Write-Host "Changes pushed to GitHub." -ForegroundColor Green

                }
                else {

                    Write-Host "Push failed. Will retry next cycle." -ForegroundColor Yellow

                }

            }

        }


        # --------------------------------
        # STEP 2: FETCH REMOTE CHANGES
        # --------------------------------

        git fetch origin $branch

        if ($LASTEXITCODE -eq 0) {

            $local = git rev-parse HEAD

            $remote = git rev-parse "origin/$branch"


            # --------------------------------
            # STEP 3: PULL NEW CHANGES
            # --------------------------------

            if ($local -ne $remote) {

                $status = git status --porcelain

                if (-not $status) {

                    Write-Host ""
                    Write-Host "New changes found on GitHub..." -ForegroundColor Cyan

                    git pull --ff-only origin $branch

                    if ($LASTEXITCODE -eq 0) {

                        Write-Host "VS Code project updated from GitHub." -ForegroundColor Green

                    }

                }
                else {

                    Write-Host ""
                    Write-Host "Remote changes found, but local changes exist." -ForegroundColor Yellow
                    Write-Host "Skipping pull to prevent conflicts." -ForegroundColor Yellow

                }

            }
            else {

                Write-Host "Everything is synchronized." -ForegroundColor DarkGray

            }

        }

    }
    catch {

        Write-Host ""
        Write-Host "Git sync error: $($_.Exception.Message)" -ForegroundColor Red

    }

    Start-Sleep -Seconds 30

}