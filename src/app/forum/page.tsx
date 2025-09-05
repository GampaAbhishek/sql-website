'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ResponsiveNavbar from '@/components/ResponsiveNavbar'
import Link from 'next/link'
import { 
  User, 
  Trophy, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Reply,
  Clock,
  Eye,
  Plus,
  Tag,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Code,
  Database,
  FileText,
  Send,
  Image,
  Bold,
  Italic,
  Link as LinkIcon,
  X,
  Edit,
  Trash2,
  Flag,
  Bookmark,
  Share2,
  BarChart3
} from 'lucide-react'

interface ForumUser {
  id: string
  name: string
  avatar?: string
  reputation: number
  badges: string[]
  joinDate: string
}

interface Question {
  id: string
  title: string
  content: string
  author: ForumUser
  tags: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  upvotes: number
  downvotes: number
  views: number
  answers: Answer[]
  acceptedAnswerId?: string
  createdAt: string
  updatedAt: string
  isBookmarked?: boolean
}

interface Answer {
  id: string
  content: string
  author: ForumUser
  upvotes: number
  downvotes: number
  replies: Reply[]
  isAccepted: boolean
  createdAt: string
  updatedAt: string
}

interface Reply {
  id: string
  content: string
  author: ForumUser
  upvotes: number
  downvotes: number
  createdAt: string
}

