# SmartMed Deployment Script for Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  SmartMed Docker Deployment Script  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker is installed and running" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠ Please edit .env file and set your passwords before continuing!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Have you updated the .env file? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Please update .env file and run this script again" -ForegroundColor Yellow
        exit 0
    }
}

# Menu
Write-Host "Select deployment option:" -ForegroundColor Cyan
Write-Host "1) Build and start all services"
Write-Host "2) Start existing services"
Write-Host "3) Stop all services"
Write-Host "4) Rebuild and restart all services"
Write-Host "5) View logs"
Write-Host "6) Check service status"
Write-Host "7) Clean up (remove containers and volumes)"
Write-Host "8) Exit"
Write-Host ""

$choice = Read-Host "Enter choice (1-8)"

switch ($choice) {
    "1" {
        Write-Host "Building and starting all services..." -ForegroundColor Yellow
        docker-compose up -d --build
        Write-Host ""
        Write-Host "✓ Services started!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost" -ForegroundColor Cyan
        Write-Host "Backend: http://localhost:8081" -ForegroundColor Cyan
        Write-Host "MySQL: localhost:3307" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "Starting services..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "✓ Services started!" -ForegroundColor Green
    }
    "3" {
        Write-Host "Stopping services..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✓ Services stopped!" -ForegroundColor Green
    }
    "4" {
        Write-Host "Rebuilding and restarting services..." -ForegroundColor Yellow
        docker-compose down
        docker-compose up -d --build
        Write-Host "✓ Services restarted!" -ForegroundColor Green
    }
    "5" {
        Write-Host "Showing logs (Ctrl+C to exit)..." -ForegroundColor Yellow
        docker-compose logs -f
    }
    "6" {
        Write-Host "Service status:" -ForegroundColor Yellow
        docker-compose ps
    }
    "7" {
        Write-Host "⚠ WARNING: This will delete all data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "Cleaning up..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✓ Cleanup complete!" -ForegroundColor Green
        } else {
            Write-Host "Cleanup cancelled" -ForegroundColor Yellow
        }
    }
    "8" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
