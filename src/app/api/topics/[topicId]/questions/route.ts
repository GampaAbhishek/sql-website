import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId: topicIdParam } = await params;
    const topicId = parseInt(topicIdParam);
    
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM questions WHERE topic_id = ? ORDER BY difficulty, created_at',
      [topicId]
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
