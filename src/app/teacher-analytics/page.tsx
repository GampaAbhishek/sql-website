'use client';

import { useState } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  BookOpen,
  Zap,
  Trophy
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalQueries: number;
  correctQueries: number;
  averageTime: number; // seconds
  currentStreak: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastActive: string;
  badges: string[];
  progress: {
    playground: number;
    challenges: number;
    interviews: number;
  };
}

interface ClassAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  topPerformers: Student[];
  strugglingStudents: Student[];
  difficultyDistribution: Record<string, number>;
  weeklyActivity: { date: string; queries: number; students: number }[];
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    joinDate: '2024-01-15',
    totalQueries: 245,
    correctQueries: 189,
    averageTime: 180,
    currentStreak: 7,
    difficulty: 'intermediate',
    lastActive: '2024-02-20',
    badges: ['Quick Learner', 'SQL Master', 'Consistent'],
    progress: { playground: 85, challenges: 70, interviews: 60 }
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    joinDate: '2024-01-20',
    totalQueries: 156,
    correctQueries: 98,
    averageTime: 280,
    currentStreak: 3,
    difficulty: 'beginner',
    lastActive: '2024-02-19',
    badges: ['First Steps', 'Persistent'],
    progress: { playground: 45, challenges: 30, interviews: 15 }
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    joinDate: '2024-01-10',
    totalQueries: 398,
    correctQueries: 356,
    averageTime: 120,
    currentStreak: 15,
    difficulty: 'advanced',
    lastActive: '2024-02-20',
    badges: ['Speed Demon', 'Perfect Score', 'SQL Ninja', 'Mentor'],
    progress: { playground: 95, challenges: 90, interviews: 85 }
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    joinDate: '2024-02-01',
    totalQueries: 67,
    correctQueries: 45,
    averageTime: 350,
    currentStreak: 1,
    difficulty: 'beginner',
    lastActive: '2024-02-18',
    badges: ['Newcomer'],
    progress: { playground: 25, challenges: 15, interviews: 5 }
  }
];

export default function TeacherAnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const analytics: ClassAnalytics = {
    totalStudents: MOCK_STUDENTS.length,
    activeStudents: MOCK_STUDENTS.filter(s => 
      new Date(s.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    averageProgress: Math.round(
      MOCK_STUDENTS.reduce((acc, s) => acc + (s.progress.playground + s.progress.challenges + s.progress.interviews) / 3, 0) / MOCK_STUDENTS.length
    ),
    topPerformers: MOCK_STUDENTS.filter(s => s.correctQueries / s.totalQueries > 0.8).slice(0, 3),
    strugglingStudents: MOCK_STUDENTS.filter(s => s.correctQueries / s.totalQueries < 0.5),
    difficultyDistribution: {
      beginner: MOCK_STUDENTS.filter(s => s.difficulty === 'beginner').length,
      intermediate: MOCK_STUDENTS.filter(s => s.difficulty === 'intermediate').length,
      advanced: MOCK_STUDENTS.filter(s => s.difficulty === 'advanced').length,
    },
    weeklyActivity: [
      { date: '2024-02-14', queries: 45, students: 12 },
      { date: '2024-02-15', queries: 52, students: 15 },
      { date: '2024-02-16', queries: 38, students: 10 },
      { date: '2024-02-17', queries: 41, students: 13 },
      { date: '2024-02-18', queries: 35, students: 8 },
      { date: '2024-02-19', queries: 48, students: 14 },
      { date: '2024-02-20', queries: 55, students: 16 },
    ]
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="analytics" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teacher Analytics</h1>
            <p className="text-slate-300">Track student progress and identify learning opportunities</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{analytics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active This Week</p>
                <p className="text-2xl font-bold text-white">{analytics.activeStudents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Progress</p>
                <p className="text-2xl font-bold text-white">{analytics.averageProgress}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Top Performers</p>
                <p className="text-2xl font-bold text-white">{analytics.topPerformers.length}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Student Progress</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-1 text-sm"
                  >
                    <option value="all">All Students</option>
                    <option value="active">Active</option>
                    <option value="struggling">Struggling</option>
                    <option value="top">Top Performers</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {MOCK_STUDENTS.map((student) => {
                    const accuracy = Math.round((student.correctQueries / student.totalQueries) * 100);
                    const overallProgress = Math.round((student.progress.playground + student.progress.challenges + student.progress.interviews) / 3);
                    
                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{student.name}</h3>
                              <p className="text-slate-400 text-sm">{student.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-white font-medium">{accuracy}%</p>
                              <p className="text-slate-400 text-xs">Accuracy</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-medium">{student.totalQueries}</p>
                              <p className="text-slate-400 text-xs">Queries</p>
                            </div>
                            <div className="text-center">
                              <p className={`font-medium ${getProgressColor(overallProgress)}`}>
                                {overallProgress}%
                              </p>
                              <p className="text-slate-400 text-xs">Progress</p>
                            </div>
                            <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${getAccuracyColor(accuracy)}`}
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {student.badges.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <div className="flex space-x-1">
                              {student.badges.slice(0, 3).map((badge) => (
                                <span key={badge} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                  {badge}
                                </span>
                              ))}
                              {student.badges.length > 3 && (
                                <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                                  +{student.badges.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {analytics.topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-500 text-black'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{student.name}</p>
                      <p className="text-slate-400 text-xs">
                        {Math.round((student.correctQueries / student.totalQueries) * 100)}% accuracy
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-400" />
                Difficulty Levels
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Beginner</span>
                  <span className="text-green-400">{analytics.difficultyDistribution.beginner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Intermediate</span>
                  <span className="text-yellow-400">{analytics.difficultyDistribution.intermediate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Advanced</span>
                  <span className="text-red-400">{analytics.difficultyDistribution.advanced}</span>
                </div>
              </div>
            </div>

            {/* Struggling Students */}
            {analytics.strugglingStudents.length > 0 && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Needs Attention
                </h3>
                <div className="space-y-2">
                  {analytics.strugglingStudents.map((student) => (
                    <div key={student.id} className="text-sm">
                      <p className="text-red-300">{student.name}</p>
                      <p className="text-red-400 text-xs">
                        {Math.round((student.correctQueries / student.totalQueries) * 100)}% accuracy
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedStudent(null)}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Student Details</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">{selectedStudent.name}</h3>
                    <p className="text-slate-400">{selectedStudent.email}</p>
                    <p className="text-slate-400 text-sm">
                      Joined {new Date(selectedStudent.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Total Queries</p>
                      <p className="text-white text-2xl font-bold">{selectedStudent.totalQueries}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Accuracy</p>
                      <p className="text-white text-2xl font-bold">
                        {Math.round((selectedStudent.correctQueries / selectedStudent.totalQueries) * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Average Time</p>
                      <p className="text-white text-2xl font-bold">{formatTime(selectedStudent.averageTime)}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-slate-400 text-sm">Current Streak</p>
                      <p className="text-white text-2xl font-bold">{selectedStudent.currentStreak} days</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Progress by Module</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Playground</span>
                        <span className="text-white">{selectedStudent.progress.playground}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${selectedStudent.progress.playground}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Challenges</span>
                        <span className="text-white">{selectedStudent.progress.challenges}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${selectedStudent.progress.challenges}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Interview Prep</span>
                        <span className="text-white">{selectedStudent.progress.interviews}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${selectedStudent.progress.interviews}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Badges Earned</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.badges.map((badge) => (
                      <span key={badge} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
