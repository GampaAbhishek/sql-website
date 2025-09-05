'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ResponsiveNavbar from '@/components/ResponsiveNavbar'
import Link from 'next/link'
import { 
  User, 
  Trophy, 
  Star,
  Lock,
  Filter,
  ChevronDown,
  Calendar,
  Zap,
  Target,
  Award,
  Crown,
  Flame,
  Database,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Share2,
  Info,
  Medal,
  Sparkles,
  BarChart3,
  Code,
  Users,
  Timer,
  Layers
} from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'query-milestones' | 'streaks' | 'challenges' | 'level-mastery' | 'speed' | 'special'
  difficulty: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'
  points: number
  earned: boolean
  earnedDate?: string
  progress: number
  requirement: number
  unlockCriteria: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isNew?: boolean
}

interface BadgeStats {
  totalEarned: number
  totalPoints: number
  streakBadges: number
  recentBadges: Badge[]
  completionPercentage: number
}

const SAMPLE_BADGES: Badge[] = [
  // Query Milestones
  {
    id: 'first-query',
    name: 'First Steps',
    description: 'Execute your very first SQL query',
    icon: '🎯',
    category: 'query-milestones',
    difficulty: 'bronze',
    points: 50,
    earned: true,
    earnedDate: '2024-01-05',
    progress: 1,
    requirement: 1,
    unlockCriteria: 'Execute 1 SQL query',
    rarity: 'common'
  },
  {
    id: 'query-explorer',
    name: 'Query Explorer',
    description: 'Execute 25 different SQL queries',
    icon: '🔍',
    category: 'query-milestones',
    difficulty: 'bronze',
    points: 100,
    earned: true,
    earnedDate: '2024-01-08',
    progress: 25,
    requirement: 25,
    unlockCriteria: 'Execute 25 SQL queries',
    rarity: 'common'
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Execute 100 SQL queries',
    icon: '💯',
    category: 'query-milestones',
    difficulty: 'silver',
    points: 250,
    earned: true,
    earnedDate: '2024-01-15',
    progress: 100,
    requirement: 100,
    unlockCriteria: 'Execute 100 SQL queries',
    rarity: 'rare',
    isNew: true
  },
  {
    id: 'query-master',
    name: 'Query Master',
    description: 'Execute 500 SQL queries',
    icon: '🎖️',
    category: 'query-milestones',
    difficulty: 'gold',
    points: 500,
    earned: false,
    progress: 127,
    requirement: 500,
    unlockCriteria: 'Execute 500 SQL queries',
    rarity: 'epic'
  },
  
  // Streaks
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Practice SQL for 3 consecutive days',
    icon: '📅',
    category: 'streaks',
    difficulty: 'bronze',
    points: 75,
    earned: true,
    earnedDate: '2024-01-07',
    progress: 3,
    requirement: 3,
    unlockCriteria: 'Practice for 3 consecutive days',
    rarity: 'common'
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    category: 'streaks',
    difficulty: 'silver',
    points: 150,
    earned: true,
    earnedDate: '2024-01-12',
    progress: 7,
    requirement: 7,
    unlockCriteria: 'Practice for 7 consecutive days',
    rarity: 'rare'
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Maintain a 30-day practice streak',
    icon: '🌟',
    category: 'streaks',
    difficulty: 'legendary',
    points: 1000,
    earned: false,
    progress: 12,
    requirement: 30,
    unlockCriteria: 'Practice for 30 consecutive days',
    rarity: 'legendary'
  },
  
  // Challenges
  {
    id: 'challenge-rookie',
    name: 'Challenge Rookie',
    description: 'Complete your first challenge',
    icon: '🏁',
    category: 'challenges',
    difficulty: 'bronze',
    points: 100,
    earned: true,
    earnedDate: '2024-01-06',
    progress: 1,
    requirement: 1,
    unlockCriteria: 'Complete 1 challenge',
    rarity: 'common'
  },
  {
    id: 'join-master',
    name: 'JOIN Master',
    description: 'Complete 20 JOIN-related challenges',
    icon: '🔗',
    category: 'challenges',
    difficulty: 'gold',
    points: 400,
    earned: false,
    progress: 15,
    requirement: 20,
    unlockCriteria: 'Complete 20 JOIN challenges',
    rarity: 'epic'
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete 50 challenges with 90%+ accuracy',
    icon: '👑',
    category: 'challenges',
    difficulty: 'diamond',
    points: 750,
    earned: false,
    progress: 32,
    requirement: 50,
    unlockCriteria: 'Complete 50 challenges with 90%+ accuracy',
    rarity: 'legendary'
  },
  
  // Level Mastery
  {
    id: 'beginner-graduate',
    name: 'Beginner Graduate',
    description: 'Complete all beginner-level content',
    icon: '🎓',
    category: 'level-mastery',
    difficulty: 'silver',
    points: 200,
    earned: true,
    earnedDate: '2024-01-10',
    progress: 100,
    requirement: 100,
    unlockCriteria: 'Complete all beginner challenges',
    rarity: 'rare'
  },
  {
    id: 'intermediate-expert',
    name: 'Intermediate Expert',
    description: 'Complete all intermediate-level content',
    icon: '⚡',
    category: 'level-mastery',
    difficulty: 'gold',
    points: 400,
    earned: false,
    progress: 64,
    requirement: 100,
    unlockCriteria: 'Complete all intermediate challenges',
    rarity: 'epic'
  },
  {
    id: 'sql-grandmaster',
    name: 'SQL Grandmaster',
    description: 'Master all difficulty levels',
    icon: '🏆',
    category: 'level-mastery',
    difficulty: 'legendary',
    points: 1500,
    earned: false,
    progress: 27,
    requirement: 100,
    unlockCriteria: 'Complete all advanced challenges',
    rarity: 'legendary'
  },
  
  // Speed
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Solve 10 queries in under 30 seconds each',
    icon: '⚡',
    category: 'speed',
    difficulty: 'silver',
    points: 300,
    earned: false,
    progress: 6,
    requirement: 10,
    unlockCriteria: 'Solve 10 queries under 30 seconds',
    rarity: 'rare'
  },
  {
    id: 'lightning-fingers',
    name: 'Lightning Fingers',
    description: 'Achieve average query time under 45 seconds',
    icon: '⚡',
    category: 'speed',
    difficulty: 'gold',
    points: 500,
    earned: false,
    progress: 75,
    requirement: 100,
    unlockCriteria: 'Maintain 45s average for 50 queries',
    rarity: 'epic'
  },
  
  // Special
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined during the first month of launch',
    icon: '🌅',
    category: 'special',
    difficulty: 'diamond',
    points: 1000,
    earned: true,
    earnedDate: '2024-01-01',
    progress: 1,
    requirement: 1,
    unlockCriteria: 'Join during launch month',
    rarity: 'legendary'
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Achieve 100% accuracy on 10 consecutive challenges',
    icon: '💎',
    category: 'special',
    difficulty: 'legendary',
    points: 2000,
    earned: false,
    progress: 4,
    requirement: 10,
    unlockCriteria: '10 consecutive perfect scores',
    rarity: 'legendary'
  }
]

