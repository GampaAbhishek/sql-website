'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Brain, Lightbulb, Send, AlertCircle, CheckCircle, ArrowRight, SkipForward } from 'lucide-react';

interface AIInterviewQuestion {
  id: string;
  type: 'practical' | 'debugging' | 'optimization' | 'conceptual';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  question: string;
  schema?: string;
  brokenQuery?: string;
  expectedOutput?: any[];
  hints: string[];
  category: string;
  timeLimit: number;
  points: number;
}

interface AIFeedback {
  type: 'syntax_error' | 'logic_error' | 'correct' | 'optimization_needed' | 'conceptual_feedback';
  message: string;
  hint?: string;
  praise?: string;
  nextSteps?: string;
}

interface InterviewSession {
  sessionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  totalTimeLimit: number;
  currentQuestionIndex: number;
  questions: AIInterviewQuestion[];
  responses: InterviewResponse[];
  startTime: string;
  aiPersonality: string;
  adaptiveMode: boolean;
}

interface InterviewResponse {
  questionId: string;
  userQuery: string;
  timeSpent: number;
  hintsUsed: number;
  isCorrect: boolean;
  score: number;
  aiFeedback: AIFeedback;
  efficiency: 'poor' | 'average' | 'good' | 'excellent';
}

interface AIInterviewSessionProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  onSessionComplete: (session: InterviewSession) => void;
}

