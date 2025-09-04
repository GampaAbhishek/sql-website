import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

export async function GET() {
  try {
    console.log('Attempting to connect to database...');
    console.log('DB Config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'sql_practice'
    });
    
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM topics ORDER BY level, name') as [any[], any];
    
    console.log('Topics fetched successfully:', rows.length);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    
    // Provide detailed error information
    const errorInfo = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch topics',
        details: errorInfo,
        suggestions: [
          'Check if MySQL service is running',
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
    
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO topics (name, description) VALUES (?, ?)',
      [name, description || '']
    ) as [any, any];
    
    return NextResponse.json({ 
      id: result.insertId, 
      name, 
      description,
      message: 'Topic created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
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
