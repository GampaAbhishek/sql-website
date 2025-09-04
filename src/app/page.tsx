'use client';

import { useState, useEffect } from 'react';
import { Database, Play, Book, Plus, Loader2 } from 'lucide-react';
import { ResultComparison } from '@/components/ResultComparison';

interface Topic {
  id: number;
  name: string;
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

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

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  console.log('topics: ', topics);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomTopic, setShowCustomTopic] = useState(false);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);

  useEffect(() => {
    fetchTopics();
    // Initialize database on first load
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await fetch('/api/init-db', { method: 'POST' });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      
      if (response.ok) {
        setTopics(data);
      } else {
        console.error('Failed to fetch topics:', data);
        // Show user-friendly error for database connection issues
        if (data.details?.code === 'ECONNREFUSED') {
          alert('Database Connection Error!\n\nMySQL is not running or connection failed.\n\nPlease check:\n1. MySQL service is running\n2. Credentials in .env.local are correct\n3. Visit /api/test-db for detailed diagnostics\n\nSee MYSQL_SETUP.md for help.');
        }
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchQuestions = async (topicId: number) => {
    try {
      const response = await fetch(`/api/topics/${topicId}/questions`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedQuestion(null);
    setUserQuery('');
    setQueryResult(null);
    fetchQuestions(topic.id);
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setUserQuery('');
    setQueryResult(null);
  };

  const executeQuery = async () => {
    if (!selectedQuestion || !userQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          userQuery: userQuery.trim()
        })
      });
      
      const result = await response.json();
      setQueryResult(result);
    } catch (error) {
      console.error('Failed to execute query:', error);
      setQueryResult({
        isCorrect: false,
        result: [],
        error: 'Failed to execute query',
        executionTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = async (topicName: string, requirements: string = '') => {
    setGeneratingQuestion(true);
    try {
      const finalTopic = requirements.trim() 
        ? `${topicName} ${requirements.trim()}` 
        : topicName;
        
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: finalTopic })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Refresh the questions for the current topic
        if (selectedTopic) {
          await handleTopicSelect(selectedTopic);
        }
        setCustomTopic('');
        // Show success message
        alert('New question generated successfully!');
      } else {
        alert(result.error || 'Failed to generate question');
      }
    } catch (error) {
      console.error('Failed to generate question:', error);
      alert('Failed to generate question');
    } finally {
      setGeneratingQuestion(false);
    }
  };

  const generateCustomQuestion = async () => {
    if (!customTopic.trim()) return;

    setGeneratingQuestion(true);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: customTopic.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Refresh topics and select the new/existing topic
        await fetchTopics();
        const topic = topics.find(t => t.name === customTopic.trim()) || 
                    { id: result.topicId, name: customTopic.trim(), description: '' };
        handleTopicSelect(topic);
        setCustomTopic('');
        setShowCustomTopic(false);
      } else {
        alert(result.error || 'Failed to generate question');
      }
    } catch (error) {
      console.error('Failed to generate question:', error);
      alert('Failed to generate question');
    } finally {
      setGeneratingQuestion(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-700 bg-green-100 border-green-200';
      case 'intermediate': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'advanced': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'expert': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '⚡';
      case 'expert': return '🔥';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SQL Practice Hub</h1>
            </div>
            <button
              onClick={() => setShowCustomTopic(!showCustomTopic)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Question
            </button>
          </div>
        </div>
      </header>

      {showCustomTopic && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter a custom SQL topic (e.g., 'Complex JOINs with multiple tables')"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={generateCustomQuestion}
                disabled={!customTopic.trim() || generatingQuestion}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Topics
              </h2>
              <div className="space-y-3">
                {topics && topics.length > 0 ? (
                  <>
                    {['beginner', 'intermediate', 'advanced', 'expert'].map(level => {
                      const levelTopics = topics.filter(topic => topic.level === level);
                      if (levelTopics.length === 0) return null;
                      
                      return (
                        <div key={level} className="space-y-2">
                          <h3 className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full inline-flex items-center gap-1 ${getLevelColor(level)}`}>
                            <span>{getLevelIcon(level)}</span>
                            {level}
                          </h3>
                          {levelTopics.map((topic) => (
                            <button
                              key={topic.id}
                              onClick={() => handleTopicSelect(topic)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedTopic?.id === topic.id
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'hover:bg-gray-50 border border-transparent'
                              }`}
                            >
                              <div className="font-medium">{topic.name}</div>
                              {topic.description && (
                                <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-600">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading topics...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedTopic ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to SQL Practice Hub</h3>
                <p className="text-gray-600 mb-6">
                  Select a topic from the sidebar to start practicing SQL queries, or generate custom questions using AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">📚 Static Topics</h4>
                    <p className="text-sm text-gray-600">Practice with curated questions on fundamental SQL concepts</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">🤖 AI Generated</h4>
                    <p className="text-sm text-gray-600">Get custom questions for any SQL topic using ChatGPT</p>
                  </div>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : !selectedQuestion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTopic.name}</h2>
                    <p className="text-gray-600">{selectedTopic.description}</p>
                  </div>
                  
                  {/* Generate More Questions Section */}
                  <div className="bg-white rounded-lg shadow-sm border p-4 w-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Generate More Questions</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder={`Add specific requirements for ${selectedTopic.name}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => generateQuestion(selectedTopic.name, customTopic)}
                        disabled={generatingQuestion}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {generatingQuestion ? 'Generating...' : 'Generate Question'}
                      </button>
                      <p className="text-xs text-gray-500">
                        Leave blank for general {selectedTopic.name} questions or specify requirements like &ldquo;with joins&rdquo;, &ldquo;complex subqueries&rdquo;, etc.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => handleQuestionSelect(question)}
                      className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600">{question.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Question Content */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedQuestion(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ← Back to {selectedTopic.name}
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedQuestion.title}</h2>
                      <p className="text-gray-600 mb-4">{selectedQuestion.description}</p>
                      
                      <details className="mb-4">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                          View Database Schema
                        </summary>
                        <pre className="mt-3 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                          {selectedQuestion.schema_setup}
                        </pre>
                      </details>
                    </div>

                    <div className="p-6">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Your SQL Query:
                      </label>
                      <textarea
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SELECT * FROM ..."
                      />
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                          {userQuery.length} characters
                        </div>
                        <button
                          onClick={executeQuery}
                          disabled={loading || !userQuery.trim()}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                          Execute Query
                        </button>
                      </div>
                    </div>
                  </div>

                  {queryResult && (
                    <div className={`bg-white rounded-lg shadow-sm border ${
                      queryResult.isCorrect ? 'border-green-200' : 'border-red-200'
                    }`}>
                      <div className={`p-6 ${
                        queryResult.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-3 h-3 rounded-full ${
                            queryResult.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <h3 className="text-lg font-semibold">
                            {queryResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                          </h3>
                          <span className="text-sm text-gray-600 ml-auto">
                            Executed in {queryResult.executionTime}s
                          </span>
                        </div>

                        <ResultComparison
                          userResult={queryResult.result}
                          expectedResult={queryResult.expectedResult}
                          isCorrect={queryResult.isCorrect}
                          error={queryResult.error}
                        />

                        {!queryResult.isCorrect && queryResult.expectedQuery && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                              Show Expected Solution
                            </summary>
                            <pre className="mt-3 p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                              {queryResult.expectedQuery}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sidebar - Generate More Questions */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Generate Similar Questions</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder={`Specify requirements for ${selectedTopic.name}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => generateQuestion(selectedTopic.name, customTopic)}
                        disabled={generatingQuestion}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {generatingQuestion ? 'Generating...' : 'Generate Question'}
                      </button>
                      <p className="text-xs text-gray-500">
                        Leave blank for general {selectedTopic.name} questions or specify requirements like &ldquo;with joins&rdquo;, &ldquo;harder difficulty&rdquo;, etc.
                      </p>
                      
                      <div className="pt-3 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Suggestions:</h4>
                        <div className="space-y-1">
                          {['with joins', 'complex subqueries', 'harder difficulty', 'with aggregations', 'with window functions'].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setCustomTopic(suggestion)}
                              className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
