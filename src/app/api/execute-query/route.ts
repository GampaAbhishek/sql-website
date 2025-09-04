import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import { queryExecutor } from '@/lib/queryExecutor';

export async function POST(request: NextRequest) {
  try {
    const { questionId, userQuery } = await request.json();
    
    if (!questionId || !userQuery) {
      return NextResponse.json(
        { error: 'Question ID and user query are required' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    // Get question details
    const [questionRows] = await connection.execute(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    ) as [any[], any];
    
    if (questionRows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    const question = questionRows[0];
    
    // Execute the user's query in a sandboxed environment
    const validation = await queryExecutor.executeInSandbox(
      userQuery,
      question.schema_setup,
      question.expected_query
    );
    
    // Save the submission
    await connection.execute(
      'INSERT INTO user_submissions (question_id, user_query, result, is_correct, execution_time) VALUES (?, ?, ?, ?, ?)',
      [
        questionId,
        userQuery,
        JSON.stringify(validation.result),
        validation.isCorrect,
        validation.executionTime
      ]
    );
    
    // Parse test_cases safely - it might already be an object or a JSON string
    let testCases = [];
    try {
      if (question.test_cases) {
        if (typeof question.test_cases === 'string') {
          testCases = JSON.parse(question.test_cases);
        } else {
          testCases = question.test_cases;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse test_cases:', parseError);
      testCases = [];
    }
    
    return NextResponse.json({
      isCorrect: validation.isCorrect,
      result: validation.result,
      error: validation.error,
      executionTime: validation.executionTime,
      expectedQuery: question.expected_query,
      expectedResult: validation.expectedResult,
      testCases: testCases
    });
  } catch (error: any) {
    console.error('Error executing query:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute query' },
      { status: 500 }
    );
  }
}
