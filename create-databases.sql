-- =============================================================================
-- SQL Practice Hub - Database Creation Script
-- =============================================================================
-- This script creates all required databases for SQL Practice Hub platform
-- Compatible with both PostgreSQL and MySQL
-- Safe to run multiple times (idempotent)
-- Date: September 5, 2025
-- =============================================================================

-- =============================================================================
-- POSTGRESQL VERSION (ACTIVE)
-- =============================================================================

-- Core Application Database
-- Contains user management, authentication, lessons, and progress tracking
CREATE DATABASE sqlhub
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE sqlhub IS 'Core application database for SQL Practice Hub - handles users, auth, lessons, and progress tracking';

-- Interactive Playground Database
-- Provides sandbox environment for SQL query practice and experimentation
CREATE DATABASE playground
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE playground IS 'Interactive SQL editor environment for practicing queries with sample datasets';

-- Challenges and Assessments Database
-- Stores coding challenges, quizzes, and automated answer validation
CREATE DATABASE challenges
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE challenges IS 'Challenges, quizzes, and auto-check answers database for skill assessment';

-- Analytics and Reporting Database
-- Tracks performance metrics for teachers and recruiters
CREATE DATABASE analytics
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE analytics IS 'Teacher and recruiter tracking database for performance analytics and reports';

-- Interview Preparation Database
-- Powers AI-driven interview sessions and technical assessments
CREATE DATABASE interview_prep
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE interview_prep IS 'AI-powered interview sessions and technical assessment database';

-- Gamification Database
-- Manages badges, achievements, leaderboards, and reward systems
CREATE DATABASE gamification
  WITH ENCODING 'UTF8'
       TEMPLATE template0
       LC_COLLATE 'en_US.UTF-8'
       LC_CTYPE 'en_US.UTF-8';
COMMENT ON DATABASE gamification IS 'Badges, achievements, and leaderboards database for user engagement';

-- Optional: Create application user (uncomment if needed)
-- CREATE USER app_user WITH PASSWORD 'secure_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE sqlhub TO app_user;
-- GRANT ALL PRIVILEGES ON DATABASE playground TO app_user;
-- GRANT ALL PRIVILEGES ON DATABASE challenges TO app_user;
-- GRANT ALL PRIVILEGES ON DATABASE analytics TO app_user;
-- GRANT ALL PRIVILEGES ON DATABASE interview_prep TO app_user;
-- GRANT ALL PRIVILEGES ON DATABASE gamification TO app_user;

-- =============================================================================
-- TABLE SCHEMAS FOR ALL DATABASES
-- =============================================================================

-- Switch to sqlhub database and create core application tables
\c sqlhub;

-- Users table for authentication and user management
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'recruiter', 'admin')) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Core user accounts with authentication and role management';

-- Sessions table for user authentication tokens
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE sessions IS 'User authentication sessions and token management';

-- Lessons table for educational content
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE lessons IS 'Educational lessons and SQL tutorials';

-- User progress tracking for lessons
CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);
COMMENT ON TABLE user_progress IS 'Tracks user progress through lessons and scores';

-- Indexes for sqlhub database
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX idx_lessons_order ON lessons(order_index);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- Switch to playground database and create interactive SQL editor tables
\c playground;

-- Playground sessions for SQL practice
CREATE TABLE playground_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    schema_json JSONB NOT NULL, -- Database schema configuration
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE playground_sessions IS 'Interactive SQL editor sessions with custom schemas';

