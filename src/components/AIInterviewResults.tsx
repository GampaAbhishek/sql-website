'use client';

import { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Zap, Award, Brain, TrendingUp, Download, Share2, ChevronRight } from 'lucide-react';
import { InterviewSession, InterviewScorecard, aiInterviewer } from '@/lib/aiInterviewer';

interface AIInterviewResultsProps {
  session: InterviewSession;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export default function AIInterviewResults({ session, onRetry, onBackToDashboard }: AIInterviewResultsProps) {
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(true);

  useEffect(() => {
    const generateScorecard = async () => {
      try {
        const generated = aiInterviewer.generateScorecard(session);
        setScorecard(generated);
      } catch (error) {
        console.error('Error generating scorecard:', error);
      } finally {
        setIsGeneratingReport(false);
      }
    };

    generateScorecard();
  }, [session]);

  const handleDownloadReport = () => {
    if (!scorecard) return;
    
    const reportData = {
      sessionId: session.sessionId,
      date: new Date().toISOString(),
      mode: session.mode,
      difficulty: session.difficulty,
      scorecard,
      responses: session.responses.map(r => ({
        question: session.questions.find(q => q.id === r.questionId)?.title,
        timeSpent: r.timeSpent,
        score: r.score,
        isCorrect: r.isCorrect
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-interview-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = () => {
    if (!scorecard) return;
    
    const shareText = `I just completed an AI-powered SQL interview! 🤖\n\nResults:\n✅ Score: ${scorecard.overallScore}/100\n⚡ Accuracy: ${scorecard.accuracy}%\n🚀 Time: ${scorecard.avgTimePerQuestion}s avg per question\n\n#SQLInterview #CodingPractice #TechSkills`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My SQL Interview Results',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl text-white mb-2">AI is analyzing your performance...</h2>
          <p className="text-gray-400">Generating personalized feedback and recommendations</p>
        </div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Error generating results</h2>
          <p className="text-gray-400">Please try again later</p>
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-6 rounded-full ${scorecard.overallScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : scorecard.overallScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview Complete!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your AI-powered SQL interview has been analyzed. Here's your comprehensive performance report.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Overall Score */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8 text-center">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(scorecard.overallScore)}`}>
                  {scorecard.overallScore}
                </div>
                <div className="text-2xl text-white font-semibold mb-1">
                  Grade: {getScoreGrade(scorecard.overallScore)}
                </div>
                <div className="text-gray-400">Overall Score</div>
              </div>
              
              <div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(scorecard.accuracy)}`}>
                  {scorecard.accuracy}%
                </div>
                <div className="text-white font-semibold">Accuracy</div>
                <div className="text-gray-400">Questions Correct</div>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {scorecard.avgTimePerQuestion}s
                </div>
                <div className="text-white font-semibold">Avg Time</div>
                <div className="text-gray-400">Per Question</div>
              </div>
              
              <div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(scorecard.efficiency)}`}>
                  {scorecard.efficiency}%
                </div>
                <div className="text-white font-semibold">Efficiency</div>
                <div className="text-gray-400">Code Quality</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance Breakdown */}
            <div className="space-y-6">
              {/* Detailed Metrics */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-green-400" />
                  Performance Breakdown
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Correct Answers</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${scorecard.accuracy}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{scorecard.accuracy}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Speed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.max(0, 100 - scorecard.avgTimePerQuestion)}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{scorecard.avgTimePerQuestion}s</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Code Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${scorecard.efficiency}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{scorecard.efficiency}%</span>
                    </div>
                  </div>
                  
                  {scorecard.hintsUsedPenalty > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Hints Penalty</span>
                      <span className="text-red-400">-{scorecard.hintsUsedPenalty} points</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question-by-Question Results */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-blue-400" />
                  Question Results
                </h2>
                
                <div className="space-y-3">
                  {session.responses.map((response, index) => {
                    const question = session.questions.find(q => q.id === response.questionId);
                    return (
                      <div key={response.questionId} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{question?.title}</div>
                            <div className="text-sm text-gray-400">{response.timeSpent}s • {response.hintsUsed} hints</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${response.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {response.score} pts
                          </span>
                          {response.isCorrect ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Analysis & Recommendations */}
            <div className="space-y-6">
              {/* Badges */}
              {scorecard.badges.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3 text-yellow-400" />
                    Achievements Unlocked
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {scorecard.badges.map((badge, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="text-yellow-400 font-semibold text-sm">{badge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-purple-400" />
                  Analysis
                </h2>
                
                {scorecard.strongAreas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-green-400 font-semibold mb-3">Strong Areas 💪</h3>
                    <div className="space-y-2">
                      {scorecard.strongAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          <span className="text-gray-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {scorecard.weakAreas.length > 0 && (
                  <div>
                    <h3 className="text-red-400 font-semibold mb-3">Areas for Improvement 📈</h3>
                    <div className="space-y-2">
                      {scorecard.weakAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className="text-gray-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendations */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center">
                  <Brain className="w-6 h-6 mr-3" />
                  AI Recommendations
                </h2>
                
                <div className="space-y-4">
                  {scorecard.aiRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 flex-1">{recommendation}</p>
                    </div>
                  ))}
                </div>

                {scorecard.nextTopics.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-blue-500/30">
                    <h3 className="text-blue-400 font-semibold mb-3">Recommended Study Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {scorecard.nextTopics.map((topic, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadReport}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
            
            <button
              onClick={handleShareResults}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Results</span>
            </button>
            
            <button
              onClick={onRetry}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-200"
            >
              <Trophy className="w-5 h-5" />
              <span>Take Another Interview</span>
            </button>
            
            <button
              onClick={onBackToDashboard}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors duration-200"
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
