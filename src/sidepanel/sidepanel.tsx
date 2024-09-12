// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';
import './sidepanel.css';

// Import pages
import { LLMResponse } from "@lib/interface"
import Main from "./pages/main";
import SettingsPage from './pages/settings';

const Sidepanel: React.FC = () => {
	// TODO: set up state for chats
	const [url, setUrl] = React.useState<string | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [initResponse, setInitResponse] = useState<LLMResponse | undefined>(undefined);
	const [showSettings, setShowSettings] = useState<boolean>(false);

	useEffect(() => {
		// Send SIDEPANEL_READY message when the sidepanel is ready
		chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' }).finally();

		// Set up listener for incoming messages
		const messageListener = (message: any) => {
			if (message.type === 'UPDATE_URL') {
				setUrl(message.url);
				setIsLoading(true);
			} else if (message.type === 'UPDATE_RESPONSE') {
				setIsLoading(false);
				setInitResponse(message.response);
			}
		};

		chrome.runtime.onMessage.addListener(messageListener);

		// Cleanup the listener when the component unmounts
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	const toggleSettings = () => setShowSettings(!showSettings);

	return (
		<mdui-layout full-height className={'font-medium'}>
			<mdui-top-app-bar>
				<mdui-button-icon icon="menu"></mdui-button-icon>
				<mdui-top-app-bar-title className="font-semibold">
					Clara Dev
				</mdui-top-app-bar-title>
				<mdui-button-icon icon="tune" onClick={toggleSettings}></mdui-button-icon>
			</mdui-top-app-bar>
			{showSettings ? (
				<SettingsPage />
			) : (
				<Main />
			)}
		</mdui-layout>
	);
};

export default Sidepanel;
