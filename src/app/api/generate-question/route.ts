import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import { generateSQLQuestion } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { topicName } = await request.json();
    
    if (!topicName) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      );
    }
    
    // Generate question using OpenAI
    const generatedQuestion = await generateSQLQuestion(topicName);
    
    const connection = await getConnection();
    
    // First, check if topic exists or create it
    let [topicRows] = await connection.execute(
      'SELECT id FROM topics WHERE name = ?',
      [topicName]
    ) as [any[], any];
    
    let topicId;
    if (topicRows.length === 0) {
      // Create new topic
      const [result] = await connection.execute(
        'INSERT INTO topics (name, description) VALUES (?, ?)',
        [topicName, `Auto-generated topic for ${topicName}`]
      ) as [any, any];
      topicId = result.insertId;
    } else {
      topicId = topicRows[0].id;
    }
    
    // Insert the generated question
    const [questionResult] = await connection.execute(
      'INSERT INTO questions (topic_id, title, description, difficulty, expected_query, schema_setup, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        topicId,
        generatedQuestion.title,
        generatedQuestion.description,
        generatedQuestion.difficulty,
        generatedQuestion.expectedQuery,
        generatedQuestion.schemaSetup,
        JSON.stringify(generatedQuestion.testCases)
      ]
    ) as [any, any];
    
    return NextResponse.json({
      id: questionResult.insertId,
      ...generatedQuestion,
      topicId,
      message: 'Question generated and saved successfully'
    });
  } catch (error: any) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate question' },
      { status: 500 }
    );
  }
}
