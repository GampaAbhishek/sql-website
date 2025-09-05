'use client';

import { useState } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Award,
  BarChart3,
  Clock,
  Target,
  Plus,
  Calendar,
  Download,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  BookOpen,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTests: number;
  averageScore: number;
  completionRate: number;
  weeklyActivity: { date: string; students: number; tests: number }[];
}

interface RecentActivity {
  id: string;
  type: 'student_joined' | 'test_completed' | 'test_created' | 'achievement_earned';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  score?: number;
}

const MOCK_STATS: DashboardStats = {
  totalStudents: 45,
  activeStudents: 32,
  totalTests: 8,
  averageScore: 78,
  completionRate: 85,
  weeklyActivity: [
    { date: '2024-02-14', students: 12, tests: 3 },
    { date: '2024-02-15', students: 15, tests: 5 },
    { date: '2024-02-16', students: 10, tests: 2 },
    { date: '2024-02-17', students: 18, tests: 4 },
    { date: '2024-02-18', students: 8, tests: 1 },
    { date: '2024-02-19', students: 22, tests: 6 },
    { date: '2024-02-20', students: 25, tests: 7 },
  ]
};

const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'test_completed',
    title: 'John Doe completed SQL Basics Test',
    description: 'Scored 85% on Junior Developer Assessment',
    timestamp: '2024-02-20T10:30:00Z',
    user: 'John Doe',
    score: 85
  },
  {
    id: '2',
    type: 'student_joined',
    title: 'New student enrolled',
    description: 'Sarah Wilson joined Advanced SQL Course',
    timestamp: '2024-02-20T09:15:00Z',
    user: 'Sarah Wilson'
  },
  {
    id: '3',
    type: 'achievement_earned',
    title: 'Achievement unlocked',
    description: 'Alice Johnson earned "SQL Master" badge',
    timestamp: '2024-02-19T16:45:00Z',
    user: 'Alice Johnson'
  },
  {
    id: '4',
    type: 'test_created',
    title: 'New test published',
    description: 'Advanced SQL Functions Assessment is now available',
    timestamp: '2024-02-19T14:20:00Z'
  }
];

export default function CompanyDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeView, setActiveView] = useState<'overview' | 'students' | 'tests'>('overview');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_joined': return <Users className="w-4 h-4 text-blue-400" />;
      case 'test_completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'test_created': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'achievement_earned': return <Award className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + ' at ' + 
           new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="company-dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Company Dashboard</h1>
            <p className="text-slate-300">Monitor student progress and manage SQL assessments</p>
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
            </select>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{MOCK_STATS.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active This Week</p>
                <p className="text-2xl font-bold text-white">{MOCK_STATS.activeStudents}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-white">{MOCK_STATS.totalTests}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{MOCK_STATS.averageScore}%</p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{MOCK_STATS.completionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'students'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Student Analytics
          </button>
          <button
            onClick={() => setActiveView('tests')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'tests'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Test Management
          </button>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Chart */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {MOCK_STATS.weeklyActivity.map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div className="w-full space-y-1">
                        <div 
                          className="bg-blue-500 rounded-t"
                          style={{ height: `${(day.students / 30) * 100}px` }}
                        />
                        <div 
                          className="bg-purple-500 rounded-b"
                          style={{ height: `${(day.tests / 10) * 50}px` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 mt-2">
                        {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-slate-300 text-sm">Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-slate-300 text-sm">Tests</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium">{activity.title}</h4>
                        <p className="text-slate-400 text-xs">{activity.description}</p>
                        <p className="text-slate-500 text-xs mt-1">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                      {activity.score && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          activity.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {activity.score}%
                        </div>
                      )}
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
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Test
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Send className="w-4 h-4 mr-2" />
                    Invite Students
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Eye className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Beginner Level</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Intermediate Level</span>
                      <span className="text-white">72%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Advanced Level</span>
                      <span className="text-white">58%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white text-sm">SQL Basics Test</p>
                      <p className="text-slate-400 text-xs">Due: March 1, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm">Advanced Queries</p>
                      <p className="text-slate-400 text-xs">Due: March 5, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeView === 'students' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Student Analytics</h3>
              <p className="text-slate-400 mb-6">
                Detailed student analytics and progress tracking
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Full Analytics
              </button>
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeView === 'tests' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Test Management</h3>
              <p className="text-slate-400 mb-6">
                Create and manage SQL assessments for your candidates
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Manage Tests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
