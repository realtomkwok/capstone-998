import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { LLMProvider, SpeechLanguage } from '@lib/interface';
import { getStorage } from '@lib/storage';

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

	speechVoice: SpeechSynthesisVoice | undefined;
	setSpeechVoice: (voice: SpeechSynthesisVoice) => void;
}

export const SettingsContext = createContext<SettingsContextProps | undefined>(
	undefined
);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// Initialize settings with default values
	const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');
	const [apiKey, setApiKey] = useState<string>('');
	const [isValidatingApiKey, setIsValidatingApiKey] =
		useState<boolean>(false);
	const [isTypingApiKey, setIsTypingApiKey] = useState<boolean>(false);
	const [speechLanguage, setSpeechLanguage] =
		useState<SpeechLanguage>('en-US');
	const [speechRate, setSpeechRate] = useState<number>(1);
	const [speechVoice, setSpeechVoice] = useState<
		SpeechSynthesisVoice | undefined
	>(undefined);
	const storage = getStorage();

	// Load speech voices
	const fetchSpeechVoice = async () => {
		const storedSpeechVoiceURI: string = await storage.getItem(
			'speechVoiceURI'
		);
		const speechVoice = speechSynthesis
			.getVoices()
			.find((voice) => voice.voiceURI === storedSpeechVoiceURI);
		setSpeechVoice(speechVoice);
	};

	fetchSpeechVoice();

	// Load settings from local storage
	useEffect(() => {
		async function loadPreferences() {
			const storedLlmProvider: string = await storage.getItem(
				'llmProvider'
			);
			const storedApiKey: string = await storage.getItem('apiKey');
			const storedSpeechLanguage: string = await storage.getItem(
				'speechLanguage'
			);
			const storedSpeechRate: string = await storage.getItem(
				'speechRate'
			);
			const storedSpeechVoiceURI: string = await storage.getItem(
				'speechVoiceURI'
			);

			if (storedLlmProvider)
				setLlmProvider(storedLlmProvider as LLMProvider);
			if (storedApiKey) setApiKey(storedApiKey);
			if (storedSpeechLanguage)
				setSpeechLanguage(storedSpeechLanguage as SpeechLanguage);
			if (storedSpeechRate) setSpeechRate(parseInt(storedSpeechRate));
			if (storedSpeechVoiceURI)
				setSpeechVoice(
					speechSynthesis
						.getVoices()
						.find(
							(voice) => voice.voiceURI === storedSpeechVoiceURI
						)!
				);
		}
		loadPreferences();
	}, []);

	useEffect(() => {
		async function savePreferences() {
			try {
				await storage.setItem('llmProvider', llmProvider);
				await storage.setItem('apiKey', apiKey);
				await storage.setItem('speechLanguage', speechLanguage);
				await storage.setItem('speechRate', speechRate.toString());
				await storage.setItem(
					'speechVoiceURI',
					speechVoice?.voiceURI || undefined
				);
			} catch (error) {
				console.error('Failed to save preferences:', error);
			}
		}
		savePreferences();
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
