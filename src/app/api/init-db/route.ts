import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, seedDatabase } from '@/lib/database';

export async function POST() {
  try {
    await initializeDatabase();
    await seedDatabase();
    
    return NextResponse.json({ 
      message: 'Database initialized and seeded successfully' 
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
