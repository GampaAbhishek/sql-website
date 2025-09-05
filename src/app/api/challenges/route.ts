import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/database';
import { verifyAuth, getOptionalAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getOptionalAuth(request);
    const client = await getClient();
    const { searchParams } = new URL(request.url);
    
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
      let query = `
        SELECT 
          c.*,
          CASE 
            WHEN uc.id IS NOT NULL THEN uc.status
            ELSE 'not_attempted'
          END as user_status,
          CASE 
            WHEN uc.id IS NOT NULL THEN uc.score
            ELSE 0
          END as user_score
        FROM challenges c
        LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
        WHERE c.is_published = true
      `;
      
      const params = [user?.id || null];
      let paramIndex = 2;

      if (difficulty) {
        query += ` AND c.difficulty = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      if (category) {
        query += ` AND c.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      query += ` ORDER BY c.difficulty, c.category, c.created_at LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit.toString(), offset.toString());

      const result = await client.query(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM challenges WHERE is_published = true';
      const countParams = [];
      let countParamIndex = 1;

      if (difficulty) {
        countQuery += ` AND difficulty = $${countParamIndex}`;
        countParams.push(difficulty);
        countParamIndex++;
      }

      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return NextResponse.json({
        success: true,
        data: {
          challenges: result.rows,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Challenges API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const challengeData = await request.json();
    const client = await getClient();

    try {
      const result = await client.query(`
        INSERT INTO challenges (
          title, slug, description, difficulty, category, points,
          database_schema, expected_output, solution_query, hints,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        challengeData.title,
        challengeData.slug,
        challengeData.description,
        challengeData.difficulty,
        challengeData.category,
        challengeData.points || 10,
        JSON.stringify(challengeData.database_schema),
        JSON.stringify(challengeData.expected_output),
        challengeData.solution_query,
        challengeData.hints || [],
        user.id
      ]);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create challenge error:', error);
    
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'A challenge with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
