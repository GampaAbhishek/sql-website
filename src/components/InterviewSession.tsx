'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Play, SkipForward, CheckCircle, AlertCircle, Database, ArrowLeft, ArrowRight } from 'lucide-react';

interface QuestionResult {
  questionId: string;
  userAnswer: string;
  userQuery: string;
  isCorrect: boolean;
  timeSpent: number;
  skipped: boolean;
  points: number;
}

interface InterviewConfig {
  timerMode: 'fixed' | 'perQuestion';
  timeLimit: number;
}

interface InterviewSessionData {
  sessionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  totalTimeLimit: number;
  currentQuestionIndex: number;
  questions: any[];
  responses: any[];
  results: QuestionResult[];
  startTime: string;
  aiPersonality: string;
  adaptiveMode: boolean;
  config: InterviewConfig;
}

interface InterviewSessionProps {
  sessionData: InterviewSessionData;
  onSessionComplete: (results: QuestionResult[]) => void;
  onUpdateSession: (sessionData: InterviewSessionData) => void;
}

export default function InterviewSession({ 
  sessionData, 
  onSessionComplete, 
  onUpdateSession 
}: InterviewSessionProps) {
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentResult, setCurrentResult] = useState<'correct' | 'incorrect' | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = sessionData.questions[sessionData.currentQuestionIndex];

  // Initialize timer
  useEffect(() => {
    const totalTimeInSeconds = sessionData.config.timerMode === 'fixed' 
      ? sessionData.config.timeLimit * 60
      : sessionData.config.timeLimit * 60; // Per question time

    setTimeLeft(totalTimeInSeconds);
    setQuestionStartTime(Date.now());
  }, [sessionData.currentQuestionIndex, sessionData.config]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      // Time's up - auto submit or skip
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  const handleTimeUp = () => {
    if (sessionData.config.timerMode === 'perQuestion') {
      // Auto skip to next question
      handleSkip();
    } else {
      // End entire session
      completeSession();
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    setShowFeedback(false);
    
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result - in real app, this would execute the query
      const mockResult = [
        { id: 1, name: 'John Doe', salary: 75000 },
        { id: 2, name: 'Jane Smith', salary: 82000 }
      ];
      
      setQueryResult(mockResult);
      
      // Check if query is correct (simplified check)
      const isCorrect = userQuery.toLowerCase().includes('select') && userQuery.toLowerCase().includes('where');
      setCurrentResult(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);
      
    } catch (error) {
      setQueryResult({ error: 'Query execution failed' });
      setCurrentResult('incorrect');
      setShowFeedback(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextQuestion = () => {
    // Save current question result
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      userAnswer: userQuery,
      userQuery,
      isCorrect: currentResult === 'correct',
      timeSpent,
      skipped: false,
      points: currentResult === 'correct' ? 10 : 0
    };

    const updatedResults = [...sessionData.results, result];
    
    if (sessionData.currentQuestionIndex + 1 >= sessionData.questions.length) {
      // Session complete
      onSessionComplete(updatedResults);
    } else {
      // Move to next question
      const updatedSession = {
        ...sessionData,
        results: updatedResults,
        currentQuestionIndex: sessionData.currentQuestionIndex + 1
      };
      onUpdateSession(updatedSession);
      
      // Reset state for next question
      setUserQuery('');
      setQueryResult(null);
      setShowFeedback(false);
      setCurrentResult(null);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSkip = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      userAnswer: userQuery || '',
      userQuery: userQuery || '',
      isCorrect: false,
      timeSpent,
      skipped: true,
      points: 0
    };

    const updatedResults = [...sessionData.results, result];
    
    if (sessionData.currentQuestionIndex + 1 >= sessionData.questions.length) {
      onSessionComplete(updatedResults);
    } else {
      const updatedSession = {
        ...sessionData,
        results: updatedResults,
        currentQuestionIndex: sessionData.currentQuestionIndex + 1
      };
      onUpdateSession(updatedSession);
      
      setUserQuery('');
      setQueryResult(null);
      setShowFeedback(false);
      setCurrentResult(null);
      setQuestionStartTime(Date.now());
    }
  };

  const completeSession = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      userAnswer: userQuery,
      userQuery,
      isCorrect: currentResult === 'correct',
      timeSpent,
      skipped: false,
      points: currentResult === 'correct' ? 10 : 0
    };

    onSessionComplete([...sessionData.results, result]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((sessionData.currentQuestionIndex + 1) / sessionData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header with Timer */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Interview Prep Session</span>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-slate-300 text-sm">
                Question {sessionData.currentQuestionIndex + 1} of {sessionData.questions.length}
              </span>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-slate-300 text-sm">
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Question Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{currentQuestion.title}</h2>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    {currentQuestion.category}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">{currentQuestion.description}</p>
            </div>

            {/* Schema Preview */}
            {currentQuestion.schema && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Database Schema
                </h3>
                <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                  <code>{currentQuestion.schema}</code>
                </pre>
              </div>
            )}

            {/* SQL Editor */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-3">Your SQL Query</h3>
              <div className="relative">
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="-- Write your SQL query here..."
                  className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={handleRunQuery}
                    disabled={!userQuery.trim() || isRunning}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Query'}
                  </button>
                  
                  <button
                    onClick={handleSkip}
                    className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Question
                  </button>
                </div>
                
                {showFeedback && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {sessionData.currentQuestionIndex + 1 >= sessionData.questions.length ? 'Complete Session' : 'Next Question'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-medium text-white mb-3">Query Results</h3>
                {queryResult.error ? (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-400">{queryResult.error}</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {Object.keys(queryResult[0] || {}).map(key => (
                            <th key={key} className="text-left p-2 text-slate-300">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.map((row: any, index: number) => (
                          <tr key={index} className="border-b border-slate-800">
                            {Object.values(row).map((value: any, i: number) => (
                              <td key={i} className="p-2 text-slate-300">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Feedback Panel */}
            {showFeedback && (
              <div className={`rounded-lg border p-6 ${
                currentResult === 'correct' 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-red-500/20 border-red-500'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {currentResult === 'correct' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    currentResult === 'correct' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentResult === 'correct' ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className={`text-sm ${
                  currentResult === 'correct' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {currentResult === 'correct' 
                    ? 'Great job! Your query produces the expected results.'
                    : 'Your query doesn\'t match the expected output. Review the requirements and try again.'
                  }
                </p>
              </div>
            )}

            {/* Session Stats */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Session Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-white">{sessionData.currentQuestionIndex}/{sessionData.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Correct</span>
                  <span className="text-green-400">{sessionData.results.filter(r => r.isCorrect).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Skipped</span>
                  <span className="text-yellow-400">{sessionData.results.filter(r => r.skipped).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy</span>
                  <span className="text-white">
                    {sessionData.results.length > 0 
                      ? Math.round((sessionData.results.filter(r => r.isCorrect).length / sessionData.results.length) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>

            {/* Hints */}
            {currentQuestion.hints && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4">Hints</h3>
                <div className="space-y-2">
                  {currentQuestion.hints.map((hint: string, index: number) => (
                    <div key={index} className="text-sm text-slate-400 p-3 bg-slate-900 rounded-lg">
                      💡 {hint}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
