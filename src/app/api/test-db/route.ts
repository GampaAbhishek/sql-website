import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sql_practice',
      connectTimeout: 5000,
    });

    console.log('Connection successful!');
    
    // Test basic query
    const [result] = await connection.execute('SELECT VERSION() as version') as [any[], any];
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      mysqlVersion: result[0],
      config: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'sql_practice'
      }
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      troubleshooting: {
        common_issues: [
          "MySQL service is not running",
          "Incorrect host, port, username, or password",
          "Database does not exist",
          "Firewall blocking connection",
          "MySQL not installed"
        ],
        next_steps: [
          "1. Check if MySQL service is running: services.msc (Windows) or brew services list (Mac)",
          "2. Try connecting with MySQL command line: mysql -u root -p",
          "3. Verify credentials in .env.local file",
          "4. Check if MySQL is listening on port 3306: netstat -an | findstr 3306",
          "5. Try using 127.0.0.1 instead of localhost"
        ]
      }
    }, { status: 500 });
  }
}
