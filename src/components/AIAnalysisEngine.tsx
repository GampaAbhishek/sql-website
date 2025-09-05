'use client';

import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Calendar,
  Zap
} from 'lucide-react';

interface AnalysisData {
  strengths: string[];
  weaknesses: string[];
  patterns: {
    timeOfDay: string;
    difficulty: string;
    topicPreference: string;
  };
  predictions: {
    nextWeekAccuracy: number;
    suggestedFocus: string;
    timeToMastery: string;
  };
  insights: {
    type: 'positive' | 'warning' | 'neutral';
    title: string;
    description: string;
    action?: string;
  }[];
}

const MOCK_ANALYSIS: AnalysisData = {
  strengths: [
    'Excellent at basic SELECT operations',
    'Strong understanding of WHERE clauses',
    'Good at simple filtering conditions',
    'Fast learner with consistent practice'
  ],
  weaknesses: [
    'Struggles with complex JOIN operations',
    'Needs improvement in aggregate functions',
    'Difficulty with subquery logic',
    'Time management in complex problems'
  ],
  patterns: {
    timeOfDay: 'Most productive between 9-11 AM',
    difficulty: 'Prefers beginner to intermediate problems',
    topicPreference: 'Shows interest in data analysis queries'
  },
  predictions: {
    nextWeekAccuracy: 82,
    suggestedFocus: 'Master JOINs to unlock advanced topics',
    timeToMastery: '3-4 weeks with current pace'
  },
  insights: [
    {
      type: 'warning',
      title: 'JOIN Performance Plateau',
      description: 'Your JOIN accuracy has been stuck at 45% for 5 days. Consider reviewing the fundamentals.',
      action: 'Take JOIN Masterclass'
    },
    {
      type: 'positive',
      title: 'Learning Velocity Improving',
      description: 'You\'re solving problems 23% faster than last week while maintaining accuracy.',
      action: 'Challenge yourself with harder problems'
    },
    {
      type: 'neutral',
      title: 'Optimal Learning Time Detected',
      description: 'Your peak performance window is 9-11 AM. Schedule complex topics during this time.',
      action: 'Adjust learning schedule'
    }
  ]
};

interface AIAnalysisEngineProps {
  compact?: boolean;
  showPredictions?: boolean;
  showInsights?: boolean;
}

export default function AIAnalysisEngine({ 
  compact = false, 
  showPredictions = true,
  showInsights = true 
}: AIAnalysisEngineProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'patterns' | 'predictions'>('analysis');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-500/30 bg-green-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-white font-medium flex items-center text-sm mb-3">
          <Brain className="w-4 h-4 mr-2 text-purple-400" />
          AI Analysis
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs">Predicted Accuracy</span>
            <span className="text-green-400 text-sm font-medium">
              {MOCK_ANALYSIS.predictions.nextWeekAccuracy}%
            </span>
          </div>
          
          <div className="text-xs">
            <p className="text-slate-400 mb-1">Focus Area:</p>
            <p className="text-white">{MOCK_ANALYSIS.predictions.suggestedFocus}</p>
          </div>
          
          <div className="text-xs">
            <p className="text-slate-400 mb-1">Time to Mastery:</p>
            <p className="text-white">{MOCK_ANALYSIS.predictions.timeToMastery}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-600">
          <p className="text-slate-400 text-xs mb-1">Latest Insight:</p>
          <p className="text-white text-xs">{MOCK_ANALYSIS.insights[0].title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            AI Learning Analysis
          </h2>
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === 'patterns'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Patterns
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === 'predictions'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Predictions
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Strengths
              </h3>
              <div className="space-y-3">
                {MOCK_ANALYSIS.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-200 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {MOCK_ANALYSIS.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-200 text-sm">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-medium">Peak Performance</h4>
                </div>
                <p className="text-slate-300 text-sm">{MOCK_ANALYSIS.patterns.timeOfDay}</p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-medium">Difficulty Sweet Spot</h4>
                </div>
                <p className="text-slate-300 text-sm">{MOCK_ANALYSIS.patterns.difficulty}</p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-medium">Learning Style</h4>
                </div>
                <p className="text-slate-300 text-sm">{MOCK_ANALYSIS.patterns.topicPreference}</p>
              </div>
            </div>

            {/* Learning Behavior Chart */}
            <div className="bg-slate-700 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">Weekly Learning Pattern</h4>
              <div className="h-32 flex items-end justify-between space-x-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const heights = [65, 80, 45, 90, 75, 30, 25];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${heights[index]}%` }}
                      />
                      <span className="text-xs text-slate-400 mt-2">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {MOCK_ANALYSIS.predictions.nextWeekAccuracy}%
                  </div>
                  <p className="text-slate-300 text-sm">Predicted Accuracy</p>
                  <p className="text-slate-400 text-xs mt-1">Next 7 days</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm mb-1">Focus Recommendation</p>
                  <p className="text-slate-300 text-xs">{MOCK_ANALYSIS.predictions.suggestedFocus}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm mb-1">Time to Mastery</p>
                  <p className="text-slate-300 text-xs">{MOCK_ANALYSIS.predictions.timeToMastery}</p>
                </div>
              </div>
            </div>

            {/* Progress Projection */}
            <div className="bg-slate-700 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">30-Day Progress Projection</h4>
              <div className="h-40 flex items-end justify-between space-x-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const baseAccuracy = 45;
                  const improvement = (i / 30) * 35; // Gradual improvement
                  const randomVariation = Math.random() * 10 - 5;
                  const height = Math.min(95, Math.max(30, baseAccuracy + improvement + randomVariation));
                  const isCurrentWeek = i < 7;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full rounded-t ${
                          isCurrentWeek ? 'bg-purple-500' : 'bg-blue-500 opacity-60'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      {(i + 1) % 7 === 0 && (
                        <span className="text-xs text-slate-400 mt-1">W{Math.floor(i / 7) + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-slate-300 text-sm">Current Week</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 opacity-60 rounded"></div>
                  <span className="text-slate-300 text-sm">Projected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {showInsights && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              AI Insights
            </h3>
            <div className="space-y-4">
              {MOCK_ANALYSIS.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{insight.description}</p>
                        {insight.action && (
                          <button className="flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                            {insight.action}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
