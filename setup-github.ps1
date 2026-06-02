# Chess Roulette - GitHub Setup Script for Windows PowerShell
# This script initializes Git and pushes your code to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chess Roulette - GitHub Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "  winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

# Configure git user (if not already set)
$email = git config user.email
if ([string]::IsNullOrEmpty($email)) {
    Write-Host "Setting up Git user configuration..." -ForegroundColor Yellow
    $userEmail = Read-Host "Enter your GitHub email address"
    $userName = Read-Host "Enter your GitHub username"
    git config user.email $userEmail
    git config user.name $userName
    Write-Host "✓ Git user configured" -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added" -ForegroundColor Green

# Create commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Chess Roulette full-stack app"
Write-Host "✓ Commit created" -ForegroundColor Green

# Check for remote
$remote = git remote get-url origin 2>$null
if ([string]::IsNullOrEmpty($remote)) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Create a new repository on GitHub:" -ForegroundColor Yellow
    Write-Host "   Go to: https://github.com/new" -ForegroundColor White
    Write-Host "   Repository name: chess-roulette" -ForegroundColor White
    Write-Host "   Make it: Public" -ForegroundColor White
    Write-Host "   Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "2. After creating the repo, run these commands:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/leesegundo/chess-roulette.git" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Then deploy to Railway:" -ForegroundColor Yellow
    Write-Host "   - Go to https://railway.app" -ForegroundColor White
    Write-Host "   - Sign in with GitHub" -ForegroundColor White
    Write-Host "   - Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor White
    Write-Host "   - Select 'chess-roulette' and deploy" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Remote repository already configured: $remote" -ForegroundColor Green
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "✓ Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Deploy to Railway at https://railway.app" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
