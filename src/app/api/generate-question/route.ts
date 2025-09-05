import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/database';
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
    
    const client = await getClient();
    
    try {
      // First, check if topic exists or create it
      const topicRows = await client.query(
        'SELECT id FROM topics WHERE name = $1',
        [topicName]
      );
      
      let topicId;
      if (topicRows.rows.length === 0) {
        // Create new topic
        const result = await client.query(
          'INSERT INTO topics (name, description) VALUES ($1, $2) RETURNING id',
          [topicName, `Auto-generated topic for ${topicName}`]
        );
        topicId = result.rows[0].id;
      } else {
        topicId = topicRows.rows[0].id;
      }
      
      // Insert the generated question
      const questionResult = await client.query(
        'INSERT INTO questions (topic_id, title, description, difficulty, expected_query, schema_setup, test_cases) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
          topicId,
          generatedQuestion.title,
          generatedQuestion.description,
          generatedQuestion.difficulty,
          generatedQuestion.expectedQuery,
          generatedQuestion.schemaSetup,
          JSON.stringify(generatedQuestion.testCases)
        ]
      );
      
      return NextResponse.json({
        id: questionResult.rows[0].id,
        ...generatedQuestion,
        topicId,
        message: 'Question generated and saved successfully'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate question' },
      { status: 500 }
    );
  }
}
