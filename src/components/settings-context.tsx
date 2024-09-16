import React, { createContext, useState, ReactNode } from 'react';
import { LLMProvider, SpeechLanguage } from '@lib/interface';

interface SettingsContextProps {
  llmProvider: LLMProvider;
  setLlmProvider: (provider: LLMProvider) => void;

  apiKey: string;
  setApiKey: (key: string) => void;

  isValidatingApiKey: boolean;
  setIsValidatingApiKey: (value: boolean) => void;

  isTypingApiKey: boolean;
  setIsTypingApiKey: (value: boolean) => void;

  speechLanguage: SpeechLanguage;
  setSpeechLanguage: (language: SpeechLanguage) => void;

  speechRate: number;
  setSpeechRate: (rate: number) => void;

  speechVoice: SpeechSynthesisVoice | null;
  setSpeechVoice: (voice: SpeechSynthesisVoice | null) => void;
}

export const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState<boolean>(false);
  const [isTypingApiKey, setIsTypingApiKey] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(null);

  return (
    <SettingsContext.Provider
      value={{
        llmProvider,
        setLlmProvider,
        apiKey,
        setApiKey,
        isValidatingApiKey,
        setIsValidatingApiKey,
        isTypingApiKey,
        setIsTypingApiKey,
        speechLanguage,
        setSpeechLanguage,
        speechRate,
        setSpeechRate,
        speechVoice,
        setSpeechVoice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
