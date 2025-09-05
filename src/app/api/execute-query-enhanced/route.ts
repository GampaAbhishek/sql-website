import { NextRequest, NextResponse } from 'next/server';
import { QueryExecutor } from '@/lib/queryExecutor';

export async function POST(request: NextRequest) {
  try {
    const { query, userId, databaseSchema } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Execute the query using the QueryExecutor
    const queryExecutor = QueryExecutor.getInstance();
    const result = await queryExecutor.executeInSandbox(query, databaseSchema || {});

    return NextResponse.json({
      success: true,
      result,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Enhanced query execution error:', error);
    return NextResponse.json(
      { 
        error: 'Query execution failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
