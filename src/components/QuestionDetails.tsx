'use client';

import { Play, Loader2 } from 'lucide-react';
import { ResultComparison } from './ResultComparison';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  schema_setup: string;
}

interface QueryResult {
  isCorrect: boolean;
  result: Record<string, unknown>[];
  error?: string;
  executionTime: number;
  expectedQuery?: string;
  expectedResult?: Record<string, unknown>[];
  testCases?: Record<string, unknown>[];
}

interface QuestionDetailsProps {
  question: Question;
  userQuery: string;
  onUserQueryChange: (query: string) => void;
  queryResult: QueryResult | null;
  loading: boolean;
  onExecuteQuery: () => void;
}

export function QuestionDetails({ 
  question, 
  userQuery, 
  onUserQueryChange, 
  queryResult, 
  loading, 
  onExecuteQuery 
}: QuestionDetailsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
          <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
        <p className="text-gray-700 mb-4">{question.description}</p>
        
        {/* Schema Setup */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Database Schema:</h3>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">{question.schema_setup}</pre>
        </div>
      </div>

      {/* SQL Editor */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your SQL Query</h3>
        <div className="space-y-4">
          <textarea
            value={userQuery}
            onChange={(e) => onUserQueryChange(e.target.value)}
            placeholder="Write your SQL query here..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={onExecuteQuery}
            disabled={!userQuery.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
      </div>

      {/* Results */}
      {queryResult && (
        <ResultComparison 
          userResult={queryResult.result}
          expectedResult={queryResult.expectedResult}
          isCorrect={queryResult.isCorrect}
          error={queryResult.error}
        />
      )}
    </div>
  );
}
