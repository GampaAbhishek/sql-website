'use client';

import { Plus, Loader2 } from 'lucide-react';

interface CustomTopicGeneratorProps {
  showCustomTopic: boolean;
  customTopic: string;
  onCustomTopicChange: (topic: string) => void;
  generatingQuestion: boolean;
  onGenerateQuestion: () => void;
}

export function CustomTopicGenerator({
  showCustomTopic,
  customTopic,
  onCustomTopicChange,
  generatingQuestion,
  onGenerateQuestion
}: CustomTopicGeneratorProps) {
  if (!showCustomTopic) return null;

  return (
    <div className="bg-blue-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => onCustomTopicChange(e.target.value)}
            placeholder="Enter a custom SQL topic (e.g., 'Complex JOINs with multiple tables')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={onGenerateQuestion}
            disabled={!customTopic.trim() || generatingQuestion}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
