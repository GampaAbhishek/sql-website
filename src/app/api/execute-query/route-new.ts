import { NextRequest, NextResponse } from 'next/server';
import { getClient, saveQuery } from '@/lib/database';
import { verifyAuth, getOptionalAuth } from '@/lib/auth';
import { queryExecutor } from '@/lib/queryExecutor';

export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    const { sessionId, query, challengeId, lessonId } = await request.json();
    
    // Get user from auth (optional for playground mode)
    const user = await getOptionalAuth(request);
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session exists
    const sessionResult = await client.query(
      'SELECT * FROM playground_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];
    const startTime = Date.now();
    
    try {
      // Execute the query using the sandbox database schema
      const result = await queryExecutor.executeInSandbox(query, session.database_schema);
      const executionTime = Date.now() - startTime;
      
      // Save query execution to database
      if (user) {
        await saveQuery(user.id, sessionId, {
          query_text: query,
          result: result,
          status: 'success',
          execution_time_ms: executionTime
        });
      }

      // If this is a challenge, check if the result matches expected output
      let isCorrect = false;
      let feedback = '';
      
      if (challengeId) {
        const challengeResult = await client.query(
          'SELECT expected_output, solution_query FROM challenges WHERE id = $1',
          [challengeId]
        );
        
        if (challengeResult.rows.length > 0) {
          const challenge = challengeResult.rows[0];
          isCorrect = compareQueryResults(result, challenge.expected_output);
          
          if (isCorrect && user) {
            // Update user challenge progress
            await client.query(`
              INSERT INTO user_challenges (user_id, challenge_id, status, score, submitted_query, submission_result, solved_at)
              VALUES ($1, $2, 'solved', $3, $4, $5, NOW())
              ON CONFLICT (user_id, challenge_id)
              DO UPDATE SET 
                status = 'solved',
                score = GREATEST(user_challenges.score, $3),
                submitted_query = $4,
                submission_result = $5,
                solved_at = CASE WHEN user_challenges.status != 'solved' THEN NOW() ELSE user_challenges.solved_at END
            `, [user.id, challengeId, 100, query, JSON.stringify(result)]);
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          columns: result.columns || [],
          rows: result.rows || [],
          rowCount: result.rows ? result.rows.length : 0,
          executionTime,
          isCorrect,
          feedback
        }
      });
      
    } catch (queryError: any) {
      const executionTime = Date.now() - startTime;
      
      // Save failed query execution
      if (user) {
        await saveQuery(user.id, sessionId, {
          query_text: query,
          status: 'error',
          execution_time_ms: executionTime,
          error_message: queryError.message
        });
      }
      
      return NextResponse.json({
        success: false,
        error: queryError.message || 'Query execution failed',
        data: {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime
        }
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Execute query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Helper function to compare query results
function compareQueryResults(actual: any, expected: any): boolean {
  try {
    if (typeof expected === 'string') {
      expected = JSON.parse(expected);
    }
    
    // Compare column names
    if (!arraysEqual(actual.columns, expected.columns)) {
      return false;
    }
    
    // Compare row count
    if (actual.rows.length !== expected.rows.length) {
      return false;
    }
    
    // Compare each row
    for (let i = 0; i < actual.rows.length; i++) {
      if (!arraysEqual(actual.rows[i], expected.rows[i])) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
