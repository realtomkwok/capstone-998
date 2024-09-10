// Import dependencies
import React, { useEffect, useState } from 'react';

import 'mdui';
import 'mdui/mdui.css';

// Import pages
import { LLMResponse, MsgBackgroundToSidepanel } from "@lib/interface"
import Main from "./pages/main";

const Sidepanel: React.FC = () => {
	const [url, setUrl] = React.useState<string | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [initResponse, setInitResponse] = useState<LLMResponse | undefined>(undefined)

	useEffect(() => {
		// Send SIDEPANEL_READY message when the sidepanel is ready
		chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' }).finally();

		// Set up listener for incoming messages
		const messageListener = (message: MsgBackgroundToSidepanel) => {
			if (message.type === 'UPDATE_URL') {
				setUrl(message.url)
				setIsLoading(true)
			} else if (message.type === 'UPDATE_RESPONSE') {
				setIsLoading(false)
				setInitResponse(message.response)
			}
		};

		chrome.runtime.onMessage.addListener(messageListener);

		// Cleanup the listener when the component unmounts
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	return (
		<mdui-layout full-height className={'font-medium'}>
			<mdui-top-app-bar>
				<mdui-button-icon icon="menu"></mdui-button-icon>
				<mdui-top-app-bar-title className="font-semibold">
					Clara Dev
				</mdui-top-app-bar-title>
				<mdui-button-icon icon="tune"></mdui-button-icon>
			</mdui-top-app-bar>
			<Main />
		</mdui-layout>
	);
};
export default Sidepanel;
