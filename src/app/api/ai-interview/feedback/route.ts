import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewer } from '@/lib/aiInterviewer';

export async function POST(request: NextRequest) {
  try {
    const { question, userQuery, isCorrect, timeSpent, hintsUsed } = await request.json();

    if (!question || userQuery === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate AI feedback
    const feedback = await aiInterviewer.generateFeedback(
      question,
      userQuery,
      isCorrect,
      timeSpent || 0,
      hintsUsed || 0
    );

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
