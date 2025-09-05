'use client';

import { useState, useCallback } from 'react';

export interface AIAssistantContext {
  currentQuery?: string;
  lastError?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  mode?: 'playground' | 'challenge' | 'interview';
}

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<AIAssistantContext>({});

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateContext = useCallback((newContext: Partial<AIAssistantContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
    context,
    updateContext
  };
}
