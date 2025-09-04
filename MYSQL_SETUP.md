# MySQL Setup and Troubleshooting Guide

## 🔧 Quick Fix for ECONNREFUSED Error

The `ECONNREFUSED` error means your application cannot connect to MySQL. Here are step-by-step solutions:

### 1. **Check if MySQL is Running**

**On Windows:**
```powershell
# Check MySQL service status
Get-Service -Name "*mysql*"

# Start MySQL service if stopped
Start-Service -Name "MySQL80" # or "MySQL57", etc.

# Or use Services GUI
services.msc
```

**Alternative - Check if MySQL is listening on port 3306:**
```cmd
netstat -an | findstr :3306
```

### 2. **Install MySQL (if not installed)**

**Option A: MySQL Community Server**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install and set root password during installation
3. Make note of your password for the .env.local file

**Option B: XAMPP (easier for development)**
1. Download from: https://www.apachefriends.org/
2. Install and start MySQL from XAMPP Control Panel
3. Default credentials: user=`root`, password=`` (empty)

**Option C: Using Chocolatey (if you have it)**
```powershell
choco install mysql
```

### 3. **Test MySQL Connection**

```cmd
# Test connection with command line
mysql -u root -p

# If successful, create the database
CREATE DATABASE sql_practice;
```

### 4. **Update Your .env.local File**

Make sure your `.env.local` has the correct credentials:
```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=sql_practice
```

**Common Issues:**
- Wrong password in `DB_PASSWORD`
- MySQL running on different port (try `DB_HOST=localhost:3307`)
- Using `localhost` vs `127.0.0.1`

### 5. **Alternative: Use 127.0.0.1**

Sometimes `localhost` doesn't resolve properly. Try:
```bash
DB_HOST=127.0.0.1
```

### 6. **Test the Connection**

Visit this URL in your browser to test the database connection:
```
http://localhost:3001/api/test-db
```

This will give you detailed error information and suggestions.

## 🚀 Quick Start Commands

**If MySQL is not installed, install XAMPP (recommended for development):**
1. Download XAMPP: https://www.apachefriends.org/download.html
2. Install and start Apache + MySQL from XAMPP Control Panel
3. Update your .env.local:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sql_practice
   ```
4. Visit: http://localhost:3001/api/init-db to initialize the database

## 📋 Verification Checklist

- [ ] MySQL service is running
- [ ] Can connect with `mysql -u root -p`
- [ ] Database `sql_practice` exists (or will be created automatically)
- [ ] .env.local has correct credentials
- [ ] Port 3306 is not blocked by firewall
- [ ] Visit `/api/test-db` shows connection success

## 🆘 Still Having Issues?

If you're still getting connection errors:
1. Check firewall settings
2. Try different host (localhost vs 127.0.0.1 vs your IP)
3. Verify MySQL is using port 3306: `SHOW VARIABLES LIKE 'port';`
4. Check MySQL error logs for additional details

## 💡 Development Alternative

For quick development setup, you can use SQLite instead of MySQL by modifying the database configuration, though MySQL is recommended for full SQL feature support.
