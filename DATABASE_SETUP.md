# Database Configuration for SQL Practice Hub

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sql_practice_hub"
POSTGRES_USER=sql_practice_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sql_practice_hub
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# AI Services Configuration
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4
AI_MAX_TOKENS=2000

# Authentication & Security
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=development
APP_NAME="SQL Practice Hub"
APP_VERSION=2.0.0

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Analytics (Optional)
ANALYTICS_TRACKING_ID=your_analytics_id
```

## Database Setup Instructions

### Option 1: PostgreSQL (Recommended)

1. **Install PostgreSQL**
   ```powershell
   # Using Chocolatey
   choco install postgresql

   # Or download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database and User**
   ```sql
   -- Connect as postgres superuser
   CREATE USER sql_practice_user WITH PASSWORD 'your_secure_password';
   CREATE DATABASE sql_practice_hub OWNER sql_practice_user;
   GRANT ALL PRIVILEGES ON DATABASE sql_practice_hub TO sql_practice_user;
   ```

3. **Run Database Schema**
   ```powershell
   # Navigate to project directory
   cd "C:\Users\mcsr8\OneDrive\Desktop\sql-website"
   
   # Run the schema file
   psql -h localhost -U sql_practice_user -d sql_practice_hub -f database-schema-enhanced.sql
   ```

### Option 2: Docker PostgreSQL (Alternative)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       container_name: sql_practice_postgres
       environment:
         POSTGRES_USER: sql_practice_user
         POSTGRES_PASSWORD: your_secure_password
         POSTGRES_DB: sql_practice_hub
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./database-schema-enhanced.sql:/docker-entrypoint-initdb.d/init.sql
   
   volumes:
     postgres_data:
   ```

2. **Start Database**
   ```powershell
   docker-compose up -d
   ```

### Option 3: Cloud Database (Production)

#### Supabase (Recommended for deployment)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Run schema in Supabase SQL Editor

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Copy connection details to environment variables

#### Vercel Postgres
1. Go to Vercel Dashboard
2. Create Postgres database
3. Copy connection string

## Database Schema Overview

The enhanced schema includes these main tables:

### Core Tables
- **users** - User accounts and profiles
- **user_progress** - Learning progress tracking
- **activity_logs** - All user activity logging

### Content Management
- **lessons** - Structured learning content
- **challenges** - Practice problems and coding challenges
- **interview_questions** - AI-generated interview questions

### AI & Personalization
- **ai_conversations** - Chat history with AI assistant
- **weakness_analysis** - AI analysis of user weak areas
- **personalized_content** - Custom content recommendations

### Gamification
- **badges** - Achievement system
- **user_badges** - User badge awards
- **leaderboards** - Competitive rankings
- **streaks** - Daily practice streaks

### Analytics
- **usage_analytics** - Platform usage statistics
- **performance_metrics** - Query performance tracking

## Connection Testing

After setup, test your database connection:

```powershell
# Test PostgreSQL connection
psql -h localhost -U sql_practice_user -d sql_practice_hub -c "SELECT version();"

# Test from Node.js (create test file)
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => {
  console.log('Database connected:', res.rows[0]);
  pool.end();
}).catch(err => console.error('Connection error:', err));
"
```

## Performance Optimization

### Recommended Indexes
```sql
-- Performance indexes (already included in schema)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_topic ON user_progress(user_id, topic);
```

### Connection Pool Settings
```javascript
// Recommended pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if no connection available
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## Migration Strategy

### From Current State to Data-Driven

1. **Phase 1: Database Setup** (Current)
   - Set up PostgreSQL database
   - Run initial schema
   - Test database connections

2. **Phase 2: User Management Integration**
   - Migrate existing auth to database-backed system
   - Add user profile management
   - Implement activity logging

3. **Phase 3: AI Integration**
   - Connect AI services to database
   - Implement personalized content generation
   - Add weakness analysis

4. **Phase 4: Advanced Features**
   - Teacher/recruiter dashboards
   - Advanced analytics
   - Gamification system

## Backup and Maintenance

### Automated Backups
```bash
# Daily backup script
pg_dump -h localhost -U sql_practice_user sql_practice_hub > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U sql_practice_user -d sql_practice_hub < backup_20241201.sql
```

### Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for high error rates
- Monitor disk space and backup success

## Security Considerations

1. **Database Security**
   - Use strong passwords
   - Limit database user permissions
   - Enable SSL connections in production
   - Regular security updates

2. **Application Security**
   - Sanitize all user inputs
   - Use parameterized queries
   - Implement rate limiting
   - Encrypt sensitive data

3. **API Key Security**
   - Store API keys in environment variables
   - Rotate keys regularly
   - Monitor API usage
   - Implement usage limits

## Next Steps

1. Set up your preferred database option
2. Configure environment variables
3. Test database connection
4. Run initial schema migration
5. Update existing components to use database
6. Implement AI-powered features

## Troubleshooting

### Common Issues

**Connection Refused**
- Check if PostgreSQL is running
- Verify connection string format
- Check firewall settings

**Authentication Failed**
- Verify username/password
- Check user permissions
- Ensure database exists

**Schema Errors**
- Check PostgreSQL version compatibility
- Verify user has CREATE permissions
- Run schema in correct order

**Performance Issues**
- Monitor connection pool usage
- Check for missing indexes
- Analyze slow queries
- Consider connection pooling

### Support Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Node.js pg library: https://node-postgres.com/
- Supabase Documentation: https://supabase.com/docs
- Railway Documentation: https://docs.railway.app/