export default function AIInterviewSession({ difficulty, mode, onSessionComplete }: AIInterviewSessionProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AIInterviewQuestion | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiGreeting, setAiGreeting] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the interview session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/ai-interview/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ difficulty, mode }),
        });

        if (!response.ok) {
          throw new Error('Failed to initialize session');
        }

        const newSession: InterviewSession = await response.json();
        setSession(newSession);
        setCurrentQuestion(newSession.questions[0]);
        setAiGreeting(newSession.aiPersonality);
        
        if (mode === 'timed') {
          setTimeLeft(newSession.totalTimeLimit * 60); // Convert to seconds
        }
        
        setQuestionStartTime(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setIsLoading(false);
      }
    };

    initSession();
  }, [difficulty, mode]);

  // Timer effect
  useEffect(() => {
    if (mode === 'timed' && timeLeft > 0 && session) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (mode === 'timed' && timeLeft === 0 && session) {
      // Time's up - end the interview
      handleSessionEnd();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, mode, session]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitQuery = async () => {
    if (!session || !currentQuestion || !userQuery.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);

    try {
      // Simulate query execution and get results
      const isCorrect = await checkQueryCorrectness(userQuery, currentQuestion);
      
      // Generate AI feedback via API
      const feedbackResponse = await fetch('/api/ai-interview/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          userQuery,
          isCorrect,
          timeSpent,
          hintsUsed: currentHintIndex
        }),
      });

      let aiFeedback: AIFeedback;
      if (feedbackResponse.ok) {
        aiFeedback = await feedbackResponse.json();
      } else {
        // Fallback feedback
        aiFeedback = {
          type: isCorrect ? 'correct' : 'logic_error',
          message: isCorrect 
            ? "Good work! Your solution is correct." 
            : "There seems to be an issue with your query. Review the requirements and try again.",
          hint: isCorrect ? undefined : "Check your WHERE clause and JOIN conditions."
        };
      }

      // Create response record
      const response: InterviewResponse = {
        questionId: currentQuestion.id,
        userQuery,
        timeSpent,
        hintsUsed: currentHintIndex,
        isCorrect,
        score: calculateScore(isCorrect, timeSpent, currentHintIndex, currentQuestion.points),
        aiFeedback,
        efficiency: determineEfficiency(userQuery, timeSpent)
      };

      // Update session with response
      const updatedSession = {
        ...session,
        responses: [...session.responses, response],
        currentQuestionIndex: session.currentQuestionIndex + 1
      };

      setSession(updatedSession);
      setFeedback(aiFeedback.message);
      setShowFeedback(true);

      // Move to next question or end session
      setTimeout(() => {
        if (updatedSession.currentQuestionIndex < updatedSession.questions.length) {
          moveToNextQuestion(updatedSession);
        } else {
          handleSessionEnd(updatedSession);
        }
      }, 3000);

    } catch (error) {
      console.error('Error submitting query:', error);
      setFeedback('Error processing your query. Please try again.');
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkQueryCorrectness = async (query: string, question: AIInterviewQuestion): Promise<boolean> => {
    // This would integrate with your actual query execution system
    // For now, we'll use a simple heuristic
    if (question.type === 'conceptual') {
      return query.length > 10; // Simple check for conceptual answers
    }
    
    // For SQL queries, check for basic structure
    const lowerQuery = query.toLowerCase();
    return lowerQuery.includes('select') || lowerQuery.includes('update') || lowerQuery.includes('insert') || lowerQuery.includes('delete');
  };

  const calculateScore = (isCorrect: boolean, timeSpent: number, hintsUsed: number, maxPoints: number): number => {
    if (!isCorrect) return 0;
    
    let score = maxPoints;
    
    // Time penalty (slower = lower score)
    const timePenalty = Math.min(timeSpent / 60, 1) * 0.2; // Max 20% penalty for time
    score *= (1 - timePenalty);
    
    // Hints penalty
    const hintsPenalty = hintsUsed * 0.1; // 10% penalty per hint
    score *= (1 - hintsPenalty);
    
    return Math.max(Math.round(score), 1);
  };

  const determineEfficiency = (query: string, timeSpent: number): 'poor' | 'average' | 'good' | 'excellent' => {
    const queryLength = query.length;
    
    if (timeSpent < 60 && queryLength < 200) return 'excellent';
    if (timeSpent < 120 && queryLength < 300) return 'good';
    if (timeSpent < 180) return 'average';
    return 'poor';
  };

  const moveToNextQuestion = (updatedSession: InterviewSession) => {
    const nextQuestion = updatedSession.questions[updatedSession.currentQuestionIndex];
    setCurrentQuestion(nextQuestion);
    setUserQuery('');
    setCurrentHintIndex(0);
    setQuestionStartTime(new Date());
    setShowFeedback(false);
    setFeedback('');
  };

  const handleSessionEnd = (finalSession?: InterviewSession) => {
    const sessionToEnd = finalSession || session;
    if (sessionToEnd) {
      onSessionComplete(sessionToEnd);
    }
  };

  const handleUseHint = () => {
    if (!currentQuestion || currentHintIndex >= currentQuestion.hints.length) return;
    setCurrentHintIndex(currentHintIndex + 1);
  };

  const handleSkipQuestion = () => {
    if (!session || !currentQuestion) return;

    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    
    const response: InterviewResponse = {
      questionId: currentQuestion.id,
      userQuery: '',
      timeSpent,
      hintsUsed: currentHintIndex,
      isCorrect: false,
      score: 0,
      aiFeedback: {
        type: 'logic_error',
        message: 'Question skipped. Try to attempt all questions in a real interview!'
      },
      efficiency: 'poor'
    };

    const updatedSession = {
      ...session,
      responses: [...session.responses, response],
      currentQuestionIndex: session.currentQuestionIndex + 1
    };

    setSession(updatedSession);

    if (updatedSession.currentQuestionIndex < updatedSession.questions.length) {
      moveToNextQuestion(updatedSession);
    } else {
      handleSessionEnd(updatedSession);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl text-white mb-2">AI Interviewer is preparing your session...</h2>
          <p className="text-gray-400">Generating personalized questions based on your preferences</p>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Failed to load interview session</h2>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">AI SQL Interview</h1>
                <p className="text-sm text-gray-400">
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </p>
              </div>
            </div>
            
            {mode === 'timed' && (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Question & AI Feedback */}
            <div className="space-y-6">
              {/* AI Greeting */}
              {session.currentQuestionIndex === 0 && aiGreeting && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">AI Interviewer</h3>
                      <p className="text-gray-300">{aiGreeting}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Question */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{currentQuestion.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      {currentQuestion.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{currentQuestion.description}</p>
                <p className="text-white font-medium mb-4">{currentQuestion.question}</p>
                
                {currentQuestion.schema && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Database Schema:</h4>
                    <pre className="text-sm text-green-400 overflow-x-auto">{currentQuestion.schema}</pre>
                  </div>
                )}

                {currentQuestion.brokenQuery && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Broken Query to Fix:</h4>
                    <pre className="text-sm text-red-300 overflow-x-auto">{currentQuestion.brokenQuery}</pre>
                  </div>
                )}
              </div>

              {/* Hints */}
              {currentHintIndex > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-6 h-6 text-yellow-400 mt-1" />
                    <div>
                      <h3 className="text-yellow-400 font-semibold mb-2">
                        Hint {currentHintIndex}/{currentQuestion.hints.length}
                      </h3>
                      <p className="text-gray-300">{currentQuestion.hints[currentHintIndex - 1]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              {showFeedback && feedback && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">AI Feedback</h3>
                      <p className="text-gray-300">{feedback}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Code Editor */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Solution</h3>
                
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={currentQuestion.type === 'conceptual' 
                    ? "Type your answer here..." 
                    : "-- Write your SQL query here\nSELECT * FROM table_name;"
                  }
                  className="w-full h-64 bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                  disabled={showFeedback}
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    {mode === 'practice' && currentHintIndex < currentQuestion.hints.length && (
                      <button
                        onClick={handleUseHint}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                        disabled={showFeedback}
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>Use Hint</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSkipQuestion}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                      disabled={showFeedback}
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>Skip</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSubmitQuery}
                    disabled={!userQuery.trim() || isSubmitting || showFeedback}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : showFeedback ? (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Moving to next...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Questions Completed</span>
                    <span className="text-white">{session.responses.length}/{session.questions.length}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(session.responses.length / session.questions.length) * 100}%` }}
                    />
                  </div>
                  {session.responses.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Score</span>
                      <span className="text-green-400">
                        {session.responses.reduce((sum, r) => sum + r.score, 0)} points
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
