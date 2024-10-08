// src/pages/settings.tsx

import React, {
	ChangeEvent,
	useEffect,
	useContext,
	useState,
	useRef,
} from 'react';
import { SettingsContext } from '@components/settings-context';
import { validateApiKey } from '@components/validate-apiKey';
import { LLMProvider, SpeechLanguage } from '@lib/interface';
import AccessibleButtonIcon from '@components/accessible/ButtonIcon';
import AccessibleNavigationDrawer from '@components/accessible/NavigationDrawer';
import { NavigationDrawer, TextField } from "mdui"
import { LLM_PROVIDERS, PREFERENCES_DRAWER } from '@lib/accessible-labels';
import { clearProcessedUrls } from '@lib/helper';
import { getStorage } from "@lib/storage"

/**
 * Settings Modal Component
 * @param isOpen - Check if the `SettingsModal` is open
 * @param onClose - Close`SettingsModal`
 * @returns - `SettingsModal` component
 */

export const SettingsModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const navigationDrawerRef = useRef<NavigationDrawer>(null);
	const speechVoices = speechSynthesis.getVoices();
	const storage = getStorage()
	
	const {
		llmProvider, 
		setLlmProvider,
		apiKey,
		setApiKey,
		isValidatingApiKey,
		setIsValidatingApiKey,
		speechLanguage,
		setSpeechLanguage,
		speechRate,
		setSpeechRate,
		speechVoice,
		setSpeechVoice,
	} = useContext(SettingsContext)!;

	// LLM configuration
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

	// LLM API Key
	useEffect(() => {
		const textfield = document.getElementById('api-key') as TextField;
		textfield.addEventListener('input', (e) => {
			setApiKey((e.target as HTMLInputElement).value);
		})
	}, [apiKey]);
	
	async function handleApiKey(apiKey: string, provider: LLMProvider) {
		if (apiKey) {
			setIsValidatingApiKey(true);
			await validateApiKey(apiKey, provider)
				.then((result) => {
					const textfield = document.getElementById('api-key') as TextField;
					if (result.isValid) {
						storage.setItem('apiKey', apiKey)
						textfield.helper = result.msg;
					} else {
						textfield.setCustomValidity(result.msg);
					}
			})
				.finally(() => setIsValidatingApiKey(false));
		}
	}

	// Speech configuration
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
	
	async function handleSpeechVoice(voiceURI: string) {
			const voice = speechVoices.find((voice) => voice.voiceURI === voiceURI)
			if (voice) {
				setSpeechVoice(voice);
				await storage.setItem('speechVoiceURI', voiceURI)
			}
	}

	return (
		<AccessibleNavigationDrawer
			navigationDrawerRef={navigationDrawerRef}
			isOpen={isOpen}
			accessibility={{
				role: PREFERENCES_DRAWER.role,
				ariaLabel: PREFERENCES_DRAWER.ariaLabel,
				ariaLabelledBy: PREFERENCES_DRAWER.ariaLabelledBy,
				ariaDescription: PREFERENCES_DRAWER.ariaDescription,
			}}
			placement="right"
			close-on-esc
			close-on-overlay-click
			order={1}
		>
			<div
				className="flex flex-row items-center p-4"
				role="toolbar"
				aria-label="Preferences"
			>
				<h1
					className="typo-title-large self-center"
					id="settings-title"
				>
					Preferences
				</h1>
				<div className="flex-grow"></div>
				<AccessibleButtonIcon
					icon="close"
					onClick={onClose}
					variant="tonal"
					ariaLabel="Close preferences menu"
					ariaDescription="Press Enter to close the preferences menu."
					tabIndex={0}
				></AccessibleButtonIcon>
			</div>
			<mdui-list role="list" aria-label="Preference controls">
				<mdui-list-subheader
					className="uppercase"
					role="heading"
					aria-label={LLM_PROVIDERS.ariaLabel}
					aria-description={LLM_PROVIDERS.ariaDescription}
				>
					LLM Providers
				</mdui-list-subheader>
				<div className="flex flex-col gap-4 px-4">
					<mdui-segmented-button-group
						full-width
						selects="single"
						value={llmProvider}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setLlmProvider(
								e.target.value as LLMProvider
							)
						}
						role="group"
						aria-label={LLM_PROVIDERS.ariaLabel}
						aria-description={LLM_PROVIDERS.ariaDescription}
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
					<mdui-text-field
						id="api-key"
						variant="outlined"
						type="password"
						label="API Key"
						icon="key"
						value={apiKey}
						toggle-password
						helper={`Enter your ${getProviderName(llmProvider)} API Key.`}
					/>
					<mdui-button
						variant="tonal"
						loading={isValidatingApiKey}
						onClick={() => handleApiKey(apiKey, llmProvider)}
					>
						Test API Key
					</mdui-button>
				</div>
			</mdui-list>
			<mdui-list>
				<mdui-list-subheader
					className="uppercase"
					role="heading"
					aria-label="Speech"
				>
					Speech
				</mdui-list-subheader>
				<div className="flex flex-col px-2">
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
								.filter(
									(voice) => voice.lang === speechLanguage
								)
								.map((voice) => (
									<mdui-menu-item
										key={voice.name}
										value={voice.voiceURI}
										selected-icon="check"
										onClick={() => handleSpeechVoice(voice.voiceURI)}
									>
										{voice.name}
									</mdui-menu-item>
								))}
						</mdui-menu>
					</mdui-dropdown>
					<mdui-list-item
						nonclickable
						rounded
						headline="Speed"
						description={`${speechRate}x`}
						icon="speed"
					/>
					<mdui-slider
						style={{ marginBottom: '1em' }}
						tickmarks
						value={speechRate}
						onInput={(e: ChangeEvent<HTMLInputElement>) =>
							setSpeechRate(parseFloat(e.target.value))
						}
						step={0.25}
						min={0.5}
						max={1.5}
					/>
					<mdui-button
						style={{ margin: '0.5em' }}
						full-width
						icon={isPlaying ? 'pause' : 'play_arrow'}
						variant={isPlaying ? 'elevated' : 'tonal'}
						onClick={handlePlayGreeting}
					>
						{isPlaying ? 'Pause' : 'Play'}
					</mdui-button>
					<mdui-button
						style={{ margin: '0.5em' }}
						full-width
						icon="delete"
						variant="text"
						color="error"
						onClick={clearProcessedUrls}
					>
						Clear Processed URLs
					</mdui-button>
				</div>
			</mdui-list>
		</AccessibleNavigationDrawer>
	);
};
