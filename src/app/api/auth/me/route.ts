import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    return NextResponse.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
