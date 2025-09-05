import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('Testing PostgreSQL database connection...');
    console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
    console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
    console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
    
    // First try to connect to default postgres database to test connection
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: 'postgres', // Connect to default postgres database first
      connectionTimeoutMillis: 5000,
    });

    console.log('Connection configuration set up!');
    
    // Test basic query
    const client = await pool.connect();
    const result = await client.query('SELECT version() as version');
    client.release();
    await pool.end();

    console.log('Connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database connection successful',
      postgresVersion: result.rows[0],
      config: {
        host: process.env.POSTGRES_HOST || 'localhost',
        user: process.env.POSTGRES_USER || 'postgres',
        database: process.env.POSTGRES_DB || 'sqlhub'
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
