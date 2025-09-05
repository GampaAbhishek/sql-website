'use client';

import { useMemo } from 'react';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  RotateCcw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  SkipForward,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  title: string;
  difficulty: string;
}

interface InterviewResult {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  skipped: boolean;
  timeSpent: number;
  difficulty: string;
}

interface InterviewConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  timerMode: 'fixed' | 'per-question';
  timeLimit: number;
  questionCount: number;
}

interface InterviewSessionData {
  sessionId: string;
  results: InterviewResult[];
  config: InterviewConfig;
  startTime: Date;
  endTime: Date;
  questions: InterviewQuestion[];
}

interface InterviewResultsProps {
  sessionData: InterviewSessionData;
  onRetry: () => void;
  onReviewSolutions: () => void;
}

export default function InterviewResults({ 
  sessionData, 
  onRetry, 
  onReviewSolutions 
}: InterviewResultsProps) {
  const stats = useMemo(() => {
    const { results, config, startTime, endTime } = sessionData;
    const totalQuestions = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const skippedQuestions = results.filter(r => r.skipped).length;
    const incorrectAnswers = totalQuestions - correctAnswers - skippedQuestions;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const totalTime = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    const avgTimePerQuestion = totalQuestions > 0 ? Math.floor(totalTime / totalQuestions) : 0;

    // Calculate difficulty breakdown
    const difficultyBreakdown = results.reduce((acc, result) => {
      const question = sessionData.questions.find(q => q.id === result.questionId);
      if (question) {
        if (!acc[question.difficulty]) {
          acc[question.difficulty] = { total: 0, correct: 0 };
        }
        acc[question.difficulty].total++;
        if (result.isCorrect) {
          acc[question.difficulty].correct++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number; correct: number }>);

    return {
      totalQuestions,
      correctAnswers,
      skippedQuestions,
      incorrectAnswers,
      accuracy,
      totalTime,
      avgTimePerQuestion,
      difficultyBreakdown
    };
  }, [sessionData]);

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (accuracy >= 75) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (accuracy >= 60) return { level: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const performance = getPerformanceLevel(stats.accuracy);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (stats.accuracy < 70) {
      recommendations.push({
        type: 'skill',
        message: 'Focus on fundamental SQL concepts in our Learning Path',
        action: 'Start Learning Path',
        href: '/learning-path'
      });
    }
    
    if (stats.skippedQuestions > stats.totalQuestions * 0.3) {
      recommendations.push({
        type: 'time',
        message: 'Practice time management with our timed challenges',
        action: 'Try Challenges',
        href: '/challenges'
      });
    }
    
    if (stats.difficultyBreakdown.advanced && stats.difficultyBreakdown.advanced.correct / stats.difficultyBreakdown.advanced.total < 0.5) {
      recommendations.push({
        type: 'advanced',
        message: 'Work on advanced topics like Window Functions and CTEs',
        action: 'Advanced Practice',
        href: '/learning-path/advanced'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${performance.bg}`}>
            <Trophy className={`w-10 h-10 ${performance.color}`} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Interview Session Complete!</h1>
          <p className={`text-xl font-medium ${performance.color}`}>{performance.level} Performance</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.accuracy}%</div>
            <div className="text-slate-400">Accuracy</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.correctAnswers}</div>
            <div className="text-slate-400">Correct</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatTime(stats.avgTimePerQuestion)}</div>
            <div className="text-slate-400">Avg Time</div>
          </div>
          
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalQuestions}</div>
            <div className="text-slate-400">Questions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Breakdown */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Question Results</h3>
              <div className="space-y-4">
                {sessionData.results.map((result, index) => {
                  const question = sessionData.questions.find(q => q.id === result.questionId);
                  return (
                    <div key={result.questionId} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {result.skipped ? (
                            <SkipForward className="w-5 h-5 text-yellow-400" />
                          ) : result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">Q{index + 1}: {question?.title}</div>
                          <div className="text-sm text-slate-400 flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              question?.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                              question?.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {question?.difficulty}
                            </span>
                            <span>•</span>
                            <span>{formatTime(result.timeSpent)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          result.skipped ? 'text-yellow-400' :
                          result.isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.skipped ? 'Skipped' : result.isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Analysis */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Difficulty Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => {
                  const percentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={difficulty}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium capitalize">{difficulty}</span>
                        <span className="text-slate-400">{data.correct}/{data.total} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            difficulty === 'beginner' ? 'bg-green-500' :
                            difficulty === 'intermediate' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className={`rounded-xl border p-6 ${performance.bg}`}>
              <h3 className={`text-lg font-semibold mb-3 ${performance.color}`}>Performance Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Time:</span>
                  <span className="text-white">{formatTime(stats.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Questions Attempted:</span>
                  <span className="text-white">{stats.totalQuestions - stats.skippedQuestions}/{stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Success Rate:</span>
                  <span className={performance.color}>{stats.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Session
              </button>
              
              <button
                onClick={onReviewSolutions}
                className="w-full flex items-center justify-center px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Solutions
              </button>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-slate-900 rounded-lg">
                      <p className="text-sm text-slate-300 mb-2">{rec.message}</p>
                      <a
                        href={rec.href}
                        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {rec.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Details */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Difficulty:</span>
                  <span className="text-white capitalize">{sessionData.config.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timer Mode:</span>
                  <span className="text-white">{sessionData.config.timerMode === 'fixed' ? 'Fixed Time' : 'Per Question'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Limit:</span>
                  <span className="text-white">{sessionData.config.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Started:</span>
                  <span className="text-white">{sessionData.startTime.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
