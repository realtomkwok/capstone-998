// src/pages/settings.tsx

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NavigationDrawer, TextField } from 'mdui';
import { validateApiKey } from '@components/validate-apiKey';
import { LLMProvider, SpeechLanguage } from '@lib/interface';

/**
 * Settings Modal Component
 * @param isOpen - 检查是否打开`SettingsModal`
 * @param onClose - 关闭`SettingsModal`
 * @returns - `SettingsModal`组件
 */

export const SettingsModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const settingsModalRef = useRef<NavigationDrawer>(null);

	const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');

    const [apiKey, setApiKey] = useState<string>('');
    const [isValidatingApiKey, setIsValidatingApiKey] = useState<boolean>(false);
    const [isTypingApiKey, setIsTypingApiKey] = useState<boolean>(false);
    
    const handleTestApiKey = async () => {
        const result = await validateApiKey(apiKey, llmProvider)
        
        if (result) {
            const textfield = document.querySelector('mdui-text-field');
            if (textfield) {
                textfield.setCustomValidity(result.msg)
            }
        }
    }

	const [speechLanguage, setSpeechLanguage] =
		useState<SpeechLanguage>('en-US');
	const [speechRate, setSpeechRate] = useState<number>(1);

	const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(
		null
	);

	const speechVoices: SpeechSynthesisVoice[] = speechSynthesis.getVoices(); // Get all voices
	const localVoices: SpeechSynthesisVoice[] = speechVoices.filter(
		(voice) => voice.lang === speechLanguage
	);

	useEffect(() => {
		setSpeechVoice(localVoices[0]);
	}, [speechLanguage]);

	function getProviderName(provider: string) {
		switch (provider) {
			case 'openai':
				return 'OpenAI';
			case 'anthropic':
				return 'Anthropic';
			default:
				return 'Unknown';
		}
	}

	function getLanguageName(language: string) {
		switch (language) {
			case 'en-US':
				return 'English (US)';
			case 'zh-CN':
				return 'Chinese (Mandarin)';
			default:
				return 'Unknown';
		}
	}

	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	function playGreeting() {
		if (!speechVoice) return;

		const greeting = (language: string) => {
			switch (language) {
				case 'en-US':
					return 'Hi, I am Clara. I can help you see the web.';
				case 'zh-CN':
					return '嗨，我是 Clara。我可以帮助你浏览网页更轻松。';
				default:
					return "Hi I'm Clara.";
			}
		};

		const utterance = new SpeechSynthesisUtterance(
			greeting(speechLanguage)
		);
		utterance.lang = speechLanguage;
		utterance.rate = speechRate;
		utterance.voice = speechVoice;
		utterance.onend = () => setIsPlaying(false);

		speechSynthesis.speak(utterance);
	}

	function handlePlayGreeting() {
		if (isPlaying) {
			setIsPlaying(false);
			speechSynthesis.cancel();
		} else {
			setIsPlaying(true);
			playGreeting();
		}
	}

	useEffect(() => {
		if (settingsModalRef.current) {
			// Control the 'open' property of the navigation drawer based on 'isOpen' state
			settingsModalRef.current.open = isOpen;
		}
	}, [isOpen]);

	return (
		<mdui-navigation-drawer
			ref={settingsModalRef}
			placement="right"
			close-on-esc
			close-on-overlay-click
			order={1}
		>
			<div className="flex flex-col p-4">
				<div className="flex flex-row items-center">
					<div className="typo-title-large self-center">Settings</div>
					<div className="flex-grow"></div>
					<mdui-button-icon
						icon="close"
						onClick={onClose}
						variant="tonal"
					></mdui-button-icon>
				</div>
			</div>
			<mdui-list>
				<mdui-list-subheader>LLM Providers</mdui-list-subheader>
				<div className="flex flex-col gap-6 px-4">
					<mdui-segmented-button-group
						className="border-outline"
						full-width
						selects="single"
						value={llmProvider}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setLlmProvider(
								e.target.value as 'openai' | 'anthropic'
							)
						}
					>
						<mdui-segmented-button
							className="border-outline border"
							onClick={() => setLlmProvider('openai')}
							value="openai"
						>
							OpenAI
						</mdui-segmented-button>
						<mdui-segmented-button
							className="border-outline border"
							onClick={() => setLlmProvider('anthropic')}
							value="anthropic"
						>
							Anthropic
						</mdui-segmented-button>
					</mdui-segmented-button-group>
					<div className="flex flex-col gap-2">
						<mdui-text-field
							variant="outlined"
							type="password"
							label="API Key"
							icon="key"
							toggle-password-button
							placeholder="sk-..."
							helper={`Enter your ${getProviderName(
								llmProvider
							)} API Key.`}
							// helper-on-focus
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setApiKey(e.target.value)
							}
							onFocus={() => setIsTypingApiKey(true)}
							onBlur={() => setIsTypingApiKey(false)}
						/>
						{isTypingApiKey && (
							<mdui-button
								style={{
									display: isTypingApiKey ? 'block' : 'none',
								}}
								variant="tonal"
								onClick={handleTestApiKey}
							>
								Test API Key
							</mdui-button>
						)}
					</div>
				</div>

				<mdui-list-subheader>Speech</mdui-list-subheader>
				<mdui-dropdown placement="bottom-start">
					<mdui-list-item
						rounded
						slot="trigger"
						icon="language"
						end-icon="arrow_drop_down"
						title="Language"
						headline="Language"
						description={getLanguageName(speechLanguage)}
					/>
					<mdui-menu style={{ transform: 'translateX(4em)' }}>
						{['en-US', 'zh-CN'].map((language) => (
							<mdui-menu-item
								key={language}
								value={language}
								selected-icon="check"
								onClick={() =>
									setSpeechLanguage(
										language as SpeechLanguage
									)
								}
							>
								{getLanguageName(language)}
							</mdui-menu-item>
						))}
					</mdui-menu>
				</mdui-dropdown>
				<mdui-dropdown placement="bottom-start">
                    <mdui-list-item
                        rounded
						slot="trigger"
						icon="record_voice_over"
						end-icon="arrow_drop_down"
						title="Voice"
						headline="Voice"
						description={speechVoice?.name || ''}
					/>
					<mdui-menu
						style={{
							transform: 'translateX(4em)',
							maxHeight: '20em',
							overflowY: 'auto',
						}}
					>
						{speechVoices
							.filter((voice) => voice.lang === speechLanguage)
							.map((voice) => (
								<mdui-menu-item
									key={voice.name}
									value={`${voice.name}_${voice.lang}`}
									selected-icon="check"
									onClick={() => setSpeechVoice(voice)}
								>
									{voice.name}
								</mdui-menu-item>
							))}
					</mdui-menu>
				</mdui-dropdown>
				<mdui-list-item nonclickable rounded headline='Speed' description={`${speechRate}x`} icon='speed' />
				<mdui-slider
					tickmarks
					value={speechRate}
					onInput={(e: ChangeEvent<HTMLInputElement>) =>
						setSpeechRate(parseFloat(e.target.value))
					}
					step={0.25}
					min={0.5}
					max={1.5}
				/>
			</mdui-list>
			<div className="flex flex-row p-4">
				<mdui-button
					icon={isPlaying ? 'pause' : 'play_arrow'}
					variant={isPlaying ? 'elevated' : 'tonal'}
					onClick={handlePlayGreeting}
				>
					{isPlaying ? 'Pause' : 'Play'}
				</mdui-button>
			</div>
		</mdui-navigation-drawer>
	);
};
