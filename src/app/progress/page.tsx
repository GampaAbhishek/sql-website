'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ResponsiveNavbar from '@/components/ResponsiveNavbar'
import Link from 'next/link'
import { 
  User, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Flame,
  BarChart3,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  BookOpen,
  Database
} from 'lucide-react'

interface ProgressStats {
  solvedProblems: number
  accuracy: number
  streak: number
  pointsEarned: number
  badgesEarned: number
  totalQueries: number
  correctQueries: number
  lastSolvedDate: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  rank: number
}

interface ChartData {
  date: string
  solved: number
  accuracy: number
}

interface ActivityItem {
  id: string
  date: string
  time: string
  title: string
  type: 'challenge' | 'lesson' | 'practice'
  points: number
  result: 'success' | 'failed'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  requirement: number
}

const SAMPLE_CHART_DATA: ChartData[] = [
  { date: '2024-01-01', solved: 2, accuracy: 85 },
  { date: '2024-01-02', solved: 3, accuracy: 90 },
  { date: '2024-01-03', solved: 1, accuracy: 100 },
  { date: '2024-01-04', solved: 4, accuracy: 75 },
  { date: '2024-01-05', solved: 2, accuracy: 95 },
  { date: '2024-01-06', solved: 5, accuracy: 88 },
  { date: '2024-01-07', solved: 3, accuracy: 92 },
  { date: '2024-01-08', solved: 6, accuracy: 83 },
  { date: '2024-01-09', solved: 2, accuracy: 100 },
  { date: '2024-01-10', solved: 4, accuracy: 87 },
]

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    date: '2024-01-10',
    time: '14:30',
    title: 'Complex JOIN Operations',
    type: 'challenge',
    points: 150,
    result: 'success',
    difficulty: 'Advanced'
  },
  {
    id: '2',
    date: '2024-01-10',
    time: '13:15',
    title: 'Subqueries and CTEs',
    type: 'lesson',
    points: 100,
    result: 'success',
    difficulty: 'Intermediate'
  },
  {
    id: '3',
    date: '2024-01-09',
    time: '16:45',
    title: 'Window Functions Practice',
    type: 'practice',
    points: 75,
    result: 'failed',
    difficulty: 'Advanced'
  },
  {
    id: '4',
    date: '2024-01-09',
    time: '15:20',
    title: 'GROUP BY and Aggregations',
    type: 'challenge',
    points: 120,
    result: 'success',
    difficulty: 'Intermediate'
  },
  {
    id: '5',
    date: '2024-01-08',
    time: '18:10',
    title: 'Basic SELECT Queries',
    type: 'lesson',
    points: 50,
    result: 'success',
    difficulty: 'Beginner'
  }
]

const SAMPLE_BADGES: Badge[] = [
  {
    id: 'sql-starter',
    name: 'SQL Starter',
    description: 'Solve your first 10 queries',
    icon: '🎯',
    unlocked: true,
    progress: 10,
    requirement: 10
  },
  {
    id: 'join-master',
    name: 'JOIN Master',
    description: 'Complete 20 JOIN-related challenges',
    icon: '🔗',
    unlocked: false,
    progress: 15,
    requirement: 20
  },
  {
    id: 'streak-warrior',
    name: 'Streak Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    unlocked: true,
    progress: 7,
    requirement: 7
  },
  {
    id: 'accuracy-ace',
    name: 'Accuracy Ace',
    description: 'Achieve 95% accuracy over 50 queries',
    icon: '🎯',
    unlocked: false,
    progress: 42,
    requirement: 50
  }
]

