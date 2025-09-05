import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, learningGoals, currentSkillLevel, preferences } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Default user profile if not provided
    const userProfile = {
      id: userId,
      skill_level: currentSkillLevel || 'beginner',
      learning_style: preferences?.learningStyle || 'visual',
      weak_areas: preferences?.weakAreas || [],
      preferences: preferences || {},
      activity_history: []
    };

    // Generate personalized learning recommendations
    const personalizedContent = generatePersonalizedContent(userProfile, learningGoals);

    // Log the personalization activity
    try {
      console.log(`Generated personalized content for user ${userId} with skill level ${userProfile.skill_level}`);
    } catch (error) {
      console.warn('Could not log personalization activity:', error);
    }

    return NextResponse.json({
      success: true,
      personalizedContent,
      userProfile: {
        skillLevel: userProfile.skill_level,
        learningStyle: userProfile.learning_style,
        weakAreas: userProfile.weak_areas
      },
      recommendations: generateRecommendations(userProfile),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Personalization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for user learning analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate mock analytics (replace with real database queries)
    const analytics = generateUserAnalytics(userId, timeframe);
    const learningPath = generateLearningPath(analytics);

    return NextResponse.json({
      success: true,
      analytics,
      learningPath,
      insights: generateLearningInsights(analytics),
      nextSteps: generateNextSteps(analytics)
    });

  } catch (error: any) {
    console.error('User analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePersonalizedContent(userProfile: any, learningGoals?: string[]): any {
  const { skill_level, learning_style, weak_areas } = userProfile;

  const skillLevelContent = {
    beginner: {
      topics: ['Basic SELECT statements', 'Filtering with WHERE', 'Sorting with ORDER BY'],
      practiceQueries: [
        'SELECT * FROM employees;',
        'SELECT name, email FROM users WHERE active = true;',
        'SELECT * FROM products ORDER BY price ASC;'
      ],
      challenges: ['Basic Data Retrieval', 'Simple Filtering', 'Basic Sorting']
    },
    intermediate: {
      topics: ['JOINs', 'Aggregate Functions', 'Subqueries', 'GROUP BY and HAVING'],
      practiceQueries: [
        'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
        'SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 100;'
      ],
      challenges: ['Complex Joins', 'Aggregation Mastery', 'Subquery Optimization']
    },
    advanced: {
      topics: ['Window Functions', 'CTEs', 'Performance Optimization', 'Complex Subqueries'],
      practiceQueries: [
        'WITH ranked_sales AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) as rank FROM sales) SELECT * FROM ranked_sales WHERE rank <= 3;'
      ],
      challenges: ['Window Function Mastery', 'Query Performance Tuning', 'Advanced Analytics']
    }
  };

  const styleBasedContent = {
    visual: {
      format: 'diagram',
      emphasis: 'schema_visualization',
      tools: ['ER diagrams', 'Query visualization tools']
    },
    hands_on: {
      format: 'interactive',
      emphasis: 'practice_exercises',
      tools: ['Live query editor', 'Immediate feedback']
    },
    theoretical: {
      format: 'conceptual',
      emphasis: 'principles_and_theory',
      tools: ['Documentation', 'Conceptual explanations']
    }
  };

  const baseContent = skillLevelContent[skill_level as keyof typeof skillLevelContent] || skillLevelContent.beginner;
  const stylePreferences = styleBasedContent[learning_style as keyof typeof styleBasedContent] || styleBasedContent.visual;

  // Customize content based on weak areas
  let focusAreas = baseContent.topics;
  if (weak_areas.length > 0) {
    const weakAreaTopics = {
      'joins': ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      'aggregation': ['COUNT', 'SUM', 'AVG', 'GROUP BY', 'HAVING'],
      'subqueries': ['Correlated subqueries', 'EXISTS', 'IN', 'ANY/ALL'],
      'performance': ['Indexing', 'Query optimization', 'Execution plans']
    };

    weak_areas.forEach((area: string) => {
      if (weakAreaTopics[area as keyof typeof weakAreaTopics]) {
        focusAreas = [...focusAreas, ...weakAreaTopics[area as keyof typeof weakAreaTopics]];
      }
    });
  }

  return {
    skillLevel: skill_level,
    recommendedTopics: focusAreas,
    practiceQueries: baseContent.practiceQueries,
    challenges: baseContent.challenges,
    learningStyle: stylePreferences,
    customizedPath: generateCustomPath(skill_level, weak_areas, learningGoals)
  };
}

function generateRecommendations(userProfile: any): any[] {
  const { skill_level, weak_areas } = userProfile;

  const recommendations = [
    {
      type: 'skill_development',
      title: 'Focus on JOIN operations',
      description: 'Master different types of JOINs to combine data from multiple tables',
      priority: weak_areas.includes('joins') ? 'high' : 'medium',
      estimatedTime: '2-3 hours'
    },
    {
      type: 'practice',
      title: 'Complete daily SQL challenges',
      description: 'Practice with progressively difficult problems',
      priority: 'high',
      estimatedTime: '30 minutes/day'
    },
    {
      type: 'project',
      title: 'Build a database project',
      description: 'Apply your skills in a real-world scenario',
      priority: skill_level === 'advanced' ? 'high' : 'low',
      estimatedTime: '5-10 hours'
    }
  ];

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 1) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 1);
  });
}

