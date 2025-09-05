import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, userId, context } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Basic SQL keyword mapping for natural language to SQL conversion
    const sqlKeywordMapping = {
      'show': 'SELECT',
      'display': 'SELECT',
      'get': 'SELECT',
      'find': 'SELECT',
      'list': 'SELECT',
      'retrieve': 'SELECT',
      'all': '*',
      'everything': '*',
      'from': 'FROM',
      'in': 'FROM',
      'table': '',
      'where': 'WHERE',
      'equals': '=',
      'is': '=',
      'greater than': '>',
      'less than': '<',
      'like': 'LIKE',
      'contains': 'LIKE',
      'order by': 'ORDER BY',
      'sort by': 'ORDER BY',
      'group by': 'GROUP BY',
      'count': 'COUNT',
      'sum': 'SUM',
      'average': 'AVG',
      'maximum': 'MAX',
      'minimum': 'MIN'
    };

    // Simple natural language processing
    let processedQuery = query.toLowerCase().trim();
    
    // Replace natural language with SQL keywords
    Object.entries(sqlKeywordMapping).forEach(([natural, sql]) => {
      const regex = new RegExp(`\\b${natural}\\b`, 'gi');
      processedQuery = processedQuery.replace(regex, sql);
    });

    // Basic SQL structure patterns
    const patterns = [
      {
        pattern: /^(show|display|get|find|list|retrieve)\s+(.+?)\s+(from|in)\s+(.+)$/,
        template: 'SELECT $2 FROM $4'
      },
      {
        pattern: /^(count|sum|avg|max|min)\s+(.+?)\s+(from|in)\s+(.+)$/,
        template: 'SELECT $1($2) FROM $4'
      },
      {
        pattern: /^(show|display|get)\s+(all|everything)\s+(from|in)\s+(.+)$/,
        template: 'SELECT * FROM $4'
      }
    ];

    let suggestedSQL: string = '';
    
    // Try to match patterns
    for (const { pattern, template } of patterns) {
      const match = processedQuery.match(pattern);
      if (match) {
        suggestedSQL = template.replace(/\$(\d+)/g, (_, num) => match[parseInt(num)] || '');
        break;
      }
    }

    // If no pattern matched, provide a basic structure
    if (!suggestedSQL) {
      if (processedQuery.includes('select') || processedQuery.includes('show')) {
        suggestedSQL = 'SELECT column_name FROM table_name WHERE condition;';
      } else if (processedQuery.includes('insert') || processedQuery.includes('add')) {
        suggestedSQL = 'INSERT INTO table_name (column1, column2) VALUES (value1, value2);';
      } else if (processedQuery.includes('update') || processedQuery.includes('change')) {
        suggestedSQL = 'UPDATE table_name SET column_name = value WHERE condition;';
      } else if (processedQuery.includes('delete') || processedQuery.includes('remove')) {
        suggestedSQL = 'DELETE FROM table_name WHERE condition;';
      } else {
        suggestedSQL = 'SELECT * FROM table_name WHERE condition;';
      }
    }

    // Clean up the SQL
    suggestedSQL = suggestedSQL
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/;+$/, ';');

    // Generate explanation
    const explanation = generateSQLExplanation(suggestedSQL);

    // Log activity if userId provided
    if (userId) {
      try {
        // We'll implement proper logging when database-enhanced is available
        console.log(`Natural language to SQL conversion for user ${userId}: "${query}" -> "${suggestedSQL}"`);
      } catch (error) {
        console.warn('Could not log activity:', error);
      }
    }

    return NextResponse.json({
      success: true,
      originalQuery: query,
      suggestedSQL,
      explanation,
      confidence: calculateConfidence(query, suggestedSQL),
      alternatives: generateAlternatives(suggestedSQL),
      tips: [
        'Review the suggested SQL and modify as needed',
        'Test the query with sample data first',
        'Consider adding appropriate WHERE clauses for filtering',
        'Use proper table and column names from your database'
      ]
    });

  } catch (error: any) {
    console.error('Natural language to SQL conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSQLExplanation(sql: string): string {
  const explanations: { [key: string]: string } = {
    'SELECT': 'Retrieves data from database tables',
    'FROM': 'Specifies which table to query',
    'WHERE': 'Filters results based on conditions',
    'ORDER BY': 'Sorts results in ascending or descending order',
    'GROUP BY': 'Groups rows that have the same values',
    'INSERT': 'Adds new records to a table',
    'UPDATE': 'Modifies existing records in a table',
    'DELETE': 'Removes records from a table',
    'COUNT': 'Counts the number of rows',
    'SUM': 'Calculates the total of numeric values',
    'AVG': 'Calculates the average of numeric values',
    'MAX': 'Finds the maximum value',
    'MIN': 'Finds the minimum value'
  };

  const foundKeywords = Object.keys(explanations).filter(keyword => 
    sql.toUpperCase().includes(keyword)
  );

  return foundKeywords.length > 0 
    ? `This SQL query uses: ${foundKeywords.map(kw => `${kw} (${explanations[kw]})`).join(', ')}`
    : 'Basic SQL query structure';
}

function calculateConfidence(naturalQuery: string, sqlQuery: string): number {
  // Simple confidence calculation based on keyword matches
  const naturalWords = naturalQuery.toLowerCase().split(/\s+/);
  const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE'];
  
  const keywordMatches = sqlKeywords.filter(keyword => 
    sqlQuery.toUpperCase().includes(keyword)
  ).length;

  const baseConfidence = Math.min(keywordMatches * 0.3, 0.9);
  const lengthFactor = Math.min(naturalWords.length / 10, 1);
  
  return Math.round((baseConfidence * lengthFactor) * 100);
}

function generateAlternatives(sql: string): string[] {
  const alternatives: string[] = [];
  
  if (sql.includes('SELECT *')) {
    alternatives.push(sql.replace('SELECT *', 'SELECT column1, column2, column3'));
  }
  
  if (sql.includes('WHERE condition')) {
    alternatives.push(sql.replace('WHERE condition', 'WHERE column_name = \'value\''));
  }
  
  if (!sql.includes('LIMIT') && sql.includes('SELECT')) {
    alternatives.push(sql.replace(';', ' LIMIT 10;'));
  }
  
  return alternatives;
}
