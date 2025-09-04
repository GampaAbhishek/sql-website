import fetch from 'node-fetch';

export interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedQuery: string;
  schemaSetup: string;
  testCases: Array<{
    input: string;
    expectedRows?: number;
    expectedColumns?: string[];
    description?: string;
  }>;
}

export async function generateSQLQuestion(topic: string): Promise<GeneratedQuestion> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Perplexity API key is not configured');
  }

  const prompt = `
    Generate a SQL practice question for the topic: "${topic}"
    
    Please provide a response in the following JSON format:
    {
      "title": "Clear, concise title for the question",
      "description": "Detailed description of what the user needs to do",
      "difficulty": "easy" | "medium" | "hard",
      "expectedQuery": "The correct SQL query solution",
      "schemaSetup": "CREATE TABLE statements and INSERT statements to set up the test data",
      "testCases": [
        {
          "input": "example query to test",
          "expectedRows": number_of_expected_rows,
          "expectedColumns": ["column1", "column2"],
          "description": "what this test case validates"
        }
      ]
    }
    
    Guidelines:
    1. Make the question practical and realistic
    2. Include proper test data in schemaSetup
    3. Ensure the expectedQuery is syntactically correct
    4. Provide 2-3 test cases that validate different aspects
    5. Choose appropriate difficulty level
    6. Make sure the schema setup creates realistic sample data
    
    Topic: ${topic}
  `;

  try {
    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a SQL expert who creates educational practice questions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      })
    });

    if (!perplexityRes.ok) {
      throw new Error(`Perplexity API error: ${perplexityRes.status} ${await perplexityRes.text()}`);
    }
    const perplexityData = await perplexityRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = perplexityData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Perplexity API');
    }
    
    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
    }
    
    const question: GeneratedQuestion = JSON.parse(jsonContent);
    if (!question.title || !question.description || !question.expectedQuery || !question.schemaSetup) {
      throw new Error('Invalid question structure from Perplexity');
    }
    return question;
  } catch (error) {
    console.error('Error generating SQL question:', error);
    throw new Error('Failed to generate SQL question');
  }
}

export async function validateSQLQuery(
  userQuery: string,
  expectedQuery: string,
  schemaSetup: string
): Promise<{
  isCorrect: boolean;
  result: any[];
  error?: string;
  executionTime: number;
}> {
  // This function would typically connect to a sandboxed database
  // For now, we'll return a mock validation
  const startTime = Date.now();
  
  try {
    // In a real implementation, you would:
    // 1. Create a temporary database/schema
    // 2. Execute the schema setup
    // 3. Execute the user query
    // 4. Compare results with expected query
    // 5. Clean up the temporary database
    
    // Mock validation logic
    const executionTime = Date.now() - startTime;
    
    // Simple validation - in reality, you'd execute both queries and compare results
    const isCorrect = userQuery.toLowerCase().trim() === expectedQuery.toLowerCase().trim();
    
    return {
      isCorrect,
      result: [{ message: 'Mock result - implement actual query execution' }],
      executionTime: executionTime / 1000
    };
  } catch (error) {
    return {
      isCorrect: false,
      result: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: (Date.now() - startTime) / 1000
    };
  }
}