function generateUserAnalytics(userId: string, timeframe: string): any {
  // Mock analytics data (replace with real database queries)
  return {
    userId,
    timeframe,
    totalQueries: Math.floor(Math.random() * 100) + 50,
    successfulQueries: Math.floor(Math.random() * 80) + 40,
    averageQueryTime: Math.floor(Math.random() * 30) + 10,
    topicProgress: {
      'basic_select': 90,
      'joins': 65,
      'aggregation': 45,
      'subqueries': 30
    },
    skillGrowth: generateSkillGrowthData(),
    challengesCompleted: Math.floor(Math.random() * 20) + 5,
    hintsUsed: Math.floor(Math.random() * 15) + 2
  };
}

function generateSkillGrowthData(): Array<{date: string, score: number}> {
  const days = 30;
  const data: Array<{date: string, score: number}> = [];
  let baseScore = 20;

  for (let i = 0; i < days; i++) {
    baseScore += Math.random() * 5 - 2; // Random growth/decline
    baseScore = Math.max(0, Math.min(100, baseScore)); // Keep within bounds
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: Math.round(baseScore)
    });
  }

  return data;
}

function generateLearningPath(analytics: any): any {
  const { topicProgress } = analytics;
  
  const allTopics = [
    { name: 'Basic SELECT', progress: topicProgress.basic_select || 0, level: 'beginner' },
    { name: 'WHERE Clauses', progress: 85, level: 'beginner' },
    { name: 'JOINs', progress: topicProgress.joins || 0, level: 'intermediate' },
    { name: 'Aggregate Functions', progress: topicProgress.aggregation || 0, level: 'intermediate' },
    { name: 'Subqueries', progress: topicProgress.subqueries || 0, level: 'intermediate' },
    { name: 'Window Functions', progress: 15, level: 'advanced' },
    { name: 'Performance Optimization', progress: 5, level: 'advanced' }
  ];

  const nextTopic = allTopics.find(topic => topic.progress < 80);
  
  return {
    currentPath: allTopics,
    nextRecommendedTopic: nextTopic,
    estimatedCompletion: calculateEstimatedCompletion(allTopics),
    milestones: generateMilestones(allTopics)
  };
}

