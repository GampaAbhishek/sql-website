'use client';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  schema_setup: string;
}

interface QuestionsListProps {
  questions: Question[];
  selectedQuestion: Question | null;
  onQuestionSelect: (question: Question) => void;
}

export function QuestionsList({ questions, selectedQuestion, onQuestionSelect }: QuestionsListProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(question)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedQuestion?.id === question.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{question.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600">{question.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No questions available for this topic</p>
        </div>
      )}
    </div>
  );
}
