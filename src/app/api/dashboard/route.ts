import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/database';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const client = await getClient();

    try {
      // Get user's dashboard summary
      const result = await client.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          -- Progress statistics
          COUNT(DISTINCT up.lesson_id) FILTER (WHERE up.status = 'completed') as lessons_completed,
          COUNT(DISTINCT uc.challenge_id) FILTER (WHERE uc.status = 'solved') as challenges_solved,
          COUNT(DISTINCT ub.badge_id) as badges_earned,
          -- Performance metrics
          COALESCE(AVG(up.accuracy_percentage) FILTER (WHERE up.status = 'completed'), 0) as avg_lesson_accuracy,
          COALESCE(AVG(uc.score) FILTER (WHERE uc.status = 'solved'), 0) as avg_challenge_score,
          -- Engagement metrics
          COALESCE(MAX(us.current_count) FILTER (WHERE us.streak_type = 'daily'), 0) as current_daily_streak,
          COUNT(DISTINCT q.id) as total_queries_executed,
          -- Recent activity
          MAX(al.created_at) as last_activity_at
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        LEFT JOIN user_challenges uc ON u.id = uc.user_id
        LEFT JOIN user_badges ub ON u.id = ub.user_id
        LEFT JOIN user_streaks us ON u.id = us.user_id
        LEFT JOIN queries q ON u.id = q.user_id
        LEFT JOIN activity_logs al ON u.id = al.user_id
        WHERE u.id = $1 AND u.is_active = true
        GROUP BY u.id, u.name, u.email, u.role
      `, [user.id]);

      const dashboardData = result.rows[0];

      // Get recent activity
      const recentActivityResult = await client.query(`
        SELECT 
          activity_type,
          entity_type,
          entity_id,
          details,
          created_at
        FROM activity_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [user.id]);

      // Get upcoming challenges
      const upcomingChallengesResult = await client.query(`
        SELECT 
          c.id,
          c.title,
          c.difficulty,
          c.category,
          c.points,
          CASE 
            WHEN uc.id IS NOT NULL THEN uc.status
            ELSE 'not_attempted'
          END as user_status
        FROM challenges c
        LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
        WHERE c.is_published = true
        AND (uc.status IS NULL OR uc.status != 'solved')
        ORDER BY c.difficulty, c.created_at
        LIMIT 5
      `, [user.id]);

      // Get recent badges earned
      const recentBadgesResult = await client.query(`
        SELECT 
          b.name,
          b.description,
          b.icon_emoji,
          b.rarity,
          ub.earned_at
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC
        LIMIT 3
      `, [user.id]);

      return NextResponse.json({
        success: true,
        data: {
          summary: dashboardData,
          recentActivity: recentActivityResult.rows,
          upcomingChallenges: upcomingChallengesResult.rows,
          recentBadges: recentBadgesResult.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Dashboard API error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
