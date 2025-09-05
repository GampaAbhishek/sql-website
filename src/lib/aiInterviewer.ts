// Using the existing OpenAI integration pattern

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

export interface AIInterviewQuestion {
  id: string;
  type: 'practical' | 'debugging' | 'optimization' | 'conceptual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  question: string;
  schema?: string;
  brokenQuery?: string; // For debugging questions
  expectedOutput?: any[];
  hints: string[];
  category: string;
  timeLimit: number; // in minutes
  points: number;
}

export interface AIFeedback {
  type: 'syntax_error' | 'logic_error' | 'correct' | 'optimization_needed' | 'conceptual_feedback';
  message: string;
  hint?: string;
  praise?: string;
  nextSteps?: string;
}

export interface InterviewSession {
  sessionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  totalTimeLimit: number; // in minutes
  currentQuestionIndex: number;
  questions: AIInterviewQuestion[];
  responses: InterviewResponse[];
  startTime: Date;
  aiPersonality: string;
  adaptiveMode: boolean;
}

export interface InterviewResponse {
  questionId: string;
  userQuery: string;
  timeSpent: number;
  hintsUsed: number;
  isCorrect: boolean;
  score: number;
  aiFeedback: AIFeedback;
  efficiency: 'poor' | 'average' | 'good' | 'excellent';
}

export interface InterviewScorecard {
  overallScore: number;
  accuracy: number;
  avgTimePerQuestion: number;
  efficiency: number;
  hintsUsedPenalty: number;
  strongAreas: string[];
  weakAreas: string[];
  aiRecommendations: string[];
  badges: string[];
  nextTopics: string[];
}

class AIInterviewer {
  private sessionData: InterviewSession | null = null;

  async initializeSession(
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed',
    mode: 'timed' | 'practice'
  ): Promise<InterviewSession> {
    const sessionId = `interview_${Date.now()}`;
    const totalTimeLimit = mode === 'timed' ? 20 : 0; // 0 means unlimited for practice
    
    // Generate AI interviewer greeting and personality
    const aiPersonality = await this.generateInterviewerPersonality();
    
    // Generate initial questions based on difficulty
    const questions = await this.generateQuestions(difficulty);
    
    this.sessionData = {
      sessionId,
      difficulty,
      mode,
      totalTimeLimit,
      currentQuestionIndex: 0,
      questions,
      responses: [],
      startTime: new Date(),
      aiPersonality,
      adaptiveMode: true
    };

    return this.sessionData;
  }

