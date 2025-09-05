'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Map, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Lock,
  ChevronRight,
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';

interface TopicMastery {
  id: string;
  name: string;
  status: 'mastered' | 'in-progress' | 'weak' | 'locked';
  accuracy: number;
  problemsSolved: number;
  totalProblems: number;
}

const TOPICS_MINI: TopicMastery[] = [
  {
    id: 'select-basics',
    name: 'SELECT Basics',
    status: 'mastered',
    accuracy: 92,
    problemsSolved: 15,
    totalProblems: 15
  },
  {
    id: 'where-clause',
    name: 'WHERE Clause',
    status: 'mastered',
    accuracy: 88,
    problemsSolved: 12,
    totalProblems: 12
  },
  {
    id: 'joins',
    name: 'JOINs',
    status: 'weak',
    accuracy: 45,
    problemsSolved: 8,
    totalProblems: 18
  },
  {
    id: 'group-by',
    name: 'GROUP BY',
    status: 'in-progress',
    accuracy: 67,
    problemsSolved: 6,
    totalProblems: 14
  },
  {
    id: 'having-clause',
    name: 'HAVING Clause',
    status: 'locked',
    accuracy: 0,
    problemsSolved: 0,
    totalProblems: 10
  }
];

interface RoadmapWidgetProps {
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export default function RoadmapWidget({ 
  showTitle = true, 
  maxItems = 4,
  compact = false 
}: RoadmapWidgetProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'in-progress': return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'weak': return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'locked': return <Lock className="w-3 h-3 text-slate-400" />;
      default: return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'border-green-500/30 bg-green-500/10';
      case 'in-progress': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'weak': return 'border-red-500/30 bg-red-500/10';
      case 'locked': return 'border-slate-500/30 bg-slate-500/10';
      default: return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const currentTopic = TOPICS_MINI.find(topic => topic.status === 'in-progress' || topic.status === 'weak');
  const nextRecommendation = currentTopic?.status === 'weak' 
    ? `Review ${currentTopic.name} (${currentTopic.accuracy}% accuracy)`
    : currentTopic?.status === 'in-progress'
    ? `Continue ${currentTopic.name} (${currentTopic.problemsSolved}/${currentTopic.totalProblems})`
    : 'Great job! Keep learning!';

  const displayTopics = TOPICS_MINI.slice(0, maxItems);

  if (compact) {
    return (
      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        {showTitle && (
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center text-sm">
              <Map className="w-4 h-4 mr-2 text-purple-400" />
              Learning Path
            </h4>
            <Link 
              href="/my-roadmap"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        <div className="space-y-2">
          {displayTopics.map((topic, index) => (
            <div key={topic.id} className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {getStatusIcon(topic.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${
                  topic.status === 'locked' ? 'text-slate-400' : 'text-white'
                }`}>
                  {topic.name}
                </p>
                {topic.status !== 'locked' && (
                  <div className="w-full bg-slate-600 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${
                        topic.status === 'mastered' ? 'bg-green-500' :
                        topic.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(topic.problemsSolved / topic.totalProblems) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-600">
          <p className="text-slate-300 text-xs mb-2">Next recommended:</p>
          <p className="text-white text-xs font-medium">{nextRecommendation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Map className="w-5 h-5 mr-2 text-purple-400" />
            Learning Roadmap
          </h3>
          <Link 
            href="/my-roadmap"
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            View Full
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
      
      <div className="space-y-3">
        {displayTopics.map((topic, index) => (
          <div key={topic.id} className={`p-3 rounded-lg border ${getStatusColor(topic.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(topic.status)}
                <span className={`text-sm font-medium ${
                  topic.status === 'locked' ? 'text-slate-400' : 'text-white'
                }`}>
                  {topic.name}
                </span>
              </div>
              {topic.status !== 'locked' && (
                <span className={`text-xs font-medium ${
                  topic.accuracy >= 80 ? 'text-green-400' :
                  topic.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {topic.accuracy}%
                </span>
              )}
            </div>
            
            {topic.status !== 'locked' && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{topic.problemsSolved}/{topic.totalProblems} problems</span>
                <div className="w-16 bg-slate-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      topic.status === 'mastered' ? 'bg-green-500' :
                      topic.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(topic.problemsSolved / topic.totalProblems) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center space-x-2 mb-1">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">AI Recommendation</span>
        </div>
        <p className="text-white text-sm">{nextRecommendation}</p>
      </div>
      
      <Link
        href="/my-roadmap"
        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        View Full Roadmap
      </Link>
    </div>
  );
}
