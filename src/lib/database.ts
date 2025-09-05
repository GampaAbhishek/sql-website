import { Pool, PoolClient } from 'pg';

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual components if DATABASE_URL is not set
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'sql_practice_hub',
  // Connection pool settings
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL settings for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

let pool: Pool;

export async function getConnection(): Promise<Pool> {
  if (!pool) {
    pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : dbConfig);
    
    // Test the connection
    try {
      const client = await pool.connect();
      console.log('✅ Database connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return pool;
}

export async function getClient(): Promise<PoolClient> {
  const pool = await getConnection();
  return pool.connect();
}

// Initialize database with the new schema
export async function initializeDatabase() {
  const client = await getClient();
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    console.log('✅ Database extensions enabled');
    console.log('📋 Database schema should be initialized separately using database-schema-final.sql');
    console.log('   Run: psql -d sql_practice_hub -f database-schema-final.sql');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Seed database with sample data (extends the schema's sample data)
export async function seedDatabase() {
  const client = await getClient();
  
  try {
    // Check if data already exists
    const existingLessons = await client.query('SELECT COUNT(*) as count FROM lessons');
    const lessonCount = parseInt(existingLessons.rows[0].count);
    
    if (lessonCount > 3) {
      console.log('✅ Database already seeded with lesson data');
      return;
    }
    
    // Insert additional lessons for development
    const additionalLessons = [
      {
        title: 'Advanced JOIN Techniques',
        slug: 'advanced-joins',
        description: 'Master complex JOIN operations including self-joins and multiple table joins',
        content: JSON.stringify({
          sections: [
            {
              title: 'Self Joins',
              content: 'Learn how to join a table with itself to find relationships within the same table'
            },
            {
              title: 'Multiple Table Joins',
              content: 'Combine data from three or more tables efficiently'
            }
          ]
        }),
        difficulty: 'intermediate',
        category: 'joins',
        order_index: 4,
        estimated_time_minutes: 45,
        learning_objectives: ['Master self-join techniques', 'Combine multiple tables', 'Optimize join performance'],
        tags: ['joins', 'self-join', 'multiple-tables']
      },
      {
        title: 'Subqueries and CTEs',
        slug: 'subqueries-ctes',
        description: 'Learn about subqueries and Common Table Expressions for complex data retrieval',
        content: JSON.stringify({
          sections: [
            {
              title: 'Subquery Types',
              content: 'Understand scalar, row, and table subqueries'
            },
            {
              title: 'Common Table Expressions',
              content: 'Use WITH clauses for more readable complex queries'
            }
          ]
        }),
        difficulty: 'advanced',
        category: 'advanced-queries',
        order_index: 1,
        estimated_time_minutes: 50,
        learning_objectives: ['Write efficient subqueries', 'Use CTEs effectively', 'Choose between subqueries and joins'],
        tags: ['subqueries', 'cte', 'with-clause']
      }
    ];
    
    for (const lesson of additionalLessons) {
      await client.query(`
        INSERT INTO lessons (title, slug, description, content, difficulty, category, order_index, 
                           estimated_time_minutes, learning_objectives, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO NOTHING
      `, [
        lesson.title, lesson.slug, lesson.description, lesson.content,
        lesson.difficulty, lesson.category, lesson.order_index,
        lesson.estimated_time_minutes, lesson.learning_objectives, lesson.tags
      ]);
    }
    
    // Insert additional challenges
    const additionalChallenges = [
      {
        title: 'Employee Manager Hierarchy',
        slug: 'employee-manager-hierarchy',
        description: 'Find all employees and their direct managers using self-join',
        difficulty: 'intermediate',
        category: 'joins',
        points: 15,
        database_schema: JSON.stringify({
          tables: [
            {
              name: 'employees',
              columns: [
                { name: 'id', type: 'INTEGER', primary_key: true },
                { name: 'name', type: 'VARCHAR(100)' },
                { name: 'manager_id', type: 'INTEGER' },
                { name: 'department', type: 'VARCHAR(50)' }
              ],
              data: [
                { id: 1, name: 'John CEO', manager_id: null, department: 'Executive' },
                { id: 2, name: 'Jane Manager', manager_id: 1, department: 'Engineering' },
                { id: 3, name: 'Bob Developer', manager_id: 2, department: 'Engineering' },
                { id: 4, name: 'Alice Developer', manager_id: 2, department: 'Engineering' }
              ]
            }
          ]
        }),
        expected_output: JSON.stringify({
          columns: ['employee_name', 'manager_name'],
          rows: [
            ['Jane Manager', 'John CEO'],
            ['Bob Developer', 'Jane Manager'],
            ['Alice Developer', 'Jane Manager']
          ]
        }),
        solution_query: `SELECT e.name as employee_name, m.name as manager_name 
                        FROM employees e 
                        LEFT JOIN employees m ON e.manager_id = m.id 
                        WHERE e.manager_id IS NOT NULL`,
        hints: [
          'Use a self-join to connect employees with their managers',
          'Join the employees table with itself using manager_id',
          'Use LEFT JOIN to handle employees without managers'
        ]
      }
    ];
    
    for (const challenge of additionalChallenges) {
      await client.query(`
        INSERT INTO challenges (title, slug, description, difficulty, category, points, 
                              database_schema, expected_output, solution_query, hints)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO NOTHING
      `, [
        challenge.title, challenge.slug, challenge.description, challenge.difficulty,
        challenge.category, challenge.points, challenge.database_schema,
        challenge.expected_output, challenge.solution_query, challenge.hints
      ]);
    }
    
    console.log('✅ Additional development data seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Utility functions for the new schema

// User management
export async function createUser(userData: {
  email: string;
  username: string;
  password_hash: string;
  name: string;
  role?: string;
}) {
  const client = await getClient();
  try {
    const result = await client.query(`
      INSERT INTO users (email, username, password_hash, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, name, role, created_at
    `, [userData.email, userData.username, userData.password_hash, userData.name, userData.role || 'student']);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getUserByEmail(email: string) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getUserById(id: string) {
  const client = await getClient();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Session management
export async function createSession(userId: string, token: string, refreshToken?: string) {
  const client = await getClient();
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const refreshExpiresAt = refreshToken ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null; // 7 days
    
    const result = await client.query(`
      INSERT INTO sessions (user_id, token, refresh_token, expires_at, refresh_expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, token, expires_at
    `, [userId, token, refreshToken, expiresAt, refreshExpiresAt]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getSessionByToken(token: string) {
  const client = await getClient();
  try {
    const result = await client.query(`
      SELECT s.*, u.id as user_id, u.email, u.name, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.is_active = true AND s.expires_at > NOW()
    `, [token]);
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Learning path functions
export async function getUserProgress(userId: string, lessonId?: string) {
  const client = await getClient();
  try {
    let query = `
      SELECT up.*, l.title, l.category, l.difficulty
      FROM user_progress up
      JOIN lessons l ON up.lesson_id = l.id
      WHERE up.user_id = $1
    `;
    const params = [userId];
    
    if (lessonId) {
      query += ' AND up.lesson_id = $2';
      params.push(lessonId);
    }
    
    query += ' ORDER BY l.category, l.order_index';
    
    const result = await client.query(query, params);
    return lessonId ? result.rows[0] || null : result.rows;
  } finally {
    client.release();
  }
}

export async function updateUserProgress(userId: string, lessonId: string, progressData: {
  status?: string;
  accuracy_percentage?: number;
  time_spent_minutes?: number;
  notes?: string;
}) {
  const client = await getClient();
  try {
    const updateFields: string[] = [];
    const values: any[] = [userId, lessonId];
    let paramIndex = 3;
    
    Object.entries(progressData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    if (updateFields.length === 0) return null;
    
    updateFields.push(`updated_at = NOW()`);
    
    if (progressData.status === 'completed') {
      updateFields.push(`completed_at = NOW()`);
    }
    
    const query = `
      INSERT INTO user_progress (user_id, lesson_id, ${Object.keys(progressData).join(', ')}, updated_at)
      VALUES ($1, $2, ${Object.keys(progressData).map((_, i) => `$${i + 3}`).join(', ')}, NOW())
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET ${updateFields.join(', ')}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Challenge functions
export async function getChallenges(filters?: {
  difficulty?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const client = await getClient();
  try {
    let query = 'SELECT * FROM challenges WHERE is_published = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (filters?.difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      params.push(filters.difficulty);
      paramIndex++;
    }
    
    if (filters?.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }
    
    query += ' ORDER BY difficulty, category, created_at';
    
    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
      
      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }
    }
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function saveQuery(userId: string, sessionId: string, queryData: {
  query_text: string;
  result?: any;
  status: string;
  execution_time_ms?: number;
  error_message?: string;
}) {
  const client = await getClient();
  try {
    const result = await client.query(`
      INSERT INTO queries (user_id, session_id, query_text, result, status, execution_time_ms, error_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      userId, sessionId, queryData.query_text, 
      queryData.result ? JSON.stringify(queryData.result) : null,
      queryData.status, queryData.execution_time_ms, queryData.error_message
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Error handling wrapper
export async function executeQuery<T>(
  queryFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    return await queryFn(client);
  } finally {
    client.release();
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const client = await getClient();
    const result = await client.query('SELECT 1 as health_check');
    client.release();
    return { healthy: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
