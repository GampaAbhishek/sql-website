import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Add level column to existing topics table if it doesn't exist
    await connection.execute(`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate' AFTER description
    `);
    
    // Clear existing topics to reload with new structure
    await connection.execute('DELETE FROM topics');
    
    // Re-seed with comprehensive topics
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
        'INSERT INTO topics (name, description, level) VALUES (?, ?, ?)',
        [topic.name, topic.description, topic.level]
      );
    }
    
    return NextResponse.json({ 
      message: 'Topics updated successfully with comprehensive basic to advanced topics!',
      totalTopics: topics.length,
      breakdown: {
        beginner: topics.filter(t => t.level === 'beginner').length,
        intermediate: topics.filter(t => t.level === 'intermediate').length,
        advanced: topics.filter(t => t.level === 'advanced').length,
        expert: topics.filter(t => t.level === 'expert').length,
      }
    });
  } catch (error: any) {
    console.error('Error updating topics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update topics' },
      { status: 500 }
    );
  }
}
