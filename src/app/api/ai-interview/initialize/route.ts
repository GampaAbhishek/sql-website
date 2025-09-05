import { NextRequest, NextResponse } from 'next/server';

interface InitializeRequest {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
}

async function callAI(prompt: string, maxTokens: number = 800): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('API key is not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: 'You are an expert SQL interviewer AI. Always respond with valid JSON when requested.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from API');
  }

  return content;
}

async function generateInterviewerPersonality(): Promise<string> {
  const prompt = `Generate a professional AI interviewer personality for a SQL technical interview. 
  The interviewer should be:
  - Professional but encouraging
  - Strict about rules but supportive
  - Constructive in feedback
  - Never gives direct answers but provides guidance
  
  Return a brief personality description (2-3 sentences) that will guide the AI's responses.`;

  try {
    const content = await callAI(prompt, 150);
    return content || 
      "I'm your AI SQL interviewer. I'll guide you through 5 challenging questions with increasing difficulty. I'm here to help you succeed while maintaining professional interview standards.";
  } catch (error) {
    console.error('Error generating AI personality:', error);
    return "I'm your AI SQL interviewer. I'll guide you through 5 challenging questions with increasing difficulty. I'm here to help you succeed while maintaining professional interview standards.";
  }
}

async function generateSingleQuestion(
  type: 'practical' | 'debugging' | 'optimization' | 'conceptual',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionNumber: number
): Promise<any> {
  const prompt = buildQuestionPrompt(type, difficulty, questionNumber);

  try {
    const content = await callAI(prompt, 800);
    if (!content) throw new Error('No content received');

    return parseQuestionResponse(content, type, difficulty, questionNumber);
  } catch (error) {
    console.error('Error generating question:', error);
    return getFallbackQuestion(type, difficulty, questionNumber);
  }
}

function buildQuestionPrompt(type: string, difficulty: string, questionNumber: number): string {
  const basePrompt = `Generate a ${difficulty} level SQL interview question of type "${type}" (question ${questionNumber}/5).

  Requirements:
  - ${type === 'practical' ? 'Create a real-world scenario with proper schema and expected query' : ''}
  - ${type === 'debugging' ? 'Provide a broken SQL query that needs fixing' : ''}
  - ${type === 'optimization' ? 'Present an inefficient query that needs performance improvement' : ''}
  - ${type === 'conceptual' ? 'Ask about SQL concepts, best practices, or theory' : ''}
  - Include 3 progressive hints
  - Specify appropriate time limit (1-4 minutes)
  - Include point value (10-30 points based on difficulty)

  Format as JSON:
  {
    "title": "Question Title",
    "description": "Context description",
    "question": "The actual question",
    "schema": "SQL schema if needed",
    "brokenQuery": "Broken query if debugging type",
    "hints": ["hint1", "hint2", "hint3"],
    "category": "Question category",
    "timeLimit": 3,
    "points": 20
  }`;

  return basePrompt;
}

function parseQuestionResponse(
  content: string,
  type: 'practical' | 'debugging' | 'optimization' | 'conceptual',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionNumber: number
): any {
  try {
    // Extract JSON from response
    let jsonContent = content;
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
    }

    const parsed = JSON.parse(jsonContent);
    return {
      id: `ai_q_${questionNumber}`,
      type,
      difficulty,
      title: parsed.title,
      description: parsed.description,
      question: parsed.question,
      schema: parsed.schema,
      brokenQuery: parsed.brokenQuery,
      hints: parsed.hints || [],
      category: parsed.category,
      timeLimit: parsed.timeLimit || 3,
      points: parsed.points || 15
    };
  } catch (error) {
    return getFallbackQuestion(type, difficulty, questionNumber);
  }
}

function getFallbackQuestion(
  type: 'practical' | 'debugging' | 'optimization' | 'conceptual',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionNumber: number
): any {
  const fallbackQuestions = {
    practical: {
      beginner: {
        title: "Basic Employee Query",
        question: "Write a query to find all employees with salary greater than 50000.",
        schema: "CREATE TABLE employees (id INT, name VARCHAR(100), salary DECIMAL(10,2), department VARCHAR(50));"
      },
      intermediate: {
        title: "Customer Orders Analysis",
        question: "Find customers who have placed more than 3 orders in the last 6 months.",
        schema: "CREATE TABLE customers (id INT, name VARCHAR(100)); CREATE TABLE orders (id INT, customer_id INT, order_date DATE);"
      },
      advanced: {
        title: "Revenue Analysis with Window Functions",
        question: "Calculate running total of revenue by month with year-over-year comparison.",
        schema: "CREATE TABLE sales (id INT, sale_date DATE, amount DECIMAL(10,2), product_id INT);"
      }
    }
  };

  const questionData = fallbackQuestions.practical[difficulty];
  
  return {
    id: `fallback_q_${questionNumber}`,
    type,
    difficulty,
    title: questionData.title,
    description: "Fallback question due to generation error",
    question: questionData.question,
    schema: questionData.schema,
    hints: ["Think about the main clause needed", "Consider your WHERE conditions", "Check your syntax"],
    category: "SQL Queries",
    timeLimit: 3,
    points: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30
  };
}

async function generateQuestions(difficulty: string): Promise<any[]> {
  const questionTypes: ('practical' | 'debugging' | 'optimization' | 'conceptual')[] = ['practical', 'debugging', 'optimization', 'conceptual'];
  const questions: any[] = [];

  for (let i = 0; i < 5; i++) {
    const questionType = questionTypes[i % questionTypes.length];
    const questionDifficulty = difficulty === 'mixed' 
      ? (['beginner', 'intermediate', 'advanced'] as const)[Math.min(i, 2)]
      : difficulty as 'beginner' | 'intermediate' | 'advanced';

    const question = await generateSingleQuestion(questionType, questionDifficulty, i + 1);
    questions.push(question);
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializeRequest = await request.json();
    const { difficulty, mode } = body;

    // Generate AI interviewer personality
    const aiPersonality = await generateInterviewerPersonality();
    
    // Generate initial questions based on difficulty
    const questions = await generateQuestions(difficulty);
    
    const sessionData = {
      sessionId: `interview_${Date.now()}`,
      difficulty,
      mode,
      totalTimeLimit: mode === 'timed' ? 20 : 0, // 0 means unlimited for practice
      currentQuestionIndex: 0,
      questions,
      responses: [],
      startTime: new Date().toISOString(),
      aiPersonality,
      adaptiveMode: true
    };

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error initializing AI interview session:', error);
    return NextResponse.json(
      { error: 'Failed to initialize interview session' },
      { status: 500 }
    );
  }
}