const SAMPLE_USERS: ForumUser[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    reputation: 1250,
    badges: ['SQL Expert', 'Helper'],
    joinDate: '2023-08-15'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    reputation: 890,
    badges: ['JOIN Master'],
    joinDate: '2023-07-22'
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    reputation: 645,
    badges: ['Rising Star'],
    joinDate: '2023-09-01'
  },
  {
    id: 'current',
    name: 'You',
    reputation: 245,
    badges: ['Beginner Graduate'],
    joinDate: '2023-05-20'
  }
]

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'How to optimize complex JOIN queries with multiple tables?',
    content: `I'm working with a database that has 5 related tables and I need to join them all together. The query is running very slowly. Here's what I have so far:

\`\`\`sql
SELECT o.order_id, c.customer_name, p.product_name, 
       cat.category_name, s.supplier_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN categories cat ON p.category_id = cat.category_id
JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE o.order_date >= '2024-01-01'
\`\`\`

Any suggestions for optimization?`,
    author: SAMPLE_USERS[1],
    tags: ['JOIN', 'Performance', 'Optimization'],
    difficulty: 'Advanced',
    category: 'Performance',
    upvotes: 12,
    downvotes: 1,
    views: 145,
    answers: [
      {
        id: '1-1',
        content: `Great question! Here are several optimization strategies:

1. **Add proper indexes**: Make sure you have indexes on all the JOIN columns
2. **Filter early**: Move WHERE conditions as early as possible
3. **Use EXPLAIN**: Check the execution plan

Here's an optimized version:

\`\`\`sql
SELECT o.order_id, c.customer_name, p.product_name, 
       cat.category_name, s.supplier_name
FROM orders o
  INNER JOIN customers c ON o.customer_id = c.customer_id
  INNER JOIN order_items oi ON o.order_id = oi.order_id
  INNER JOIN products p ON oi.product_id = p.product_id
  INNER JOIN categories cat ON p.category_id = cat.category_id
  INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE o.order_date >= '2024-01-01'
  AND o.status = 'completed'  -- Add more filters if applicable
\`\`\`

The key is to ensure your indexes cover the JOIN columns and WHERE clauses.`,
        author: SAMPLE_USERS[0],
        upvotes: 8,
        downvotes: 0,
        replies: [
          {
            id: '1-1-1',
            content: 'This is excellent advice! I would also add that using INNER JOIN explicitly instead of just JOIN can sometimes help the query optimizer.',
            author: SAMPLE_USERS[2],
            upvotes: 3,
            downvotes: 0,
            createdAt: '2024-01-08T11:30:00Z'
          }
        ],
        isAccepted: true,
        createdAt: '2024-01-08T10:15:00Z',
        updatedAt: '2024-01-08T10:15:00Z'
      }
    ],
    acceptedAnswerId: '1-1',
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-08T11:30:00Z',
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Difference between GROUP BY and HAVING clauses?',
    content: `I'm getting confused about when to use GROUP BY vs HAVING. Can someone explain the difference with examples?

For instance, when would I use:
\`\`\`sql
SELECT column1, COUNT(*)
FROM table1
GROUP BY column1
HAVING COUNT(*) > 5
\`\`\`

vs just using WHERE?`,
    author: SAMPLE_USERS[3],
    tags: ['GROUP BY', 'HAVING', 'Aggregation'],
    difficulty: 'Beginner',
    category: 'Basics',
    upvotes: 6,
    downvotes: 0,
    views: 89,
    answers: [
      {
        id: '2-1',
        content: `Great question! The key difference is:

- **WHERE**: Filters rows BEFORE grouping
- **HAVING**: Filters groups AFTER grouping and aggregation

Here's the execution order:
1. WHERE clause filters individual rows
2. GROUP BY groups the remaining rows
3. Aggregate functions are calculated
4. HAVING filters the groups based on aggregate results

Example:
\`\`\`sql
-- This filters customers first, then groups
SELECT customer_id, COUNT(*) as order_count
FROM orders
WHERE order_date >= '2024-01-01'  -- Filter rows first
GROUP BY customer_id
HAVING COUNT(*) > 5  -- Filter groups after aggregation
\`\`\`

You can't use aggregate functions in WHERE, but you can in HAVING!`,
        author: SAMPLE_USERS[1],
        upvotes: 4,
        downvotes: 0,
        replies: [],
        isAccepted: false,
        createdAt: '2024-01-09T14:20:00Z',
        updatedAt: '2024-01-09T14:20:00Z'
      }
    ],
    createdAt: '2024-01-09T13:45:00Z',
    updatedAt: '2024-01-09T14:20:00Z'
  },
  {
    id: '3',
    title: 'Best practices for writing subqueries vs CTEs?',
    content: `I've been learning about Common Table Expressions (CTEs) and I'm wondering when I should use them instead of subqueries. What are the performance implications and readability benefits?`,
    author: SAMPLE_USERS[2],
    tags: ['CTE', 'Subqueries', 'Best Practices'],
    difficulty: 'Intermediate',
    category: 'Advanced Concepts',
    upvotes: 9,
    downvotes: 0,
    views: 67,
    answers: [],
    createdAt: '2024-01-10T16:10:00Z',
    updatedAt: '2024-01-10T16:10:00Z'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Database, count: 156 },
  { id: 'basics', name: 'SQL Basics', icon: FileText, count: 45 },
  { id: 'joins', name: 'JOINs', icon: LinkIcon, count: 38 },
  { id: 'aggregation', name: 'GROUP BY & Aggregation', icon: BarChart3, count: 29 },
  { id: 'subqueries', name: 'Subqueries & CTEs', icon: Code, count: 22 },
  { id: 'performance', name: 'Performance', icon: TrendingUp, count: 15 },
  { id: 'advanced', name: 'Advanced Concepts', icon: Award, count: 7 }
]

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Upvoted' },
  { value: 'trending', label: 'Trending' },
  { value: 'unanswered', label: 'Unanswered' }
]

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionContent, setNewQuestionContent] = useState('')
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS)

  const filteredQuestions = questions.filter(question => {
    const categoryMatch = selectedCategory === 'all' || 
      question.category.toLowerCase().includes(selectedCategory) ||
      question.tags.some(tag => tag.toLowerCase().includes(selectedCategory))
    
    const difficultyMatch = selectedDifficulty === 'All' || question.difficulty === selectedDifficulty
    
    const searchMatch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && difficultyMatch && searchMatch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      case 'trending':
        return b.views - a.views
      case 'unanswered':
        return a.answers.length - b.answers.length
      case 'recent':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  const handleUpvote = (questionId: string, answerId?: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        if (answerId) {
          return {
            ...q,
            answers: q.answers.map(a => 
              a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
            )
          }
        } else {
          return { ...q, upvotes: q.upvotes + 1 }
        }
      }
      return q
    }))
  }

  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          acceptedAnswerId: answerId,
          answers: q.answers.map(a => ({
            ...a,
            isAccepted: a.id === answerId
          }))
        }
      }
      return q
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to access the forum</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedQuestion ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">SQL Discussion Forum</h1>
                <p className="text-slate-300">Ask questions, share knowledge, and help the community</p>
              </div>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Ask Question</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DIFFICULTY_FILTERS.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-4 h-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-xs bg-slate-600 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {filteredQuestions.map(question => (
                    <div
                      key={question.id}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                            {question.title}
                          </h3>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-slate-300">{question.author.name}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">{formatTimeAgo(question.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                            {question.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {question.isBookmarked && (
                          <Bookmark className="w-5 h-5 text-yellow-400 fill-current" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{question.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{question.answers.length} answers</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{question.views} views</span>
                          </div>
                        </div>
                        {question.acceptedAnswerId && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Solved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Question Detail View */
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="mb-6 text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              <span>Back to Forum</span>
            </button>

            {/* Question Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-4">{selectedQuestion.title}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">{selectedQuestion.author.name}</span>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span>{selectedQuestion.author.reputation} rep</span>
                          <span>•</span>
                          <span>{formatTimeAgo(selectedQuestion.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                      {selectedQuestion.difficulty}
                    </span>
                    {selectedQuestion.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpvote(selectedQuestion.id)}
                    className="flex flex-col items-center space-y-1 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5 text-slate-400 hover:text-green-400" />
                    <span className="text-sm text-slate-400">{selectedQuestion.upvotes}</span>
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Bookmark className={`w-5 h-5 ${selectedQuestion.isBookmarked ? 'text-yellow-400 fill-current' : 'text-slate-400'}`} />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap">{selectedQuestion.content}</div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedQuestion.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{selectedQuestion.answers.length} answers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white">
                {selectedQuestion.answers.length} Answer{selectedQuestion.answers.length !== 1 ? 's' : ''}
              </h2>
              
              {selectedQuestion.answers.map(answer => (
                <div
                  key={answer.id}
                  className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 ${
                    answer.isAccepted ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700'
                  }`}
                >
                  {answer.isAccepted && (
                    <div className="flex items-center space-x-2 mb-4 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Accepted Answer</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">{answer.author.name}</span>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span>{answer.author.reputation} rep</span>
                          <span>•</span>
                          <span>{formatTimeAgo(answer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpvote(selectedQuestion.id, answer.id)}
                        className="flex items-center space-x-1 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4 text-slate-400 hover:text-green-400" />
                        <span className="text-sm text-slate-400">{answer.upvotes}</span>
                      </button>
                      {selectedQuestion.author.name === 'You' && !answer.isAccepted && (
                        <button
                          onClick={() => handleAcceptAnswer(selectedQuestion.id, answer.id)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none mb-4">
                    <div className="text-slate-300 whitespace-pre-wrap">{answer.content}</div>
                  </div>

                  {/* Replies */}
                  {answer.replies.length > 0 && (
                    <div className="mt-6 pl-8 border-l-2 border-slate-700">
                      <div className="space-y-4">
                        {answer.replies.map(reply => (
                          <div key={reply.id} className="bg-slate-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-slate-300">{reply.author.name}</span>
                                <span className="text-xs text-slate-500">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400">{reply.upvotes}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Answer Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Answer</h3>
              <textarea
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
                placeholder="Write your answer here... You can use markdown for formatting."
                className="w-full h-40 p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Bold className="w-4 h-4" />
                  <Italic className="w-4 h-4" />
                  <Code className="w-4 h-4" />
                  <span>Markdown supported</span>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Post Answer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Ask a Question</h3>
              <button 
                onClick={() => setShowQuestionForm(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="What's your SQL question?"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  placeholder="Describe your problem in detail. Include code examples if relevant."
                  className="w-full h-40 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Code className="w-4 h-4" />
                  <span>Use ``` for code blocks</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Post Question</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
