import mysql from 'mysql2/promise';

export class QueryExecutor {
  private static instance: QueryExecutor;
  private tempDbCounter = 0;

  static getInstance(): QueryExecutor {
    if (!QueryExecutor.instance) {
      QueryExecutor.instance = new QueryExecutor();
    }
    return QueryExecutor.instance;
  }

  async executeInSandbox(
    userQuery: string,
    schemaSetup: string,
    expectedQuery: string
  ): Promise<{
    isCorrect: boolean;
    result: any[];
    error?: string;
    executionTime: number;
    userResult?: any[];
    expectedResult?: any[];
  }> {
    const startTime = Date.now();
    let tempDbName = `temp_db_${this.tempDbCounter++}_${Date.now()}`;
    
    // Create connection without selecting a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    try {
      // Create temporary database - use query() for DDL commands
      await connection.query(`CREATE DATABASE ${tempDbName}`);
      await connection.query(`USE ${tempDbName}`);

      // Execute schema setup - use query() for DDL commands
      if (schemaSetup) {
        const setupStatements = schemaSetup
          .split(';')
          .filter(stmt => stmt.trim())
          .map(stmt => stmt.trim());

        for (const statement of setupStatements) {
          if (statement) {
            await connection.query(statement);
          }
        }
      }

      // Execute user query - use query() to avoid prepared statement issues
      let userResult: any[] = [];
      let userError: string | undefined;
      
      try {
        const [userRows] = await connection.query(userQuery);
        userResult = Array.isArray(userRows) ? userRows : [userRows];
      } catch (error: any) {
        userError = error.message;
      }

      // Execute expected query for comparison - use query() to avoid prepared statement issues
      let expectedResult: any[] = [];
      let expectedError: string | undefined;

      try {
        const [expectedRows] = await connection.query(expectedQuery);
        expectedResult = Array.isArray(expectedRows) ? expectedRows : [expectedRows];
      } catch (error: any) {
        expectedError = error.message;
      }

      const executionTime = (Date.now() - startTime) / 1000;

      // Compare results
      let isCorrect = false;
      
      if (userError && expectedError) {
        // Both queries failed - not necessarily wrong, depends on the question
        isCorrect = false;
      } else if (userError) {
        // User query failed but expected didn't
        isCorrect = false;
      } else if (!expectedError) {
        // Both queries succeeded, compare results
        isCorrect = this.compareResults(userResult, expectedResult);
      }

      return {
        isCorrect,
        result: userResult,
        error: userError,
        executionTime,
        userResult,
        expectedResult: expectedError ? [] : expectedResult
      };

    } catch (error: any) {
      return {
        isCorrect: false,
        result: [],
        error: error.message,
        executionTime: (Date.now() - startTime) / 1000
      };
    } finally {
      // Clean up: drop temporary database - use query() for DDL commands
      try {
        await connection.query(`DROP DATABASE IF EXISTS ${tempDbName}`);
      } catch (error) {
        console.error('Failed to cleanup temp database:', error);
      }
      await connection.end();
    }
  }

  private compareResults(userResult: any[], expectedResult: any[]): boolean {
    // Basic comparison - can be enhanced based on requirements
    if (userResult.length !== expectedResult.length) {
      return false;
    }

    // Convert results to comparable format
    const normalizeResult = (result: any[]) => {
      return result.map(row => {
        const normalizedRow: any = {};
        for (const [key, value] of Object.entries(row)) {
          // Normalize key names (case insensitive)
          const normalizedKey = key.toLowerCase();
          normalizedRow[normalizedKey] = value;
        }
        return normalizedRow;
      });
    };

    const normalizedUserResult = normalizeResult(userResult);
    const normalizedExpectedResult = normalizeResult(expectedResult);

    // Sort both arrays for comparison (order might not matter)
    const sortResult = (result: any[]) => {
      return result.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    };

    const sortedUserResult = sortResult(normalizedUserResult);
    const sortedExpectedResult = sortResult(normalizedExpectedResult);

    return JSON.stringify(sortedUserResult) === JSON.stringify(sortedExpectedResult);
  }
}

export const queryExecutor = QueryExecutor.getInstance();
