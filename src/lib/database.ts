import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sql_practice',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function initializeDatabase() {
  // First, create connection without database to create the database
  const tempConnection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  });
  
  try {
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConnection.end();
    
    // Now get connection with the database specified
    const connection = await getConnection();
    
    // Create topics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create questions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_id INT,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        expected_query TEXT,
        test_cases JSON,
        schema_setup TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      )
    `);
    
    // Create user_submissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT,
        user_query TEXT NOT NULL,
        result JSON,
        is_correct BOOLEAN DEFAULT FALSE,
        execution_time DECIMAL(10,4),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function seedDatabase() {
  const connection = await getConnection();
  
  try {
    // Insert default topics - Basic to Advanced
    const topics = [
      // Beginner Topics
      { name: 'Basic SELECT', description: 'Simple SELECT statements, WHERE clauses, and basic filtering', level: 'beginner' },
      { name: 'Sorting & Limiting', description: 'ORDER BY, LIMIT, and DISTINCT clauses', level: 'beginner' },
      { name: 'Basic Functions', description: 'String functions, math functions, and date functions', level: 'beginner' },
      { name: 'Data Types', description: 'Understanding SQL data types and conversions', level: 'beginner' },
      
      // Intermediate Topics
      { name: 'INNER JOINs', description: 'Basic JOIN operations between tables', level: 'intermediate' },
      { name: 'OUTER JOINs', description: 'LEFT, RIGHT, and FULL OUTER JOINs', level: 'intermediate' },
      { name: 'GROUP BY & HAVING', description: 'Grouping data and aggregate functions', level: 'intermediate' },
      { name: 'Basic Subqueries', description: 'Simple nested queries and subqueries', level: 'intermediate' },
      { name: 'UNION Operations', description: 'Combining results from multiple queries', level: 'intermediate' },
      { name: 'Data Modification', description: 'INSERT, UPDATE, DELETE operations', level: 'intermediate' },
      
      // Advanced Topics
      { name: 'Complex JOINs', description: 'Multi-table JOINs and self-joins', level: 'advanced' },
      { name: 'Correlated Subqueries', description: 'Advanced subqueries that reference outer query', level: 'advanced' },
      { name: 'Window Functions', description: 'ROW_NUMBER, RANK, LAG, LEAD, and partitioning', level: 'advanced' },
      { name: 'Common Table Expressions (CTEs)', description: 'WITH clauses and recursive CTEs', level: 'advanced' },
      { name: 'Advanced Aggregations', description: 'ROLLUP, CUBE, and GROUPING SETS', level: 'advanced' },
      { name: 'Pivot & Unpivot', description: 'Data transformation and restructuring', level: 'advanced' },
      { name: 'Stored Procedures', description: 'Creating and using stored procedures', level: 'advanced' },
      { name: 'Views & Materialized Views', description: 'Creating and managing database views', level: 'advanced' },
      { name: 'Indexes & Performance', description: 'Query optimization, indexing strategies', level: 'advanced' },
      { name: 'Transactions & Concurrency', description: 'ACID properties, locking, and isolation levels', level: 'advanced' },
      
      // Expert Topics
      { name: 'Query Optimization', description: 'Advanced performance tuning and execution plans', level: 'expert' },
      { name: 'Database Design', description: 'Normalization, denormalization, and schema design', level: 'expert' },
      { name: 'Advanced Analytics', description: 'Statistical functions and advanced analytics', level: 'expert' },
      { name: 'JSON & XML Data', description: 'Working with semi-structured data types', level: 'expert' },
      { name: 'Temporal Data', description: 'Working with time-series and temporal data', level: 'expert' },
    ];
    
    for (const topic of topics) {
      await connection.execute(
        'INSERT IGNORE INTO topics (name, description, level) VALUES (?, ?, ?)',
        [topic.name, topic.description, topic.level]
      );
    }
    
    // Insert sample questions across different levels
    const sampleQuestions = [
      // Beginner Level
      {
        topic: 'Basic SELECT',
        title: 'Find all employees with salary greater than 50000',
        description: 'Write a query to select all employees whose salary is greater than 50000.',
        difficulty: 'easy',
        expectedQuery: 'SELECT * FROM employees WHERE salary > 50000',
        schemaSetup: `
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            salary DECIMAL(10,2),
            department_id INT
          );
          INSERT INTO employees VALUES 
          (1, 'John Doe', 60000, 1),
          (2, 'Jane Smith', 45000, 2),
          (3, 'Bob Johnson', 75000, 1),
          (4, 'Alice Brown', 55000, 3);
        `,
        testCases: [
          { input: 'SELECT * FROM employees WHERE salary > 50000', expectedRows: 3 },
          { input: 'SELECT name FROM employees WHERE salary > 50000', expectedColumns: ['name'] }
        ]
      },
      {
        topic: 'Sorting & Limiting',
        title: 'Top 3 highest paid employees',
        description: 'Write a query to find the top 3 highest paid employees ordered by salary in descending order.',
        difficulty: 'easy',
        expectedQuery: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3',
        schemaSetup: `
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            salary DECIMAL(10,2)
          );
          INSERT INTO employees VALUES 
          (1, 'John', 60000), (2, 'Jane', 75000), (3, 'Bob', 45000),
          (4, 'Alice', 80000), (5, 'Charlie', 65000);
        `,
        testCases: [
          { input: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3', expectedRows: 3 }
        ]
      },
      // Intermediate Level
      {
        topic: 'INNER JOINs',
        title: 'Employee Department Join',
        description: 'Write a query to get employee names with their department names using INNER JOIN.',
        difficulty: 'medium',
        expectedQuery: 'SELECT e.name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id',
        schemaSetup: `
          CREATE TABLE departments (
            id INT PRIMARY KEY,
            department_name VARCHAR(100)
          );
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            department_id INT
          );
          INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Marketing'), (3, 'Sales');
          INSERT INTO employees VALUES (1, 'John', 1), (2, 'Jane', 2), (3, 'Bob', 1);
        `,
        testCases: [
          { input: 'SELECT e.name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id', expectedRows: 3 }
        ]
      },
      {
        topic: 'GROUP BY & HAVING',
        title: 'Department salary statistics',
        description: 'Find departments with average salary greater than 60000. Show department name and average salary.',
        difficulty: 'medium',
        expectedQuery: 'SELECT d.department_name, AVG(e.salary) as avg_salary FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.department_name HAVING AVG(e.salary) > 60000',
        schemaSetup: `
          CREATE TABLE departments (
            id INT PRIMARY KEY,
            department_name VARCHAR(100)
          );
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            salary DECIMAL(10,2),
            department_id INT
          );
          INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Marketing'), (3, 'Sales');
          INSERT INTO employees VALUES 
          (1, 'John', 70000, 1), (2, 'Jane', 65000, 1), (3, 'Bob', 50000, 2), 
          (4, 'Alice', 75000, 1), (5, 'Charlie', 55000, 3);
        `,
        testCases: [
          { input: 'SELECT d.department_name, AVG(e.salary) FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.department_name HAVING AVG(e.salary) > 60000', expectedRows: 1 }
        ]
      },
      // Advanced Level
      {
        topic: 'Window Functions',
        title: 'Employee salary ranking within departments',
        description: 'Rank employees by salary within their departments using window functions.',
        difficulty: 'hard',
        expectedQuery: 'SELECT name, salary, department_id, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM employees',
        schemaSetup: `
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            salary DECIMAL(10,2),
            department_id INT
          );
          INSERT INTO employees VALUES 
          (1, 'John', 70000, 1), (2, 'Jane', 65000, 1), (3, 'Bob', 50000, 2), 
          (4, 'Alice', 75000, 1), (5, 'Charlie', 55000, 2);
        `,
        testCases: [
          { input: 'SELECT name, salary, department_id, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM employees', expectedRows: 5 }
        ]
      },
      {
        topic: 'Common Table Expressions (CTEs)',
        title: 'Department hierarchy with CTEs',
        description: 'Use a CTE to find all employees in departments with more than 2 employees.',
        difficulty: 'hard',
        expectedQuery: 'WITH dept_counts AS (SELECT department_id, COUNT(*) as emp_count FROM employees GROUP BY department_id HAVING COUNT(*) > 2) SELECT e.name, e.salary FROM employees e INNER JOIN dept_counts dc ON e.department_id = dc.department_id',
        schemaSetup: `
          CREATE TABLE employees (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            salary DECIMAL(10,2),
            department_id INT
          );
          INSERT INTO employees VALUES 
          (1, 'John', 70000, 1), (2, 'Jane', 65000, 1), (3, 'Bob', 50000, 1), 
          (4, 'Alice', 75000, 2), (5, 'Charlie', 55000, 2);
        `,
        testCases: [
          { input: 'WITH dept_counts AS (SELECT department_id, COUNT(*) as emp_count FROM employees GROUP BY department_id HAVING COUNT(*) > 2) SELECT e.name FROM employees e INNER JOIN dept_counts dc ON e.department_id = dc.department_id', expectedRows: 3 }
        ]
      }
    ];
    
    for (const question of sampleQuestions) {
      // Get topic ID
      const [topicRows] = await connection.execute(
        'SELECT id FROM topics WHERE name = ?',
        [question.topic]
      ) as [any[], any];
      
      if (topicRows.length > 0) {
        await connection.execute(
          'INSERT IGNORE INTO questions (topic_id, title, description, difficulty, expected_query, schema_setup, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            topicRows[0].id,
            question.title,
            question.description,
            question.difficulty,
            question.expectedQuery,
            question.schemaSetup,
            JSON.stringify(question.testCases)
          ]
        );
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
