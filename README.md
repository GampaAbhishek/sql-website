# SQL Practice Hub

A comprehensive SQL practice platform with AI-powered question generation, built with Next.js, TypeScript, and MySQL.

## Features

- 🎯 **Interactive SQL Practice**: Execute SQL queries in a sandboxed environment
- 📚 **Static Topics**: Curated questions on fundamental SQL concepts
- 🤖 **AI-Generated Questions**: Custom questions for any SQL topic using ChatGPT
- ✅ **Automated Testing**: Real-time query validation and results comparison  
- 📊 **Progress Tracking**: Track your submissions and performance
- 🛡️ **Safe Environment**: Sandboxed database execution prevents data corruption

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 2
- **AI**: OpenAI GPT-3.5-turbo
- **Icons**: Lucide React

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MySQL server running locally
- OpenAI API key (for AI question generation)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd sql-practice
npm install
```

### 2. Database Setup

Make sure MySQL is running on your local machine. The application will automatically create the required database and tables.

Default MySQL connection settings:
- Host: localhost
- User: root  
- Password: (empty)
- Database: sql_practice

### 3. Environment Configuration

Copy the `.env.local` file and update the values:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sql_practice

# OpenAI Configuration (required for AI question generation)
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 5. Initialize the Database

When you first visit the application, it will automatically:
- Create the database if it doesn't exist
- Set up the required tables
- Seed with sample topics and questions

## Usage

### Static Practice

1. Select a topic from the sidebar (e.g., "SELECT Statements", "JOINs")
2. Choose a question to practice
3. View the database schema by clicking "View Database Schema"
4. Write your SQL query in the editor
5. Click "Execute Query" to test your solution
6. Get instant feedback with results comparison

### AI-Powered Question Generation

1. Click the "Generate Question" button in the header
2. Enter any SQL topic (e.g., "Complex JOINs with multiple tables", "Window functions for analytics")
3. The AI will generate a complete question with:
   - Problem description
   - Database schema setup
   - Test cases
   - Expected solution

### Features in Detail

#### Query Execution Engine
- **Sandboxed Environment**: Each query runs in a temporary database
- **Real-time Validation**: Compare your results with expected output
- **Error Handling**: Clear error messages for debugging
- **Performance Metrics**: Track query execution time

#### Question Management
- **Difficulty Levels**: Easy, Medium, Hard classifications
- **Topic Organization**: Questions grouped by SQL concepts
- **Schema Visualization**: See table structures and sample data
- **Solution Hints**: View expected solutions when needed

## Database Schema

### Tables

#### `topics`
- `id` - Primary key
- `name` - Topic name (e.g., "SELECT Statements")  
- `description` - Topic description
- `created_at` - Timestamp

#### `questions`
- `id` - Primary key
- `topic_id` - Foreign key to topics
- `title` - Question title
- `description` - Question description
- `difficulty` - easy/medium/hard
- `expected_query` - Solution SQL query
- `schema_setup` - Database setup SQL
- `test_cases` - JSON array of test cases
- `created_at` - Timestamp

#### `user_submissions`
- `id` - Primary key
- `question_id` - Foreign key to questions
- `user_query` - User's submitted SQL query
- `result` - Query execution results (JSON)
- `is_correct` - Boolean flag
- `execution_time` - Query performance metric
- `submitted_at` - Timestamp

## API Endpoints

- `GET /api/topics` - List all topics
- `POST /api/topics` - Create new topic
- `GET /api/topics/[id]/questions` - Get questions for a topic
- `POST /api/generate-question` - Generate AI question for custom topic
- `POST /api/execute-query` - Execute and validate SQL query
- `POST /api/init-db` - Initialize database schema

## Development

### Adding New Static Questions

1. Add questions via the database or by modifying `src/lib/database.ts`
2. Include proper schema setup SQL
3. Define test cases for validation
4. Set appropriate difficulty level

### Customizing Query Validation

The query executor in `src/lib/queryExecutor.ts` handles:
- Temporary database creation
- Schema setup execution  
- Query result comparison
- Cleanup and error handling

### AI Question Generation

The OpenAI integration in `src/lib/openai.ts`:
- Uses GPT-3.5-turbo for question generation
- Generates complete questions with schema and test cases
- Validates response structure
- Handles API errors gracefully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in `.env.local`
- Verify database permissions

### OpenAI API Issues  
- Ensure valid API key in `.env.local`
- Check API usage limits
- Verify network connectivity

### Query Execution Problems
- Check MySQL user permissions for database creation
- Ensure sufficient disk space for temporary databases
- Review error logs in browser console

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Leaderboards and achievements  
- [ ] More database engines (PostgreSQL, SQLite)
- [ ] Advanced analytics and insights
- [ ] Question sharing and community features
- [ ] Mobile-responsive design improvements