export default function BadgesPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSort, setSelectedSort] = useState<'newest' | 'points' | 'difficulty'>('newest')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const badgeStats: BadgeStats = {
    totalEarned: SAMPLE_BADGES.filter(b => b.earned).length,
    totalPoints: SAMPLE_BADGES.filter(b => b.earned).reduce((sum, b) => sum + b.points, 0),
    streakBadges: SAMPLE_BADGES.filter(b => b.category === 'streaks' && b.earned).length,
    recentBadges: SAMPLE_BADGES.filter(b => b.earned && b.isNew),
    completionPercentage: Math.round((SAMPLE_BADGES.filter(b => b.earned).length / SAMPLE_BADGES.length) * 100)
  }

  const filteredBadges = SAMPLE_BADGES.filter(badge => {
    if (selectedCategory === 'all') return true
    return badge.category === selectedCategory
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'newest':
        if (a.earned && b.earned) {
          return new Date(b.earnedDate!).getTime() - new Date(a.earnedDate!).getTime()
        }
        return b.earned ? 1 : a.earned ? -1 : 0
      case 'points':
        return b.points - a.points
      case 'difficulty':
        const difficultyOrder = { bronze: 1, silver: 2, gold: 3, diamond: 4, legendary: 5 }
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
      default:
        return 0
    }
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'from-amber-600 to-amber-800'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'diamond': return 'from-blue-400 to-purple-600'
      case 'legendary': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-gray-500'
    }
  }

  const getNextAchievableBadge = () => {
    return SAMPLE_BADGES
      .filter(badge => !badge.earned && badge.progress > 0)
      .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))[0]
  }

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    setShowBadgeModal(true)
  }

  const categories = [
    { value: 'all', label: 'All Badges', icon: Trophy },
    { value: 'query-milestones', label: 'Query Milestones', icon: Database },
    { value: 'streaks', label: 'Streaks', icon: Flame },
    { value: 'challenges', label: 'Challenges', icon: Target },
    { value: 'level-mastery', label: 'Level Mastery', icon: Crown },
    { value: 'speed', label: 'Speed', icon: Zap },
    { value: 'special', label: 'Special', icon: Sparkles }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your badges</h1>
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
          <h1 className="text-3xl font-bold text-white mb-2">Badges & Achievements</h1>
          <p className="text-slate-300">Collect badges by mastering SQL skills and completing challenges</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Total Badges</p>
                <p className="text-2xl font-bold text-white">{badgeStats.totalEarned}/{SAMPLE_BADGES.length}</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${badgeStats.completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{badgeStats.completionPercentage}% Complete</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Badge Points</p>
                <p className="text-2xl font-bold text-white">{badgeStats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">From {badgeStats.totalEarned} earned badges</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Streak Badges</p>
                <p className="text-2xl font-bold text-white">{badgeStats.streakBadges}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Consistency achievements</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">New Badges</p>
                <p className="text-2xl font-bold text-white">{badgeStats.recentBadges.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Recently earned</p>
          </div>
        </div>

        {/* Next Achievement */}
        {getNextAchievableBadge() && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{getNextAchievableBadge()?.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Next Achievement</h3>
                  <p className="text-slate-300 mb-2">
                    Complete {getNextAchievableBadge()?.requirement - getNextAchievableBadge()?.progress!} more to earn the <strong>{getNextAchievableBadge()?.name}</strong> badge!
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-48 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(getNextAchievableBadge()?.progress! / getNextAchievableBadge()?.requirement!) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400">
                      {getNextAchievableBadge()?.progress}/{getNextAchievableBadge()?.requirement}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Reward</div>
                <div className="text-xl font-bold text-yellow-400">+{getNextAchievableBadge()?.points} pts</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative">
            <button 
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="capitalize">{categories.find(c => c.value === selectedCategory)?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value)
                      setShowCategoryDropdown(false)
                    }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="capitalize">Sort by {selectedSort}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                {[
                  { value: 'newest', label: 'Newest Earned' },
                  { value: 'points', label: 'Most Points' },
                  { value: 'difficulty', label: 'Difficulty' }
                ].map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => {
                      setSelectedSort(sort.value as any)
                      setShowSortDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`relative bg-slate-800/50 backdrop-blur-sm border-2 ${
                badge.earned ? getRarityColor(badge.rarity) : 'border-slate-700'
              } rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                badge.earned ? 'shadow-lg' : ''
              }`}
              onClick={() => handleBadgeClick(badge)}
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              {/* New Badge Indicator */}
              {badge.isNew && badge.earned && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW!
                </div>
              )}

              {/* Badge Icon */}
              <div className={`relative mb-4 ${!badge.earned ? 'opacity-40' : ''}`}>
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getDifficultyColor(badge.difficulty)} flex items-center justify-center text-2xl mb-3 ${
                  hoveredBadge === badge.id ? 'animate-pulse' : ''
                }`}>
                  {badge.earned ? badge.icon : <Lock className="w-8 h-8 text-white" />}
                </div>
                
                {/* Difficulty Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${getDifficultyColor(badge.difficulty)} flex items-center justify-center`}>
                  {badge.difficulty === 'bronze' && <Medal className="w-3 h-3 text-white" />}
                  {badge.difficulty === 'silver' && <Award className="w-3 h-3 text-white" />}
                  {badge.difficulty === 'gold' && <Trophy className="w-3 h-3 text-white" />}
                  {badge.difficulty === 'diamond' && <Sparkles className="w-3 h-3 text-white" />}
                  {badge.difficulty === 'legendary' && <Crown className="w-3 h-3 text-white" />}
                </div>
              </div>

              {/* Badge Content */}
              <div className="text-center">
                <h3 className={`font-semibold mb-2 ${badge.earned ? 'text-white' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                <p className={`text-sm mb-3 ${badge.earned ? 'text-slate-300' : 'text-slate-500'}`}>
                  {badge.description}
                </p>

                {/* Progress Bar */}
                {!badge.earned && badge.progress > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{badge.progress}/{badge.requirement}</p>
                  </div>
                )}

                {/* Points */}
                <div className={`flex items-center justify-center space-x-2 ${badge.earned ? 'text-yellow-400' : 'text-slate-500'}`}>
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{badge.points} pts</span>
                </div>

                {/* Earned Date */}
                {badge.earned && badge.earnedDate && (
                  <p className="text-xs text-slate-400 mt-2">
                    Earned {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Lock Overlay */}
              {!badge.earned && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 px-2">{badge.unlockCriteria}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {showBadgeModal && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Badge Details</h3>
              <button 
                onClick={() => setShowBadgeModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getDifficultyColor(selectedBadge.difficulty)} flex items-center justify-center text-4xl mb-4 ${
                selectedBadge.earned ? '' : 'opacity-40'
              }`}>
                {selectedBadge.earned ? selectedBadge.icon : <Lock className="w-12 h-12 text-white" />}
              </div>
              
              <h4 className="text-xl font-semibold text-white mb-2">{selectedBadge.name}</h4>
              <p className="text-slate-300 mb-4">{selectedBadge.description}</p>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${getDifficultyColor(selectedBadge.difficulty)} text-white`}>
                  {selectedBadge.difficulty.charAt(0).toUpperCase() + selectedBadge.difficulty.slice(1)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm border ${getRarityColor(selectedBadge.rarity)} text-white`}>
                  {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Points Reward</span>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{selectedBadge.points}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Progress</span>
                <span className="text-white">{selectedBadge.progress}/{selectedBadge.requirement}</span>
              </div>
              
              {!selectedBadge.earned && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-slate-300 mb-2">How to Unlock</h5>
                  <p className="text-sm text-slate-400">{selectedBadge.unlockCriteria}</p>
                  
                  {selectedBadge.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-1">
                        <div 
                          className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(selectedBadge.progress / selectedBadge.requirement) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {selectedBadge.requirement - selectedBadge.progress} more to complete
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedBadge.earned && selectedBadge.earnedDate && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Earned on {new Date(selectedBadge.earnedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {selectedBadge.earned && (
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share Badge</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
