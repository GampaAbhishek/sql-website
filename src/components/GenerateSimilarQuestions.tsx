'use client';

import { Plus, Loader2 } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface GenerateSimilarQuestionsProps {
  selectedTopic: Topic;
  customTopic: string;
  onCustomTopicChange: (topic: string) => void;
  generatingQuestion: boolean;
  onGenerateQuestion: (topicName: string, requirements: string) => void;
}

export function GenerateSimilarQuestions({
  selectedTopic,
  customTopic,
  onCustomTopicChange,
  generatingQuestion,
  onGenerateQuestion
}: GenerateSimilarQuestionsProps) {
  const suggestions = [
    'with joins',
    'complex subqueries',
    'harder difficulty',
    'with aggregations',
    'with window functions'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Generate Similar Questions</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => onCustomTopicChange(e.target.value)}
          placeholder={`Specify requirements for ${selectedTopic.name}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={() => onGenerateQuestion(selectedTopic.name, customTopic)}
          disabled={generatingQuestion}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {generatingQuestion ? 'Generating...' : 'Generate Question'}
        </button>
        <p className="text-xs text-gray-500">
          Leave blank for general {selectedTopic.name} questions or specify requirements like &ldquo;with joins&rdquo;, &ldquo;harder difficulty&rdquo;, etc.
        </p>
        
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Suggestions:</h4>
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onCustomTopicChange(suggestion)}
                className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
