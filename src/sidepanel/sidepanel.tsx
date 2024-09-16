// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import { LLMResponse, MsgBackgroundToSidepanel } from '@lib/interface';
import Main from './pages/main';
import { MaterialSymbol } from '@components/material-symbol';
import { SettingsModal } from './pages/settings';

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
