'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Lightbulb, 
  AlertCircle, 
  FileText, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Zap
} from 'lucide-react';

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'hint' | 'error' | 'generation' | 'explanation' | 'general';
  sqlQuery?: string;
}

export interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  context?: {
    currentQuery?: string;
    lastError?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    mode?: 'playground' | 'challenge' | 'interview';
  };
  onQuerySuggestion?: (query: string) => void;
}

const AI_RESPONSES = {
  welcome: "Hi! I'm your SQL Assistant 🤖. I can help you with:\n\n• Explaining SQL errors\n• Converting natural language to SQL\n• Providing hints for challenges\n• Best practices and optimization tips\n\nWhat would you like to know?",
  
  errorExamples: {
    syntax: "I see there's a syntax error in your query. This usually happens when:\n• Missing commas between column names\n• Incorrect use of quotes or brackets\n• Misspelled SQL keywords\n\nCould you share your query so I can give specific guidance?",
    
    group_by: "When using GROUP BY, remember that all non-aggregated columns in SELECT must be included in GROUP BY. For example:\n\n```sql\nSELECT department, AVG(salary)\nFROM employees\nGROUP BY department;\n```",
    
    join: "JOIN issues are common! Make sure you:\n• Specify the correct JOIN type (INNER, LEFT, RIGHT)\n• Include the ON clause with proper conditions\n• Use table aliases for clarity\n\nNeed help with a specific JOIN?"
  },
  
  hints: {
    beginner: "Start with basic SELECT statements and WHERE clauses. Focus on understanding how to filter and sort data.",
    intermediate: "Try using JOINs to combine tables and GROUP BY with aggregate functions like COUNT, SUM, AVG.",
    advanced: "Explore window functions, CTEs (Common Table Expressions), and subqueries for complex data analysis."
  }
};

