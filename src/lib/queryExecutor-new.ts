import { Pool, PoolClient } from 'pg';

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
    databaseSchema: any
  ): Promise<{
    columns: string[];
    rows: any[][];
    error?: string;
    executionTime: number;
  }> {
    const startTime = Date.now();
    
    // Create a temporary in-memory connection for sandbox execution
    const tempPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: 'postgres', // Use default postgres database for temp operations
      max: 1,
      idleTimeoutMillis: 30000,
    });

    const client = await tempPool.connect();
    const tempSchemaName = `temp_schema_${this.tempDbCounter++}_${Date.now()}`;

    try {
      // Create temporary schema
      await client.query(`CREATE SCHEMA ${tempSchemaName}`);
      await client.query(`SET search_path TO ${tempSchemaName}`);

      // Setup database schema from the session
      await this.setupDatabaseSchema(client, databaseSchema, tempSchemaName);

      // Execute user query
      const result = await client.query(userQuery);
      
      const executionTime = Date.now() - startTime;

      // Extract column names
      const columns = result.fields ? result.fields.map(field => field.name) : [];
      
      // Format rows
      const rows = result.rows || [];

      return {
        columns,
        rows,
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        columns: [],
        rows: [],
        error: error.message || 'Query execution failed',
        executionTime
      };
    } finally {
      try {
        // Clean up temporary schema
        await client.query(`DROP SCHEMA IF EXISTS ${tempSchemaName} CASCADE`);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      client.release();
      await tempPool.end();
    }
  }

  private async setupDatabaseSchema(client: PoolClient, schema: any, schemaName: string): Promise<void> {
    try {
      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }

      if (!schema.tables || !Array.isArray(schema.tables)) {
        throw new Error('Invalid database schema format');
      }

      // Create tables
      for (const table of schema.tables) {
        await this.createTable(client, table, schemaName);
      }

      // Insert sample data
      for (const table of schema.tables) {
        if (table.data && Array.isArray(table.data)) {
          await this.insertTableData(client, table, schemaName);
        }
      }

    } catch (error) {
      console.error('Schema setup error:', error);
      throw error;
    }
  }

  private async createTable(client: PoolClient, table: any, schemaName: string): Promise<void> {
    if (!table.name || !table.columns) {
      throw new Error(`Invalid table definition: ${JSON.stringify(table)}`);
    }

    const columnDefinitions = table.columns.map((col: any) => {
      let definition = `${col.name} ${this.mapDataType(col.type)}`;
      
      if (col.primary_key) {
        definition += ' PRIMARY KEY';
      }
      
      if (col.not_null) {
        definition += ' NOT NULL';
      }
      
      if (col.default !== undefined) {
        definition += ` DEFAULT ${col.default}`;
      }
      
      return definition;
    });

    const createTableSQL = `
      CREATE TABLE ${schemaName}.${table.name} (
        ${columnDefinitions.join(', ')}
      )
    `;

    await client.query(createTableSQL);
  }

  private async insertTableData(client: PoolClient, table: any, schemaName: string): Promise<void> {
    if (!table.data || table.data.length === 0) return;

    const columns = table.columns.map((col: any) => col.name);
    const values = table.data.map((row: any) => {
      return columns.map((col: string) => {
        const value = row[col];
        return value === null || value === undefined ? null : value;
      });
    });

    if (values.length === 0) return;

    // Create parameterized query
    const placeholders = values.map((_: any, rowIndex: number) => {
      const rowPlaceholders = columns.map((_: any, colIndex: number) => 
        `$${rowIndex * columns.length + colIndex + 1}`
      );
      return `(${rowPlaceholders.join(', ')})`;
    });

    const insertSQL = `
      INSERT INTO ${schemaName}.${table.name} (${columns.join(', ')})
      VALUES ${placeholders.join(', ')}
    `;

    // Flatten values array for parameterized query
    const flatValues = values.flat();

    await client.query(insertSQL, flatValues);
  }

  private mapDataType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      'INTEGER': 'INTEGER',
      'INT': 'INTEGER',
      'BIGINT': 'BIGINT',
      'SMALLINT': 'SMALLINT',
      'DECIMAL': 'DECIMAL',
      'NUMERIC': 'NUMERIC',
      'REAL': 'REAL',
      'DOUBLE': 'DOUBLE PRECISION',
      'FLOAT': 'REAL',
      'VARCHAR': 'VARCHAR',
      'CHAR': 'CHAR',
      'TEXT': 'TEXT',
      'DATE': 'DATE',
      'TIME': 'TIME',
      'TIMESTAMP': 'TIMESTAMP',
      'BOOLEAN': 'BOOLEAN',
      'BOOL': 'BOOLEAN',
      'JSON': 'JSONB',
      'JSONB': 'JSONB'
    };

    // Handle types with parameters like VARCHAR(100)
    const baseType = type.split('(')[0].toUpperCase();
    
    if (typeMapping[baseType]) {
      return type.toUpperCase();
    }
    
    // Default to TEXT for unknown types
    return 'TEXT';
  }

  // Legacy method for backward compatibility
  async executeQuery(query: string, connection?: any): Promise<any> {
    // This method can be used for simple query execution
    // without the sandbox environment
    throw new Error('Use executeInSandbox for safe query execution');
  }

  // Method to validate SQL syntax
  async validateQuery(query: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic SQL validation - check for dangerous operations
      const upperQuery = query.toUpperCase().trim();
      
      const dangerousOperations = [
        'DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE'
      ];
      
      const isReadOnly = !dangerousOperations.some(op => 
        upperQuery.includes(op + ' ') || upperQuery.startsWith(op)
      );
      
      if (!isReadOnly) {
        return {
          valid: false,
          error: 'Only SELECT queries are allowed in practice mode'
        };
      }
      
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

export const queryExecutor = QueryExecutor.getInstance();
