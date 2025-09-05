'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import RoadmapWidget from '@/components/RoadmapWidget';
import { 
  Play, 
  BookOpen, 
  Target, 
  Award,
  Clock,
  Trophy,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Flame,
  Database,
  Brain,
  Lightbulb,
  MessageSquare,
  Share2
} from 'lucide-react';

interface UserStats {
  totalPoints: number;
  lessonsCompleted: number;
  challengesCompleted: number;
  currentStreak: number;
  rank: number;
  skillLevel: string;
  timeSpent: string;
  queriesExecuted: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface RecentActivity {
  id: string;
  type: 'lesson' | 'challenge' | 'achievement';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  icon: React.ComponentType<any>;
}

interface UpcomingGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  type: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 1847,
    lessonsCompleted: 12,
    challengesCompleted: 8,
    currentStreak: 7,
    rank: 156,
    skillLevel: 'Intermediate',
    timeSpent: '24h 30m',
    queriesExecuted: 127
  });

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'SQL Playground',
      description: 'Practice queries in our interactive editor',
      href: '/playground',
      icon: Play,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: '2',
      title: 'Daily Challenge',
      description: 'Solve today\'s SQL challenge and earn points',
      href: '/challenges',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    },
    {
      id: '3',
      title: 'AI Interview Simulator',
      description: 'Practice with AI-powered mock interviews',
      href: '/interview-prep',
      icon: Brain,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: '4',
      title: 'Learning Path',
      description: 'Continue your structured SQL learning journey',
      href: '/learning-path',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: '5',
      title: 'Community Forum',
      description: 'Ask questions and help other learners',
      href: '/forum',
      icon: MessageSquare,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30'
    },
    {
      id: '6',
      title: 'Share Queries',
      description: 'Share your SQL solutions with the community',
      href: '/share-queries',
      icon: Share2,
      color: 'text-teal-400',
      bgColor: 'bg-teal-900/20',
      borderColor: 'border-teal-500/30'
    },
    {
      id: '7',
      title: 'View Progress',
      description: 'Track your learning analytics and achievements',
      href: '/progress',
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'lesson',
      title: 'Completed "Advanced JOINs"',
      description: 'Mastered INNER, LEFT, and RIGHT JOIN operations',
      points: 150,
      timestamp: '2 hours ago',
      icon: BookOpen
    },
    {
      id: '2',
      type: 'challenge',
      title: 'SQL Challenge Victory',
      description: 'Solved "Complex Aggregations" in under 5 minutes',
      points: 200,
      timestamp: '1 day ago',
      icon: Target
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Badge Unlocked: Query Master',
      description: 'Executed 100+ successful queries',
      points: 100,
      timestamp: '2 days ago',
      icon: Award
    }
  ];

  const upcomingGoals: UpcomingGoal[] = [
    {
      id: '1',
      title: 'Complete 5 More Lessons',
      description: 'Finish the Advanced SQL track',
      progress: 2,
      target: 5,
      type: 'lessons'
    },
    {
      id: '2',
      title: 'Win 10 Challenges',
      description: 'Test your skills in daily challenges',
      progress: 6,
      target: 10,
      type: 'challenges'
    },
    {
      id: '3',
      title: 'Maintain 14-Day Streak',
      description: 'Keep your learning momentum',
      progress: 7,
      target: 14,
      type: 'streak'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-slate-400 mb-6">You need to be logged in to access the dashboard</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <ResponsiveNavbar currentPage="dashboard" />

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                Ready to continue your SQL learning journey? Let's build something amazing today!
              </p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <div className="text-xs sm:text-sm text-slate-400">Your current level</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{userStats.skillLevel}</div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-yellow-400">{userStats.totalPoints}</span>
            </div>
            <div className="text-slate-300 font-medium text-sm sm:text-base">Total Points</div>
            <div className="text-slate-500 text-xs sm:text-sm">+45 this week</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-green-400">{userStats.lessonsCompleted}</span>
            </div>
            <div className="text-slate-300 font-medium text-sm sm:text-base">Lessons</div>
            <div className="text-slate-500 text-xs sm:text-sm">6 total available</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-orange-400">{userStats.currentStreak}</span>
            </div>
            <div className="text-slate-300 font-medium text-sm sm:text-base">Day Streak</div>
            <div className="text-slate-500 text-xs sm:text-sm">Keep it up!</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-purple-400">#{userStats.rank}</span>
            </div>
            <div className="text-slate-300 font-medium text-sm sm:text-base">Global Rank</div>
            <div className="text-slate-500 text-xs sm:text-sm">Top 10%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={`group ${action.bgColor} border ${action.borderColor} rounded-lg p-4 sm:p-6 hover:bg-opacity-30 transition-all duration-200 hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                    <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
                <Link 
                  href="/activity"
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'lesson' ? 'bg-blue-900/30' :
                      activity.type === 'challenge' ? 'bg-green-900/30' :
                      'bg-yellow-900/30'
                    }`}>
                      <activity.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        activity.type === 'lesson' ? 'text-blue-400' :
                        activity.type === 'challenge' ? 'text-green-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm sm:text-base truncate">{activity.title}</h3>
                        {activity.points && (
                          <span className="text-yellow-400 text-xs sm:text-sm font-medium ml-2">+{activity.points} pts</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs sm:text-sm">{activity.description}</p>
                      <p className="text-slate-500 text-xs mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Current Goals */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Current Goals</h2>
              <div className="space-y-3 sm:space-y-4">
                {upcomingGoals.map((goal) => (
                  <div key={goal.id} className="p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
                      <span className="text-slate-400 text-xs">{goal.progress}/{goal.target}</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">{goal.description}</p>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Learning Stats</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">Time Spent</span>
                  </div>
                  <span className="text-white font-medium text-sm">{userStats.timeSpent}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">Queries Executed</span>
                  </div>
                  <span className="text-white font-medium text-sm">{userStats.queriesExecuted}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm">Challenges Won</span>
                  </div>
                  <span className="text-white font-medium text-sm">{userStats.challengesCompleted}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300 text-sm">Skill Level</span>
                  </div>
                  <span className="text-white font-medium text-sm">{userStats.skillLevel}</span>
                </div>
              </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 sm:p-6 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">Daily SQL Tip</h2>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm">
                Use <code className="bg-slate-800 px-2 py-1 rounded text-blue-300">EXPLAIN</code> before your SELECT statements to understand query execution plans and optimize performance.
              </p>
            </div>

            {/* AI Roadmap Widget */}
            <RoadmapWidget compact={true} maxItems={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
