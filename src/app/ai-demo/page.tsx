'use client';

import { useState } from 'react';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import AIAssistant from '@/components/AIAssistant';
import { Bot, Code, Lightbulb, AlertCircle, Zap, Target } from 'lucide-react';

export default function AIAssistantDemoPage() {
  const [isAIOpen, setIsAIOpen] = useState(true);
  const [currentQuery, setCurrentQuery] = useState(`SELECT e.name, e.salary, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE e.salary > 50000
ORDER BY e.salary DESC;`);
  const [demoError, setDemoError] = useState('');
  const [demoMode, setDemoMode] = useState<'playground' | 'challenge' | 'interview'>('playground');

  const demoQueries = {
    basic: "SELECT * FROM employees WHERE salary > 50000;",
    error: "SELECT name, salary FROM employees GROUP BY department;", // Missing GROUP BY column
    complex: `WITH high_earners AS (
  SELECT department_id, AVG(salary) as avg_salary
  FROM employees
  GROUP BY department_id
  HAVING AVG(salary) > 60000
)
SELECT d.department_name, he.avg_salary
FROM high_earners he
JOIN departments d ON he.department_id = d.id
ORDER BY he.avg_salary DESC;`
  };

  const demoErrors = {
    syntax: "Syntax error near 'GRUP': did you mean 'GROUP'?",
    groupBy: "Column 'name' must appear in the GROUP BY clause or be used in an aggregate function",
    table: "Table 'employes' doesn't exist. Did you mean 'employees'?"
  };

  const handleQuerySuggestion = (query: string) => {
    setCurrentQuery(query);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="ai-demo" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI SQL Assistant</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Your intelligent companion for learning SQL. Get real-time help, explanations, and suggestions 
            to improve your SQL skills and solve problems faster.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Try the AI Assistant</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setDemoMode('playground')}
              className={`p-4 rounded-lg border-2 transition-all ${
                demoMode === 'playground'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <Code className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-white font-medium">Playground Mode</div>
              <div className="text-sm text-slate-400">Free-form SQL practice</div>
            </button>
            
            <button
              onClick={() => setDemoMode('challenge')}
              className={`p-4 rounded-lg border-2 transition-all ${
                demoMode === 'challenge'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-white font-medium">Challenge Mode</div>
              <div className="text-sm text-slate-400">Guided problem solving</div>
            </button>
            
            <button
              onClick={() => setDemoMode('interview')}
              className={`p-4 rounded-lg border-2 transition-all ${
                demoMode === 'interview'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-white font-medium">Interview Mode</div>
              <div className="text-sm text-slate-400">Timed practice sessions</div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sample Queries */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Sample Queries</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentQuery(demoQueries.basic)}
                  className="w-full text-left p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div className="text-white text-sm">Basic SELECT with WHERE</div>
                </button>
                <button
                  onClick={() => {
                    setCurrentQuery(demoQueries.error);
                    setDemoError(demoErrors.groupBy);
                  }}
                  className="w-full text-left p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div className="text-white text-sm">Query with GROUP BY Error</div>
                </button>
                <button
                  onClick={() => setCurrentQuery(demoQueries.complex)}
                  className="w-full text-left p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div className="text-white text-sm">Complex CTE Query</div>
                </button>
              </div>
            </div>

            {/* Sample Errors */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Sample Errors</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setDemoError(demoErrors.syntax)}
                  className="w-full text-left p-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <div className="text-red-400 text-sm">Syntax Error</div>
                </button>
                <button
                  onClick={() => setDemoError(demoErrors.groupBy)}
                  className="w-full text-left p-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <div className="text-red-400 text-sm">GROUP BY Error</div>
                </button>
                <button
                  onClick={() => setDemoError(demoErrors.table)}
                  className="w-full text-left p-3 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <div className="text-red-400 text-sm">Table Not Found</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Query Display */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-3">Current Query</h3>
          <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto mb-4">
            <code>{currentQuery}</code>
          </pre>
          {demoError && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Error:</span>
              </div>
              <p className="text-red-300 text-sm mt-1">{demoError}</p>
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Hints</h3>
            <p className="text-slate-400 text-sm">
              Get progressive hints that guide you to the solution without giving it away. 
              Perfect for learning and building understanding.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Explanation</h3>
            <p className="text-slate-400 text-sm">
              Understand SQL errors in plain English. Learn why they happen and how to fix them 
              with clear, actionable explanations.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Query Generation</h3>
            <p className="text-slate-400 text-sm">
              Convert natural language requests into valid SQL queries. Learn by example 
              and understand the reasoning behind each query.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-slate-300 mb-4">
            The AI Assistant is always available in Playground and Challenges modes.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsAIOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Open AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIOpen}
        onToggle={() => setIsAIOpen(!isAIOpen)}
        context={{
          currentQuery,
          lastError: demoError,
          difficulty: 'intermediate',
          mode: demoMode
        }}
        onQuerySuggestion={handleQuerySuggestion}
      />
    </div>
  );
}
