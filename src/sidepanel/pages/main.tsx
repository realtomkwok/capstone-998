/// <reference types="chrome"/>

import 'mdui';
import 'mdui/mdui.css';

import { LLMChat, LLMResponse, MsgBackgroundToSidepanel } from '@lib/interface';
import React, { useEffect, useContext } from 'react';
import { readText } from '@lib/helper';
import { RESPONSES } from '@lib/responses';
import { SettingsContext } from '@components/settings-context';

const Main = () => {
	const [chats, setChats] = React.useState<{ [url: string]: LLMChat[] }>({});
	const [input, setInput] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [currentUrl, setCurrentUrl] = React.useState<string | undefined>()
	
	const { speechVoice } = useContext(SettingsContext)!;
	
	useEffect(() => {
		// Notify the background script that the sidepanel is ready
		chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' });

		const messageListener = (message: MsgBackgroundToSidepanel) => {
			// Ensure the message contains a URL since it's a key of the chat list
			if (message.url) {
				if (message.type === 'UPDATE_URL') {
					setCurrentUrl(message.url);
					setIsLoading(!chats[message.url]);
				} else if (message.type === 'UPDATE_RESPONSE') {
					const updateMessage = message as {
						type: 'UPDATE_RESPONSE';
						response: LLMResponse;
						url: string;
					};
					setIsLoading(false);
					
					// Speak the response if the user has enabled text-to-speech
					if (speechVoice) {
						readText(updateMessage.response.answer).then(() => {
							console.log('Text-to-speech finished')
						})
					}
					
					// Add the response to the chat list if it doesn't exist
					setChats((prevChats) => {
						if (!prevChats[updateMessage.url]) {
							return {
								...prevChats,
								[updateMessage.url]: [
									{
										id: Date.now().toString(),
										input: '',
										output: updateMessage.response,
									},
								],
							};
						}
						return prevChats;
					});
				}
			}
		};

		// Add the listener to the runtime
		chrome.runtime.onMessage.addListener(messageListener);

		// Cleanup the listener when the component unmounts
		return () => chrome.runtime.onMessage.removeListener(messageListener);
	}, [])
	
	// Handle playing the text-to-speech
	const handlePlay = (text: string) => {
		if (speechVoice) {
			!speechSynthesis.speaking ? readText(text) : speechSynthesis.cancel()
		} else {
			console.log('No voice selected')
		}
	}
	
	// Create a new chat card
	const ChatCard: React.FC<
		React.HTMLAttributes<HTMLDivElement> & {
			url: string;
			output: LLMResponse;
		}
		> = ({ url, output }) => {
		console.log(output)

		return (
			<mdui-card
				variant="elevated"
				role="region"
				aria-label="Summary of the current webpage"
			>
				<div
					className={'w-full p-4 flex flex-col gap-4'}
					// role="generic"
				>
					<div className="flex flex-col gap-2 w-full" role="heading">
						<div className="flex flex-row typo-body-large text-on-surface-variant gap-2 items-center w-full overflow-hidden overflow-ellipsis">
							<mdui-icon
								style={{ fontSize: '18px' }}
								name="public"
							/>
							<div className="overflow-auto overflow-ellipsis whitespace-nowrap max-w-full">
								{url}
							</div>
						</div>
						<div
							className={
								'typo-headline-small text-on-surface word-break'
							}
						>
							{output.answer || RESPONSES.error.message}
						</div>
					</div>
					<div className={'flex flex-row gap-2 justify-end'}>
						<mdui-button-icon
							icon="volume_up"
							onClick={() => handlePlay(output.answer)}
						></mdui-button-icon>
					</div>
				</div>
			</mdui-card>
		);
	};

	// Create a wrapper for all chat cards
	const ChatsWrapper: React.FC<
		React.HTMLAttributes<HTMLDivElement> & {
			chats: { [url: string]: LLMChat[] };
			url: string | undefined;
		}
	> = ({ chats, url, ...props }) => {
		const currentChats = url ? chats[url] || [] : [];

		return (
			<div className={`flex flex-col gap-8 p-4 chats-anchor`} role="feed">
				{currentChats.map((chat) => (
					<ChatCard
						key={chat.id}
						url={url || ''}
						output={chat.output!}
						aria-label="Chat"
					/>
				))}
			</div>
		);
	};

	const BottomAppBar = () => {
		return (
			<mdui-bottom-app-bar>
				<input
					type={'text'}
					placeholder={'Type an URL here...'}
					className="flex-auto text-body-medium text-on-surface-variant"
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
			</mdui-bottom-app-bar>
		);
	};

	return (
		<mdui-layout-main>
			<ChatsWrapper chats={chats} url={currentUrl} />
		</mdui-layout-main>
	);
};
export default Main;