  async generateInterviewerPersonality(): Promise<string> {
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

  async generateQuestions(difficulty: string): Promise<AIInterviewQuestion[]> {
    const questionTypes: AIInterviewQuestion['type'][] = ['practical', 'debugging', 'optimization', 'conceptual'];
    const questions: AIInterviewQuestion[] = [];

    for (let i = 0; i < 5; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const questionDifficulty = difficulty === 'mixed' 
        ? (['beginner', 'intermediate', 'advanced'] as const)[Math.min(i, 2)]
        : difficulty as 'beginner' | 'intermediate' | 'advanced';

      const question = await this.generateSingleQuestion(questionType, questionDifficulty, i + 1);
      questions.push(question);
    }

    return questions;
  }

  async generateSingleQuestion(
    type: AIInterviewQuestion['type'],
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    questionNumber: number
  ): Promise<AIInterviewQuestion> {
    const prompt = this.buildQuestionPrompt(type, difficulty, questionNumber);

    try {
      const content = await callAI(prompt, 800);
      if (!content) throw new Error('No content received');

      return this.parseQuestionResponse(content, type, difficulty, questionNumber);
    } catch (error) {
      console.error('Error generating question:', error);
      return this.getFallbackQuestion(type, difficulty, questionNumber);
    }
  }

  private buildQuestionPrompt(type: string, difficulty: string, questionNumber: number): string {
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

  private parseQuestionResponse(
    content: string,
    type: AIInterviewQuestion['type'],
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    questionNumber: number
  ): AIInterviewQuestion {
    try {
      const parsed = JSON.parse(content);
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
      return this.getFallbackQuestion(type, difficulty, questionNumber);
    }
  }

  private getFallbackQuestion(
    type: AIInterviewQuestion['type'],
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    questionNumber: number
  ): AIInterviewQuestion {
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

  async generateFeedback(
    question: AIInterviewQuestion,
    userQuery: string,
    isCorrect: boolean,
    timeSpent: number,
    hintsUsed: number
  ): Promise<AIFeedback> {
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
      return {
        type: parsed.type,
        message: parsed.message,
        hint: parsed.hint,
        praise: parsed.praise,
        nextSteps: parsed.nextSteps
      };
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        type: isCorrect ? 'correct' : 'logic_error',
        message: isCorrect 
          ? "Good work! Your solution is correct." 
          : "There seems to be an issue with your query. Review the requirements and try again.",
        hint: isCorrect ? undefined : "Check your WHERE clause and JOIN conditions."
      };
    }
  }

  async adaptNextQuestion(currentPerformance: InterviewResponse[]): Promise<AIInterviewQuestion | null> {
    if (!this.sessionData || currentPerformance.length === 0) return null;

    const lastResponse = currentPerformance[currentPerformance.length - 1];
    const overallAccuracy = currentPerformance.reduce((sum, r) => sum + (r.isCorrect ? 1 : 0), 0) / currentPerformance.length;

    // Adaptive logic
    let nextDifficulty: 'beginner' | 'intermediate' | 'advanced';
    
    if (overallAccuracy >= 0.8 && lastResponse.timeSpent < 120) { // 2 minutes
      nextDifficulty = 'advanced';
    } else if (overallAccuracy >= 0.6) {
      nextDifficulty = 'intermediate';
    } else {
      nextDifficulty = 'beginner';
    }

    // Generate adapted question
    const questionType: AIInterviewQuestion['type'] = ['practical', 'debugging', 'optimization', 'conceptual'][
      currentPerformance.length % 4
    ] as AIInterviewQuestion['type'];

    return await this.generateSingleQuestion(questionType, nextDifficulty, currentPerformance.length + 1);
  }

  generateScorecard(session: InterviewSession): InterviewScorecard {
    const responses = session.responses;
    const totalQuestions = responses.length;
    
    if (totalQuestions === 0) {
      return {
        overallScore: 0,
        accuracy: 0,
        avgTimePerQuestion: 0,
        efficiency: 0,
        hintsUsedPenalty: 0,
        strongAreas: [],
        weakAreas: [],
        aiRecommendations: [],
        badges: [],
        nextTopics: []
      };
    }

    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    const totalTime = responses.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTimePerQuestion = totalTime / totalQuestions;
    
    const totalHints = responses.reduce((sum, r) => sum + r.hintsUsed, 0);
    const hintsUsedPenalty = Math.min(totalHints * 5, 25); // Max 25 point penalty
    
    const efficiencyScores = responses.map(r => {
      switch(r.efficiency) {
        case 'excellent': return 100;
        case 'good': return 80;
        case 'average': return 60;
        case 'poor': return 30;
        default: return 50;
      }
    });
    const efficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
    
    const rawScore = (accuracy * 0.4) + (efficiency * 0.3) + (Math.max(0, 100 - avgTimePerQuestion) * 0.3);
    const overallScore = Math.max(0, rawScore - hintsUsedPenalty);

    // Determine strong/weak areas
    const categoryPerformance = this.analyzeCategoryPerformance(responses);
    const strongAreas = Object.entries(categoryPerformance)
      .filter(([, score]) => score >= 80)
      .map(([category]) => category);
    const weakAreas = Object.entries(categoryPerformance)
      .filter(([, score]) => score < 60)
      .map(([category]) => category);

    // Generate badges
    const badges = this.generateBadges(responses, avgTimePerQuestion, accuracy);

    // AI recommendations
    const aiRecommendations = this.generateRecommendations(weakAreas, overallScore);

    return {
      overallScore: Math.round(overallScore),
      accuracy: Math.round(accuracy),
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      efficiency: Math.round(efficiency),
      hintsUsedPenalty,
      strongAreas,
      weakAreas,
      aiRecommendations,
      badges,
      nextTopics: weakAreas.length > 0 ? weakAreas : ['Advanced SQL Patterns', 'Performance Optimization']
    };
  }

  private analyzeCategoryPerformance(responses: InterviewResponse[]): Record<string, number> {
    const categoryScores: Record<string, number[]> = {};
    
    responses.forEach(response => {
      // This would need to be enhanced to track question categories
      const category = 'SQL Queries'; // Simplified for now
      if (!categoryScores[category]) {
        categoryScores[category] = [];
      }
      categoryScores[category].push(response.score);
    });

    const categoryAverages: Record<string, number> = {};
    Object.entries(categoryScores).forEach(([category, scores]) => {
      categoryAverages[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return categoryAverages;
  }

  private generateBadges(responses: InterviewResponse[], avgTime: number, accuracy: number): string[] {
    const badges: string[] = [];

    if (responses.length > 0) badges.push("First Mock Interview");
    if (avgTime < 60) badges.push("Speed Coder");
    if (accuracy >= 90) badges.push("SQL Master");
    if (responses.some(r => r.efficiency === 'excellent')) badges.push("Optimizer");
    if (responses.every(r => r.hintsUsed === 0)) badges.push("Independent Solver");

    return badges;
  }

  private generateRecommendations(weakAreas: string[], overallScore: number): string[] {
    const recommendations: string[] = [];

    if (overallScore < 50) {
      recommendations.push("Focus on SQL fundamentals - practice basic SELECT, WHERE, and JOIN operations");
    } else if (overallScore < 70) {
      recommendations.push("Work on intermediate concepts like subqueries and aggregate functions");
    } else {
      recommendations.push("Challenge yourself with advanced topics like window functions and CTEs");
    }

    if (weakAreas.length > 0) {
      recommendations.push(`Prioritize practice in: ${weakAreas.join(', ')}`);
    }

    recommendations.push("Take mock interviews regularly to build confidence");

    return recommendations;
  }
}

export const aiInterviewer = new AIInterviewer();
