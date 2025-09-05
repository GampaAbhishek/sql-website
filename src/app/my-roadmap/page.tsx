'use client';

import { useState, useEffect } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import GamifiedProgress from '@/components/GamifiedProgress';
import AIAnalysisEngine from '@/components/AIAnalysisEngine';
import { 
  Map, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Zap,
  BookOpen,
  Play,
  RotateCcw,
  Star,
  Trophy,
  Brain,
  ArrowRight,
  Lock,
  Unlock,
  Eye,
  Timer,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserProgress {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  accuracy: number;
  streak: number;
  totalProblems: number;
  solvedProblems: number;
  timeSpent: number; // in hours
}

interface TopicMastery {
  id: string;
  name: string;
  category: string;
  status: 'mastered' | 'in-progress' | 'weak' | 'locked';
  accuracy: number;
  problemsSolved: number;
  totalProblems: number;
  timeSpent: number;
  lastActivity: string;
  prerequisites: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Recommendation {
  id: string;
  type: 'lesson' | 'challenge' | 'interview-prep' | 'review';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  topicId: string;
  action: string;
}

const MOCK_USER_PROGRESS: UserProgress = {
  level: 'Intermediate',
  accuracy: 78,
  streak: 12,
  totalProblems: 145,
  solvedProblems: 89,
  timeSpent: 24.5
};

const MOCK_TOPICS: TopicMastery[] = [
  {
    id: 'select-basics',
    name: 'SELECT Basics',
    category: 'Foundation',
    status: 'mastered',
    accuracy: 92,
    problemsSolved: 15,
    totalProblems: 15,
    timeSpent: 2.5,
    lastActivity: '2025-09-03',
    prerequisites: [],
    difficulty: 'Beginner'
  },
  {
    id: 'where-clause',
    name: 'WHERE Clause',
    category: 'Foundation',
    status: 'mastered',
    accuracy: 88,
    problemsSolved: 12,
    totalProblems: 12,
    timeSpent: 1.8,
    lastActivity: '2025-09-02',
    prerequisites: ['select-basics'],
    difficulty: 'Beginner'
  },
  {
    id: 'joins',
    name: 'JOINs',
    category: 'Intermediate',
    status: 'weak',
    accuracy: 45,
    problemsSolved: 8,
    totalProblems: 18,
    timeSpent: 3.2,
    lastActivity: '2025-09-04',
    prerequisites: ['select-basics', 'where-clause'],
    difficulty: 'Intermediate'
  },
  {
    id: 'group-by',
    name: 'GROUP BY',
    category: 'Intermediate',
    status: 'in-progress',
    accuracy: 67,
    problemsSolved: 6,
    totalProblems: 14,
    timeSpent: 2.1,
    lastActivity: '2025-09-05',
    prerequisites: ['where-clause'],
    difficulty: 'Intermediate'
  },
  {
    id: 'having-clause',
    name: 'HAVING Clause',
    category: 'Intermediate',
    status: 'locked',
    accuracy: 0,
    problemsSolved: 0,
    totalProblems: 10,
    timeSpent: 0,
    lastActivity: '',
    prerequisites: ['group-by'],
    difficulty: 'Intermediate'
  },
  {
    id: 'subqueries',
    name: 'Subqueries',
    category: 'Advanced',
    status: 'locked',
    accuracy: 0,
    problemsSolved: 0,
    totalProblems: 12,
    timeSpent: 0,
    lastActivity: '',
    prerequisites: ['joins', 'group-by'],
    difficulty: 'Advanced'
  },
  {
    id: 'window-functions',
    name: 'Window Functions',
    category: 'Advanced',
    status: 'locked',
    accuracy: 0,
    problemsSolved: 0,
    totalProblems: 15,
    timeSpent: 0,
    lastActivity: '',
    prerequisites: ['subqueries'],
    difficulty: 'Advanced'
  }
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    type: 'review',
    title: 'Master JOIN Operations',
    description: 'Focus on INNER JOIN and LEFT JOIN concepts',
    reason: 'You\'ve struggled with 55% of JOIN problems. Mastering this will unlock Subqueries.',
    priority: 'high',
    estimatedTime: '2-3 hours',
    topicId: 'joins',
    action: 'Review & Practice'
  },
  {
    id: '2',
    type: 'lesson',
    title: 'Complete GROUP BY Fundamentals',
    description: 'Learn GROUP BY with aggregate functions',
    reason: 'You\'re making good progress! Complete this to unlock HAVING clause.',
    priority: 'medium',
    estimatedTime: '1-2 hours',
    topicId: 'group-by',
    action: 'Continue Learning'
  },
  {
    id: '3',
    type: 'interview-prep',
    title: 'Practice Timed JOIN Questions',
    description: 'Solve 3 intermediate JOIN problems under time pressure',
    reason: 'Build confidence with JOINs in interview scenarios.',
    priority: 'high',
    estimatedTime: '45 minutes',
    topicId: 'joins',
    action: 'Start Practice'
  },
  {
    id: '4',
    type: 'challenge',
    title: 'WHERE Clause Mastery Challenge',
    description: 'Take on advanced WHERE clause problems',
    reason: 'You\'ve mastered the basics. Challenge yourself with complex filtering!',
    priority: 'low',
    estimatedTime: '30 minutes',
    topicId: 'where-clause',
    action: 'Take Challenge'
  }
];

export default function MyRoadmap() {
  const [selectedView, setSelectedView] = useState<'overview' | 'roadmap' | 'recommendations' | 'progress' | 'analysis'>('overview');
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-400 bg-green-500/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-500/20';
      case 'weak': return 'text-red-400 bg-red-500/20';
      case 'locked': return 'text-slate-400 bg-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'weak': return <AlertCircle className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-5 h-5" />;
      case 'challenge': return <Target className="w-5 h-5" />;
      case 'interview-prep': return <Timer className="w-5 h-5" />;
      case 'review': return <RotateCcw className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const strengths = MOCK_TOPICS.filter(topic => topic.status === 'mastered');
  const weakAreas = MOCK_TOPICS.filter(topic => topic.status === 'weak');
  const inProgress = MOCK_TOPICS.filter(topic => topic.status === 'in-progress');

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="my-roadmap" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My AI Roadmap</h1>
                <p className="text-slate-300">Personalized learning path powered by AI</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('roadmap')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'roadmap'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setSelectedView('recommendations')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'recommendations'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              AI Suggestions
            </button>
            <button
              onClick={() => setSelectedView('progress')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'progress'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setSelectedView('analysis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'analysis'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              AI Analysis
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Summary */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Progress Summary
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    MOCK_USER_PROGRESS.level === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
                    MOCK_USER_PROGRESS.level === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {MOCK_USER_PROGRESS.level}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_USER_PROGRESS.accuracy}%</div>
                    <div className="text-slate-400 text-sm">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_USER_PROGRESS.streak}</div>
                    <div className="text-slate-400 text-sm">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_USER_PROGRESS.solvedProblems}</div>
                    <div className="text-slate-400 text-sm">Problems Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{MOCK_USER_PROGRESS.timeSpent}h</div>
                    <div className="text-slate-400 text-sm">Time Spent</div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weak Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-green-400" />
                    Strengths
                  </h3>
                  <div className="space-y-3">
                    {strengths.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">{topic.name}</span>
                        </div>
                        <span className="text-green-400 text-xs font-medium">{topic.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                    Areas to Improve
                  </h3>
                  <div className="space-y-3">
                    {weakAreas.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-white text-sm">{topic.name}</span>
                        </div>
                        <span className="text-red-400 text-xs font-medium">{topic.accuracy}%</span>
                      </div>
                    ))}
                    {inProgress.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm">{topic.name}</span>
                        </div>
                        <span className="text-yellow-400 text-xs font-medium">{topic.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Recommended Next Steps
                </h3>
                <div className="space-y-4">
                  {MOCK_RECOMMENDATIONS.slice(0, 3).map((rec) => (
                    <div key={rec.id} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getTypeIcon(rec.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{rec.title}</h4>
                            <p className="text-slate-300 text-sm mt-1">{rec.description}</p>
                            <p className="text-slate-400 text-xs mt-2">{rec.reason}</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors">
                          {rec.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Target className="w-4 h-4 mr-2" />
                    Take Challenge
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Timer className="w-4 h-4 mr-2" />
                    Interview Prep
                  </button>
                </div>
              </div>

              {/* Achievement Preview */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Next Achievement
                </h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-medium">JOIN Master</h4>
                  <p className="text-slate-400 text-sm mt-1">Complete 2 more JOIN problems</p>
                  <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-yellow-400 text-xs mt-1">3/4 completed</p>
                </div>
              </div>

              {/* Learning Streak */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Learning Streak</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">🔥</div>
                  <div className="text-2xl font-bold text-white">{MOCK_USER_PROGRESS.streak} Days</div>
                  <p className="text-slate-400 text-sm">Keep it up! You're on fire!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Tab */}
        {selectedView === 'roadmap' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Map className="w-5 h-5 mr-2 text-purple-400" />
                Visual Learning Roadmap
              </h2>
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="flex items-center px-3 py-1 text-slate-300 hover:text-white transition-colors"
              >
                {showAllTopics ? 'Show Less' : 'Show All'}
                {showAllTopics ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            </div>
            
            {/* Roadmap Timeline */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-600"></div>
              
              <div className="space-y-6">
                {(showAllTopics ? MOCK_TOPICS : MOCK_TOPICS.slice(0, 5)).map((topic, index) => (
                  <div key={topic.id} className="relative flex items-start space-x-6">
                    {/* Progress Node */}
                    <div className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                      topic.status === 'mastered' ? 'bg-green-500 border-green-400' :
                      topic.status === 'in-progress' ? 'bg-yellow-500 border-yellow-400' :
                      topic.status === 'weak' ? 'bg-red-500 border-red-400' :
                      'bg-slate-600 border-slate-500'
                    }`}>
                      {getStatusIcon(topic.status)}
                    </div>
                    
                    {/* Topic Card */}
                    <div className={`flex-1 p-4 rounded-lg border ${
                      topic.status === 'locked' ? 'bg-slate-700 border-slate-600' : 'bg-slate-700 border-slate-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${topic.status === 'locked' ? 'text-slate-400' : 'text-white'}`}>
                          {topic.name}
                        </h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(topic.status)}`}>
                          {topic.status === 'mastered' ? 'Mastered' :
                           topic.status === 'in-progress' ? 'In Progress' :
                           topic.status === 'weak' ? 'Needs Work' : 'Locked'}
                        </div>
                      </div>
                      
                      {topic.status !== 'locked' && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Accuracy:</span>
                            <span className={`ml-1 font-medium ${
                              topic.accuracy >= 80 ? 'text-green-400' :
                              topic.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {topic.accuracy}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Progress:</span>
                            <span className="ml-1 text-white font-medium">
                              {topic.problemsSolved}/{topic.totalProblems}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Time:</span>
                            <span className="ml-1 text-white font-medium">{topic.timeSpent}h</span>
                          </div>
                        </div>
                      )}
                      
                      {topic.status !== 'locked' && (
                        <div className="mt-3">
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                topic.status === 'mastered' ? 'bg-green-500' :
                                topic.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(topic.problemsSolved / topic.totalProblems) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {topic.status === 'locked' && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-sm">
                            Unlock by completing: {topic.prerequisites.map(pre => 
                              MOCK_TOPICS.find(t => t.id === pre)?.name || pre
                            ).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {selectedView === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI-Powered Recommendations
              </h2>
              
              <div className="space-y-4">
                {MOCK_RECOMMENDATIONS.map((rec) => (
                  <div key={rec.id} className={`p-6 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {getTypeIcon(rec.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-semibold">{rec.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-slate-300 mb-3">{rec.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {rec.estimatedTime}
                              </span>
                              <span className="flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                {MOCK_TOPICS.find(t => t.id === rec.topicId)?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedRecommendation(
                            expandedRecommendation === rec.id ? null : rec.id
                          )}
                          className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          {rec.action}
                        </button>
                      </div>
                    </div>
                    
                    {expandedRecommendation === rec.id && (
                      <div className="mt-4 p-4 bg-slate-700 rounded-lg border-l-4 border-purple-500">
                        <h4 className="text-white font-medium mb-2">Why this recommendation?</h4>
                        <p className="text-slate-300 text-sm">{rec.reason}</p>
                        
                        <div className="mt-4 flex items-center space-x-4">
                          <button className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            <BookOpen className="w-4 h-4 mr-1" />
                            View Lessons
                          </button>
                          <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Retry Failed Questions
                          </button>
                          <button className="flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                            <Timer className="w-4 h-4 mr-1" />
                            Practice Mode
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {selectedView === 'progress' && (
          <GamifiedProgress />
        )}

        {/* Analysis Tab */}
        {selectedView === 'analysis' && (
          <AIAnalysisEngine />
        )}
      </div>
    </div>
  );
}
