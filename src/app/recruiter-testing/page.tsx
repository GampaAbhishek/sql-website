'use client';

import { useState } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Users, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  Calendar,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Eye,
  Download,
  Settings,
  Filter
} from 'lucide-react';

interface SQLTest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number; // minutes
  questions: SQLQuestion[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  candidates: TestCandidate[];
  passingScore: number;
}

interface SQLQuestion {
  id: string;
  title: string;
  description: string;
  schema: string;
  expectedQuery?: string;
  expectedOutput: any[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface TestCandidate {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  timeSpent?: number;
  startedAt?: string;
  completedAt?: string;
  answers: {
    questionId: string;
    query: string;
    isCorrect: boolean;
    points: number;
    timeSpent: number;
  }[];
}

const MOCK_TESTS: SQLTest[] = [
  {
    id: '1',
    title: 'Junior SQL Developer Assessment',
    description: 'Basic SQL skills test for junior developer positions',
    difficulty: 'beginner',
    timeLimit: 60,
    status: 'published',
    createdAt: '2024-02-01',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        title: 'Basic SELECT Query',
        description: 'Write a query to select all employees with salary > 50000',
        schema: 'CREATE TABLE employees (id INT, name VARCHAR(100), salary DECIMAL(10,2), department VARCHAR(50));',
        expectedOutput: [],
        points: 10,
        difficulty: 'easy',
        category: 'Basic Queries'
      },
      {
        id: 'q2',
        title: 'JOIN Operation',
        description: 'Find all orders with customer information',
        schema: 'CREATE TABLE customers (id INT, name VARCHAR(100)); CREATE TABLE orders (id INT, customer_id INT, total DECIMAL(10,2));',
        expectedOutput: [],
        points: 15,
        difficulty: 'medium',
        category: 'Joins'
      }
    ],
    candidates: [
      {
        id: 'c1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'completed',
        score: 85,
        timeSpent: 45,
        startedAt: '2024-02-15T10:00:00Z',
        completedAt: '2024-02-15T10:45:00Z',
        answers: [
          { questionId: 'q1', query: 'SELECT * FROM employees WHERE salary > 50000', isCorrect: true, points: 10, timeSpent: 300 },
          { questionId: 'q2', query: 'SELECT c.name, o.total FROM customers c JOIN orders o ON c.id = o.customer_id', isCorrect: true, points: 15, timeSpent: 600 }
        ]
      },
      {
        id: 'c2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'in_progress',
        startedAt: '2024-02-20T14:00:00Z',
        answers: []
      }
    ]
  }
];

export default function RecruiterTestingPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'candidates' | 'analytics'>('tests');
  const [selectedTest, setSelectedTest] = useState<SQLTest | null>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyTestLink = (testId: string) => {
    const link = `${window.location.origin}/test/${testId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(testId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-500/20';
      case 'draft': return 'text-yellow-400 bg-yellow-500/20';
      case 'archived': return 'text-gray-400 bg-gray-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'invited': return 'text-purple-400 bg-purple-500/20';
      case 'expired': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': case 'easy': return 'text-green-400 bg-green-500/20';
      case 'intermediate': case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="recruiter-testing" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Testing Platform</h1>
            <p className="text-slate-300">Create and manage SQL assessments for candidates</p>
          </div>
          
          <button
            onClick={() => setShowCreateTest(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Test
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'candidates'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {MOCK_TESTS.map((test) => (
              <div key={test.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{test.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-4">{test.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{test.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{test.questions.length} questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{test.candidates.length} candidates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{test.passingScore}% passing</span>
                      </div>
                    </div>

                    {/* Candidate Results Summary */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-slate-300">
                          {test.candidates.filter(c => c.status === 'completed' && (c.score || 0) >= test.passingScore).length} passed
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-slate-300">
                          {test.candidates.filter(c => c.status === 'completed' && (c.score || 0) < test.passingScore).length} failed
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">
                          {test.candidates.filter(c => c.status === 'in_progress').length} in progress
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleCopyTestLink(test.id)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="Copy test link"
                    >
                      {copiedLink === test.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedTest(test)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Edit test">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Delete test">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">All Candidates</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {MOCK_TESTS.flatMap(test => 
                  test.candidates.map(candidate => (
                    <div key={`${test.id}-${candidate.id}`} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{candidate.name}</h3>
                          <p className="text-slate-400 text-sm">{candidate.email}</p>
                          <p className="text-slate-500 text-xs">Test: {test.title}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                          {candidate.status.replace('_', ' ')}
                        </span>
                        {candidate.score !== undefined && (
                          <div className="text-center">
                            <p className={`font-medium ${candidate.score >= test.passingScore ? 'text-green-400' : 'text-red-400'}`}>
                              {candidate.score}%
                            </p>
                            <p className="text-slate-400 text-xs">Score</p>
                          </div>
                        )}
                        {candidate.timeSpent && (
                          <div className="text-center">
                            <p className="text-white font-medium">{candidate.timeSpent}m</p>
                            <p className="text-slate-400 text-xs">Time</p>
                          </div>
                        )}
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Tests</p>
                      <p className="text-2xl font-bold text-white">{MOCK_TESTS.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Candidates</p>
                      <p className="text-2xl font-bold text-white">
                        {MOCK_TESTS.reduce((acc, test) => acc + test.candidates.length, 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Pass Rate</p>
                      <p className="text-2xl font-bold text-white">75%</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Recent Test Activity */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Test Activity</h3>
                <div className="space-y-3">
                  {MOCK_TESTS.flatMap(test => 
                    test.candidates.filter(c => c.completedAt).map(candidate => (
                      <div key={`activity-${test.id}-${candidate.id}`} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="text-white text-sm">
                            <span className="font-medium">{candidate.name}</span> completed {test.title}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Score: {candidate.score}% • {new Date(candidate.completedAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (candidate.score || 0) >= test.passingScore ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                        }`}>
                          {(candidate.score || 0) >= test.passingScore ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Analytics */}
            <div className="space-y-6">
              {/* Test Performance */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Performance</h3>
                <div className="space-y-3">
                  {MOCK_TESTS.map(test => {
                    const completed = test.candidates.filter(c => c.status === 'completed');
                    const passed = completed.filter(c => (c.score || 0) >= test.passingScore);
                    const passRate = completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0;
                    
                    return (
                      <div key={test.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{test.title}</span>
                          <span className="text-white">{passRate}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              passRate >= 80 ? 'bg-green-500' :
                              passRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Test
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    <Send className="w-4 h-4 mr-2" />
                    Invite Candidates
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Detail Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedTest(null)}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">{selectedTest.title}</h2>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Test Info */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Test Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-slate-400 text-sm">Description</p>
                        <p className="text-white">{selectedTest.description}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Time Limit</p>
                        <p className="text-white">{selectedTest.timeLimit} minutes</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Passing Score</p>
                        <p className="text-white">{selectedTest.passingScore}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Questions</p>
                        <p className="text-white">{selectedTest.questions.length} questions</p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Results */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Candidate Results</h3>
                    <div className="space-y-3">
                      {selectedTest.candidates.map((candidate) => (
                        <div key={candidate.id} className="p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{candidate.name}</p>
                              <p className="text-slate-400 text-xs">{candidate.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                {candidate.status.replace('_', ' ')}
                              </span>
                              {candidate.score !== undefined && (
                                <p className={`text-sm font-medium mt-1 ${
                                  candidate.score >= selectedTest.passingScore ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {candidate.score}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