export default function AIAssistant({ 
  isOpen, 
  onToggle, 
  context = {}, 
  onQuerySuggestion 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: AI_RESPONSES.welcome,
      timestamp: new Date(),
      category: 'general'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const generateAIResponse = async (userMessage: string, category: string = 'general'): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Error explanation responses
    if (category === 'error' || lowerMessage.includes('error') || lowerMessage.includes('wrong')) {
      if (context.lastError) {
        return `I can see the error in your query! Here's what's happening:\n\n${context.lastError}\n\n💡 **Quick Fix:** Try checking your column names, table references, and SQL syntax. Would you like me to suggest a corrected version?`;
      }
      return AI_RESPONSES.errorExamples.syntax;
    }
    
    // Hint responses
    if (category === 'hint' || lowerMessage.includes('hint') || lowerMessage.includes('help')) {
      const difficulty = context.difficulty || 'beginner';
      return `Here's a hint for your current level (${difficulty}):\n\n${AI_RESPONSES.hints[difficulty]}\n\n💡 **Tip:** Try breaking down the problem into smaller steps. What data do you need first?`;
    }
    
    // Natural language to SQL
    if (category === 'generation' || lowerMessage.includes('show') || lowerMessage.includes('find') || lowerMessage.includes('get')) {
      const sqlQuery = generateSQLFromNaturalLanguage(userMessage);
      return `I understand you want to: "${userMessage}"\n\nHere's the SQL query for that:\n\n\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n💡 **Explanation:** This query ${explainQuery(sqlQuery)}`;
    }
    
    // General responses
    if (lowerMessage.includes('join')) {
      return AI_RESPONSES.errorExamples.join;
    }
    
    if (lowerMessage.includes('group by')) {
      return AI_RESPONSES.errorExamples.group_by;
    }
    
    // Default helpful response
    return `I'd be happy to help with that! Could you be more specific about what you're trying to do? For example:\n\n• "Explain this error: [your error message]"\n• "How do I find the top 5 customers by sales?"\n• "Give me a hint for this challenge"\n• "What's wrong with my JOIN query?"`;
  };

  const generateSQLFromNaturalLanguage = (text: string): string => {
    const lower = text.toLowerCase();
    
    if (lower.includes('top') && lower.includes('employees') && lower.includes('salary')) {
      return "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;";
    }
    
    if (lower.includes('customers') && lower.includes('orders')) {
      return "SELECT c.name, COUNT(o.id) as order_count\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name;";
    }
    
    if (lower.includes('average') || lower.includes('avg')) {
      return "SELECT department, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department;";
    }
    
    return "SELECT *\nFROM your_table\nWHERE your_condition;";
  };

  const explainQuery = (query: string): string => {
    if (query.includes('ORDER BY') && query.includes('LIMIT')) {
      return "uses ORDER BY to sort results and LIMIT to show only the top results.";
    }
    if (query.includes('JOIN')) {
      return "joins multiple tables to combine related data.";
    }
    if (query.includes('GROUP BY')) {
      return "groups rows by common values and calculates aggregates.";
    }
    return "retrieves data based on your specified conditions.";
  };

  const handleSendMessage = async (category: string = 'general') => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      category: category as any
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      const aiResponse = await generateAIResponse(inputValue, category);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        category: category as any,
        sqlQuery: category === 'generation' ? generateSQLFromNaturalLanguage(inputValue) : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble processing that right now. Please try again!",
        timestamp: new Date(),
        category: 'general'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExplainError = () => {
    if (context.lastError) {
      setInputValue(`Explain this error: ${context.lastError}`);
    } else {
      setInputValue("I'm getting an error with my SQL query. Can you help?");
    }
    handleSendMessage('error');
  };

  const handleSuggestQuery = () => {
    setInputValue("Help me write a SQL query to find...");
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuery(text);
      setTimeout(() => setCopiedQuery(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const copyToPlayground = (query: string) => {
    if (onQuerySuggestion) {
      onQuerySuggestion(query);
    }
    copyToClipboard(query);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    const parts = content.split('\n');
    return parts.map((part, index) => {
      if (part.startsWith('```sql') || part.startsWith('```')) {
        return null; // Handle code blocks separately
      }
      if (part.startsWith('•')) {
        return (
          <li key={index} className="ml-4 text-slate-300">
            {part.substring(1).trim()}
          </li>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <p key={index} className="font-semibold text-slate-200 mt-2">
            {part.slice(2, -2)}
          </p>
        );
      }
      return part.trim() ? (
        <p key={index} className="text-slate-300 mt-1">
          {part}
        </p>
      ) : null;
    });
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```sql\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 w-96 h-[600px] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">AI SQL Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {/* Message content */}
                  <div className="text-sm">
                    {formatMessage(message.content)}
                  </div>

                  {/* Code blocks */}
                  {message.type === 'assistant' && extractCodeBlocks(message.content).map((code, index) => (
                    <div key={index} className="mt-3 bg-slate-800 rounded p-3 relative">
                      <pre className="text-xs text-slate-300 overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Copy query"
                        >
                          {copiedQuery === code ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {onQuerySuggestion && (
                          <button
                            onClick={() => copyToPlayground(code)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Use in Playground
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Message metadata */}
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.category && message.category !== 'general' && (
                      <div className="flex items-center space-x-1">
                        {message.category === 'hint' && <Lightbulb className="w-3 h-3" />}
                        {message.category === 'error' && <AlertCircle className="w-3 h-3" />}
                        {message.category === 'generation' && <FileText className="w-3 h-3" />}
                        <span className="capitalize">{message.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg p-3 max-w-[85%]">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="px-4 py-2 border-t border-slate-700">
            <div className="flex space-x-2">
              <button
                onClick={handleExplainError}
                className="flex items-center px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30 transition-colors"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Explain Error
              </button>
              <button
                onClick={() => handleSendMessage('hint')}
                className="flex items-center px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs hover:bg-yellow-600/30 transition-colors"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Get Hint
              </button>
              <button
                onClick={handleSuggestQuery}
                className="flex items-center px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors"
              >
                <Zap className="w-3 h-3 mr-1" />
                Generate SQL
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about SQL..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                disabled={isThinking}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isThinking}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
