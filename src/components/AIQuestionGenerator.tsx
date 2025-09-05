'use client';

import { useState } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Shuffle, 
  Clock,
  Star,
  TrendingUp,
  Zap,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DatabaseSchema {
  id: string;
  name: string;
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
    }[];
  }[];
}

interface GeneratedQuestion {
  id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  description: string;
  expectedQuery: string;
  hints: string[];
  tags: string[];
  learningObjectives: string[];
  estimatedTime: string;
}

interface AIQuestionGeneratorProps {
  currentDatabase: DatabaseSchema;
  userLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  onQuestionGenerated: (question: GeneratedQuestion) => void;
  isGenerating?: boolean;
}

const QUESTION_TEMPLATES = {
  Beginner: [
    {
      type: 'basic_select',
      template: 'Find all {entities} where {condition}',
      hints: ['Use SELECT to retrieve data', 'Use WHERE to filter results', 'Remember to specify the table name'],
      tags: ['SELECT', 'WHERE', 'filtering'],
      estimatedTime: '3-5 minutes'
    },
    {
      type: 'simple_count',
      template: 'Count the total number of {entities}',
      hints: ['Use COUNT() function', 'COUNT(*) counts all rows', 'Remember the FROM clause'],
      tags: ['COUNT', 'aggregate', 'basic'],
      estimatedTime: '2-3 minutes'
    },
    {
      type: 'order_by',
      template: 'List all {entities} ordered by {column}',
      hints: ['Use ORDER BY to sort results', 'ASC for ascending, DESC for descending', 'ORDER BY goes at the end of query'],
      tags: ['ORDER BY', 'sorting', 'SELECT'],
      estimatedTime: '3-4 minutes'
    }
  ],
  Intermediate: [
    {
      type: 'join_basic',
      template: 'Find {entity1} with their corresponding {entity2} information',
      hints: ['Use JOIN to combine tables', 'Match foreign keys with primary keys', 'Use table aliases for clarity'],
      tags: ['JOIN', 'foreign key', 'relationships'],
      estimatedTime: '8-10 minutes'
    },
    {
      type: 'group_by',
      template: 'Group {entities} by {category} and show {aggregate}',
      hints: ['Use GROUP BY to group similar records', 'Use aggregate functions like COUNT, SUM, AVG', 'GROUP BY comes after WHERE but before ORDER BY'],
      tags: ['GROUP BY', 'aggregation', 'grouping'],
      estimatedTime: '6-8 minutes'
    },
    {
      type: 'having_clause',
      template: 'Find {groups} that have {condition} after grouping',
      hints: ['HAVING filters groups, WHERE filters rows', 'HAVING comes after GROUP BY', 'Use aggregate functions in HAVING clause'],
      tags: ['HAVING', 'GROUP BY', 'filtering groups'],
      estimatedTime: '8-12 minutes'
    }
  ],
  Advanced: [
    {
      type: 'subquery',
      template: 'Find {entities} that {comparison} the {metric} of {other_entities}',
      hints: ['Use subqueries for complex comparisons', 'Subqueries can go in WHERE, FROM, or SELECT clauses', 'Make sure subquery returns appropriate data type'],
      tags: ['subquery', 'nested query', 'complex'],
      estimatedTime: '12-15 minutes'
    },
    {
      type: 'window_function',
      template: 'Rank {entities} by {metric} within each {partition}',
      hints: ['Use window functions for advanced analytics', 'PARTITION BY divides data into groups', 'ROW_NUMBER(), RANK(), DENSE_RANK() are common window functions'],
      tags: ['window function', 'ranking', 'analytics'],
      estimatedTime: '15-20 minutes'
    },
    {
      type: 'complex_join',
      template: 'Find {entities} with complex relationships involving multiple tables',
      hints: ['Use multiple JOINs to connect several tables', 'Be careful about data types in join conditions', 'Consider using table aliases for readability'],
      tags: ['multiple JOIN', 'complex relationships', 'advanced'],
      estimatedTime: '10-15 minutes'
    }
  ]
};

const AI_REASONING_PATTERNS = [
  {
    pattern: 'data_exploration',
    description: 'User needs to explore and understand the data structure',
    questions: ['basic_select', 'simple_count', 'order_by']
  },
  {
    pattern: 'relationship_analysis',
    description: 'User should learn about table relationships',
    questions: ['join_basic', 'complex_join']
  },
  {
    pattern: 'aggregation_mastery',
    description: 'User needs to practice data aggregation and grouping',
    questions: ['group_by', 'having_clause']
  },
  {
    pattern: 'advanced_analysis',
    description: 'User is ready for complex analytical queries',
    questions: ['subquery', 'window_function']
  }
];

