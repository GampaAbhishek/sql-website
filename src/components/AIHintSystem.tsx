'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Brain, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Code,
  Database,
  ArrowRight
} from 'lucide-react';

interface HintLevel {
  id: string;
  level: number;
  title: string;
  content: string;
  type: 'conceptual' | 'structural' | 'syntax' | 'approach';
  pointPenalty: number;
  isRevealed: boolean;
}

interface AIHintSystemProps {
  currentQuestion: {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    tags: string[];
  };
  userQuery: string;
  onHintRevealed: (penalty: number) => void;
  onHintRequest: (hintType: string) => void;
}

const generateIntelligentHints = (question: any, userQuery: string): HintLevel[] => {
  const baseHints: HintLevel[] = [
    {
      id: '1',
      level: 1,
      title: 'Understanding the Problem',
      content: 'Think about what data you need to retrieve and from which tables. Break down the problem into smaller parts.',
      type: 'conceptual',
      pointPenalty: 5,
      isRevealed: false
    },
    {
      id: '2',
      level: 2,
      title: 'Query Structure Guidance',
      content: 'Start with SELECT statement. Consider what columns you need and identify the main table to query from.',
      type: 'structural',
      pointPenalty: 8,
      isRevealed: false
    },
    {
      id: '3',
      level: 3,
      title: 'Syntax Direction',
      content: 'Remember the basic SQL structure: SELECT columns FROM table WHERE conditions ORDER BY column.',
      type: 'syntax',
      pointPenalty: 12,
      isRevealed: false
    },
    {
      id: '4',
      level: 4,
      title: 'Approach Strategy',
      content: 'Consider if you need to filter data, join tables, or group results. Look at the relationships between tables.',
      type: 'approach',
      pointPenalty: 15,
      isRevealed: false
    }
  ];

  // AI Logic: Customize hints based on question difficulty and type
  if (question.difficulty === 'Advanced') {
    baseHints.push({
      id: '5',
      level: 5,
      title: 'Advanced Techniques',
      content: 'For complex queries, consider using subqueries, CTEs, or window functions. Think about the order of operations.',
      type: 'approach',
      pointPenalty: 20,
      isRevealed: false
    });
  }

  // AI Logic: Analyze user's current query for contextual hints
  if (userQuery) {
    const hasSelect = /SELECT/i.test(userQuery);
    const hasFrom = /FROM/i.test(userQuery);
    const hasWhere = /WHERE/i.test(userQuery);
    const hasJoin = /JOIN/i.test(userQuery);

    if (!hasSelect) {
      baseHints[0].content = 'You need to start with a SELECT statement to retrieve data. Think about what columns you want to see.';
    } else if (!hasFrom) {
      baseHints[1].content = 'Great start with SELECT! Now you need a FROM clause to specify which table to query.';
    } else if (question.tags.includes('JOIN') && !hasJoin) {
      baseHints[2].content = 'This question requires joining multiple tables. Look for foreign key relationships in the schema.';
    }
  }

  return baseHints;
};

const HINT_TYPES = [
  { id: 'conceptual', label: 'Conceptual Help', icon: Brain, color: 'purple' },
  { id: 'structural', label: 'Query Structure', icon: Database, color: 'blue' },
  { id: 'syntax', label: 'Syntax Guide', icon: Code, color: 'green' },
  { id: 'approach', label: 'Problem Approach', icon: Target, color: 'yellow' }
];

