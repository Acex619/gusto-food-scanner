# Fix-PowerShell-ExecutionPolicy.ps1
#
# This script fixes the PowerShell execution policy to allow npm and other scripts to run
# Run this script as administrator by right-clicking on it and selecting "Run as Administrator"

# Set execution policy for current user
try {
    Write-Host "Setting execution policy to RemoteSigned for CurrentUser..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "Successfully set execution policy to RemoteSigned for CurrentUser!" -ForegroundColor Green
} catch {
    Write-Host "Failed to set execution policy for CurrentUser: $_" -ForegroundColor Red
}

# Create/update PowerShell profile to maintain this setting
try {
    $profileContent = @"
# PowerShell Profile
# This file is loaded each time you start PowerShell

# Set execution policy to allow npm and other signed scripts to run
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# You can add other customizations below:
# - Custom aliases
# - Environment variables
# - Functions
# - Other preferences
"@

    $profilePath = $PROFILE.CurrentUserAllHosts
    $profileDir = Split-Path -Parent $profilePath
    
    if (!(Test-Path -Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    
    Set-Content -Path $profilePath -Value $profileContent -Force
    Write-Host "PowerShell profile updated at: $profilePath" -ForegroundColor Green
} catch {
    Write-Host "Failed to update PowerShell profile: $_" -ForegroundColor Red
}

# Output current execution policy
Write-Host "`nCurrent execution policies:" -ForegroundColor Cyan
Get-ExecutionPolicy -List

Write-Host "`nSetup complete! You should now be able to run npm commands without issues." -ForegroundColor Green
Write-Host "If you still encounter issues, try closing and reopening PowerShell, or restart your computer." -ForegroundColor Yellow

# Keep the window open
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
