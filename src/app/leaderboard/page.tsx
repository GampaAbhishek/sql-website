'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ResponsiveNavbar from '@/components/ResponsiveNavbar'
import Link from 'next/link'
import { 
  User, 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Clock,
  Search,
  Users,
  Globe,
  Flame,
  Timer,
  Eye
} from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  rank: number
  points: number
  solvedProblems: number
  accuracy: number
  streak: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  avatar?: string
  badges: number
  weeklyPoints: number
  isCurrentUser?: boolean
  isFriend?: boolean
  avgQueryTime: number // in seconds
  rankChange: number // positive = up, negative = down, 0 = no change
  recentBadges: string[]
  joinDate: string
}

const SAMPLE_LEADERBOARD: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    rank: 1,
    points: 4520,
    solvedProblems: 156,
    accuracy: 94,
    streak: 28,
    level: 'Advanced',
    badges: 12,
    weeklyPoints: 485,
    avgQueryTime: 45,
    rankChange: 0,
    recentBadges: ['SQL Master', 'Speed Demon'],
    joinDate: '2023-08-15',
    isFriend: false
  },
  {
    id: '2',
    name: 'Sarah Chen',
    rank: 2,
    points: 4350,
    solvedProblems: 142,
    accuracy: 92,
    streak: 15,
    level: 'Advanced',
    badges: 11,
    weeklyPoints: 420,
    avgQueryTime: 52,
    rankChange: 1,
    recentBadges: ['JOIN Expert'],
    joinDate: '2023-07-22',
    isFriend: true
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    rank: 3,
    points: 4180,
    solvedProblems: 134,
    accuracy: 89,
    streak: 22,
    level: 'Advanced',
    badges: 10,
    weeklyPoints: 380,
    avgQueryTime: 58,
    rankChange: -1,
    recentBadges: ['Consistency King'],
    joinDate: '2023-09-01',
    isFriend: true
  },
  {
    id: '4',
    name: 'Emily Johnson',
    rank: 4,
    points: 3890,
    solvedProblems: 128,
    accuracy: 91,
    streak: 12,
    level: 'Intermediate',
    badges: 9,
    weeklyPoints: 350,
    avgQueryTime: 73,
    rankChange: 2,
    recentBadges: ['Rising Star'],
    joinDate: '2023-06-10',
    isFriend: false
  },
  {
    id: '5',
    name: 'You',
    rank: 5,
    points: 3450,
    solvedProblems: 127,
    accuracy: 89,
    streak: 12,
    level: 'Intermediate',
    badges: 8,
    weeklyPoints: 285,
    isCurrentUser: true,
    avgQueryTime: 89,
    rankChange: 1,
    recentBadges: ['Streak Warrior'],
    joinDate: '2023-05-20',
    isFriend: false
  },
  {
    id: '6',
    name: 'David Park',
    rank: 6,
    points: 3280,
    solvedProblems: 115,
    accuracy: 87,
    streak: 8,
    level: 'Intermediate',
    badges: 7,
    weeklyPoints: 240,
    avgQueryTime: 95,
    rankChange: -1,
    recentBadges: ['Problem Solver'],
    joinDate: '2023-04-18',
    isFriend: true
  },
  {
    id: '7',
    name: 'Lisa Wang',
    rank: 7,
    points: 3150,
    solvedProblems: 108,
    accuracy: 93,
    streak: 18,
    level: 'Intermediate',
    badges: 8,
    weeklyPoints: 220,
    avgQueryTime: 67,
    rankChange: 0,
    recentBadges: ['Accuracy Ace'],
    joinDate: '2023-03-25',
    isFriend: true
  },
  {
    id: '8',
    name: 'James Wilson',
    rank: 8,
    points: 2980,
    solvedProblems: 102,
    accuracy: 85,
    streak: 5,
    level: 'Intermediate',
    badges: 6,
    weeklyPoints: 195,
    avgQueryTime: 112,
    rankChange: -2,
    recentBadges: ['Beginner Graduate'],
    joinDate: '2023-08-30',
    isFriend: false
  },
  {
    id: '9',
    name: 'Anna Martinez',
    rank: 9,
    points: 2750,
    solvedProblems: 95,
    accuracy: 88,
    streak: 14,
    level: 'Intermediate',
    badges: 7,
    weeklyPoints: 180,
    avgQueryTime: 134,
    rankChange: 1,
    recentBadges: ['Dedicated Learner'],
    joinDate: '2023-02-14',
    isFriend: false
  },
  {
    id: '10',
    name: 'Tom Anderson',
    rank: 10,
    points: 2580,
    solvedProblems: 89,
    accuracy: 84,
    streak: 7,
    level: 'Beginner',
    badges: 5,
    weeklyPoints: 165,
    avgQueryTime: 156,
    rankChange: 0,
    recentBadges: ['First Steps'],
    joinDate: '2023-09-20',
    isFriend: false
  }
]

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'all-time' | 'weekly' | 'monthly'>('all-time')
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [leaderboardView, setLeaderboardView] = useState<'global' | 'friends'>('global')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showLevelDropdown, setShowLevelDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  const filteredLeaderboard = SAMPLE_LEADERBOARD.filter(user => {
    // Filter by level
    const levelFilter = selectedLevel === 'all' || user.level.toLowerCase() === selectedLevel
    
    // Filter by view (global vs friends)
    const viewFilter = leaderboardView === 'global' || user.isFriend || user.isCurrentUser
    
    // Filter by search query
    const searchFilter = searchQuery === '' || user.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return levelFilter && viewFilter && searchFilter
  })

  const friendsCount = SAMPLE_LEADERBOARD.filter(u => u.isFriend).length
  const currentUserData = SAMPLE_LEADERBOARD.find(u => u.isCurrentUser)

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <span className="text-slate-400">—</span>
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getMotivationalMessage = () => {
    if (!currentUserData) return null
    
    const nextRankUser = SAMPLE_LEADERBOARD.find(u => u.rank === currentUserData.rank - 1)
    if (nextRankUser) {
      const pointsNeeded = nextRankUser.points - currentUserData.points
      return `You're ${pointsNeeded} points away from moving to rank #${nextRankUser.rank}!`
    }
    return "You're doing great! Keep solving challenges to climb the ranks!"
  }

  const handleUserClick = (clickedUser: LeaderboardUser) => {
    setSelectedUser(clickedUser)
    setShowUserModal(true)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-slate-400">#{rank}</span>
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-green-400 bg-green-500/20'
      case 'Intermediate':
        return 'text-blue-400 bg-blue-500/20'
      case 'Advanced':
        return 'text-purple-400 bg-purple-500/20'
      default:
        return 'text-slate-400 bg-slate-500/20'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view the leaderboard</h1>
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
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-slate-300">See how you rank against other SQL practitioners</p>
        </div>

        {/* Leaderboard Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setLeaderboardView('global')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                leaderboardView === 'global'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Global</span>
            </button>
            <button
              onClick={() => setLeaderboardView('friends')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                leaderboardView === 'friends'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Friends ({friendsCount})</span>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative">
            <button 
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{selectedPeriod.replace('-', ' ')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showPeriodDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                {[
                  { value: 'all-time', label: 'All Time' },
                  { value: 'weekly', label: 'This Week' },
                  { value: 'monthly', label: 'This Month' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => {
                      setSelectedPeriod(period.value as any)
                      setShowPeriodDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLevelDropdown(!showLevelDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="capitalize">{selectedLevel} Level</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showLevelDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                {[
                  { value: 'all', label: 'All Levels' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => {
                      setSelectedLevel(level.value as any)
                      setShowLevelDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Stats Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Stats */}
            {currentUserData && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Current Rank</span>
                    <div className="flex items-center space-x-2">
                      {getRankIcon(currentUserData.rank)}
                      <span className="text-blue-400 font-medium">#{currentUserData.rank}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total Points</span>
                    <span className="text-yellow-400 font-medium">{currentUserData.points.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Current Streak</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-medium">{currentUserData.streak}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Avg Speed</span>
                    <span className="text-blue-400 font-medium">{formatTime(currentUserData.avgQueryTime)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Accuracy</span>
                    <span className="text-green-400 font-medium">{currentUserData.accuracy}%</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {currentUserData.recentBadges.map((badge, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-yellow-400">🏆</span>
                        <span className="text-sm text-slate-300">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Leaderboard Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total Users</span>
                  <span className="text-white font-medium">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Your Friends</span>
                  <span className="text-green-400 font-medium">{friendsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Active Today</span>
                  <span className="text-blue-400 font-medium">342</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Leaderboard */}
          <div className="lg:col-span-3 space-y-8">
            {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredLeaderboard.slice(0, 3).map((user, index) => {
            const positions = [1, 0, 2] // Center the first place
            const actualPosition = positions[index]
            const heights = ['h-32', 'h-40', 'h-28']
            const podiumUser = filteredLeaderboard[actualPosition]
            
            return (
              <div 
                key={podiumUser.id} 
                className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center relative overflow-hidden ${
                  podiumUser.isCurrentUser ? 'ring-2 ring-blue-500' : ''
                } ${index === 1 ? 'md:order-first' : ''}`}
              >
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${
                  podiumUser.rank === 1 ? 'from-yellow-500/20' : 
                  podiumUser.rank === 2 ? 'from-gray-400/20' : 'from-amber-600/20'
                } ${heights[actualPosition]}`} />
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(podiumUser.rank)}
                  </div>
                  
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{podiumUser.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-center items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{podiumUser.points.toLocaleString()} pts</span>
                    </div>
                    
                    <div className="flex justify-center items-center space-x-4 text-slate-300">
                      <span>{podiumUser.solvedProblems} solved</span>
                      <span>{podiumUser.accuracy}% accuracy</span>
                    </div>
                    
                    <div className={`inline-block px-2 py-1 rounded-full text-xs ${getLevelColor(podiumUser.level)}`}>
                      {podiumUser.level}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Full Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Solved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Avg Speed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLeaderboard.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-700/30 transition-colors ${
                      user.isCurrentUser ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.rank <= 3 ? getRankIcon(user.rank) : (
                          <span className="text-lg font-bold text-slate-400">#{user.rank}</span>
                        )}
                        {getRankChangeIcon(user.rankChange)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className={`font-medium flex items-center space-x-2 ${user.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                            <span>{user.name}</span>
                            {user.isCurrentUser && <span className="text-xs text-blue-400">(You)</span>}
                            {user.isFriend && <Users className="w-4 h-4 text-green-400" />}
                          </div>
                          {selectedPeriod === 'weekly' && (
                            <div className="text-sm text-slate-400">+{user.weeklyPoints} this week</div>
                          )}
                          {user.recentBadges.length > 0 && (
                            <div className="text-xs text-yellow-400">
                              🏆 {user.recentBadges[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{user.points.toLocaleString()}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-300">{user.solvedProblems}</span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">{formatTime(user.avgQueryTime)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${user.accuracy}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-sm">{user.accuracy}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-300">{user.streak}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getLevelColor(user.level)}`}>
                        {user.level}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">{user.badges}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Your Rank</h3>
            <p className="text-3xl font-bold text-blue-400 mb-2">#5</p>
            <p className="text-sm text-slate-400">Out of 1,247 users</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Star className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Points to Next Rank</h3>
            <p className="text-3xl font-bold text-green-400 mb-2">440</p>
            <p className="text-sm text-slate-400">To reach rank #4</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Top 1% Achievement</h3>
            <p className="text-3xl font-bold text-yellow-400 mb-2">87%</p>
            <p className="text-sm text-slate-400">Almost there!</p>
          </div>
        </div>
        
        </div>
        </div>

        {/* Motivational Message */}
        {currentUserData && (
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Keep Climbing!</h3>
            </div>
            <p className="text-slate-300 mb-4">{getMotivationalMessage()}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-slate-300">
                  Complete 3 challenges today to improve your streak rank
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">
                  Solve faster queries to improve your speed ranking
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Profile</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">{selectedUser.name}</h4>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getRankIcon(selectedUser.rank)}
                <span className="text-slate-300">Rank #{selectedUser.rank}</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${getLevelColor(selectedUser.level)}`}>
                {selectedUser.level}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{selectedUser.points.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Points</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Timer className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{formatTime(selectedUser.avgQueryTime)}</div>
                <div className="text-sm text-slate-400">Avg Speed</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{selectedUser.streak}</div>
                <div className="text-sm text-slate-400">Day Streak</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{selectedUser.badges}</div>
                <div className="text-sm text-slate-400">Badges</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium text-slate-300 mb-3">Recent Badges</h5>
              <div className="flex flex-wrap gap-2">
                {selectedUser.recentBadges.map((badge, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-slate-400">
                Joined {new Date(selectedUser.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
