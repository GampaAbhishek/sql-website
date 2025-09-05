'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Clock, 
  Play, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';

interface TestQuestion {
  id: string;
  title: string;
  description: string;
  schema: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface TestSession {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: TestQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: Set<string>;
  startTime: Date;
  timeRemaining: number;
  candidateName: string;
  candidateEmail: string;
}

export default function TestTakingPage() {
  const params = useParams();
  const testId = params?.testId as string;
  
  const [session, setSession] = useState<TestSession>({
    id: testId || '1',
    title: 'Junior SQL Developer Assessment',
    description: 'Basic SQL skills test for junior developer positions',
    timeLimit: 60 * 60, // 60 minutes in seconds
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    startTime: new Date(),
    timeRemaining: 60 * 60,
    candidateName: 'John Doe',
    candidateEmail: 'john@example.com',
    questions: [
      {
        id: 'q1',
        title: 'Basic SELECT Query',
        description: 'Write a query to select all employees whose salary is greater than 50,000. Include their name, salary, and department.',
        schema: `CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department VARCHAR(50) NOT NULL,
    hire_date DATE
);

-- Sample data
INSERT INTO employees VALUES 
(1, 'Alice Johnson', 75000, 'Engineering', '2022-01-15'),
(2, 'Bob Smith', 45000, 'Marketing', '2021-06-10'),
(3, 'Carol Davis', 65000, 'Engineering', '2020-03-20'),
(4, 'David Wilson', 40000, 'Sales', '2023-01-05');`,
        points: 15,
        difficulty: 'easy',
        category: 'Basic Queries'
      },
      {
        id: 'q2',
        title: 'JOIN Operation',
        description: 'Write a query to find all orders along with customer information. Include customer name, order date, and total amount. Order by order date (newest first).',
        schema: `CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    city VARCHAR(50)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Sample data
INSERT INTO customers VALUES 
(1, 'John Doe', 'john@example.com', 'New York'),
(2, 'Jane Smith', 'jane@example.com', 'Los Angeles');

INSERT INTO orders VALUES 
(1, 1, '2024-02-15', 150.00),
(2, 2, '2024-02-18', 200.00),
(3, 1, '2024-02-20', 75.50);`,
        points: 20,
        difficulty: 'medium',
        category: 'Joins'
      },
      {
        id: 'q3',
        title: 'Aggregate Functions',
        description: 'Write a query to find the department with the highest average salary. Include the department name and the average salary, rounded to 2 decimal places.',
        schema: `CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- Sample data
INSERT INTO employees VALUES 
(1, 'Alice Johnson', 75000, 'Engineering'),
(2, 'Bob Smith', 45000, 'Marketing'),
(3, 'Carol Davis', 85000, 'Engineering'),
(4, 'David Wilson', 40000, 'Sales'),
(5, 'Eve Brown', 50000, 'Marketing'),
(6, 'Frank Miller', 90000, 'Engineering');`,
        points: 25,
        difficulty: 'hard',
        category: 'Aggregation'
      }
    ]
  });

  const [currentQuery, setCurrentQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSchema, setShowSchema] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = session.questions[session.currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSession(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          handleSubmitTest();
          return prev;
        }
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Load saved answer when question changes
  useEffect(() => {
    const savedAnswer = session.answers[currentQuestion.id] || '';
    setCurrentQuery(savedAnswer);
  }, [session.currentQuestionIndex, currentQuestion.id, session.answers]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds < 300) return 'text-red-400'; // Less than 5 minutes
    if (seconds < 900) return 'text-yellow-400'; // Less than 15 minutes
    return 'text-white';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result based on query content
      const mockResult = {
        columns: ['name', 'salary', 'department'],
        rows: [
          ['Alice Johnson', 75000, 'Engineering'],
          ['Carol Davis', 65000, 'Engineering']
        ],
        executionTime: 45
      };
      
      setQueryResult(mockResult);
    } catch (error) {
      setQueryResult({
        error: 'Query execution failed',
        details: 'Please check your SQL syntax and try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveAnswer = () => {
    setSession(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: currentQuery
      }
    }));
  };

  const handleNextQuestion = () => {
    handleSaveAnswer();
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
      setQueryResult(null);
    }
  };

  const handlePreviousQuestion = () => {
    handleSaveAnswer();
    if (session.currentQuestionIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
      setQueryResult(null);
    }
  };

  const handleFlagQuestion = () => {
    setSession(prev => {
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(currentQuestion.id)) {
        newFlagged.delete(currentQuestion.id);
      } else {
        newFlagged.add(currentQuestion.id);
      }
      return { ...prev, flaggedQuestions: newFlagged };
    });
  };

  const handleSubmitTest = () => {
    handleSaveAnswer();
    setIsSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Test Submitted!</h1>
          <p className="text-slate-300 mb-6">
            Thank you for completing the SQL assessment. Your responses have been recorded and will be reviewed by our team.
          </p>
          <p className="text-slate-400 text-sm">
            You will receive results via email within 2-3 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">{session.title}</h1>
            <p className="text-slate-400 text-sm">{session.candidateName} • {session.candidateEmail}</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-300 text-sm">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </span>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 ${getTimeColor(session.timeRemaining)}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(session.timeRemaining)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">{currentQuestion.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {currentQuestion.points} points
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{currentQuestion.description}</p>
                </div>
                
                <button
                  onClick={handleFlagQuestion}
                  className={`p-2 rounded-lg transition-colors ${
                    session.flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-slate-700 text-slate-400 hover:text-yellow-400'
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Schema */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Database Schema
                </h3>
                <button
                  onClick={() => setShowSchema(!showSchema)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {showSchema ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {showSchema && (
                <div className="p-4">
                  <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                    <code>{currentQuestion.schema}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* SQL Editor */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-3">Your SQL Query</h3>
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  placeholder="-- Write your SQL query here..."
                  className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handleRunQuery}
                  disabled={!currentQuery.trim() || isRunning}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Test Query'}
                </button>
                
                <button
                  onClick={handleSaveAnswer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Answer
                </button>
              </div>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-medium text-white mb-3">Query Results</h3>
                {queryResult.error ? (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">Error</span>
                    </div>
                    <p className="text-red-300">{queryResult.details}</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {queryResult.columns.map((column: string) => (
                            <th key={column} className="text-left p-2 text-slate-300 font-medium">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row: any[], index: number) => (
                          <tr key={index} className="border-b border-slate-800">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2 text-slate-300">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-slate-400 text-xs mt-2">
                      {queryResult.rows.length} rows returned • Executed in {queryResult.executionTime}ms
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Navigation */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Navigation</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {session.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      handleSaveAnswer();
                      setSession(prev => ({ ...prev, currentQuestionIndex: index }));
                      setQueryResult(null);
                    }}
                    className={`p-2 rounded text-sm font-medium transition-colors relative ${
                      index === session.currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : session.answers[question.id]
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {index + 1}
                    {session.flaggedQuestions.has(question.id) && (
                      <Flag className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={session.currentQuestionIndex === 0}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={session.currentQuestionIndex === session.questions.length - 1}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Answered</span>
                  <span className="text-white">
                    {Object.keys(session.answers).length}/{session.questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flagged</span>
                  <span className="text-yellow-400">{session.flaggedQuestions.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Used</span>
                  <span className="text-white">
                    {formatTime(session.timeLimit - session.timeRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Test */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Submit Test</h3>
              <p className="text-slate-400 text-sm mb-4">
                Make sure you have answered all questions before submitting. You cannot change your answers after submission.
              </p>
              <button
                onClick={handleSubmitTest}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
