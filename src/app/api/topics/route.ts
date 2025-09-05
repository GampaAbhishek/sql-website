import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sql_practice',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    console.log('Attempting to connect to PostgreSQL database...');
    console.log('DB Config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      database: process.env.DB_NAME || 'sql_practice'
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM topics ORDER BY level, name');
    client.release();
    
    console.log('Topics fetched successfully:', result.rows.length);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    
    // Provide detailed error information
    const errorInfo = {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch topics',
        details: errorInfo,
        suggestions: [
          'Check if PostgreSQL service is running',
          'Verify database credentials in .env.local',
          'Ensure sql_practice database exists',
          'Try visiting /api/test-db for detailed connection diagnostics'
        ]
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO topics (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || '']
    );
    client.release();
    
    return NextResponse.json({ 
      ...result.rows[0],
      message: 'Topic created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json(
        { error: 'Topic already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
