import React, { createContext, useState, ReactNode, useEffect } from 'react';
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
  const [llmProvider, setLlmProvider] = useState<LLMProvider>(localStorage.getItem('llmProvider') as LLMProvider || 'openai');
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('apiKey') as string || '');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState<boolean>(false);
  const [isTypingApiKey, setIsTypingApiKey] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>(localStorage.getItem('speechLanguage') as SpeechLanguage || 'en-US');
  const [speechRate, setSpeechRate] = useState<number>(localStorage.getItem('speechRate') ? parseInt(localStorage.getItem('speechRate')!) : 1);
  const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load settings from local storage on component mount
  useEffect(() => {
    const storedLlmProvider = localStorage.getItem('llmProvider');
    const storedApiKey = localStorage.getItem('apiKey');
    const storedSpeechLanguage = localStorage.getItem('speechLanguage');
    const storedSpeechRate = localStorage.getItem('speechRate');
    const storedSpeechVoice = localStorage.getItem('speechVoice');

    if (storedLlmProvider) setLlmProvider(storedLlmProvider as LLMProvider);
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedSpeechLanguage) setSpeechLanguage(storedSpeechLanguage as SpeechLanguage);
    if (storedSpeechRate) setSpeechRate(parseInt(storedSpeechRate));
    if (storedSpeechVoice) {
      const voices = speechSynthesis.getVoices();
      const storedVoice = voices.find(voice => voice.name === storedSpeechVoice);
      if (storedVoice) setSpeechVoice(storedVoice);
    }
  }, []);

  // Save settings to local storage when they change
  useEffect(() => {
		localStorage.setItem('llmProvider', llmProvider);
		localStorage.setItem('apiKey', apiKey);
		localStorage.setItem('speechLanguage', speechLanguage);
		localStorage.setItem('speechRate', speechRate.toString());
		if (speechVoice) localStorage.setItem('speechVoice', speechVoice.name);

		// Test the settings object
		console.log('Saving settings to local storage:', {
			llmProvider,
			apiKey,
			speechLanguage,
			speechRate,
			speechVoice: speechVoice?.name || '',
		});
  }, [llmProvider, apiKey, speechLanguage, speechRate, speechVoice]);

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
