'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Clock,
  Database,
  Code,
  BarChart3,
  BookOpen,
  ArrowRight,
  Star,
  Award,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface QueryAnalysis {
  isCorrect: boolean;
  score: number;
  executionTime: number;
  rowsReturned: number;
  feedback: {
    positive: string[];
    improvements: string[];
    suggestions: string[];
  };
  performanceMetrics: {
    efficiency: number;
    readability: number;
    bestPractices: number;
  };
  detectedPatterns: string[];
  recommendations: string[];
}

interface AIQueryAnalyzerProps {
  userQuery: string;
  expectedQuery: string;
  currentQuestion: {
    id: string;
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    tags: string[];
  };
  onAnalysisComplete: (analysis: QueryAnalysis) => void;
}

const analyzeQueryIntelligently = (userQuery: string, expectedQuery: string, question: any): QueryAnalysis => {
  // Simulate AI analysis logic
  const queryLower = userQuery.toLowerCase().trim();
  const expectedLower = expectedQuery.toLowerCase().trim();
  
  // Basic correctness check
  const hasSelect = /select/i.test(userQuery);
  const hasFrom = /from/i.test(userQuery);
  const hasRequiredKeywords = question.tags.every((tag: string) => 
    new RegExp(tag, 'i').test(userQuery) || 
    (tag === 'JOIN' && /join/i.test(userQuery)) ||
    (tag === 'WHERE' && /where/i.test(userQuery)) ||
    (tag === 'GROUP BY' && /group\s+by/i.test(userQuery))
  );

  // Performance analysis
  const efficiency = calculateEfficiency(userQuery, question);
  const readability = calculateReadability(userQuery);
  const bestPractices = checkBestPractices(userQuery);

  // Pattern detection
  const detectedPatterns = detectQueryPatterns(userQuery);
  
  // Generate feedback
  const feedback = generateIntelligentFeedback(userQuery, question, {
    hasSelect,
    hasFrom,
    hasRequiredKeywords,
    efficiency,
    readability,
    bestPractices
  });

  // Calculate overall score
  const baseScore = hasSelect && hasFrom ? 40 : 0;
  const keywordScore = hasRequiredKeywords ? 30 : 0;
  const performanceScore = (efficiency + readability + bestPractices) / 3 * 30;
  const totalScore = Math.min(100, baseScore + keywordScore + performanceScore);

  return {
    isCorrect: hasSelect && hasFrom && hasRequiredKeywords,
    score: Math.round(totalScore),
    executionTime: Math.random() * 150 + 50, // Simulated
    rowsReturned: Math.floor(Math.random() * 100) + 1,
    feedback,
    performanceMetrics: {
      efficiency: Math.round(efficiency),
      readability: Math.round(readability),
      bestPractices: Math.round(bestPractices)
    },
    detectedPatterns,
    recommendations: generateRecommendations(userQuery, question, totalScore)
  };
};

