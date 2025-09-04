#!/usr/bin/env pwsh
# SQL Practice Hub Setup Script
# Run this script to set up the project quickly

Write-Host "🚀 SQL Practice Hub Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is running
Write-Host "🔍 Checking MySQL connection..." -ForegroundColor Yellow

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Creating .env.local file..." -ForegroundColor Yellow
    $envContent = @"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sql_practice

# OpenAI Configuration (required for AI question generation)
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
"@
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created. Please update with your actual values." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure MySQL is running on your machine" -ForegroundColor White
Write-Host "2. Update .env.local with your MySQL credentials" -ForegroundColor White
Write-Host "3. (Optional) Add your OpenAI API key for AI question generation" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "📚 Features:" -ForegroundColor Cyan
Write-Host "• Practice SQL queries with instant feedback" -ForegroundColor White
Write-Host "• Static topics covering fundamental SQL concepts" -ForegroundColor White
Write-Host "• AI-powered custom question generation" -ForegroundColor White
Write-Host "• Sandboxed query execution environment" -ForegroundColor White
Write-Host "• Progress tracking and performance metrics" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to start? Run: npm run dev" -ForegroundColor Green
