import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, contentType, topic, difficulty, preferences } = await request.json();

    if (!userId || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and contentType' },
        { status: 400 }
      );
    }

    // Mock user progress (replace with actual database call when available)
    const skillLevel = difficulty || 'beginner';
    let generatedContent = null;

    try {
      switch (contentType) {
        case 'database_scenario':
          generatedContent = generateDatabaseScenario(
            topic || 'general',
            difficulty || skillLevel,
            preferences || {}
          );
          break;

        case 'interview_question':
          generatedContent = generateInterviewQuestion(
            difficulty || skillLevel,
            topic || 'sql_fundamentals',
            preferences?.questionType || 'practical'
          );
          break;

        case 'practice_challenge':
          generatedContent = generatePracticeChallenge(
            skillLevel,
            topic || 'general'
          );
          break;

        case 'learning_roadmap':
          generatedContent = generateLearningRoadmap(skillLevel);
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
          );
      }

      // Log the content generation activity
      console.log(`Generated ${contentType} content for user ${userId} at ${skillLevel} level`);

      return NextResponse.json({
        success: true,
        content: generatedContent,
        metadata: {
          contentType,
          skillLevel,
          topic: topic || 'general',
          timestamp: new Date().toISOString()
        }
      });

    } catch (aiError: any) {
      console.error('AI content generation error:', aiError);
      return NextResponse.json(
        { 
          error: 'AI content generation temporarily unavailable',
          fallback: 'Please try again later or use manual content creation.'
        },
        { status: 503 }
      );
    }

  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for personalized challenges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate mock personalized challenges
    const personalizedChallenges = generatePersonalizedChallenges(userId, limit);
    
    // Log the personalized content request
    console.log(`Generated ${personalizedChallenges.length} personalized challenges for user ${userId}`);

    return NextResponse.json({
      success: true,
      challenges: personalizedChallenges,
      userContext: {
        skillLevel: 'beginner', // Mock data
        totalQueries: 0,
        successRate: 0
      }
    });

  } catch (error: any) {
    console.error('Personalized challenges error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateDatabaseScenario(topic: string, difficulty: string, preferences: any): any {
  const scenarios = {
    beginner: {
      title: 'E-commerce Product Catalog',
      description: 'A simple online store database with products, categories, and basic customer information.',
      tables: [
        { name: 'products', columns: ['id', 'name', 'price', 'category_id', 'in_stock'] },
        { name: 'categories', columns: ['id', 'name', 'description'] },
        { name: 'customers', columns: ['id', 'name', 'email', 'created_at'] }
      ],
      sampleQueries: [
        'SELECT * FROM products WHERE price < 50;',
        'SELECT p.name, c.name as category FROM products p JOIN categories c ON p.category_id = c.id;'
      ]
    },
    intermediate: {
      title: 'Hospital Management System',
      description: 'A healthcare database managing patients, doctors, appointments, and medical records.',
      tables: [
        { name: 'patients', columns: ['id', 'name', 'birth_date', 'phone', 'address'] },
        { name: 'doctors', columns: ['id', 'name', 'specialization', 'department_id'] },
        { name: 'appointments', columns: ['id', 'patient_id', 'doctor_id', 'appointment_date', 'status'] },
        { name: 'departments', columns: ['id', 'name', 'location'] }
      ],
      sampleQueries: [
        'SELECT d.name, COUNT(a.id) as appointment_count FROM doctors d LEFT JOIN appointments a ON d.id = a.doctor_id GROUP BY d.id;',
        'SELECT p.name, a.appointment_date FROM patients p JOIN appointments a ON p.id = a.patient_id WHERE a.status = "scheduled";'
      ]
    },
    advanced: {
      title: 'Financial Trading Platform',
      description: 'Complex financial system with real-time trading, portfolio management, and risk analysis.',
      tables: [
        { name: 'users', columns: ['id', 'username', 'email', 'created_at', 'risk_tolerance'] },
        { name: 'stocks', columns: ['symbol', 'company_name', 'sector', 'current_price'] },
        { name: 'trades', columns: ['id', 'user_id', 'stock_symbol', 'quantity', 'price', 'trade_type', 'timestamp'] },
        { name: 'portfolios', columns: ['id', 'user_id', 'total_value', 'updated_at'] }
      ],
      sampleQueries: [
        'WITH user_performance AS (SELECT user_id, SUM(CASE WHEN trade_type = "sell" THEN quantity * price ELSE -quantity * price END) as profit FROM trades GROUP BY user_id) SELECT u.username, up.profit FROM users u JOIN user_performance up ON u.id = up.user_id ORDER BY up.profit DESC;'
      ]
    }
  };

  return scenarios[difficulty as keyof typeof scenarios] || scenarios.beginner;
}

function generateInterviewQuestion(difficulty: string, topic: string, questionType: string): any {
  const questions = {
    beginner: [
      {
        question: 'What is the difference between WHERE and HAVING clauses?',
        answer: 'WHERE filters rows before grouping, HAVING filters groups after aggregation.',
        type: 'conceptual',
        followUp: 'Can you provide an example where you would use each?'
      },
      {
        question: 'Write a query to find all customers who have placed more than 5 orders.',
        answer: 'SELECT c.name FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(o.id) > 5;',
        type: 'practical',
        followUp: 'How would you modify this to include customers with exactly 5 orders?'
      }
    ],
    intermediate: [
      {
        question: 'Explain the different types of JOINs and when to use each.',
        answer: 'INNER JOIN returns matching rows, LEFT JOIN includes all left table rows, RIGHT JOIN includes all right table rows, FULL OUTER JOIN includes all rows from both tables.',
        type: 'conceptual',
        followUp: 'What would happen if you use LEFT JOIN vs INNER JOIN in a specific scenario?'
      },
      {
        question: 'Write a query to find the second highest salary in each department.',
        answer: 'SELECT department_id, MAX(salary) as second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees e2 WHERE e2.department_id = employees.department_id) GROUP BY department_id;',
        type: 'practical',
        followUp: 'Can you solve this using window functions?'
      }
    ],
    advanced: [
      {
        question: 'Explain query optimization techniques and how indexes work.',
        answer: 'Indexes create sorted data structures for faster lookups. Optimization includes proper indexing, query rewriting, analyzing execution plans, and avoiding full table scans.',
        type: 'conceptual',
        followUp: 'What are the trade-offs of having too many indexes?'
      },
      {
        question: 'Write a query using CTEs and window functions to find running totals.',
        answer: 'WITH running_totals AS (SELECT order_date, amount, SUM(amount) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) as running_total FROM orders) SELECT * FROM running_totals;',
        type: 'practical',
        followUp: 'How would you handle ties in the order_date?'
      }
    ]
  };

  const questionSet = questions[difficulty as keyof typeof questions] || questions.beginner;
  return questionSet[Math.floor(Math.random() * questionSet.length)];
}

function generatePracticeChallenge(skillLevel: string, topic: string): any {
  const challenges = {
    beginner: {
      title: 'Basic Product Query Challenge',
      description: 'Practice fundamental SELECT statements with filtering and sorting.',
      challenge: 'Find all products under $100, sort by price ascending, and display name and price only.',
      expectedSQL: 'SELECT name, price FROM products WHERE price < 100 ORDER BY price ASC;',
      hints: [
        'Use SELECT to specify which columns to return',
        'Use WHERE to filter by price condition',
        'Use ORDER BY to sort the results'
      ]
    },
    intermediate: {
      title: 'Sales Analysis Challenge',
      description: 'Analyze sales data using JOINs and aggregate functions.',
      challenge: 'Find the total sales amount for each category, including category name.',
      expectedSQL: 'SELECT c.name, SUM(oi.quantity * oi.price) as total_sales FROM categories c JOIN products p ON c.id = p.category_id JOIN order_items oi ON p.id = oi.product_id GROUP BY c.id, c.name;',
      hints: [
        'Join categories, products, and order_items tables',
        'Use SUM with quantity * price for total sales',
        'Group by category to get totals per category'
      ]
    },
    advanced: {
      title: 'Performance Analysis Challenge',
      description: 'Complex analysis using window functions and CTEs.',
      challenge: 'Rank employees by salary within each department and show the difference from department average.',
      expectedSQL: 'WITH dept_stats AS (SELECT department_id, AVG(salary) as avg_salary FROM employees GROUP BY department_id) SELECT e.name, e.salary, RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) as salary_rank, e.salary - ds.avg_salary as diff_from_avg FROM employees e JOIN dept_stats ds ON e.department_id = ds.department_id;',
      hints: [
        'Use CTE to calculate department averages',
        'Use RANK() window function for ranking',
        'Use PARTITION BY for ranking within departments'
      ]
    }
  };

  return challenges[skillLevel as keyof typeof challenges] || challenges.beginner;
}

function generateLearningRoadmap(skillLevel: string): any {
  const roadmaps = {
    beginner: {
      title: 'SQL Fundamentals Roadmap',
      duration: '6-8 weeks',
      phases: [
        {
          week: '1-2',
          topic: 'Basic Queries',
          skills: ['SELECT statements', 'WHERE clauses', 'ORDER BY', 'Basic filtering'],
          practice: '15 exercises'
        },
        {
          week: '3-4',
          topic: 'Data Relationships',
          skills: ['INNER JOIN', 'LEFT JOIN', 'Table relationships', 'Basic aggregations'],
          practice: '20 exercises'
        },
        {
          week: '5-6',
          topic: 'Data Analysis',
          skills: ['GROUP BY', 'HAVING', 'COUNT, SUM, AVG', 'Data summarization'],
          practice: '25 exercises'
        },
        {
          week: '7-8',
          topic: 'Practical Applications',
          skills: ['Real-world scenarios', 'Mini projects', 'Performance basics'],
          practice: '3 projects'
        }
      ]
    },
    intermediate: {
      title: 'Intermediate SQL Mastery',
      duration: '4-6 weeks',
      phases: [
        {
          week: '1-2',
          topic: 'Advanced Joins & Subqueries',
          skills: ['Complex JOINs', 'Correlated subqueries', 'EXISTS, IN operators'],
          practice: '30 exercises'
        },
        {
          week: '3-4',
          topic: 'Window Functions',
          skills: ['ROW_NUMBER', 'RANK', 'LAG/LEAD', 'Moving averages'],
          practice: '25 exercises'
        },
        {
          week: '5-6',
          topic: 'Advanced Analysis',
          skills: ['CTEs', 'Recursive queries', 'Complex aggregations', 'Performance tuning'],
          practice: '5 projects'
        }
      ]
    },
    advanced: {
      title: 'SQL Expert Path',
      duration: '3-4 weeks',
      phases: [
        {
          week: '1',
          topic: 'Query Optimization',
          skills: ['Execution plans', 'Index strategies', 'Query rewriting'],
          practice: 'Performance challenges'
        },
        {
          week: '2-3',
          topic: 'Advanced Features',
          skills: ['Stored procedures', 'Triggers', 'Advanced CTEs', 'Dynamic SQL'],
          practice: 'Complex scenarios'
        },
        {
          week: '4',
          topic: 'Real-world Applications',
          skills: ['Database design', 'ETL processes', 'Data warehousing concepts'],
          practice: 'Capstone project'
        }
      ]
    }
  };

  return roadmaps[skillLevel as keyof typeof roadmaps] || roadmaps.beginner;
}

function generatePersonalizedChallenges(userId: string, limit: number): any[] {
  const challenges = [
    {
      id: 1,
      title: 'Customer Order Analysis',
      difficulty: 'beginner',
      topic: 'joins',
      description: 'Find customers who have placed orders in the last 30 days',
      estimatedTime: '15 minutes'
    },
    {
      id: 2,
      title: 'Product Performance Report',
      difficulty: 'intermediate',
      topic: 'aggregation',
      description: 'Calculate total sales and average rating for each product category',
      estimatedTime: '25 minutes'
    },
    {
      id: 3,
      title: 'Employee Ranking System',
      difficulty: 'advanced',
      topic: 'window_functions',
      description: 'Rank employees by performance within each department using window functions',
      estimatedTime: '40 minutes'
    },
    {
      id: 4,
      title: 'Inventory Management Query',
      difficulty: 'beginner',
      topic: 'basic_select',
      description: 'Find products with low stock levels and their suppliers',
      estimatedTime: '20 minutes'
    },
    {
      id: 5,
      title: 'Financial Trend Analysis',
      difficulty: 'advanced',
      topic: 'cte',
      description: 'Analyze revenue trends using Common Table Expressions',
      estimatedTime: '45 minutes'
    }
  ];

  return challenges.slice(0, limit);
}