const calculateEfficiency = (query: string, question: any): number => {
  let score = 100;
  
  // Penalize unnecessary complexity
  if (query.includes('SELECT *') && question.difficulty !== 'Beginner') {
    score -= 20;
  }
  
  // Reward proper indexing considerations
  if (/WHERE.*=/.test(query) && question.tags.includes('filtering')) {
    score += 10;
  }
  
  // Check for unnecessary subqueries
  const subqueryCount = (query.match(/\(/g) || []).length;
  if (subqueryCount > 2 && question.difficulty !== 'Advanced') {
    score -= 15;
  }
  
  return Math.max(0, Math.min(100, score));
};

const calculateReadability = (query: string): number => {
  let score = 70; // Base score
  
  // Check for proper formatting
  const lines = query.split('\n');
  const hasProperIndentation = lines.some(line => line.startsWith(' ') || line.startsWith('\t'));
  if (hasProperIndentation) score += 15;
  
  // Check for meaningful aliases
  const hasAliases = /\s+AS\s+/i.test(query);
  if (hasAliases) score += 10;
  
  // Check for comments
  const hasComments = /--/.test(query);
  if (hasComments) score += 5;
  
  return Math.max(0, Math.min(100, score));
};

const checkBestPractices = (query: string): number => {
  let score = 80; // Base score
  
  const practices = [
    { pattern: /SELECT\s+\*/i, penalty: -15, description: 'Avoid SELECT *' },
    { pattern: /WHERE.*LIKE.*%.*%/i, penalty: -10, description: 'Leading wildcards can be slow' },
    { pattern: /ORDER\s+BY/i, bonus: 5, description: 'Good use of sorting' },
    { pattern: /LIMIT\s+\d+/i, bonus: 10, description: 'Using LIMIT for large datasets' },
  ];
  
  practices.forEach(practice => {
    if (practice.pattern.test(query)) {
      score += practice.penalty || practice.bonus || 0;
    }
  });
  
  return Math.max(0, Math.min(100, score));
};

const detectQueryPatterns = (query: string): string[] => {
  const patterns = [];
  
  if (/JOIN/i.test(query)) patterns.push('Table Joins');
  if (/GROUP\s+BY/i.test(query)) patterns.push('Data Aggregation');
  if (/HAVING/i.test(query)) patterns.push('Group Filtering');
  if (/ORDER\s+BY/i.test(query)) patterns.push('Result Sorting');
  if (/LIMIT/i.test(query)) patterns.push('Result Limiting');
  if (/WHERE/i.test(query)) patterns.push('Data Filtering');
  if (/COUNT|SUM|AVG|MAX|MIN/i.test(query)) patterns.push('Aggregate Functions');
  if (/\(/i.test(query)) patterns.push('Subqueries');
  
  return patterns;
};

const generateIntelligentFeedback = (query: string, question: any, analysis: any) => {
  const positive = [];
  const improvements = [];
  const suggestions = [];
  
  // Positive feedback
  if (analysis.hasSelect) positive.push('Correct use of SELECT statement');
  if (analysis.hasFrom) positive.push('Proper FROM clause identified');
  if (analysis.readability > 80) positive.push('Well-formatted and readable query');
  if (analysis.efficiency > 80) positive.push('Efficient query structure');
  
  // Improvements
  if (!analysis.hasSelect) improvements.push('Missing SELECT statement - this is required to retrieve data');
  if (!analysis.hasFrom) improvements.push('Missing FROM clause - specify which table to query');
  if (!analysis.hasRequiredKeywords) {
    const missingTags = question.tags.filter((tag: string) => 
      !new RegExp(tag, 'i').test(query)
    );
    improvements.push(`Consider using: ${missingTags.join(', ')}`);
  }
  
  // Suggestions
  if (query.includes('SELECT *')) {
    suggestions.push('Consider selecting specific columns instead of using SELECT *');
  }
  if (analysis.efficiency < 70) {
    suggestions.push('Look for ways to optimize your query for better performance');
  }
  if (analysis.readability < 70) {
    suggestions.push('Try formatting your query with proper indentation and line breaks');
  }
  
  return { positive, improvements, suggestions };
};

const generateRecommendations = (query: string, question: any, score: number): string[] => {
  const recommendations = [];
  
  if (score < 50) {
    recommendations.push('Review the basic SQL syntax and structure');
    recommendations.push('Practice with simpler queries first');
  } else if (score < 80) {
    recommendations.push('Focus on query optimization techniques');
    recommendations.push('Learn about indexing and performance considerations');
  } else {
    recommendations.push('Explore advanced SQL features like window functions');
    recommendations.push('Consider query performance and scalability');
  }
  
  // Question-specific recommendations
  if (question.tags.includes('JOIN') && !/join/i.test(query)) {
    recommendations.push('Learn about different types of table joins');
  }
  
  if (question.difficulty === 'Advanced' && score > 90) {
    recommendations.push('Excellent work! Try creating your own complex scenarios');
  }
  
  return recommendations;
};

export default function AIQueryAnalyzer({ 
  userQuery, 
  expectedQuery, 
  currentQuestion, 
  onAnalysisComplete 
}: AIQueryAnalyzerProps) {
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    if (userQuery.trim()) {
      performAnalysis();
    }
  }, [userQuery]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = analyzeQueryIntelligently(userQuery, expectedQuery, currentQuestion);
    setAnalysis(result);
    setIsAnalyzing(false);
    onAnalysisComplete(result);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (!userQuery.trim()) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="text-center">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">AI Query Analyzer</h3>
          <p className="text-slate-400">Start typing your SQL query to get instant AI-powered analysis and feedback.</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 className="text-xl font-semibold text-white">Analyzing Your Query...</h3>
            <p className="text-slate-400">AI is examining syntax, performance, and best practices</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header with Overall Score */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI Analysis Results</h3>
              <p className="text-slate-400">Comprehensive query evaluation</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}%
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {analysis.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-slate-300">
                {analysis.isCorrect ? 'Correct' : 'Needs Work'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="p-6 border-b border-slate-700">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Efficiency</span>
              <span className={`font-semibold ${getScoreColor(analysis.performanceMetrics.efficiency)}`}>
                {analysis.performanceMetrics.efficiency}%
              </span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  analysis.performanceMetrics.efficiency >= 80 ? 'bg-green-500' :
                  analysis.performanceMetrics.efficiency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.performanceMetrics.efficiency}%` }}
              />
            </div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Readability</span>
              <span className={`font-semibold ${getScoreColor(analysis.performanceMetrics.readability)}`}>
                {analysis.performanceMetrics.readability}%
              </span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  analysis.performanceMetrics.readability >= 80 ? 'bg-green-500' :
                  analysis.performanceMetrics.readability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.performanceMetrics.readability}%` }}
              />
            </div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Best Practices</span>
              <span className={`font-semibold ${getScoreColor(analysis.performanceMetrics.bestPractices)}`}>
                {analysis.performanceMetrics.bestPractices}%
              </span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  analysis.performanceMetrics.bestPractices >= 80 ? 'bg-green-500' :
                  analysis.performanceMetrics.bestPractices >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.performanceMetrics.bestPractices}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Execution Time</p>
            <p className="text-white font-semibold">{analysis.executionTime.toFixed(0)}ms</p>
          </div>
          <div className="text-center">
            <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Rows Returned</p>
            <p className="text-white font-semibold">{analysis.rowsReturned}</p>
          </div>
          <div className="text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Patterns Found</p>
            <p className="text-white font-semibold">{analysis.detectedPatterns.length}</p>
          </div>
          <div className="text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Overall Score</p>
            <p className={`font-semibold ${getScoreColor(analysis.score)}`}>{analysis.score}%</p>
          </div>
        </div>
      </div>

      {/* Feedback Sections */}
      <div className="p-6">
        {/* Positive Feedback */}
        {analysis.feedback.positive.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <ThumbsUp className="w-5 h-5 mr-2 text-green-400" />
              What You Did Well
            </h4>
            <div className="space-y-2">
              {analysis.feedback.positive.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {analysis.feedback.improvements.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {analysis.feedback.improvements.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysis.feedback.suggestions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
              AI Suggestions
            </h4>
            <div className="space-y-2">
              {analysis.feedback.suggestions.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Patterns */}
        {analysis.detectedPatterns.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Code className="w-5 h-5 mr-2 text-purple-400" />
              Detected SQL Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.detectedPatterns.map((pattern, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-teal-400" />
              Next Steps & Recommendations
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
                  <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span className="text-teal-100">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overall Assessment */}
      <div className={`p-6 border-t border-slate-700 ${getScoreBackground(analysis.score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold mb-1">AI Assessment</h4>
            <p className="text-slate-300">
              {analysis.score >= 90 ? 'Excellent work! Your query demonstrates mastery of SQL concepts.' :
               analysis.score >= 70 ? 'Good job! With minor improvements, this will be a solid query.' :
               analysis.score >= 50 ? 'You\'re on the right track. Focus on the key improvements suggested.' :
               'Keep practicing! Review the fundamentals and try again.'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {analysis.score >= 70 ? (
              <Award className="w-8 h-8 text-yellow-400" />
            ) : analysis.isCorrect ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <Target className="w-8 h-8 text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
