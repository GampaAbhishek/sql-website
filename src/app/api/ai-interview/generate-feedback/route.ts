import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  question: {
    id: string;
    type: string;
    question: string;
    title: string;
  };
  userQuery: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
}

async function callAI(prompt: string, maxTokens: number = 300): Promise<string> {
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

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { question, userQuery, isCorrect, timeSpent, hintsUsed } = body;

    if (!question || userQuery === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const prompt = `As an AI SQL interviewer, provide constructive feedback for this user's attempt:

    Question: ${question.question}
    User's Query: ${userQuery}
    Correct: ${isCorrect}
    Time Spent: ${timeSpent} seconds
    Hints Used: ${hintsUsed}

    Rules:
    - Never provide the complete solution
    - Give constructive guidance
    - Be encouraging but professional
    - Point out specific issues if incorrect
    - Praise good practices if correct

    Respond in JSON format:
    {
      "type": "correct|syntax_error|logic_error|optimization_needed",
      "message": "Main feedback message",
      "hint": "Next step hint if needed",
      "praise": "Positive reinforcement if applicable",
      "nextSteps": "What to focus on next"
    }`;

    try {
      const content = await callAI(prompt, 300);
      if (!content) throw new Error('No feedback content');

      // Extract JSON from response
      let jsonContent = content;
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }

      const parsed = JSON.parse(jsonContent);
      const feedback = {
        type: parsed.type,
        message: parsed.message,
        hint: parsed.hint,
        praise: parsed.praise,
        nextSteps: parsed.nextSteps
      };

      return NextResponse.json(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      // Fallback feedback
      const fallbackFeedback = {
        type: isCorrect ? 'correct' : 'logic_error',
        message: isCorrect 
          ? "Good work! Your solution is correct." 
          : "There seems to be an issue with your query. Review the requirements and try again.",
        hint: isCorrect ? undefined : "Check your WHERE clause and JOIN conditions."
      };

      return NextResponse.json(fallbackFeedback);
    }
  } catch (error) {
    console.error('Error processing feedback request:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