export default function ProgressPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7days')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  
  // Sample user progress data
  const [progressStats] = useState<ProgressStats>({
    solvedProblems: 127,
    accuracy: 89,
    streak: 12,
    pointsEarned: 3450,
    badgesEarned: 8,
    totalQueries: 143,
    correctQueries: 127,
    lastSolvedDate: '2024-01-10',
    level: 'Intermediate',
    rank: 5
  })

  const [chartData] = useState(SAMPLE_CHART_DATA)
  const [activities] = useState(SAMPLE_ACTIVITIES)
  const [badges] = useState(SAMPLE_BADGES)

  // Calculate trends
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { direction: 'up', percentage: 0 }
    const change = ((current - previous) / previous) * 100
    return {
      direction: change >= 0 ? 'up' : 'down',
      percentage: Math.abs(change)
    }
  }

  const solvedTrend = getTrend(progressStats.solvedProblems, 118)
  const accuracyTrend = getTrend(progressStats.accuracy, 85)
  const streakTrend = getTrend(progressStats.streak, 8)
  const pointsTrend = getTrend(progressStats.pointsEarned, 3200)

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'all') return true
    return activity.difficulty.toLowerCase() === selectedFilter
  })

  const nextBadge = badges.find(badge => !badge.unlocked)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your progress</h1>
          <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation Bar */}
      <ResponsiveNavbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Progress Dashboard</h1>
          <p className="text-slate-300">Track your SQL learning journey and achievements</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Solved Problems */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Solved Problems</p>
                  <p className="text-2xl font-bold text-white">{progressStats.solvedProblems}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                solvedTrend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {solvedTrend.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{solvedTrend.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((progressStats.solvedProblems / 200) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Accuracy</p>
                  <p className="text-2xl font-bold text-white">{progressStats.accuracy}%</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                accuracyTrend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {accuracyTrend.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{accuracyTrend.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.accuracy}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-white">{progressStats.streak} days</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                streakTrend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {streakTrend.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{streakTrend.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((progressStats.streak / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Points & Badges */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-white">{progressStats.pointsEarned.toLocaleString()}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                pointsTrend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {pointsTrend.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{pointsTrend.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>{progressStats.badgesEarned} badges earned</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Queries Solved Over Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Queries Solved Over Time</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                  7D
                </button>
                <button className="px-3 py-1 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                  30D
                </button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => {
                const maxSolved = Math.max(...chartData.map(d => d.solved))
                const height = (data.solved / maxSolved) * 200
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500 hover:from-blue-400 hover:to-blue-300 cursor-pointer"
                      style={{ height: `${height}px` }}
                      title={`${data.solved} queries on ${data.date}`}
                    />
                    <span className="text-xs text-slate-400 transform rotate-45">
                      {new Date(data.date).getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Accuracy Trend */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Accuracy Trend</h2>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Current: {progressStats.accuracy}%</span>
              </div>
            </div>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0,${200 - (chartData[0].accuracy * 2)} ${chartData.map((data, index) => 
                    `L ${(index * 400) / (chartData.length - 1)},${200 - (data.accuracy * 2)}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  className="drop-shadow-lg"
                />
                <path
                  d={`M 0,${200 - (chartData[0].accuracy * 2)} ${chartData.map((data, index) => 
                    `L ${(index * 400) / (chartData.length - 1)},${200 - (data.accuracy * 2)}`
                  ).join(' ')} L 400,200 L 0,200 Z`}
                  fill="url(#accuracyGradient)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Level Progression */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Level Progression</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">Beginner</span>
              <span className="text-slate-300">45/45 Complete</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-green-400 h-3 rounded-full" style={{ width: '100%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium">Intermediate</span>
              <span className="text-slate-300">32/50 Complete</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-blue-400 h-3 rounded-full" style={{ width: '64%' }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-medium">Advanced</span>
              <span className="text-slate-300">8/30 Complete</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-purple-400 h-3 rounded-full" style={{ width: '27%' }} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="capitalize">{selectedFilter}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter)
                          setShowFilterDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg capitalize"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      activity.result === 'success' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {activity.result === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{activity.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{activity.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.time}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                          activity.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-400 font-medium">
                      <Star className="w-4 h-4" />
                      <span>+{activity.points}</span>
                    </div>
                    <span className="text-xs text-slate-400 capitalize">{activity.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges & Achievements */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Badges & Achievements</h2>
            <div className="space-y-4">
              {badges.map((badge) => (
                <div key={badge.id} className={`p-4 rounded-lg border transition-all duration-300 ${
                  badge.unlocked 
                    ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' 
                    : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h3 className={`font-medium ${badge.unlocked ? 'text-yellow-400' : 'text-white'}`}>
                        {badge.name}
                      </h3>
                      <p className="text-sm text-slate-400">{badge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      {badge.progress}/{badge.requirement}
                    </span>
                    <span className={badge.unlocked ? 'text-yellow-400' : 'text-slate-400'}>
                      {badge.unlocked ? '✓ Unlocked' : `${Math.round((badge.progress / badge.requirement) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        badge.unlocked ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.min((badge.progress / badge.requirement) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Next Goal */}
            {nextBadge && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-medium text-blue-400 mb-2">🎯 Next Goal</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Solve {nextBadge.requirement - nextBadge.progress} more {nextBadge.name.includes('JOIN') ? 'JOIN' : 'Intermediate'} challenges to unlock the <strong>{nextBadge.name}</strong> badge!
                </p>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(nextBadge.progress / nextBadge.requirement) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
