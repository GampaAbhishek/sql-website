// AI Service for SQL Practice Hub - Comprehensive AI Integration
// Provides personalized learning, content generation, and intelligent assistance

interface AIUser {
  id: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learning_style: string;
  weak_areas: string[];
  preferences: any;
  activity_history: any[];
}

interface AIGeneratedContent {
  type: 'challenge' | 'lesson' | 'interview_question' | 'hint' | 'explanation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: any;
  metadata: {
    topics: string[];
    estimated_time: number;
    learning_objectives: string[];
  };
}

async function callAI(prompt: string, maxTokens: number = 1000, temperature: number = 0.7): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('AI API key is not configured');
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
        { 
          role: 'system', 
          content: 'You are an expert SQL tutor and educational content creator. You provide personalized, pedagogically sound guidance. Always respond with valid JSON when requested, and explain concepts clearly for different skill levels.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI API');
  }

  return content;
}

// ===========================================
// PERSONALIZED LEARNING ENGINE
// ===========================================

export class AILearningEngine {
  
  // Generate personalized learning roadmap
  async generatePersonalizedRoadmap(user: AIUser): Promise<any> {
    const prompt = `
    Generate a personalized SQL learning roadmap for a user with the following profile:
    
    Skill Level: ${user.skill_level}
    Learning Style: ${user.learning_style}
    Weak Areas: ${user.weak_areas.join(', ')}
    Recent Activity: ${JSON.stringify(user.activity_history.slice(-5))}
    
    Create a structured roadmap with:
    1. Next 5 recommended lessons/topics
    2. Difficulty progression
    3. Estimated time for each step
    4. Why each step is recommended
    5. Specific focus areas based on weaknesses
    
    Respond in JSON format:
    {
      "roadmap": [
        {
          "step": 1,
          "topic": "Topic Name",
          "difficulty": "beginner/intermediate/advanced",
          "estimated_hours": 2,
          "description": "What they'll learn",
          "reason": "Why this is recommended now",
          "focus_areas": ["specific", "skills"],
          "prerequisites": ["previous", "topics"],
          "success_criteria": "How to know they've mastered it"
        }
      ],
      "overall_strategy": "Learning strategy explanation",
      "motivation_message": "Encouraging message for the user"
    }`;

    try {
      const response = await callAI(prompt, 1500, 0.8);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return this.getFallbackRoadmap(user.skill_level);
    }
  }

  // Analyze user progress and provide insights
  async analyzeProgress(user: AIUser, recentActivity: any[]): Promise<any> {
    const prompt = `
    Analyze this user's SQL learning progress and provide insights:
    
    User Profile:
    - Skill Level: ${user.skill_level}
    - Weak Areas: ${user.weak_areas.join(', ')}
    
    Recent Activity (last 10 sessions):
    ${JSON.stringify(recentActivity)}
    
    Provide analysis on:
    1. Learning velocity and consistency
    2. Improvement trends in weak areas
    3. New strengths emerging
    4. Recommended adjustments to study plan
    5. Motivational insights
    
    Respond in JSON format:
    {
      "progress_score": 85,
      "learning_velocity": "steady/accelerating/slowing",
      "strengths": ["areas where user excels"],
      "improvements": ["areas showing progress"],
      "concerns": ["areas needing attention"],
      "recommendations": ["specific actions to take"],
      "motivation_message": "Personalized encouragement",
      "next_milestone": "What to work toward next"
    }`;

    try {
      const response = await callAI(prompt, 1200, 0.7);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return this.getFallbackAnalysis();
    }
  }

