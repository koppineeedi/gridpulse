Write-Host "Starting GridPulse Build Automation..." -ForegroundColor Cyan

Write-Host "Building React Frontend..." -ForegroundColor Yellow
Push-Location frontend
npm install
npm run build
Pop-Location

Write-Host "Preparing Static Resource Directory in Backend..." -ForegroundColor Yellow
$staticDir = "backend/src/main/resources/static"
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force $staticDir
}
New-Item -ItemType Directory -Path $staticDir -Force | Out-Null

Write-Host "Copying Static Assets..." -ForegroundColor Yellow
Copy-Item -Path "frontend/dist/*" -Destination $staticDir -Recurse -Force

Write-Host "Packaging Backend into WAR..." -ForegroundColor Yellow
Push-Location backend
mvn clean package "-Dmaven.test.skip=true"
Pop-Location

Write-Host "GridPulse.war built successfully in backend/target/!" -ForegroundColor Green
