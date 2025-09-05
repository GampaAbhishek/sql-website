import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, scorecard, badges } = await request.json();

    if (!userId || !sessionId || !scorecard) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // In a real application, this would update the user's profile in the database
    // For now, we'll return the badges and achievements that would be awarded
    
    const achievements: string[] = [];
    const newBadges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
    }> = [];

    // Check for first interview badge
    if (badges.includes('First Mock Interview')) {
      newBadges.push({
        id: 'first_interview',
        name: 'First Mock Interview',
        description: 'Completed your first AI-powered SQL interview',
        icon: '🎯',
        rarity: 'common'
      });
    }

    // Check for speed coding badge
    if (badges.includes('Speed Coder')) {
      newBadges.push({
        id: 'speed_coder',
        name: 'Speed Coder',
        description: 'Answered a question in under 1 minute',
        icon: '⚡',
        rarity: 'rare'
      });
    }

    // Check for SQL master badge
    if (badges.includes('SQL Master')) {
      newBadges.push({
        id: 'sql_master',
        name: 'SQL Master',
        description: 'Achieved 90%+ accuracy in an interview',
        icon: '🏆',
        rarity: 'legendary'
      });
    }

    // Check for optimizer badge
    if (badges.includes('Optimizer')) {
      newBadges.push({
        id: 'optimizer',
        name: 'Optimizer',
        description: 'Wrote excellent efficiency queries',
        icon: '🚀',
        rarity: 'epic'
      });
    }

    // Calculate XP gained based on performance
    let xpGained = 0;
    xpGained += scorecard.overallScore; // Base XP from score
    xpGained += scorecard.accuracy * 0.5; // Bonus for accuracy
    xpGained += newBadges.length * 50; // Bonus for new badges

    // Update leaderboard position (simulated)
    const leaderboardUpdate = {
      currentRank: Math.floor(Math.random() * 100) + 1,
      pointsGained: Math.round(xpGained),
      newTotal: Math.floor(Math.random() * 10000) + xpGained
    };

    return NextResponse.json({
      xpGained: Math.round(xpGained),
      newBadges,
      achievements,
      leaderboardUpdate,
      message: `Great work! You gained ${Math.round(xpGained)} XP and ${newBadges.length} new badges!`
    });

  } catch (error) {
    console.error('Error updating gamification progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
