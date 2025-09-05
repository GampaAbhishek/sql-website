import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewer } from '@/lib/aiInterviewer';

export async function POST(request: NextRequest) {
  try {
    const { difficulty, mode } = await request.json();

    if (!difficulty || !mode) {
      return NextResponse.json(
        { error: 'Missing difficulty or mode parameter' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'mixed'];
    const validModes = ['timed', 'practice'];

    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      );
    }

    // Initialize the AI interview session
    const session = await aiInterviewer.initializeSession(difficulty, mode);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error initializing AI interview session:', error);
    return NextResponse.json(
      { error: 'Failed to initialize interview session' },
      { status: 500 }
    );
  }
}
