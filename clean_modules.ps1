# Remove all node_modules folders and pnpm-lock.yaml files in the project directory and its subdirectories
param(
    [string]$RootPath = "."
)

Write-Host "Starte Bereinigung unter $RootPath ..." -ForegroundColor Cyan

# Alle node_modules Ordner finden und löschen
Get-ChildItem -Path $RootPath -Directory -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "node_modules" } |
    ForEach-Object {
        Write-Host "Lösche Ordner: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }

Write-Host "Bereinigung abgeschlossen." -ForegroundColor Green