  // Generate adaptive practice problems
  async generateAdaptivePractice(user: AIUser, topicFocus?: string): Promise<AIGeneratedContent> {
    const focus = topicFocus || user.weak_areas[0] || 'SELECT operations';
    
    const prompt = `
    Generate a SQL practice problem tailored for:
    
    User Skill Level: ${user.skill_level}
    Focus Topic: ${focus}
    Learning Style: ${user.learning_style}
    
    Create a problem that:
    1. Targets their skill level appropriately
    2. Focuses on the specified topic
    3. Includes realistic business context
    4. Has clear learning objectives
    5. Provides progressive hints
    
    Respond in JSON format:
    {
      "title": "Problem Title",
      "business_context": "Real-world scenario",
      "problem_statement": "What the user needs to solve",
      "schema": "CREATE TABLE statements with sample data",
      "expected_query": "Correct SQL solution",
      "expected_output": "Sample result set",
      "difficulty_level": "beginner/intermediate/advanced",
      "topics": ["main", "topics", "covered"],
      "learning_objectives": ["what user will learn"],
      "hints": [
        "First hint (conceptual)",
        "Second hint (structural)",
        "Third hint (specific)"
      ],
      "explanation": "Why this solution works",
      "variations": ["Ways to extend this problem"],
      "estimated_time_minutes": 15
    }`;

    try {
      const response = await callAI(prompt, 1500, 0.8);
      const content = this.parseJSONResponse(response);
      
      return {
        type: 'challenge',
        difficulty: user.skill_level === 'expert' ? 'advanced' : user.skill_level,
        content,
        metadata: {
          topics: content.topics || [focus],
          estimated_time: content.estimated_time_minutes || 15,
          learning_objectives: content.learning_objectives || []
        }
      };
    } catch (error) {
      console.error('Error generating practice:', error);
      return this.getFallbackPractice(user.skill_level, focus);
    }
  }

