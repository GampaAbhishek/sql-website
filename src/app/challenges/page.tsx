'use client'

import { useState, useEffect, useRef } from 'react'
import ResponsiveNavbar from '@/components/ResponsiveNavbar'
import AIAssistant from '@/components/AIAssistant'
import { 
  Play, 
  Send, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  TrendingUp,
  Book,
  Clock,
  Award,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Database,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Crown,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  points: number
  expectedQuery: string
  expectedOutput: any[]
  schemaInfo: string
  hints: string[]
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  prerequisites?: string[]
}

interface UserProgress {
  totalScore: number
  currentStreak: number
  challengesCompleted: number
  badges: string[]
  difficultyProgress: {
    Beginner: { completed: number; total: number }
    Intermediate: { completed: number; total: number }
    Advanced: { completed: number; total: number }
  }
}

const SAMPLE_CHALLENGES: Challenge[] = [
  // Beginner Challenges
  {
    id: 'b1',
    title: 'Select All Employees',
    description: 'Write a query to select all columns from the employees table.',
    difficulty: 'Beginner',
    points: 10,
    expectedQuery: 'SELECT * FROM employees',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use SELECT * to select all columns', 'FROM specifies the table name'],
    status: 'available'
  },
  {
    id: 'b2',
    title: 'Filter by Department',
    description: 'Find all employees who work in the "Sales" department.',
    difficulty: 'Beginner',
    points: 10,
    expectedQuery: 'SELECT * FROM employees WHERE department = "Sales"',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use WHERE clause to filter rows', 'String values need quotes'],
    status: 'available'
  },
  {
    id: 'b3',
    title: 'Sort by Salary',
    description: 'List all employees ordered by salary in descending order.',
    difficulty: 'Beginner',
    points: 10,
    expectedQuery: 'SELECT * FROM employees ORDER BY salary DESC',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use ORDER BY to sort results', 'DESC means descending order'],
    status: 'locked',
    prerequisites: ['b1', 'b2']
  },
  
  // Intermediate Challenges
  {
    id: 'i1',
    title: 'Count Employees by Department',
    description: 'Count how many employees are in each department.',
    difficulty: 'Intermediate',
    points: 20,
    expectedQuery: 'SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use GROUP BY to group rows', 'COUNT(*) counts rows in each group'],
    status: 'locked',
    prerequisites: ['b1', 'b2', 'b3']
  },
  {
    id: 'i2',
    title: 'Average Salary by Department',
    description: 'Calculate the average salary for each department.',
    difficulty: 'Intermediate',
    points: 20,
    expectedQuery: 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use AVG() function for average', 'GROUP BY department to get per-department averages'],
    status: 'locked',
    prerequisites: ['i1']
  },
  
  // Advanced Challenges
  {
    id: 'a1',
    title: 'Top Earning Employees',
    description: 'Find the top 3 highest paid employees in each department.',
    difficulty: 'Advanced',
    points: 30,
    expectedQuery: 'SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rn FROM employees) ranked WHERE rn <= 3',
    expectedOutput: [],
    schemaInfo: 'employees (id, name, department, salary, hire_date)',
    hints: ['Use window functions', 'ROW_NUMBER() with PARTITION BY', 'Filter with WHERE rn <= 3'],
    status: 'locked',
    prerequisites: ['i1', 'i2']
  }
]

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-100 text-green-800 border-green-200',
  Intermediate: 'bg-orange-100 text-orange-800 border-orange-200',
  Advanced: 'bg-red-100 text-red-800 border-red-200'
}

const DIFFICULTY_POINTS = {
  Beginner: 10,
  Intermediate: 20,
  Advanced: 30
}

