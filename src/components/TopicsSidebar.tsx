'use client';

import { Book, Database } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface TopicsSidebarProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  onTopicSelect: (topic: Topic) => void;
}

export function TopicsSidebar({ topics, selectedTopic, onTopicSelect }: TopicsSidebarProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '⚡';
      case 'expert': return '💎';
      default: return '📚';
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Book className="w-5 h-5" />
          Topics
        </h2>
        <div className="space-y-3">
          {topics && topics.length > 0 ? (
            <>
              {['beginner', 'intermediate', 'advanced', 'expert'].map(level => {
                const levelTopics = topics.filter(topic => topic.level === level);
                if (levelTopics.length === 0) return null;
                
                return (
                  <div key={level} className="space-y-2">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full inline-flex items-center gap-1 ${getLevelColor(level)}`}>
                      <span>{getLevelIcon(level)}</span>
                      {level}
                    </h3>
                    {levelTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => onTopicSelect(topic)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedTopic?.id === topic.id
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-sm">{topic.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{topic.description}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No topics available</p>
              <p className="text-xs mt-1">Check database connection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
