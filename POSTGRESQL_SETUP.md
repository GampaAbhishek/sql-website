# PostgreSQL Setup Guide for SQL Practice Hub

## 🚀 Quick Installation (Windows)

### Option 1: PostgreSQL Official Installer (Recommended)
1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Run installer** and follow setup wizard
3. **Set password** for 'postgres' user: `Mcsr@246800` (as configured in .env.local)
4. **Port**: Keep default `5432`
5. **Locale**: Keep default settings

### Option 2: Using Chocolatey
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql
```

## 🔧 Database Setup After Installation

### 1. Create Database
```powershell
# Connect to PostgreSQL (will prompt for password: Mcsr@246800)
psql -U postgres -h localhost

# Create the database
CREATE DATABASE sqlhub;

# Create additional databases (as per schema)
CREATE DATABASE playground;
CREATE DATABASE challenges;
CREATE DATABASE analytics;
CREATE DATABASE interview_prep;
CREATE DATABASE gamification;

# List databases to verify
\l

# Exit psql
\q
```

### 2. Test Connection
After installation, test the API:
```
http://localhost:3001/api/test-db
```

## 🔍 Current Configuration
The application is configured with these PostgreSQL settings:
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: Mcsr@246800
- **Database**: sqlhub

## 🆘 Troubleshooting

### If PostgreSQL service isn't running:
```powershell
# Check service status
Get-Service -Name "*postgres*"

# Start service
Start-Service postgresql-x64-*
```

### If connection still fails:
1. Verify PostgreSQL is listening: `netstat -an | findstr :5432`
2. Check Windows Firewall settings
3. Verify password in .env.local matches PostgreSQL user password
4. Try connecting with different host: `127.0.0.1` instead of `localhost`

## 📋 Schema Information
The application uses a 6-database architecture:
1. **sqlhub** - Main application database
2. **playground** - SQL playground and testing
3. **challenges** - Coding challenges
4. **analytics** - User analytics and progress
5. **interview_prep** - Interview preparation questions
6. **gamification** - Badges, achievements, leaderboards

## ✅ Verification Steps
1. [ ] PostgreSQL installed and running
2. [ ] Can connect with: `psql -U postgres -h localhost`
3. [ ] Database 'sqlhub' created
4. [ ] API endpoint `/api/test-db` returns success
5. [ ] Environment variables loaded correctly
