import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/database-enhanced';

export async function POST(request: NextRequest) {
  try {
    const { userId, assistanceType, query, errorMessage, context } = await request.json();

    if (!userId || !assistanceType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and assistanceType' },
        { status: 400 }
      );
    }

    // Get user progress for personalized assistance
    let userWithProgress: { user: any; progress: any } | null = null;
    try {
      userWithProgress = await db.getUserWithProgress(userId);
    } catch (error) {
      console.warn('Could not fetch user progress:', error);
    }

    const skillLevel = userWithProgress?.progress?.skill_level || 'beginner';
    let assistance = null;

    try {
      switch (assistanceType) {
        case 'hint':
          assistance = generateHint(query, context, skillLevel);
          break;

        case 'error_explanation':
          assistance = generateErrorExplanation(errorMessage, query, skillLevel);
          break;

        case 'query_optimization':
          assistance = generateQueryOptimization(query, skillLevel);
          break;

        case 'general_help':
          assistance = generateGeneralHelp(context, skillLevel);
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid assistance type' },
            { status: 400 }
          );
      }

      // Log the assistance activity
      if (userWithProgress) {
        await db.logActivity({
          user_id: userId,
          activity_type: 'ai_assistance',
          feature_area: 'learning_support',
          topic_tags: context?.topics || ['general'],
          time_spent: 0,
          hints_used: assistanceType === 'hint' ? 1 : 0,
          ai_assistance_used: true,
          query_executed: query || null,
          success_rate: 0,
          metadata: {
            assistance_type: assistanceType,
            skill_level: skillLevel,
            has_error: !!errorMessage
          }
        });
      }

      return NextResponse.json({
        success: true,
        assistance,
        skillLevel,
        followUpSuggestions: generateFollowUpSuggestions(assistanceType, skillLevel),
        timestamp: new Date().toISOString()
      });

    } catch (aiError: any) {
      console.error('AI assistance error:', aiError);
      return NextResponse.json(
        { 
          error: 'AI assistance temporarily unavailable',
          fallback: generateFallbackAssistance(assistanceType, skillLevel)
        },
        { status: 503 }
      );
    }

  } catch (error: any) {
    console.error('Assistance endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateHint(query: string, context: any, skillLevel: string): any {
  const hints: Record<string, Record<string, string>> = {
    beginner: {
      select: 'Try using SELECT to choose which columns you want to see from your table.',
      where: 'Use WHERE to filter your results. For example: WHERE price > 100',
      join: 'To combine data from multiple tables, use JOIN. Start with INNER JOIN.',
      orderby: 'Use ORDER BY to sort your results. Add ASC for ascending or DESC for descending.'
    },
    intermediate: {
      groupby: 'When using aggregate functions like COUNT or SUM, you usually need GROUP BY.',
      having: 'HAVING is like WHERE but for grouped results. Use it after GROUP BY.',
      subquery: 'Try breaking complex problems into smaller parts using subqueries in parentheses.',
      join: 'Consider which type of JOIN you need: INNER, LEFT, RIGHT, or FULL OUTER.'
    },
    advanced: {
      window: 'Window functions like ROW_NUMBER() OVER() can solve ranking and analytical problems.',
      cte: 'Common Table Expressions (WITH clause) can make complex queries more readable.',
      performance: 'Consider indexes, query execution order, and avoiding unnecessary subqueries.',
      recursive: 'For hierarchical data, consider recursive CTEs with UNION ALL.'
    }
  };

  const levelHints = hints[skillLevel] || hints.beginner;
  
  // Try to match query content to relevant hint
  const queryLower = (query || '').toLowerCase();
  if (queryLower.includes('join')) {
    return {
      type: 'hint',
      content: levelHints.join || Object.values(levelHints)[0],
      category: 'joins',
      difficulty: skillLevel,
      nextSteps: ['Practice with different JOIN types', 'Try using table aliases']
    };
  } else if (queryLower.includes('group') || queryLower.includes('count') || queryLower.includes('sum')) {
    return {
      type: 'hint',
      content: levelHints.groupby || 'GROUP BY groups rows that have the same values in specified columns.',
      category: 'aggregation',
      difficulty: skillLevel,
      nextSteps: ['Remember to include non-aggregate columns in GROUP BY', 'Try using HAVING for filtering groups']
    };
  } else if (queryLower.includes('where')) {
    return {
      type: 'hint',
      content: levelHints.where || 'WHERE filters rows based on conditions.',
      category: 'filtering',
      difficulty: skillLevel,
      nextSteps: ['Try different comparison operators', 'Combine conditions with AND/OR']
    };
  } else {
    return {
      type: 'hint',
      content: levelHints.select || 'Start with a basic SELECT statement to retrieve data.',
      category: 'basic',
      difficulty: skillLevel,
      nextSteps: ['Practice basic SELECT statements', 'Add WHERE clauses for filtering']
    };
  }
}

function generateErrorExplanation(errorMessage: string, query: string, skillLevel: string): any {
  const commonErrors = {
    'syntax error': {
      explanation: 'There is a syntax error in your SQL query. Check for missing commas, parentheses, or keywords.',
      solutions: ['Check for typos in SQL keywords', 'Ensure proper comma placement', 'Verify parentheses are balanced'],
      example: 'SELECT name, age FROM users; -- Note the comma between columns'
    },
    'column does not exist': {
      explanation: 'You are trying to reference a column that does not exist in the table.',
      solutions: ['Check the table schema', 'Verify column names spelling', 'Use table aliases if needed'],
      example: 'SELECT u.name FROM users u; -- Use table alias u'
    },
    'table does not exist': {
      explanation: 'The table you are trying to query does not exist or is misspelled.',
      solutions: ['Verify table name spelling', 'Check if table exists in database', 'Ensure proper schema/database context'],
      example: 'SELECT * FROM users; -- Make sure "users" table exists'
    },
    'group by': {
      explanation: 'When using aggregate functions, non-aggregate columns must be included in GROUP BY.',
      solutions: ['Add missing columns to GROUP BY', 'Remove non-aggregate columns from SELECT', 'Use aggregate functions for all selected columns'],
      example: 'SELECT category, COUNT(*) FROM products GROUP BY category;'
    }
  };

  const errorKey = Object.keys(commonErrors).find(key => 
    (errorMessage || '').toLowerCase().includes(key)
  );

  const errorInfo = errorKey ? commonErrors[errorKey as keyof typeof commonErrors] : {
    explanation: 'An error occurred while executing your query.',
    solutions: ['Check your SQL syntax', 'Verify table and column names', 'Review your query logic'],
    example: 'SELECT column FROM table WHERE condition;'
  };

  return {
    type: 'error_explanation',
    error: errorMessage,
    explanation: errorInfo.explanation,
    solutions: errorInfo.solutions,
    example: errorInfo.example,
    difficulty: skillLevel,
    preventionTips: [
      'Always test with simple queries first',
      'Use proper SQL formatting and indentation',
      'Double-check table and column names'
    ]
  };
}

function generateQueryOptimization(query: string, skillLevel: string): any {
  const optimizations = {
    beginner: [
      'Use specific column names instead of SELECT *',
      'Add WHERE clauses to limit result sets',
      'Use proper indentation for readability'
    ],
    intermediate: [
      'Consider using indexes on frequently queried columns',
      'Use appropriate JOIN types for your needs',
      'Avoid unnecessary subqueries where possible'
    ],
    advanced: [
      'Analyze query execution plans',
      'Consider partitioning for large datasets',
      'Use window functions instead of self-joins where applicable'
    ]
  };

  const levelOptimizations = optimizations[skillLevel as keyof typeof optimizations] || optimizations.beginner;

  // Analyze query for specific optimization opportunities
  const suggestions = [];
  const queryLower = (query || '').toLowerCase();

  if (queryLower.includes('select *')) {
    suggestions.push('Replace SELECT * with specific column names to improve performance');
  }
  if (queryLower.includes('where') === false && queryLower.includes('limit') === false) {
    suggestions.push('Consider adding WHERE clause or LIMIT to reduce result set size');
  }
  if (queryLower.includes('order by') && queryLower.includes('limit') === false) {
    suggestions.push('When using ORDER BY, consider adding LIMIT if you only need top results');
  }

  return {
    type: 'optimization',
    currentQuery: query,
    suggestions: suggestions.length > 0 ? suggestions : levelOptimizations,
    optimizedQuery: generateOptimizedVersion(query),
    performanceTips: [
      'Use indexes on columns in WHERE and JOIN clauses',
      'Limit result sets with WHERE conditions',
      'Avoid functions in WHERE clauses when possible'
    ],
    difficulty: skillLevel
  };
}

function generateOptimizedVersion(query: string): string {
  if (!query) return 'SELECT column1, column2 FROM table_name WHERE condition LIMIT 100;';
  
  // Basic optimization suggestions
  let optimized = query;
  
  // Replace SELECT * with specific columns (as an example)
  if (optimized.includes('SELECT *')) {
    optimized = optimized.replace('SELECT *', 'SELECT column1, column2, column3');
  }
  
  // Add LIMIT if not present and no aggregation
  if (!optimized.toLowerCase().includes('limit') && 
      !optimized.toLowerCase().includes('count') && 
      !optimized.toLowerCase().includes('sum') &&
      !optimized.toLowerCase().includes('avg')) {
    optimized += optimized.endsWith(';') ? ' LIMIT 100;' : ' LIMIT 100;';
  }

  return optimized;
}

function generateGeneralHelp(context: any, skillLevel: string): any {
  const helpTopics = {
    beginner: {
      title: 'SQL Basics Help',
      concepts: [
        'SELECT statements retrieve data from tables',
        'WHERE clauses filter results based on conditions',
        'ORDER BY sorts your results',
        'Basic operators: =, !=, <, >, >=, <='
      ],
      examples: [
        'SELECT name FROM users;',
        'SELECT * FROM products WHERE price > 100;',
        'SELECT name, email FROM customers ORDER BY name;'
      ]
    },
    intermediate: {
      title: 'Intermediate SQL Help',
      concepts: [
        'JOINs combine data from multiple tables',
        'GROUP BY aggregates data by common values',
        'HAVING filters grouped results',
        'Subqueries provide nested query capabilities'
      ],
      examples: [
        'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
        'SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 100;'
      ]
    },
    advanced: {
      title: 'Advanced SQL Help',
      concepts: [
        'Window functions for analytics',
        'Common Table Expressions (CTEs)',
        'Recursive queries for hierarchical data',
        'Performance optimization techniques'
      ],
      examples: [
        'WITH sales_summary AS (SELECT ...) SELECT * FROM sales_summary;',
        'SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) FROM employees;'
      ]
    }
  };

  const help = helpTopics[skillLevel as keyof typeof helpTopics] || helpTopics.beginner;

  return {
    type: 'general_help',
    ...help,
    quickTips: [
      'Start with simple queries and build complexity gradually',
      'Use proper formatting and indentation',
      'Test queries with small datasets first',
      'Always backup data before making changes'
    ],
    resources: [
      'Practice with sample databases',
      'Use EXPLAIN to understand query execution',
      'Read database documentation for specific features'
    ],
    difficulty: skillLevel
  };
}

function generateFollowUpSuggestions(assistanceType: string, skillLevel: string): string[] {
  const suggestions = {
    hint: [
      'Try implementing the suggested approach',
      'Practice similar problems to reinforce learning',
      'Ask for clarification if the hint is unclear'
    ],
    error_explanation: [
      'Fix the identified issue and retry',
      'Learn about SQL syntax rules',
      'Practice proper query formatting'
    ],
    query_optimization: [
      'Test the optimized version',
      'Learn about database indexing',
      'Practice writing efficient queries'
    ],
    general_help: [
      'Practice the provided examples',
      'Explore related SQL concepts',
      'Try building on these basic patterns'
    ]
  };

  return suggestions[assistanceType as keyof typeof suggestions] || suggestions.general_help;
}

function generateFallbackAssistance(assistanceType: string, skillLevel: string): any {
  return {
    type: 'fallback',
    message: 'AI assistance is temporarily unavailable, but here are some general tips:',
    tips: [
      'Check your SQL syntax carefully',
      'Verify table and column names',
      'Start with simple queries and build complexity',
      'Use proper formatting and indentation'
    ],
    resources: [
      'SQL documentation',
      'Practice with sample databases',
      'Online SQL tutorials'
    ]
  };
}
