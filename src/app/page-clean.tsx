'use client';

import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { TopicsSidebar } from '@/components/TopicsSidebar';
import { QuestionsList } from '@/components/QuestionsList';
import { QuestionDetails } from '@/components/QuestionDetails';
import { CustomTopicGenerator } from '@/components/CustomTopicGenerator';
import { GenerateSimilarQuestions } from '@/components/GenerateSimilarQuestions';

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
    if (!userQuery.trim() || !selectedQuestion) return;

    setLoading(true);
    setQueryResult(null);

    try {
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          questionId: selectedQuestion.id
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
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topicName, 
          requirements: requirements || undefined 
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchTopics();
        if (selectedTopic && result.topicId === selectedTopic.id) {
          await fetchQuestions(selectedTopic.id);
        }
        setCustomTopic('');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onGenerateQuestion={() => setShowCustomTopic(!showCustomTopic)}
        showCustomTopic={showCustomTopic}
      />

      <CustomTopicGenerator
        showCustomTopic={showCustomTopic}
        customTopic={customTopic}
        onCustomTopicChange={setCustomTopic}
        generatingQuestion={generatingQuestion}
        onGenerateQuestion={generateCustomQuestion}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <TopicsSidebar
            topics={topics}
            selectedTopic={selectedTopic}
            onTopicSelect={handleTopicSelect}
          />

          <div className="lg:col-span-2">
            {selectedTopic ? (
              <div className="space-y-6">
                <QuestionsList
                  questions={questions}
                  selectedQuestion={selectedQuestion}
                  onQuestionSelect={handleQuestionSelect}
                />

                {selectedQuestion && (
                  <QuestionDetails
                    question={selectedQuestion}
                    userQuery={userQuery}
                    onUserQueryChange={setUserQuery}
                    queryResult={queryResult}
                    loading={loading}
                    onExecuteQuery={executeQuery}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to SQL Practice Hub</h3>
                <p className="text-gray-600 mb-6">
                  Select a topic from the sidebar to start practicing SQL queries, or generate custom questions using AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Practice Mode</h4>
                    <p className="text-sm text-gray-600">Choose from curated SQL topics and solve real-world problems</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Generator</h4>
                    <p className="text-sm text-gray-600">Generate custom questions tailored to your learning needs</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedTopic && (
              <GenerateSimilarQuestions
                selectedTopic={selectedTopic}
                customTopic={customTopic}
                onCustomTopicChange={setCustomTopic}
                generatingQuestion={generatingQuestion}
                onGenerateQuestion={generateQuestion}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