function generateLearningInsights(analytics: any): string[] {
  const insights: string[] = [];
  const { successfulQueries, totalQueries, topicProgress, hintsUsed } = analytics;
  
  const successRate = (successfulQueries / totalQueries) * 100;
  
  if (successRate > 80) {
    insights.push('Excellent progress! You have a high success rate in your queries.');
  } else if (successRate > 60) {
    insights.push('Good progress! Consider reviewing areas where you struggled.');
  } else {
    insights.push('Focus on fundamentals. Practice basic concepts before moving to advanced topics.');
  }

  if (topicProgress.joins < 50) {
    insights.push('JOINs need attention. This is crucial for complex data analysis.');
  }

  if (hintsUsed < 5) {
    insights.push('Great independent problem-solving! You rarely need hints.');
  } else if (hintsUsed > 15) {
    insights.push('Consider reviewing fundamentals to reduce reliance on hints.');
  }

  return insights;
}

function generateNextSteps(analytics: any): Array<{action: string, description: string, priority: string, estimatedTime: string}> {
  const { topicProgress } = analytics;
  
  const steps: Array<{action: string, description: string, priority: string, estimatedTime: string}> = [];
  
  if (topicProgress.basic_select < 80) {
    steps.push({
      action: 'Master Basic SELECT',
      description: 'Complete basic SELECT exercises',
      priority: 'high',
      estimatedTime: '2 hours'
    });
  }

  if (topicProgress.joins < 60) {
    steps.push({
      action: 'Practice JOINs',
      description: 'Work through JOIN exercises and challenges',
      priority: 'high',
      estimatedTime: '4 hours'
    });
  }

  if (topicProgress.aggregation < 50) {
    steps.push({
      action: 'Learn Aggregate Functions',
      description: 'Study COUNT, SUM, AVG, GROUP BY, HAVING',
      priority: 'medium',
      estimatedTime: '3 hours'
    });
  }

  return steps;
}

function generateCustomPath(skillLevel: string, weakAreas: string[], learningGoals?: string[]): any {
  const customPath = {
    duration: '4-6 weeks',
    phases: [
      {
        week: 1,
        focus: 'Foundation Building',
        topics: ['Basic SELECT', 'WHERE clauses', 'ORDER BY'],
        goals: 'Master fundamental query structure'
      },
      {
        week: 2,
        focus: 'Data Combination',
        topics: ['JOINs', 'UNION', 'Basic relationships'],
        goals: 'Learn to combine data from multiple sources'
      },
      {
        week: 3,
        focus: 'Data Analysis',
        topics: ['Aggregate functions', 'GROUP BY', 'HAVING'],
        goals: 'Perform data analysis and summarization'
      },
      {
        week: 4,
        focus: 'Advanced Techniques',
        topics: ['Subqueries', 'Window functions', 'CTEs'],
        goals: 'Master complex query patterns'
      }
    ]
  };

  // Adjust based on skill level
  if (skillLevel === 'intermediate') {
    customPath.phases = customPath.phases.slice(1); // Skip basic phase
    customPath.duration = '3-4 weeks';
  } else if (skillLevel === 'advanced') {
    customPath.phases = customPath.phases.slice(2); // Skip basic and intermediate phases
    customPath.duration = '2-3 weeks';
  }

  return customPath;
}

function calculateEstimatedCompletion(topics: any[]): string {
  const averageProgress = topics.reduce((sum, topic) => sum + topic.progress, 0) / topics.length;
  const remainingProgress = 100 - averageProgress;
  const weeksRemaining = Math.ceil(remainingProgress / 15); // Assume 15% progress per week
  
  return `${weeksRemaining} weeks`;
}

function generateMilestones(topics: any[]): any[] {
  return [
    { name: 'SQL Basics', completed: topics.slice(0, 2).every(t => t.progress > 80), reward: 'Beginner Badge' },
    { name: 'Data Joining', completed: topics.find(t => t.name === 'JOINs')?.progress > 80, reward: 'JOIN Master Badge' },
    { name: 'Data Analysis', completed: topics.find(t => t.name === 'Aggregate Functions')?.progress > 80, reward: 'Analyst Badge' },
    { name: 'Advanced SQL', completed: topics.slice(-2).every(t => t.progress > 80), reward: 'SQL Expert Badge' }
  ];
}
