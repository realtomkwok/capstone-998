/// <reference types="chrome"/>

import 'mdui';
import 'mdui/mdui.css';

import { LLMChat, LLMResponse, MsgBackgroundToSidepanel } from '@lib/interface';
import React, { useEffect, useContext } from 'react';
import { readText } from '@lib/helper';
import { RESPONSES } from '@lib/responses';
import { SettingsContext } from '@components/settings-context';
import { MaterialSymbol } from '@components/material-symbol';

const Main = () => {
	const [chats, setChats] = React.useState<{
		[url: string]: LLMChat[];
	}>({});
	const [input, setInput] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [currentUrl, setCurrentUrl] = React.useState<string | undefined>();

	const { speechVoice } = useContext(SettingsContext)!;

	const handleInputChange = React.useCallback((value: string) => {
		setInput(value);
	}, []);

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
						readText(updateMessage.response).then(() => {
							console.log('Text-to-speech finished');
						});
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
	}, []);

	// Handle playing the text-to-speech
	const handlePlay = (text: string) => {
		if (speechVoice) {
			!speechSynthesis.speaking
				? readText(text)
				: speechSynthesis.cancel();
		} else {
			console.log('No voice selected');
		}
	};

	// Create a new chat card
	const ChatCard: React.FC<
		React.HTMLAttributes<HTMLDivElement> & {
			output: LLMResponse;
		}
	> = ({ output }) => {
		return (
			<div className="flex flex-col gap-2">
				{/*<div className="flex flex-row items-center">*/}
				{/*	<MaterialSymbol*/}
				{/*		symbol="stars"*/}
				{/*		fill={true}*/}
				{/*		weight={400}*/}
				{/*		grade={200}*/}
				{/*		opticalSize={20}*/}
				{/*		role="presentation"*/}
				{/*	/>*/}
				{/*	<div className="overflow-auto overflow-ellipsis whitespace-nowrap max-w-full">*/}
				{/*		<span className="typo-label-large uppercase">Summary</span>*/}
				{/*	</div>*/}
				{/*</div>*/}
				<mdui-card
					variant="elevated"
					role="region"
					aria-label="Summary of the current webpage"
				>
					<div
						className={'w-full p-4 flex flex-col gap-4'}
						// role="generic"
					>
						<div
							className="flex flex-col gap-2 w-full"
							role="heading"
						>
							<div className="flex flex-row typo-body-large text-on-surface-variant gap-2 items-center w-full overflow-hidden overflow-ellipsis"></div>
							<div
								className={
									'typo-headline-small text-on-surface word-break'
								}
							>
								{output || RESPONSES.error.message}
							</div>
						</div>
						<div className={'flex flex-row gap-2 justify-end'}>
							<mdui-button-icon
								icon="volume_up"
								onClick={() => handlePlay(output)}
							></mdui-button-icon>
						</div>
					</div>
				</mdui-card>
			</div>
		);
	};

	// Create a wrapper for all chat cards
	const ChatsWrapper: React.FC<
		React.HTMLAttributes<HTMLDivElement> & {
			chats: {
				[url: string]: LLMChat[];
			};
			url: string | undefined;
		}
	> = ({ chats, url, ...props }) => {
		const currentChats = url ? chats[url] || [] : [];

		return (
			<div className={`flex flex-col gap-8 p-4 h-[calc(100%-80px)] chats-anchor`} role="feed">
				{currentChats.map((chat) => (
					<ChatCard
						key={chat.id}
						output={chat.output!}
						aria-label="Chat"
					/>
				))}
			</div>
		);
	};
	
	const LoadingState: React.FC = () => {
		return (
			<div
				className="flex-col items-center justify-center gap-4"
				style={{ display: isLoading ? 'flex' : 'none' }}
			>
				<img
					src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20in%20Lotus%20Position.png"
					alt="Clara is thinking"
					className="w-1/2 h-1/2 scale-x-[-1]"
				/>
				<p className="typo-label-large">
					Clara is thinking...
				</p>
			</div>
		);
	};

	const BottomAppBar = () => {
		const inputRef = React.useRef<HTMLInputElement>(null);

		useEffect(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, [input]);

		return (
			<mdui-bottom-app-bar fab-detach>
				<input
					type={'text'}
					placeholder={'Ask me anything!'}
					className="w-[calc(100%-5em)] h-full text-body-large text-on-surface-variant"
				/>
				<mdui-fab icon="keyboard_voice" />
			</mdui-bottom-app-bar>
		);
	};

	return (
		<mdui-layout-main>
			<div className="flex flex-col items-center">
				<LoadingState />
				<ChatsWrapper chats={chats} url={currentUrl} />
			</div>
			<BottomAppBar />
		</mdui-layout-main>
	);
};
export default Main;
