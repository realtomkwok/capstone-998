// Import dependencies
import React, { useEffect, useRef, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import { LLMProvider, LLMResponse, MsgBackgroundToSidepanel } from "@lib/interface"
import Main from './pages/main';
import { MaterialSymbol } from '@components/material-symbol';
import { NavigationDrawer } from 'mdui';

/**
 * Settings Modal Component
 * @param isOpen - Whether the modal is open
 * @param onClose - Function to close the modal
 * @returns Settings Modal Component
 */

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
	isOpen,
	onClose,
}) => {
	const settingsModalRef = useRef<NavigationDrawer>(null);

	const [llmProvider, setLlmProvider] = useState<string>('openai');

	const getProviderName = (provider: string) => {
		switch (provider) {
			case 'openai':
				return 'OpenAI';
			case 'anthropic':
				return 'Anthropic';
			default:
				return 'Unknown';
		}
	};

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
			<div className="p-4 flex flex-col gap-4">
				<div className="flex flex-row items-center">
					<div className="typo-title-large self-center">Settings</div>
					<div className="flex-grow"></div>
					<mdui-button-icon
						icon="close"
						onClick={onClose}
						variant="tonal"
					></mdui-button-icon>
				</div>
				{/*	Setting Content: LLM providers, speech, language, pitch, etc*/}
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-5">
						<div className="flex flex-col">
							<p className="typo-title-medium mb-4">
								LLM Providers
							</p>
							<mdui-segmented-button-group
								className="border-outline"
								full-width
								selects="single"
								value="openai"
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
						</div>
						<mdui-text-field
							variant="outlined"
							type="password"
							label="API Key"
							toggle-password
							placeholder="sk-..."
							helper={`Enter your ${getProviderName(
								llmProvider
							)} API Key.`}
							helper-on-focus
						/>
					</div>
					<div className="flex flex-col gap-5">
						<div className="flex flex-col">
							<p className="typo-title-medium mb-4">
								Speech
							</p>
							<mdui-select label="Language" value="en-US">
								<mdui-menu-item value="en-US">English (US)</mdui-menu-item>
								<mdui-menu-item value="zh-CN">Chinese (Mandarin)</mdui-menu-item>
							</mdui-select>
							<mdui-slider tickmarks step={10}/>
							<mdui-slider />
						</div>
					</div>
				</div>
			</div>
		</mdui-navigation-drawer>
	);
};

const TopAppBar: React.FC<{ onOpenSettings: () => void }> = ({
	onOpenSettings,
}) => {
	return (
		<mdui-top-app-bar variant="small">
			<MaterialSymbol
				symbol="family_star"
				fill={true}
				weight={400}
				grade={200}
				opticalSize={24}
			/>
			<mdui-top-app-bar-title className="font-semibold">
				Clara Dev
			</mdui-top-app-bar-title>
			<mdui-button-icon
				icon="tune"
				onClick={onOpenSettings}
				aria-label="Open Settings"
				className="mr-4"
			></mdui-button-icon>
		</mdui-top-app-bar>
	);
};

const Sidepanel: React.FC = () => {
	// TODO: set up state for chats
	const [url, setUrl] = React.useState<string | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [initResponse, setInitResponse] = useState<LLMResponse | undefined>(
		undefined
	);

	// State to control the visibility of the settings modal
	const [showSettings, setShowSettings] = useState<boolean>(false);

	useEffect(() => {
		// Notify the background script that the sidepanel is ready
		chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' }).finally();

		// Set up listener for incoming messages
		const messageListener = (message: MsgBackgroundToSidepanel) => {
			if (message.type === 'UPDATE_URL') {
				setUrl(message.url);
				setIsLoading(true);
			} else if (message.type === 'UPDATE_RESPONSE') {
				setIsLoading(false);
				setInitResponse(message.response);
			}
		};

		// Add the listener to the runtime
		chrome.runtime.onMessage.addListener(messageListener);

		// Cleanup the listener when the component unmounts
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	// Handler to toggle the settings modal
	const toggleSettingsModal = () => setShowSettings((prev) => !prev);

	return (
		<mdui-layout full-height className={'font-medium'}>
			{/* Top App Bar */}
			<TopAppBar onOpenSettings={toggleSettingsModal} />
			{/* Main Content Area*/}
			<section className="scroll-target h-full">
				<Main />
			</section>
			{/* Settings Modal */}
			<SettingsModal
				isOpen={showSettings}
				onClose={toggleSettingsModal}
			/>
		</mdui-layout>
	);
};
export default Sidepanel;
