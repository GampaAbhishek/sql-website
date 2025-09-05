'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Copy, 
  Heart, 
  MessageCircle, 
  User, 
  Clock, 
  Tag, 
  TrendingUp, 
  Calendar,
  Code,
  X,
  Check,
  Send,
  ChevronDown,
  Star,
  Eye,
  Plus,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface SharedQuery {
  id: string;
  title: string;
  description: string;
  query: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  upvotes: number;
  comments: number;
  timestamp: string;
  isUpvoted: boolean;
  views: number;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export default function ShareQueriesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'trending'>('recent');
  const [showSubmissionPanel, setShowSubmissionPanel] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<SharedQuery | null>(null);
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form states
  const [newQuery, setNewQuery] = useState({
    title: '',
    description: '',
    query: '',
    tags: [] as string[],
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });

  // Mock data
  const [queries, setQueries] = useState<SharedQuery[]>([
    {
      id: '1',
      title: 'Employee Salary Analysis',
      description: 'Query to find employees with salary above department average',
      query: `SELECT e.name, e.salary, d.department_name,
       AVG(e2.salary) as dept_avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN employees e2 ON e2.department_id = d.id
WHERE e.salary > (
    SELECT AVG(salary) 
    FROM employees 
    WHERE department_id = e.department_id
)
GROUP BY e.id, e.name, e.salary, d.department_name
ORDER BY e.salary DESC;`,
      author: { name: 'Sarah Chen', avatar: '👩‍💻', level: 'Expert' },
      tags: ['SELECT', 'JOIN', 'GROUP BY', 'Subquery'],
      difficulty: 'Advanced',
      upvotes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      isUpvoted: false,
      views: 156
    },
    {
      id: '2',
      title: 'Basic Customer Orders',
      description: 'Simple query to get customer orders with product details',
      query: `SELECT c.customer_name, p.product_name, o.quantity, o.order_date
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN products p ON o.product_id = p.product_id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC;`,
      author: { name: 'Mike Johnson', avatar: '👨‍💼', level: 'Intermediate' },
      tags: ['SELECT', 'JOIN', 'WHERE'],
      difficulty: 'Beginner',
      upvotes: 12,
      comments: 3,
      timestamp: '5 hours ago',
      isUpvoted: true,
      views: 89
    },
    {
      id: '3',
      title: 'Monthly Sales Report',
      description: 'Generate monthly sales report with growth percentage',
      query: `WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', order_date) as month,
        SUM(total_amount) as monthly_total
    FROM orders 
    WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT 
    month,
    monthly_total,
    LAG(monthly_total) OVER (ORDER BY month) as prev_month,
    ROUND(((monthly_total - LAG(monthly_total) OVER (ORDER BY month)) / 
           LAG(monthly_total) OVER (ORDER BY month)) * 100, 2) as growth_pct
FROM monthly_sales
ORDER BY month DESC;`,
      author: { name: 'Emma Davis', avatar: '👩‍🔬', level: 'Advanced' },
      tags: ['CTE', 'Window Functions', 'GROUP BY', 'Date Functions'],
      difficulty: 'Advanced',
      upvotes: 31,
      comments: 12,
      timestamp: '1 day ago',
      isUpvoted: false,
      views: 203
    },
    {
      id: '4',
      title: 'Top Selling Products',
      description: 'Find the top 10 selling products by quantity',
      query: `SELECT p.product_name, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_sold DESC
LIMIT 10;`,
      author: { name: 'Alex Rodriguez', avatar: '👨‍🎨', level: 'Beginner' },
      tags: ['SELECT', 'JOIN', 'GROUP BY', 'ORDER BY'],
      difficulty: 'Beginner',
      upvotes: 8,
      comments: 2,
      timestamp: '3 days ago',
      isUpvoted: false,
      views: 67
    }
  ]);

  const availableTags = ['SELECT', 'JOIN', 'GROUP BY', 'WHERE', 'ORDER BY', 'CTE', 'Window Functions', 'Subquery', 'Date Functions', 'Aggregate'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredQueries = queries
    .filter(query => {
      const matchesSearch = query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           query.query.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => query.tags.includes(tag));
      const matchesDifficulty = !selectedDifficulty || query.difficulty === selectedDifficulty;
      return matchesSearch && matchesTags && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'trending':
          return (b.upvotes + b.comments + b.views) - (a.upvotes + a.comments + a.views);
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const handleCopyToPlayground = (query: string, queryId: string) => {
    navigator.clipboard.writeText(query);
    setCopiedQueryId(queryId);
    setTimeout(() => setCopiedQueryId(null), 2000);
    // In real app, this would navigate to playground with the query
    console.log('Copied to playground:', query);
  };

  const handleUpvote = (queryId: string) => {
    setQueries(prev => prev.map(query => 
      query.id === queryId 
        ? { 
            ...query, 
            upvotes: query.isUpvoted ? query.upvotes - 1 : query.upvotes + 1,
            isUpvoted: !query.isUpvoted 
          }
        : query
    ));
  };

  const handleSubmitQuery = () => {
    if (!newQuery.title || !newQuery.query) return;

    const query: SharedQuery = {
      id: Date.now().toString(),
      title: newQuery.title,
      description: newQuery.description,
      query: newQuery.query,
      author: { name: user?.name || 'Anonymous', avatar: '👤', level: 'Beginner' },
      tags: newQuery.tags,
      difficulty: newQuery.difficulty,
      upvotes: 0,
      comments: 0,
      timestamp: 'Just now',
      isUpvoted: false,
      views: 0
    };

    setQueries(prev => [query, ...prev]);
    setNewQuery({ title: '', description: '', query: '', tags: [], difficulty: 'Beginner' });
    setShowSubmissionPanel(false);
  };

  const handleTagToggle = (tag: string) => {
    if (newQuery.tags.includes(tag)) {
      setNewQuery(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    } else {
      setNewQuery(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-slate-400 mb-6">You need to be logged in to access Share Queries</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <ResponsiveNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Share Queries</h1>
            <p className="text-slate-400">Share your SQL queries and discover solutions from the community</p>
          </div>
          <button
            onClick={() => setShowSubmissionPanel(!showSubmissionPanel)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Share Query</span>
          </button>
        </div>

        {/* Query Submission Panel */}
        {showSubmissionPanel && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Share Your SQL Query</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newQuery.title}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter query title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newQuery.description}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe what your query does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">SQL Query</label>
                <textarea
                  value={newQuery.query}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                  rows={8}
                  placeholder="Enter your SQL query here..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                  <select
                    value={newQuery.difficulty}
                    onChange={(e) => setNewQuery(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          newQuery.tags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitQuery}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Query</span>
                </button>
                <button
                  onClick={() => setNewQuery({ title: '', description: '', query: '', tags: [], difficulty: 'Beginner' })}
                  className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search queries, descriptions, or SQL code..."
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(prev => prev.filter(t => t !== tag));
                          } else {
                            setSelectedTags(prev => [...prev, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Query Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQueries.map((query) => (
            <div key={query.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              {/* Query Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{query.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{query.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <span>{query.author.avatar}</span>
                      <span>{query.author.name}</span>
                      <span className="text-blue-400">({query.author.level})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{query.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(query.difficulty)}`}>
                  {query.difficulty}
                </div>
              </div>

              {/* SQL Code Preview */}
              <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                <pre className="text-green-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {query.query.length > 200 ? `${query.query.substring(0, 200)}...` : query.query}
                </pre>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {query.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCopyToPlayground(query.query, query.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    {copiedQueryId === query.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy to Playground</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedQuery(query)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-slate-400">
                  <button
                    onClick={() => handleUpvote(query.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      query.isUpvoted ? 'text-red-400' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${query.isUpvoted ? 'fill-current' : ''}`} />
                    <span>{query.upvotes}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{query.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{query.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQueries.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No queries found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedQuery.title}</h2>
                  <p className="text-slate-400">{selectedQuery.description}</p>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedQuery.author.avatar}</span>
                  <span className="text-white">{selectedQuery.author.name}</span>
                  <span className="text-blue-400">({selectedQuery.author.level})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedQuery.timestamp}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuery.difficulty)}`}>
                  {selectedQuery.difficulty}
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                <pre className="text-green-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {selectedQuery.query}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedQuery.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleCopyToPlayground(selectedQuery.query, selectedQuery.id)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {copiedQueryId === selectedQuery.id ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Copied to Playground!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy to Playground</span>
                    </>
                  )}
                </button>
                <div className="flex items-center space-x-6 text-slate-400">
                  <button
                    onClick={() => handleUpvote(selectedQuery.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      selectedQuery.isUpvoted ? 'text-red-400' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedQuery.isUpvoted ? 'fill-current' : ''}`} />
                    <span>{selectedQuery.upvotes} Upvotes</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedQuery.comments} Comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