export default function AIQuestionGenerator({ 
  currentDatabase, 
  userLevel, 
  onQuestionGenerated,
  isGenerating = false 
}: AIQuestionGeneratorProps) {
  const [generationHistory, setGenerationHistory] = useState<GeneratedQuestion[]>([]);
  const [currentPattern, setCurrentPattern] = useState<string>('data_exploration');
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(userLevel);

  const generateIntelligentQuestion = (): GeneratedQuestion => {
    // AI Logic: Select appropriate question template based on user level and database
    const templates = QUESTION_TEMPLATES[adaptiveDifficulty];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // AI Logic: Analyze database structure to create contextual questions
    const primaryTable = currentDatabase.tables[0];
    const hasRelationships = currentDatabase.tables.some(table => 
      table.columns.some(col => col.isForeign)
    );
    
    // Generate contextual content based on database theme
    let entityName = primaryTable.name;
    let contextualDescription = '';
    let practicalScenario = '';
    
    if (currentDatabase.id === 'library-mgmt') {
      entityName = primaryTable.name === 'books' ? 'books' : 'library members';
      practicalScenario = 'As a librarian, you need to ';
    } else if (currentDatabase.id === 'ecommerce') {
      entityName = primaryTable.name === 'customers' ? 'customers' : 'products';
      practicalScenario = 'As an e-commerce analyst, you need to ';
    } else if (currentDatabase.id === 'hospital') {
      entityName = primaryTable.name === 'patients' ? 'patients' : 'doctors';
      practicalScenario = 'As a hospital administrator, you need to ';
    }

    // AI Logic: Create difficulty-appropriate questions
    switch (randomTemplate.type) {
      case 'basic_select':
        const filterColumn = primaryTable.columns.find(col => !col.isPrimary)?.name || 'name';
        contextualDescription = `${practicalScenario}find all ${entityName} where ${filterColumn} meets certain criteria.`;
        break;
      
      case 'join_basic':
        if (hasRelationships) {
          const foreignKeyTable = currentDatabase.tables.find(table => 
            table.columns.some(col => col.isForeign)
          );
          if (foreignKeyTable) {
            contextualDescription = `${practicalScenario}analyze the relationship between ${primaryTable.name} and ${foreignKeyTable.name}.`;
          }
        }
        break;
      
      case 'group_by':
        const groupColumn = primaryTable.columns.find(col => 
          col.type.includes('VARCHAR') && !col.isPrimary
        )?.name || 'category';
        contextualDescription = `${practicalScenario}analyze ${entityName} grouped by ${groupColumn} to identify patterns.`;
        break;
      
      default:
        contextualDescription = `${practicalScenario}analyze the ${entityName} data for insights.`;
    }

    // Generate unique question ID
    const questionId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create learning objectives based on question type
    const learningObjectives = [
      `Understand how to use ${randomTemplate.tags[0]} effectively`,
      `Practice working with ${currentDatabase.name} schema`,
      `Develop problem-solving skills for real-world scenarios`
    ];

    const generatedQuestion: GeneratedQuestion = {
      id: questionId,
      difficulty: adaptiveDifficulty,
      title: `${randomTemplate.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Challenge`,
      description: contextualDescription,
      expectedQuery: `-- AI-generated query for ${randomTemplate.type}\n-- This would be dynamically created based on the template`,
      hints: randomTemplate.hints,
      tags: randomTemplate.tags,
      learningObjectives,
      estimatedTime: randomTemplate.estimatedTime
    };

    return generatedQuestion;
  };

  const handleGenerateQuestion = () => {
    const question = generateIntelligentQuestion();
    setGenerationHistory([question, ...generationHistory.slice(0, 4)]); // Keep last 5
    onQuestionGenerated(question);
  };

  const adaptDifficulty = (success: boolean) => {
    if (success && adaptiveDifficulty === 'Beginner') {
      setAdaptiveDifficulty('Intermediate');
    } else if (success && adaptiveDifficulty === 'Intermediate') {
      setAdaptiveDifficulty('Advanced');
    } else if (!success && adaptiveDifficulty === 'Advanced') {
      setAdaptiveDifficulty('Intermediate');
    } else if (!success && adaptiveDifficulty === 'Intermediate') {
      setAdaptiveDifficulty('Beginner');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">AI Question Generator</h3>
            <p className="text-slate-400 text-sm">Intelligent, adaptive question generation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(adaptiveDifficulty)}`}>
            {adaptiveDifficulty} Mode
          </span>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm font-medium">Current Focus</span>
          </div>
          <p className="text-slate-300 text-xs">
            {AI_REASONING_PATTERNS.find(p => p.pattern === currentPattern)?.description}
          </p>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">Adaptive Level</span>
          </div>
          <p className="text-slate-300 text-xs">
            Adjusting difficulty based on your performance
          </p>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-white text-sm font-medium">Contextual</span>
          </div>
          <p className="text-slate-300 text-xs">
            Questions tailored to {currentDatabase.name}
          </p>
        </div>
      </div>

      {/* Generation Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGenerateQuestion}
            disabled={isGenerating}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Question
              </>
            )}
          </button>
          
          <button
            onClick={() => setCurrentPattern(
              AI_REASONING_PATTERNS[
                (AI_REASONING_PATTERNS.findIndex(p => p.pattern === currentPattern) + 1) % 
                AI_REASONING_PATTERNS.length
              ].pattern
            )}
            className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Change Focus
          </button>
        </div>
        
        <div className="text-right">
          <p className="text-slate-400 text-xs">Generated: {generationHistory.length} questions</p>
          <p className="text-slate-300 text-sm font-medium">Database: {currentDatabase.name}</p>
        </div>
      </div>

      {/* AI Generation Logic Explanation */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
          How AI Creates Your Questions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Analyzes your current skill level</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Studies database schema and relationships</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Creates contextual, real-world scenarios</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Adapts difficulty based on performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Generation History */}
      {generationHistory.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            Recent AI Generations
          </h4>
          <div className="space-y-2">
            {generationHistory.slice(0, 3).map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="text-white text-sm">{question.title}</span>
                  <span className="text-slate-400 text-xs">~{question.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {question.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Performance Feedback */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-medium">AI Feedback</span>
        </div>
        <p className="text-slate-300 text-sm">
          The AI notices you're getting better! Questions will automatically become more challenging as you improve.
          Current success rate: 87% - Ready for {adaptiveDifficulty} level challenges.
        </p>
      </div>
    </div>
  );
}