export default function AIHintSystem({ 
  currentQuestion, 
  userQuery, 
  onHintRevealed, 
  onHintRequest 
}: AIHintSystemProps) {
  const [hints, setHints] = useState<HintLevel[]>([]);
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [hintUsageStats, setHintUsageStats] = useState({
    conceptual: 0,
    structural: 0,
    syntax: 0,
    approach: 0
  });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  useEffect(() => {
    // Generate new hints when question changes
    const intelligentHints = generateIntelligentHints(currentQuestion, userQuery);
    setHints(intelligentHints);
    setExpandedHints(new Set());
    setTotalPenalty(0);
    
    // AI Analysis of the current problem
    generateAIAnalysis();
  }, [currentQuestion.id]);

  useEffect(() => {
    // Update hints based on user's query progress
    if (userQuery) {
      const updatedHints = generateIntelligentHints(currentQuestion, userQuery);
      setHints(updatedHints);
      analyzeUserProgress();
    }
  }, [userQuery]);

  const generateAIAnalysis = () => {
    const analysis = `Based on the question "${currentQuestion.title}", the AI suggests focusing on ${currentQuestion.tags.join(', ')} concepts. This ${currentQuestion.difficulty} level challenge requires understanding of database relationships and SQL fundamentals.`;
    setAiAnalysis(analysis);
  };

  const analyzeUserProgress = () => {
    if (!userQuery) return;

    const hasBasicStructure = /SELECT.*FROM/i.test(userQuery);
    const hasFiltering = /WHERE/i.test(userQuery);
    const hasJoins = /JOIN/i.test(userQuery);
    const hasSorting = /ORDER BY/i.test(userQuery);

    let progressAnalysis = '';
    if (hasBasicStructure) {
      progressAnalysis = 'Good progress! You have the basic query structure.';
    }
    if (hasFiltering) {
      progressAnalysis += ' You\'re filtering data effectively.';
    }
    if (hasJoins && currentQuestion.tags.includes('JOIN')) {
      progressAnalysis += ' Excellent use of table joins!';
    }

    if (progressAnalysis) {
      setAiAnalysis(progressAnalysis);
    }
  };

  const revealHint = (hintId: string) => {
    const hint = hints.find(h => h.id === hintId);
    if (!hint || hint.isRevealed) return;

    setHints(prev => prev.map(h => 
      h.id === hintId ? { ...h, isRevealed: true } : h
    ));
    
    setExpandedHints(prev => new Set([...prev, hintId]));
    setTotalPenalty(prev => prev + hint.pointPenalty);
    
    // Update usage stats
    setHintUsageStats(prev => ({
      ...prev,
      [hint.type]: prev[hint.type] + 1
    }));

    onHintRevealed(hint.pointPenalty);
    onHintRequest(hint.type);
  };

  const toggleHintExpansion = (hintId: string) => {
    setExpandedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hintId)) {
        newSet.delete(hintId);
      } else {
        newSet.add(hintId);
      }
      return newSet;
    });
  };

  const getHintTypeIcon = (type: string) => {
    const hintType = HINT_TYPES.find(t => t.id === type);
    return hintType ? hintType.icon : Lightbulb;
  };

  const getHintTypeColor = (type: string) => {
    const hintType = HINT_TYPES.find(t => t.id === type);
    switch (hintType?.color) {
      case 'purple': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'blue': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'green': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const revealedHints = hints.filter(h => h.isRevealed);
  const nextHint = hints.find(h => !h.isRevealed);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Hint System</h3>
              <p className="text-slate-400 text-sm">Intelligent, progressive guidance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Hints Used</p>
              <p className="text-white font-medium">{revealedHints.length}/{hints.length}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Point Penalty</p>
              <p className="text-red-400 font-medium">-{totalPenalty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-slate-700">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-white font-medium mb-1">AI Analysis</h4>
            <p className="text-slate-300 text-sm">{aiAnalysis}</p>
          </div>
        </div>
      </div>

      {/* Hint Categories */}
      <div className="p-4 border-b border-slate-700">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Available Hint Types
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {HINT_TYPES.map((type) => {
            const Icon = type.icon;
            const used = hintUsageStats[type.id as keyof typeof hintUsageStats];
            return (
              <div key={type.id} className={`p-3 rounded-lg border ${getHintTypeColor(type.id)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  {used > 0 && (
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                      {used} used
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progressive Hint System */}
      <div className="p-4">
        <div className="space-y-3">
          {hints.map((hint) => {
            const Icon = getHintTypeIcon(hint.type);
            const isExpanded = expandedHints.has(hint.id);
            const canReveal = !hint.isRevealed && (hint.level === 1 || hints[hint.level - 2]?.isRevealed);
            
            return (
              <div key={hint.id} className="border border-slate-600 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      hint.isRevealed ? 'bg-green-500' : canReveal ? 'bg-yellow-500' : 'bg-slate-600'
                    }`}>
                      {hint.isRevealed ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : canReveal ? (
                        <Icon className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{hint.title}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getHintTypeColor(hint.type)}`}>
                          {hint.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">Level {hint.level} • -{hint.pointPenalty} points</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {hint.isRevealed ? (
                      <button
                        onClick={() => toggleHintExpansion(hint.id)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    ) : canReveal ? (
                      <button
                        onClick={() => revealHint(hint.id)}
                        className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Reveal
                      </button>
                    ) : (
                      <div className="flex items-center text-slate-500 text-sm">
                        <EyeOff className="w-4 h-4 mr-1" />
                        Locked
                      </div>
                    )}
                  </div>
                </div>
                
                {hint.isRevealed && isExpanded && (
                  <div className="p-4 bg-slate-800">
                    <p className="text-slate-300">{hint.content}</p>
                    
                    {/* Additional contextual information */}
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Revealed at level {hint.level}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Star className="w-3 h-3" />
                        <span>{hint.pointPenalty} point penalty</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Hint Preview */}
        {nextHint && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Next Hint Available</p>
                  <p className="text-slate-300 text-sm">{nextHint.title} • Level {nextHint.level}</p>
                </div>
              </div>
              <button
                onClick={() => revealHint(nextHint.id)}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Get Hint (-{nextHint.pointPenalty} pts)
              </button>
            </div>
          </div>
        )}

        {/* Hint Usage Statistics */}
        {revealedHints.length > 0 && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Your Hint Usage Pattern
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Most Used Type</p>
                <p className="text-white font-medium">
                  {Object.entries(hintUsageStats).reduce((a, b) => 
                    hintUsageStats[a[0] as keyof typeof hintUsageStats] > hintUsageStats[b[0] as keyof typeof hintUsageStats] ? a : b
                  )[0]}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Learning Style</p>
                <p className="text-white font-medium">
                  {revealedHints.length <= 2 ? 'Independent' : 'Guided Learning'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
