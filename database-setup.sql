-- SQL Practice Hub Database Setup
-- Run this script in your MySQL client if you need to manually set up the database

-- Create the database
CREATE DATABASE IF NOT EXISTS sql_practice;
USE sql_practice;

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
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
);

-- Create user_submissions table
CREATE TABLE IF NOT EXISTS user_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    user_query TEXT NOT NULL,
    result JSON,
    is_correct BOOLEAN DEFAULT FALSE,
    execution_time DECIMAL(10,4),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Insert comprehensive topics from beginner to expert
INSERT IGNORE INTO topics (name, description, level) VALUES 
-- Beginner Topics
('Basic SELECT', 'Simple SELECT statements, WHERE clauses, and basic filtering', 'beginner'),
('Sorting & Limiting', 'ORDER BY, LIMIT, and DISTINCT clauses', 'beginner'),
('Basic Functions', 'String functions, math functions, and date functions', 'beginner'),
('Data Types', 'Understanding SQL data types and conversions', 'beginner'),

-- Intermediate Topics
('INNER JOINs', 'Basic JOIN operations between tables', 'intermediate'),
('OUTER JOINs', 'LEFT, RIGHT, and FULL OUTER JOINs', 'intermediate'),
('GROUP BY & HAVING', 'Grouping data and aggregate functions', 'intermediate'),
('Basic Subqueries', 'Simple nested queries and subqueries', 'intermediate'),
('UNION Operations', 'Combining results from multiple queries', 'intermediate'),
('Data Modification', 'INSERT, UPDATE, DELETE operations', 'intermediate'),

-- Advanced Topics
('Complex JOINs', 'Multi-table JOINs and self-joins', 'advanced'),
('Correlated Subqueries', 'Advanced subqueries that reference outer query', 'advanced'),
('Window Functions', 'ROW_NUMBER, RANK, LAG, LEAD, and partitioning', 'advanced'),
('Common Table Expressions (CTEs)', 'WITH clauses and recursive CTEs', 'advanced'),
('Advanced Aggregations', 'ROLLUP, CUBE, and GROUPING SETS', 'advanced'),
('Pivot & Unpivot', 'Data transformation and restructuring', 'advanced'),
('Stored Procedures', 'Creating and using stored procedures', 'advanced'),
('Views & Materialized Views', 'Creating and managing database views', 'advanced'),
('Indexes & Performance', 'Query optimization, indexing strategies', 'advanced'),
('Transactions & Concurrency', 'ACID properties, locking, and isolation levels', 'advanced'),

-- Expert Topics
('Query Optimization', 'Advanced performance tuning and execution plans', 'expert'),
('Database Design', 'Normalization, denormalization, and schema design', 'expert'),
('Advanced Analytics', 'Statistical functions and advanced analytics', 'expert'),
('JSON & XML Data', 'Working with semi-structured data types', 'expert'),
('Temporal Data', 'Working with time-series and temporal data', 'expert');

-- Insert sample questions
INSERT IGNORE INTO questions (topic_id, title, description, difficulty, expected_query, schema_setup, test_cases) VALUES 
(
    (SELECT id FROM topics WHERE name = 'SELECT Statements'),
    'Find all employees with salary greater than 50000',
    'Write a query to select all employees whose salary is greater than 50000.',
    'easy',
    'SELECT * FROM employees WHERE salary > 50000',
    'CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), salary DECIMAL(10,2), department_id INT); INSERT INTO employees VALUES (1, \"John Doe\", 60000, 1), (2, \"Jane Smith\", 45000, 2), (3, \"Bob Johnson\", 75000, 1), (4, \"Alice Brown\", 55000, 3);',
    '[{\"input\": \"SELECT * FROM employees WHERE salary > 50000\", \"expectedRows\": 3}]'
),
(
    (SELECT id FROM topics WHERE name = 'JOINs'),
    'Employee Department Join',
    'Write a query to get employee names with their department names.',
    'medium',
    'SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id',
    'CREATE TABLE departments (id INT PRIMARY KEY, department_name VARCHAR(100)); CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(100), department_id INT); INSERT INTO departments VALUES (1, \"Engineering\"), (2, \"Marketing\"), (3, \"Sales\"); INSERT INTO employees VALUES (1, \"John\", 1), (2, \"Jane\", 2), (3, \"Bob\", 1);',
    '[{\"input\": \"SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id\", \"expectedRows\": 3}]'
);

SELECT 'Database setup completed successfully!' as status;
