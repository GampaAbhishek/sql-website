'use client';

import { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Lock,
  Unlock,
  Award,
  Crown,
  Flame,
  CheckCircle,
  ArrowRight,
  Timer,
  BookOpen,
  Play
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  category: 'mastery' | 'streak' | 'speed' | 'achievement';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  type: 'upcoming' | 'in-progress' | 'completed';
  estimatedTime?: string;
}

const BADGES: Badge[] = [
  {
    id: 'select-master',
    name: 'SELECT Master',
    description: 'Complete all SELECT basics challenges',
    icon: CheckCircle,
    color: 'text-green-400',
    unlocked: true,
    category: 'mastery'
  },
  {
    id: 'where-wizard',
    name: 'WHERE Wizard',
    description: 'Master WHERE clause operations',
    icon: Star,
    color: 'text-blue-400',
    unlocked: true,
    category: 'mastery'
  },
  {
    id: 'join-journeyman',
    name: 'JOIN Journeyman',
    description: 'Complete 10 JOIN problems correctly',
    icon: Target,
    color: 'text-yellow-400',
    unlocked: false,
    progress: 6,
    total: 10,
    category: 'mastery'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Solve 5 problems in under 2 minutes each',
    icon: Zap,
    color: 'text-purple-400',
    unlocked: false,
    progress: 2,
    total: 5,
    category: 'speed'
  },
  {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    color: 'text-orange-400',
    unlocked: true,
    category: 'streak'
  },
  {
    id: 'sql-sensei',
    name: 'SQL Sensei',
    description: 'Unlock all basic SQL concepts',
    icon: Crown,
    color: 'text-yellow-500',
    unlocked: false,
    progress: 4,
    total: 8,
    category: 'achievement'
  }
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'JOIN Master Badge',
    description: 'Complete 4 more JOIN problems to earn this badge',
    reward: '50 XP + JOIN Master Badge',
    progress: 6,
    total: 10,
    type: 'in-progress',
    estimatedTime: '2-3 hours'
  },
  {
    id: '2',
    title: 'GROUP BY Expert',
    description: 'Unlock by completing current GROUP BY lessons',
    reward: '75 XP + Expert Badge',
    progress: 0,
    total: 8,
    type: 'upcoming',
    estimatedTime: '4-5 hours'
  },
  {
    id: '3',
    title: 'Perfect Week',
    description: 'Practice every day for 7 consecutive days',
    reward: '100 XP + Special Badge',
    progress: 5,
    total: 7,
    type: 'in-progress',
    estimatedTime: '2 days'
  }
];

interface GamifiedProgressProps {
  showBadges?: boolean;
  showAchievements?: boolean;
  compact?: boolean;
}

export default function GamifiedProgress({ 
  showBadges = true, 
  showAchievements = true,
  compact = false 
}: GamifiedProgressProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements'>('badges');

  const unlockedBadges = BADGES.filter(badge => badge.unlocked);
  const inProgressBadges = BADGES.filter(badge => !badge.unlocked && badge.progress);
  const lockedBadges = BADGES.filter(badge => !badge.unlocked && !badge.progress);

  const getBadgeIcon = (badge: Badge) => {
    const Icon = badge.icon;
    return <Icon className={`w-6 h-6 ${badge.unlocked ? badge.color : 'text-slate-400'}`} />;
  };

  const getAchievementProgress = (achievement: Achievement) => {
    return (achievement.progress / achievement.total) * 100;
  };

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h4 className="text-white font-medium flex items-center text-sm mb-3">
          <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
          Progress & Badges
        </h4>
        
        {/* Badge Preview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BADGES.slice(0, 3).map((badge) => (
            <div key={badge.id} className="text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                badge.unlocked ? 'bg-yellow-500/20' : 'bg-slate-600'
              }`}>
                {getBadgeIcon(badge)}
              </div>
              <p className={`text-xs truncate ${badge.unlocked ? 'text-white' : 'text-slate-400'}`}>
                {badge.name}
              </p>
            </div>
          ))}
        </div>
        
        {/* Next Achievement */}
        <div className="bg-slate-700 rounded p-3">
          <p className="text-slate-400 text-xs mb-1">Next Achievement:</p>
          <p className="text-white text-xs font-medium">{ACHIEVEMENTS[0].title}</p>
          <div className="w-full bg-slate-600 rounded-full h-1.5 mt-2">
            <div 
              className="bg-yellow-500 h-1.5 rounded-full"
              style={{ width: `${getAchievementProgress(ACHIEVEMENTS[0])}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {ACHIEVEMENTS[0].progress}/{ACHIEVEMENTS[0].total} completed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Progress & Achievements
          </h2>
          <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === 'badges'
                  ? 'bg-yellow-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Badges
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-yellow-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Goals
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{unlockedBadges.length}</div>
            <div className="text-slate-400 text-xs">Badges Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{inProgressBadges.length}</div>
            <div className="text-slate-400 text-xs">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-400">{lockedBadges.length}</div>
            <div className="text-slate-400 text-xs">Locked</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Unlocked Badges */}
            {unlockedBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Earned Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {unlockedBadges.map((badge) => (
                    <div key={badge.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        {getBadgeIcon(badge)}
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{badge.name}</h4>
                      <p className="text-slate-300 text-xs">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Badges */}
            {inProgressBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Timer className="w-5 h-5 mr-2 text-yellow-400" />
                  Almost There!
                </h3>
                <div className="space-y-4">
                  {inProgressBadges.map((badge) => (
                    <div key={badge.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {getBadgeIcon(badge)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{badge.name}</h4>
                          <p className="text-slate-300 text-sm mb-3">{badge.description}</p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-xs">Progress</span>
                            <span className="text-white text-xs font-medium">
                              {badge.progress}/{badge.total}
                            </span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${((badge.progress || 0) / (badge.total || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-slate-400" />
                  Locked Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {lockedBadges.map((badge) => (
                    <div key={badge.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 text-center opacity-60">
                      <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-slate-400 font-medium text-sm mb-1">{badge.name}</h4>
                      <p className="text-slate-500 text-xs">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {ACHIEVEMENTS.map((achievement) => (
              <div key={achievement.id} className={`p-6 rounded-lg border ${
                achievement.type === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                achievement.type === 'in-progress' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-slate-700 border-slate-600'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-white font-semibold">{achievement.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        achievement.type === 'completed' ? 'bg-green-500/20 text-green-400' :
                        achievement.type === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {achievement.type === 'completed' ? 'Completed' :
                         achievement.type === 'in-progress' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{achievement.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-yellow-400 font-medium">{achievement.reward}</span>
                      {achievement.estimatedTime && (
                        <span className="text-slate-400">~{achievement.estimatedTime}</span>
                      )}
                    </div>
                  </div>
                  
                  {achievement.type !== 'upcoming' && (
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {achievement.progress}/{achievement.total}
                      </div>
                      <div className="text-slate-400 text-xs">Progress</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          achievement.type === 'completed' ? 'bg-green-500' :
                          achievement.type === 'in-progress' ? 'bg-yellow-500' :
                          'bg-slate-500'
                        }`}
                        style={{ width: `${getAchievementProgress(achievement)}%` }}
                      />
                    </div>
                  </div>
                  
                  <button className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    achievement.type === 'completed' ? 'bg-green-600 text-white' :
                    achievement.type === 'in-progress' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                    'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}>
                    {achievement.type === 'completed' ? (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Claimed
                      </>
                    ) : achievement.type === 'in-progress' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Requirements
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
