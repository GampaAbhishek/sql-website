'use client';

import { useState } from 'react';
import { Clock, Target, Users, Play, Timer, CheckCircle, Brain, Zap, Settings, Award } from 'lucide-react';

interface InterviewModeSelectionProps {
  onStartSession: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed', mode: 'timed' | 'practice') => void;
}

export default function InterviewModeSelectionNew({ onStartSession }: InterviewModeSelectionProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'mixed'>('mixed');
  const [selectedMode, setSelectedMode] = useState<'timed' | 'practice'>('timed');

  const handleStartInterview = () => {
    onStartSession(selectedDifficulty, selectedMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI-Powered SQL Interview Simulator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience real interview conditions with adaptive AI guidance. Get personalized feedback, 
            adaptive difficulty, and detailed performance analysis.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">AI Interviewer</h3>
            <p className="text-gray-400 text-sm">Professional AI that adapts to your performance</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Adaptive Difficulty</h3>
            <p className="text-gray-400 text-sm">Questions adjust based on your skill level</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Smart Feedback</h3>
            <p className="text-gray-400 text-sm">Detailed guidance without giving away answers</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-400 text-sm">Comprehensive scorecard with improvement tips</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mode Selection */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-400" />
              Interview Configuration
            </h2>
            
            {/* Interview Mode */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Choose Interview Mode</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedMode('timed')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedMode === 'timed'
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Clock className={`w-6 h-6 mr-3 ${selectedMode === 'timed' ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="text-lg font-semibold text-white">Timed Interview</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Real interview conditions with strict 20-minute time limit
                  </p>
                  <div className="text-xs text-gray-400">
                    • 5 Questions • 20 Minutes Total • Pressure Training
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMode('practice')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedMode === 'practice'
                      ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Target className={`w-6 h-6 mr-3 ${selectedMode === 'practice' ? 'text-green-400' : 'text-gray-400'}`} />
                    <h4 className="text-lg font-semibold text-white">Practice Mode</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Relaxed learning environment with unlimited time and hints
                  </p>
                  <div className="text-xs text-gray-400">
                    • 5 Questions • No Time Limit • Learning Focus
                  </div>
                </button>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Select Difficulty Level</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setSelectedDifficulty('beginner')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedDifficulty === 'beginner'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="text-white font-semibold">Beginner</h4>
                  <p className="text-xs text-gray-400 mt-1">Basic SQL concepts</p>
                </button>

                <button
                  onClick={() => setSelectedDifficulty('intermediate')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedDifficulty === 'intermediate'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="text-white font-semibold">Intermediate</h4>
                  <p className="text-xs text-gray-400 mt-1">JOINs & Functions</p>
                </button>

                <button
                  onClick={() => setSelectedDifficulty('advanced')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedDifficulty === 'advanced'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🔥</div>
                  <h4 className="text-white font-semibold">Advanced</h4>
                  <p className="text-xs text-gray-400 mt-1">Complex Queries</p>
                </button>

                <button
                  onClick={() => setSelectedDifficulty('mixed')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedDifficulty === 'mixed'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="text-white font-semibold">Mixed</h4>
                  <p className="text-xs text-gray-400 mt-1">Adaptive Difficulty</p>
                </button>
              </div>
            </div>

            {/* Interview Preview */}
            <div className="bg-slate-700/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">What to Expect</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Question Types:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      Practical SQL Queries
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      Debugging Challenges
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      Optimization Tasks
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      Conceptual Questions
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">AI Features:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      Real-time feedback
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      Progressive hints
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      Performance tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                      Personalized recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center mx-auto"
              >
                <Play className="w-6 h-6 mr-3" />
                Start AI Interview Session
              </button>
              <p className="text-gray-400 text-sm mt-4">
                Mode: <span className="text-white font-medium">{selectedMode === 'timed' ? 'Timed Interview' : 'Practice Mode'}</span> • 
                Difficulty: <span className="text-white font-medium capitalize">{selectedDifficulty}</span>
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">💡 Interview Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p className="mb-2">• <strong>Read carefully:</strong> Understand requirements before coding</p>
                <p className="mb-2">• <strong>Think aloud:</strong> AI learns from your thought process</p>
              </div>
              <div>
                <p className="mb-2">• <strong>Use hints wisely:</strong> They affect your final score</p>
                <p>• <strong>Stay calm:</strong> AI adapts if you're struggling</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