-- Query execution history in playground
CREATE TABLE queries (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES playground_sessions(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    result_json JSONB, -- Query execution results
    is_correct BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE queries IS 'Query execution history and results in playground sessions';

-- Indexes for playground database
CREATE INDEX idx_playground_sessions_user_id ON playground_sessions(user_id);
CREATE INDEX idx_playground_sessions_started ON playground_sessions(started_at);
CREATE INDEX idx_queries_session_id ON queries(session_id);
CREATE INDEX idx_queries_executed_at ON queries(executed_at);
CREATE INDEX idx_queries_is_correct ON queries(is_correct);

-- Switch to challenges database and create challenge system tables
\c challenges;

-- SQL challenges and coding problems
CREATE TABLE challenges (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    expected_output JSONB NOT NULL, -- Expected query results
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE challenges IS 'SQL coding challenges and problem sets';

-- User challenge submissions and results
CREATE TABLE user_challenges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    challenge_id BIGINT REFERENCES challenges(id) ON DELETE CASCADE,
    submission TEXT NOT NULL,
    result JSONB, -- Submission results and feedback
    score INTEGER CHECK (score >= 0 AND score <= 100),
    attempts INTEGER DEFAULT 1,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);
COMMENT ON TABLE user_challenges IS 'User submissions and results for SQL challenges';

-- Indexes for challenges database
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_created_at ON challenges(created_at);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_user_challenges_score ON user_challenges(score);
CREATE INDEX idx_user_challenges_completed_at ON user_challenges(completed_at);

-- Switch to analytics database and create reporting tables
\c analytics;

-- Classroom management for teachers
CREATE TABLE classrooms (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE classrooms IS 'Teacher-managed classrooms for student groups';

-- Student enrollment in classrooms
CREATE TABLE classroom_users (
    id BIGSERIAL PRIMARY KEY,
    classroom_id BIGINT REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(classroom_id, user_id)
);
COMMENT ON TABLE classroom_users IS 'Student enrollment and classroom membership';

-- Recruiter-created technical tests
CREATE TABLE recruiter_tests (
    id BIGSERIAL PRIMARY KEY,
    recruiter_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    title VARCHAR(255) NOT NULL,
    description TEXT,
    config_json JSONB NOT NULL, -- Test configuration and questions
    time_limit INTEGER, -- Time limit in minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE recruiter_tests IS 'Technical assessments created by recruiters';

-- Test results and candidate performance
CREATE TABLE test_results (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT REFERENCES recruiter_tests(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    score INTEGER CHECK (score >= 0 AND score <= 100),
    results_json JSONB, -- Detailed test results and answers
    time_taken INTEGER, -- Time taken in minutes
    completed_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE test_results IS 'Candidate performance and results on recruiter tests';

-- Indexes for analytics database
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_created_at ON classrooms(created_at);
CREATE INDEX idx_classroom_users_classroom_id ON classroom_users(classroom_id);
CREATE INDEX idx_classroom_users_user_id ON classroom_users(user_id);
CREATE INDEX idx_recruiter_tests_recruiter_id ON recruiter_tests(recruiter_id);
CREATE INDEX idx_recruiter_tests_created_at ON recruiter_tests(created_at);
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_score ON test_results(score);

-- Switch to interview_prep database and create AI interview tables
\c interview_prep;

-- AI-powered interview sessions
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    difficulty VARCHAR(20) CHECK (difficulty IN ('junior', 'mid', 'senior')) DEFAULT 'junior',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback JSONB, -- AI-generated feedback and analysis
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE interviews IS 'AI-powered technical interview sessions';

-- Individual questions within interview sessions
CREATE TABLE interview_questions (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    expected_output JSONB NOT NULL, -- Expected answer format and results
    user_submission TEXT,
    result JSONB, -- Evaluation results and scoring
    hints JSONB, -- AI-provided hints and guidance
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE interview_questions IS 'Individual questions and responses in AI interviews';

-- Indexes for interview_prep database
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_difficulty ON interviews(difficulty);
CREATE INDEX idx_interviews_started_at ON interviews(started_at);
CREATE INDEX idx_interviews_score ON interviews(score);
CREATE INDEX idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX idx_interview_questions_order ON interview_questions(order_index);

-- Switch to gamification database and create engagement tables
\c gamification;

-- Achievement badges system
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    requirements JSONB, -- Badge earning criteria
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE badges IS 'Achievement badges and rewards system';

-- User earned badges tracking
CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Reference to users table in sqlhub
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);
COMMENT ON TABLE user_badges IS 'User earned badges and achievement tracking';

-- Leaderboard and ranking system
CREATE TABLE leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE, -- Reference to users table in sqlhub
    points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    rank_position INTEGER,
    total_challenges INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
COMMENT ON TABLE leaderboard IS 'User rankings, points, and gamification metrics';

-- Indexes for gamification database
CREATE INDEX idx_badges_name ON badges(name);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank_position);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Connect back to postgres to verify all databases and tables were created
\c postgres;

-- Verify databases were created successfully
SELECT datname as "Database Name", 
       pg_encoding_to_char(encoding) as "Encoding",
       datcollate as "Collation"
FROM pg_database 
WHERE datname IN ('sqlhub', 'playground', 'challenges', 'analytics', 'interview_prep', 'gamification')
ORDER BY datname;

-- Verify table counts in each database
SELECT 
    'sqlhub' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'sqlhub' AND table_schema = 'public') as table_count
UNION ALL
SELECT 
    'playground' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'playground' AND table_schema = 'public') as table_count
UNION ALL
SELECT 
    'challenges' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'challenges' AND table_schema = 'public') as table_count
UNION ALL
SELECT 
    'analytics' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'analytics' AND table_schema = 'public') as table_count
UNION ALL
SELECT 
    'interview_prep' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'interview_prep' AND table_schema = 'public') as table_count