  private parseJSONResponse(response: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      let jsonContent = response;
      if (response.includes('```json')) {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private getFallbackRoadmap(skillLevel: string): any {
    const fallbackRoadmaps = {
      beginner: {
        roadmap: [
          {
            step: 1,
            topic: "SELECT Fundamentals",
            difficulty: "beginner",
            estimated_hours: 2,
            description: "Master basic data retrieval",
            reason: "Foundation for all SQL operations",
            focus_areas: ["column selection", "basic filtering"],
            prerequisites: [],
            success_criteria: "Can write SELECT statements confidently"
          }
        ],
        overall_strategy: "Build solid foundations before advancing",
        motivation_message: "Every expert was once a beginner. You're making great progress!"
      }
    };
    
    return fallbackRoadmaps[skillLevel as keyof typeof fallbackRoadmaps] || fallbackRoadmaps.beginner;
  }

  private getFallbackAnalysis(): any {
    return {
      progress_score: 75,
      learning_velocity: "steady",
      strengths: ["Basic SELECT operations"],
      improvements: ["Query structure"],
      concerns: ["Complex JOINs need practice"],
      recommendations: ["Practice JOIN operations daily"],
      motivation_message: "You're making consistent progress. Keep up the great work!",
      next_milestone: "Master INNER and LEFT JOINs"
    };
  }

  private getFallbackPractice(skillLevel: string, topic: string): AIGeneratedContent {
    return {
      type: 'challenge',
      difficulty: skillLevel as any,
      content: {
        title: "Practice Challenge",
        business_context: "Employee database analysis",
        problem_statement: `Write a query to analyze ${topic} in our employee database`,
        schema: "CREATE TABLE employees (id INT, name VARCHAR(100), department VARCHAR(50), salary DECIMAL(10,2));",
        expected_query: "SELECT * FROM employees;",
        topics: [topic],
        learning_objectives: [`Practice ${topic} operations`],
        hints: ["Think about the main clause", "Consider your WHERE conditions", "Check your syntax"],
        estimated_time_minutes: 10
      },
      metadata: {
        topics: [topic],
        estimated_time: 10,
        learning_objectives: [`Practice ${topic} operations`]
      }
    };
  }
}

// ===========================================
// AI ASSISTANT FOR REAL-TIME HELP
// ===========================================

export class AIAssistant {
  
  // Explain SQL errors in plain English
  async explainError(sqlQuery: string, errorMessage: string, userLevel: string): Promise<string> {
    const prompt = `
    A ${userLevel} SQL learner wrote this query:
    \`\`\`sql
    ${sqlQuery}
    \`\`\`
    
    They got this error:
    "${errorMessage}"
    
    Explain the error in simple, encouraging language:
    1. What went wrong (in plain English)
    2. Why it happened
    3. How to fix it
    4. A corrected version of their query
    5. A tip to avoid this error in the future
    
    Be encouraging and educational, not discouraging.`;

    try {
      const response = await callAI(prompt, 800, 0.7);
      return response;
    } catch (error) {
      console.error('Error explaining error:', error);
      return "It looks like there's a syntax issue with your query. Try checking your spelling and making sure all clauses are in the right order: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY.";
    }
  }

  // Convert natural language to SQL
  async naturalLanguageToSQL(naturalQuery: string, schema: string, userLevel: string): Promise<any> {
    const prompt = `
    Convert this natural language request to SQL for a ${userLevel} learner:
    
    Request: "${naturalQuery}"
    
    Available schema:
    ${schema}
    
    Provide:
    1. The SQL query
    2. Step-by-step explanation
    3. Why each part is needed
    4. Alternative approaches they could consider
    
    Respond in JSON format:
    {
      "sql_query": "SELECT ...",
      "explanation": "Step by step breakdown",
      "learning_points": ["key concepts used"],
      "alternatives": ["other ways to solve this"],
      "difficulty_notes": "Why this query is at their level"
    }`;

    try {
      const response = await callAI(prompt, 1000, 0.6);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error converting natural language:', error);
      return {
        sql_query: "-- Unable to generate query automatically",
        explanation: "I couldn't convert that to SQL automatically. Try breaking down your request into smaller parts.",
        learning_points: ["Query structure", "Clause order"],
        alternatives: [],
        difficulty_notes: "This might be a complex request."
      };
    }
  }

  // Provide contextual hints without giving away the answer
  async provideHint(sqlQuery: string, problemStatement: string, userLevel: string, hintLevel: number = 1): Promise<string> {
    const prompt = `
    A ${userLevel} learner is working on this problem:
    "${problemStatement}"
    
    Their current query attempt:
    \`\`\`sql
    ${sqlQuery}
    \`\`\`
    
    Provide a helpful hint (level ${hintLevel}/3):
    - Level 1: Conceptual guidance
    - Level 2: Structural suggestions  
    - Level 3: Specific syntax help
    
    Don't give away the complete answer. Guide them to discover it themselves.
    Be encouraging and focus on the learning process.`;

    try {
      const response = await callAI(prompt, 500, 0.8);
      return response;
    } catch (error) {
      console.error('Error providing hint:', error);
      const fallbackHints = [
        "Think about what data you need to retrieve and which tables contain that information.",
        "Consider the structure: SELECT (what) FROM (where) WHERE (conditions).",
        "Check your syntax - are all keywords spelled correctly and in the right order?"
      ];
      return fallbackHints[Math.min(hintLevel - 1, fallbackHints.length - 1)];
    }
  }

  // Suggest next learning activity
  async suggestNextActivity(user: AIUser, currentContext: string): Promise<any> {
    const prompt = `
    Based on this user's profile and current context, suggest their next learning activity:
    
    User Profile:
    - Skill Level: ${user.skill_level}
    - Weak Areas: ${user.weak_areas.join(', ')}
    - Learning Style: ${user.learning_style}
    
    Current Context: ${currentContext}
    
    Suggest:
    1. What they should do next
    2. Why this activity is recommended
    3. Expected time commitment
    4. How it fits their learning goals
    
    Respond in JSON format:
    {
      "activity_type": "challenge/lesson/practice/review",
      "specific_topic": "Specific topic or skill",
      "title": "Activity title",
      "description": "What they'll do",
      "reason": "Why this is recommended now",
      "estimated_time": "15 minutes",
      "difficulty": "beginner/intermediate/advanced",
      "motivation": "Encouraging message"
    }`;

    try {
      const response = await callAI(prompt, 800, 0.8);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error suggesting activity:', error);
      return {
        activity_type: "practice",
        specific_topic: "SQL fundamentals",
        title: "Quick Practice Session",
        description: "Try a few practice problems to reinforce your learning",
        reason: "Regular practice helps solidify concepts",
        estimated_time: "15 minutes",
        difficulty: user.skill_level,
        motivation: "Keep building on your progress!"
      };
    }
  }

  private parseJSONResponse(response: string): any {
    try {
      let jsonContent = response;
      if (response.includes('```json')) {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

// ===========================================
// AI CONTENT GENERATOR
// ===========================================

export class AIContentGenerator {
  
  // Generate database scenarios for playground
  async generateDatabaseScenario(topic: string, difficulty: string, userPreferences: any): Promise<any> {
    const prompt = `
    Generate a realistic database scenario for SQL practice:
    
    Topic Focus: ${topic}
    Difficulty: ${difficulty}
    User Preferences: ${JSON.stringify(userPreferences)}
    
    Create:
    1. Business context (company/domain)
    2. 3-5 related tables with realistic data
    3. Relationships between tables
    4. Sample queries to explore
    5. Interesting questions to investigate
    
    Respond in JSON format:
    {
      "scenario_name": "E-commerce Analytics",
      "business_context": "Online store database",
      "description": "Full scenario description",
      "tables": [
        {
          "name": "customers",
          "schema": "CREATE TABLE statement",
          "sample_data": "INSERT statements",
          "description": "What this table represents"
        }
      ],
      "relationships": "How tables connect",
      "sample_queries": [
        {
          "question": "Business question",
          "sql": "SELECT statement",
          "explanation": "What this query shows"
        }
      ],
      "exploration_ideas": ["Questions users can investigate"]
    }`;

    try {
      const response = await callAI(prompt, 2000, 0.8);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error generating database scenario:', error);
      return this.getFallbackScenario(topic);
    }
  }

  // Generate interview questions with evaluation criteria
  async generateInterviewQuestion(difficulty: string, topic: string, questionType: string): Promise<any> {
    const prompt = `
    Generate a SQL interview question:
    
    Difficulty: ${difficulty}
    Topic: ${topic}
    Type: ${questionType} (practical/debugging/optimization/conceptual)
    
    Create:
    1. Clear business scenario
    2. Required database schema
    3. Detailed question
    4. Expected solution approach
    5. Evaluation criteria
    6. Common mistakes to watch for
    
    Respond in JSON format:
    {
      "question_title": "Descriptive title",
      "business_scenario": "Realistic context",
      "schema": "CREATE TABLE statements",
      "question": "What the candidate should solve",
      "sample_data": "INSERT statements for testing",
      "expected_approach": "How to think about the solution",
      "sample_solution": "One correct solution",
      "evaluation_criteria": {
        "correctness": "How to judge if answer is right",
        "efficiency": "Performance considerations",
        "style": "Code quality aspects"
      },
      "common_mistakes": ["typical errors candidates make"],
      "follow_up_questions": ["additional questions to ask"],
      "difficulty_justification": "Why this is at the specified level"
    }`;

    try {
      const response = await callAI(prompt, 1800, 0.7);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('Error generating interview question:', error);
      return this.getFallbackInterviewQuestion(difficulty, topic);
    }
  }

  private parseJSONResponse(response: string): any {
    try {
      let jsonContent = response;
      if (response.includes('```json')) {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private getFallbackScenario(topic: string): any {
    return {
      scenario_name: "Simple Practice Database",
      business_context: "Basic business scenario for practicing " + topic,
      description: "A simple database to practice SQL fundamentals",
      tables: [
        {
          name: "employees",
          schema: "CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), department VARCHAR(50), salary DECIMAL(10,2));",
          sample_data: "INSERT INTO employees VALUES (1, 'John Doe', 'Engineering', 75000), (2, 'Jane Smith', 'Marketing', 65000);",
          description: "Employee information"
        }
      ],
      relationships: "Simple table structure",
      sample_queries: [
        {
          question: "Find all employees",
          sql: "SELECT * FROM employees;",
          explanation: "Basic data retrieval"
        }
      ],
      exploration_ideas: ["Try different WHERE conditions", "Practice sorting with ORDER BY"]
    };
  }

  private getFallbackInterviewQuestion(difficulty: string, topic: string): any {
    return {
      question_title: `${difficulty} ${topic} Challenge`,
      business_scenario: "Database analysis scenario",
      schema: "CREATE TABLE employees (id INT, name VARCHAR(100), department VARCHAR(50));",
      question: `Write a query to demonstrate ${topic} usage`,
      sample_data: "INSERT INTO employees VALUES (1, 'John', 'IT');",
      expected_approach: "Use appropriate SQL syntax",
      sample_solution: "SELECT * FROM employees;",
      evaluation_criteria: {
        correctness: "Query returns expected results",
        efficiency: "Reasonable performance",
        style: "Clean, readable code"
      },
      common_mistakes: ["Syntax errors", "Logic mistakes"],
      follow_up_questions: ["Can you optimize this?"],
      difficulty_justification: `Appropriate for ${difficulty} level`
    };
  }
}

// ===========================================
// EXPORT INSTANCES
// ===========================================

export const aiLearningEngine = new AILearningEngine();
export const aiAssistant = new AIAssistant();
export const aiContentGenerator = new AIContentGenerator();
