'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import InterviewModeSelectionNew from '@/components/InterviewModeSelectionNew';
import AIInterviewSession from '@/components/AIInterviewSession';
import AIInterviewResultsSimple from '@/components/AIInterviewResultsSimple';

interface InterviewSession {
  sessionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  mode: 'timed' | 'practice';
  totalTimeLimit: number;
  currentQuestionIndex: number;
  questions: any[];
  responses: any[];
  startTime: string;
  aiPersonality: string;
  adaptiveMode: boolean;
}

type PageMode = 'selection' | 'session' | 'results';

export default function InterviewPrepPage() {
  const router = useRouter();
  const [mode, setMode] = useState<PageMode>('selection');
  const [sessionData, setSessionData] = useState<InterviewSession | null>(null);
  const [interviewConfig, setInterviewConfig] = useState<{
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    mode: 'timed' | 'practice';
  } | null>(null);

  const handleStartSession = (
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed',
    interviewMode: 'timed' | 'practice'
  ) => {
    setInterviewConfig({ difficulty, mode: interviewMode });
    setMode('session');
  };

  const handleSessionComplete = (session: InterviewSession) => {
    setSessionData(session);
    setMode('results');
  };

  const handleRetrySession = () => {
    setMode('selection');
    setSessionData(null);
    setInterviewConfig(null);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ResponsiveNavbar currentPage="interview-prep" />
      
      <main className="flex-1">
        {mode === 'selection' && (
          <InterviewModeSelectionNew onStartSession={handleStartSession} />
        )}
        
        {mode === 'session' && interviewConfig && (
          <AIInterviewSession
            difficulty={interviewConfig.difficulty}
            mode={interviewConfig.mode}
            onSessionComplete={handleSessionComplete}
          />
        )}
        
        {mode === 'results' && sessionData && (
          <AIInterviewResultsSimple
            session={sessionData}
            onRetry={handleRetrySession}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}
