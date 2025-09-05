'use client';

import { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Zap, Award, Brain, TrendingUp, Download, Share2, ChevronRight } from 'lucide-react';

interface InterviewSession {
  sessionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  totalTimeLimit: number;
  currentQuestionIndex: number;
  questions: any[];
  responses: any[];
  startTime: string;
  aiPersonality: string;
  adaptiveMode: boolean;
}

interface InterviewScorecard {
  overallScore: number;
  accuracy: number;
  avgTimePerQuestion: number;
  efficiency: number;
  hintsUsedPenalty: number;
  strongAreas: string[];
  weakAreas: string[];
  aiRecommendations: string[];
  badges: string[];
  nextTopics: string[];
}

interface AIInterviewResultsProps {
  session: InterviewSession;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export default function AIInterviewResults({ session, onRetry, onBackToDashboard }: AIInterviewResultsProps) {
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(true);

  useEffect(() => {
    const generateScorecard = () => {
      // Generate scorecard locally for now
      const responses = session.responses;
      const totalQuestions = responses.length;
      
      if (totalQuestions === 0) {
        setScorecard({
          overallScore: 0,
          accuracy: 0,
          avgTimePerQuestion: 0,
          efficiency: 0,
          hintsUsedPenalty: 0,
          strongAreas: [],
          weakAreas: [],
          aiRecommendations: ['Complete more questions to get personalized feedback'],
          badges: [],
          nextTopics: ['Basic SQL', 'JOIN Operations']
        });
        setIsGeneratingReport(false);
        return;
      }

      const correctAnswers = responses.filter((r: any) => r.isCorrect).length;
      const accuracy = (correctAnswers / totalQuestions) * 100;
      
      const totalTime = responses.reduce((sum: number, r: any) => sum + r.timeSpent, 0);
      const avgTimePerQuestion = totalTime / totalQuestions;
      
      const totalHints = responses.reduce((sum: number, r: any) => sum + r.hintsUsed, 0);
      const hintsUsedPenalty = Math.min(totalHints * 5, 25);
      
      const efficiency = 75; // Simplified calculation
      const rawScore = (accuracy * 0.4) + (efficiency * 0.3) + (Math.max(0, 100 - avgTimePerQuestion) * 0.3);
      const overallScore = Math.max(0, rawScore - hintsUsedPenalty);

      const badges = [];
      if (totalQuestions > 0) badges.push("First Mock Interview");
      if (avgTimePerQuestion < 60) badges.push("Speed Coder");
      if (accuracy >= 90) badges.push("SQL Master");

      setScorecard({
        overallScore: Math.round(overallScore),
        accuracy: Math.round(accuracy),
        avgTimePerQuestion: Math.round(avgTimePerQuestion),
        efficiency: Math.round(efficiency),
        hintsUsedPenalty,
        strongAreas: accuracy >= 80 ? ['SQL Queries'] : [],
        weakAreas: accuracy < 60 ? ['SQL Fundamentals'] : [],
        aiRecommendations: [
          accuracy < 50 ? 'Focus on SQL fundamentals' : 'Practice advanced concepts',
          'Take regular mock interviews',
          'Review your weak areas'
        ],
        badges,
        nextTopics: ['Advanced SQL Patterns', 'Performance Optimization']
      });
      
      setIsGeneratingReport(false);
    };

    // Simulate loading time
    setTimeout(generateScorecard, 2000);
  }, [session]);

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">AI is analyzing your performance...</h2>
          <p className="text-gray-400">Generating personalized insights and recommendations</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Failed to generate results</h2>
          <p className="text-gray-400">Please try again</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-6 bg-gradient-to-r ${getScoreGradient(scorecard.overallScore)} rounded-full`}>
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview Complete!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI analysis complete. Here's your comprehensive performance report.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Overall Score */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Overall Performance</h2>
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-8 border-slate-700 flex items-center justify-center mx-auto mb-4">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-r ${getScoreGradient(scorecard.overallScore)} flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-white">{scorecard.overallScore}</span>
                </div>
              </div>
              <p className="text-lg text-gray-300">out of 100</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Accuracy</h3>
              <p className={`text-2xl font-bold ${getScoreColor(scorecard.accuracy)}`}>
                {scorecard.accuracy}%
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Avg Time</h3>
              <p className="text-2xl font-bold text-white">
                {Math.floor(scorecard.avgTimePerQuestion / 60)}:{(scorecard.avgTimePerQuestion % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Efficiency</h3>
              <p className={`text-2xl font-bold ${getScoreColor(scorecard.efficiency)}`}>
                {scorecard.efficiency}%
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Badges</h3>
              <p className="text-2xl font-bold text-purple-400">
                {scorecard.badges.length}
              </p>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Strengths & Weaknesses */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                Performance Analysis
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Strong Areas</h4>
                  {scorecard.strongAreas.length > 0 ? (
                    <ul className="space-y-2">
                      {scorecard.strongAreas.map((area, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">Complete more questions to identify strengths</p>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Areas for Improvement</h4>
                  {scorecard.weakAreas.length > 0 ? (
                    <ul className="space-y-2">
                      {scorecard.weakAreas.map((area, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">Great job! No major weaknesses identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-400" />
                AI Recommendations
              </h3>
              
              <div className="space-y-4">
                {scorecard.aiRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-300 flex-1">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges */}
          {scorecard.badges.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-purple-400" />
                Badges Earned
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {scorecard.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-purple-900/20 rounded-lg">
                    <Award className="w-8 h-8 text-purple-400" />
                    <span className="text-white font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
            >
              <Trophy className="w-5 h-5" />
              <span>Take Another Interview</span>
            </button>
            
            <button
              onClick={onBackToDashboard}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