export default function ChallengesPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner')
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(SAMPLE_CHALLENGES[0])
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalScore: 0,
    currentStreak: 0,
    challengesCompleted: 0,
    badges: [],
    difficultyProgress: {
      Beginner: { completed: 0, total: 3 },
      Intermediate: { completed: 0, total: 2 },
      Advanced: { completed: 0, total: 1 }
    }
  })
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Filter challenges by difficulty
  const challengesByDifficulty = SAMPLE_CHALLENGES.filter(c => c.difficulty === selectedDifficulty)

  // AI Assistant handlers
  const handleAIQuerySuggestion = (query: string) => {
    setSqlQuery(query)
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(!isAIAssistantOpen)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('sql-challenges-progress')
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress)
    localStorage.setItem('sql-challenges-progress', JSON.stringify(newProgress))
  }

  const runQuery = async () => {
    if (!sqlQuery.trim()) {
      setFeedback('Please enter a SQL query')
      return
    }

    setIsLoading(true)
    setShowResult(false)

    try {
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: sqlQuery,
          database: 'employees'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Query execution failed')
      }

      setQueryResult(data)
      setShowResult(true)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'An error occurred')
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!sqlQuery.trim()) {
      setFeedback('Please enter a SQL query')
      return
    }

    setAttempts(prev => prev + 1)
    
    // Simple query comparison (in real app, this would be more sophisticated)
    const normalizedUserQuery = sqlQuery.toLowerCase().replace(/\s+/g, ' ').trim()
    const normalizedExpectedQuery = selectedChallenge.expectedQuery.toLowerCase().replace(/\s+/g, ' ').trim()
    
    const isQueryCorrect = normalizedUserQuery.includes('select') && 
                          normalizedUserQuery.includes('from') &&
                          normalizedUserQuery.includes('employees')

    if (isQueryCorrect) {
      setIsCorrect(true)
      setFeedback(`🎉 Correct! You earned ${selectedChallenge.points} points!`)
      setShowCelebration(true)
      
      // Update progress
      const newProgress = { ...userProgress }
      newProgress.totalScore += selectedChallenge.points
      newProgress.challengesCompleted += 1
      newProgress.currentStreak += 1
      newProgress.difficultyProgress[selectedChallenge.difficulty].completed += 1
      
      // Check for badges
      if (newProgress.challengesCompleted === 1 && !newProgress.badges.includes('First Steps')) {
        newProgress.badges.push('First Steps')
      }
      if (newProgress.currentStreak === 3 && !newProgress.badges.includes('Hat Trick')) {
        newProgress.badges.push('Hat Trick')
      }
      
      saveProgress(newProgress)
      
      setTimeout(() => setShowCelebration(false), 3000)
    } else {
      setIsCorrect(false)
      setFeedback(`❌ Not quite right. Try again! Attempt ${attempts + 1}`)
      setShowHint(true)
    }
    
    setShowResult(true)
  }

  const nextHint = () => {
    if (currentHintIndex < selectedChallenge.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1)
    }
  }

  const resetChallenge = () => {
    setSqlQuery('')
    setQueryResult(null)
    setShowResult(false)
    setIsCorrect(null)
    setFeedback('')
    setShowHint(false)
    setCurrentHintIndex(0)
    setAttempts(0)
  }

  const selectChallenge = (challenge: Challenge) => {
    if (challenge.status === 'locked') return
    setSelectedChallenge(challenge)
    resetChallenge()
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce text-6xl">🎉</div>
        </div>
      )}

      {/* Navigation Bar */}
      <ResponsiveNavbar />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Challenge Selection */}
        <div className={`w-80 border-r overflow-y-auto ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Progress Overview */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Score</span>
                <span className="font-medium">{userProgress.totalScore} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Challenges Completed</span>
                <span className="font-medium">{userProgress.challengesCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Streak</span>
                <span className="font-medium">{userProgress.currentStreak} days</span>
              </div>
              
              {/* Badges */}
              {userProgress.badges.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Badges Earned</h3>
                  <div className="flex flex-wrap gap-1">
                    {userProgress.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        🏆 {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Filters */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium mb-3">Difficulty Levels</h3>
            <div className="space-y-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((difficulty) => {
                const progress = userProgress.difficultyProgress[difficulty]
                return (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{difficulty}</span>
                      <span className={`px-2 py-1 rounded text-xs ${DIFFICULTY_COLORS[difficulty]}`}>
                        +{DIFFICULTY_POINTS[difficulty]} pts
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {progress.completed}/{progress.total} completed
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      ></div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Challenge List */}
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3">{selectedDifficulty} Challenges</h3>
            <div className="space-y-2">
              {challengesByDifficulty.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => selectChallenge(challenge)}
                  disabled={challenge.status === 'locked'}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    selectedChallenge.id === challenge.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : challenge.status === 'locked'
                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{challenge.title}</span>
                    <div className="flex items-center space-x-1">
                      {challenge.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {challenge.status === 'in_progress' && <Clock className="w-4 h-4 text-orange-500" />}
                      {challenge.status === 'locked' && <Lock className="w-4 h-4 text-gray-400" />}
                      <span className="text-xs text-gray-500">+{challenge.points}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{challenge.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Challenge Area */}
        <div className="flex-1 flex flex-col">
          {/* Challenge Header */}
          <div className={`p-6 border-b ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{selectedChallenge.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${DIFFICULTY_COLORS[selectedChallenge.difficulty]}`}>
                  {selectedChallenge.difficulty}
                </span>
                <span className="flex items-center space-x-1 text-sm text-gray-500">
                  <Star className="w-4 h-4" />
                  <span>{selectedChallenge.points} points</span>
                </span>
              </div>
              <button
                onClick={resetChallenge}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 border border-gray-600'
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Database className="w-4 h-4 text-blue-500" />
                <span>{selectedChallenge.schemaInfo}</span>
              </div>
              {attempts > 0 && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span>Attempts: {attempts}</span>
                </div>
              )}
            </div>
          </div>

          {/* SQL Editor */}
          <div className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Your SQL Query</h3>
                <div className="flex items-center space-x-3">
                  {showHint && (
                    <button
                      onClick={nextHint}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        isDarkMode
                          ? 'text-yellow-300 hover:bg-yellow-900 border border-yellow-600'
                          : 'text-yellow-600 hover:bg-yellow-50 border border-yellow-300'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Next Hint</span>
                    </button>
                  )}
                  <button
                    onClick={runQuery}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isLoading ? 'Running...' : 'Run Query'}</span>
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Answer</span>
                  </button>
                </div>
              </div>

              {/* Hint Display */}
              {showHint && selectedChallenge.hints[currentHintIndex] && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Hint {currentHintIndex + 1}:</strong> {selectedChallenge.hints[currentHintIndex]}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SQL Textarea */}
              <div className="flex-1 mb-4">
                <textarea
                  ref={textAreaRef}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className={`w-full h-full resize-none font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="-- Write your SQL query here
SELECT * FROM employees
WHERE department = 'Sales';"
                  style={{ minHeight: '200px' }}
                />
              </div>

              {/* Results/Feedback Area */}
              {showResult && (
                <div className="border-t pt-4">
                  {feedback && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      isCorrect === true
                        ? 'bg-green-100 border border-green-300 text-green-800'
                        : isCorrect === false
                        ? 'bg-red-100 border border-red-300 text-red-800'
                        : 'bg-blue-100 border border-blue-300 text-blue-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {isCorrect === true && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                        {isCorrect === false && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                        <p className="font-medium">{feedback}</p>
                      </div>
                    </div>
                  )}

                  {queryResult && (
                    <div className={`border rounded-lg overflow-hidden ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <div className={`px-4 py-2 border-b ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h4 className="font-medium">Query Results</h4>
                      </div>
                      <div className="overflow-auto max-h-64">
                        <table className="min-w-full">
                          <thead>
                            <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                              {queryResult.columns?.map((column: string, index: number) => (
                                <th
                                  key={index}
                                  className={`px-4 py-2 text-left font-medium border-b ${
                                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                                  }`}
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.rows?.map((row: any[], rowIndex: number) => (
                              <tr
                                key={rowIndex}
                                className={
                                  rowIndex % 2 === 0
                                    ? isDarkMode ? 'bg-gray-900' : 'bg-white'
                                    : isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                                }
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className={`px-4 py-2 border-b ${
                                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                                    }`}
                                  >
                                    {cell?.toString() || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onToggle={toggleAIAssistant}
        context={{
          currentQuery: sqlQuery,
          lastError: feedback,
          difficulty: selectedDifficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
          mode: 'challenge'
        }}
        onQuerySuggestion={handleAIQuerySuggestion}
      />
    </div>
  )
}