UNION ALL
SELECT 
    'gamification' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_catalog = 'gamification' AND table_schema = 'public') as table_count;

-- =============================================================================
-- MYSQL VERSION (REFERENCE - UNCOMMENT IF NEEDED)
-- =============================================================================

/*
-- Core Application Database
-- Contains user management, authentication, lessons, and progress tracking
CREATE DATABASE IF NOT EXISTS sqlhub
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- Core application database for SQL Practice Hub - handles users, auth, lessons, and progress tracking

-- Interactive Playground Database
-- Provides sandbox environment for SQL query practice and experimentation
CREATE DATABASE IF NOT EXISTS playground
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- Interactive SQL editor environment for practicing queries with sample datasets

-- Challenges and Assessments Database
-- Stores coding challenges, quizzes, and automated answer validation
CREATE DATABASE IF NOT EXISTS challenges
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- Challenges, quizzes, and auto-check answers database for skill assessment

-- Analytics and Reporting Database
-- Tracks performance metrics for teachers and recruiters
CREATE DATABASE IF NOT EXISTS analytics
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- Teacher and recruiter tracking database for performance analytics and reports

-- Interview Preparation Database
-- Powers AI-driven interview sessions and technical assessments
CREATE DATABASE IF NOT EXISTS interview_prep
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- AI-powered interview sessions and technical assessment database

-- Gamification Database
-- Manages badges, achievements, leaderboards, and reward systems
CREATE DATABASE IF NOT EXISTS gamification
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
-- Badges, achievements, and leaderboards database for user engagement

-- Optional: Create application user (uncomment if needed)
-- CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT ALL PRIVILEGES ON sqlhub.* TO 'app_user'@'localhost';
-- GRANT ALL PRIVILEGES ON playground.* TO 'app_user'@'localhost';
-- GRANT ALL PRIVILEGES ON challenges.* TO 'app_user'@'localhost';
-- GRANT ALL PRIVILEGES ON analytics.* TO 'app_user'@'localhost';
-- GRANT ALL PRIVILEGES ON interview_prep.* TO 'app_user'@'localhost';
-- GRANT ALL PRIVILEGES ON gamification.* TO 'app_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify databases were created successfully
SHOW DATABASES LIKE '%sqlhub%' 
UNION ALL
SELECT SCHEMA_NAME as 'Database' 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME IN ('playground', 'challenges', 'analytics', 'interview_prep', 'gamification')
ORDER BY 1;
*/

-- =============================================================================
-- EXECUTION INSTRUCTIONS
-- =============================================================================
/*
POSTGRESQL:
1. Connect to PostgreSQL as superuser: psql -U postgres
2. Uncomment the PostgreSQL section above
3. Execute this script: \i create-databases.sql
4. Verify creation with: \l

MYSQL:
1. Connect to MySQL as root: mysql -u root -p
2. Uncomment the MySQL section above  
3. Execute this script: source create-databases.sql
4. Verify creation with: SHOW DATABASES;

SECURITY NOTES:
- Change default passwords before production use
- Consider using environment variables for credentials
- Restrict database user permissions as needed
- Enable SSL connections for production environments

NEXT STEPS:
After running this script:
1. Create database schemas and tables
2. Set up connection pooling
3. Configure backup strategies
4. Implement monitoring and logging
*/

-- =============================================================================
-- DATABASE PURPOSE SUMMARY
-- =============================================================================
/*
┌─────────────────┬─────────────────────────────────────────────────────────┐
│ Database        │ Purpose                                                 │
├─────────────────┼─────────────────────────────────────────────────────────┤
│ sqlhub          │ Core app: users, auth, lessons, progress tracking      │
│ playground      │ Interactive SQL editor with sample datasets            │
│ challenges      │ Coding challenges, quizzes, auto-validation            │
│ analytics       │ Teacher/recruiter dashboards and reporting             │
│ interview_prep  │ AI-powered technical interviews and assessments        │
│ gamification    │ Badges, achievements, leaderboards, rewards            │
└─────────────────┴─────────────────────────────────────────────────────────┘

Total Storage Estimate: 50GB-100GB for production workload
Recommended Configuration: Master-slave replication with read replicas
*/
