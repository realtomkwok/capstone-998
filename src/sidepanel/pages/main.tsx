/// <reference types="chrome"/>

import 'mdui';
import 'mdui/mdui.css';

import { LLMChat, LLMResponse, MsgBackgroundToSidepanel } from '@lib/interface';
import React, { useEffect, useContext } from 'react';
import { readText, startLLM } from '@lib/helper';
import { SettingsContext } from '@components/settings-context';

const Main = () => {
	const [chats, setChats] = React.useState<{
		[url: string]: LLMChat[];
	}>({});
	const [input, setInput] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
	const [currentUrl, setCurrentUrl] = React.useState<string | undefined>();

	const { speechVoice } = useContext(SettingsContext)!;

	useEffect(() => {
		// Notify the background script that the sidepanel is ready
		chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' });

		const messageListener = (message: MsgBackgroundToSidepanel) => {
			// Ensure the message contains a URL since it's a key of the chat list
			if (message.url) {
				if (message.type === 'UPDATE_URL') {
					setCurrentUrl(message.url);
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
			setIsPlaying(!isPlaying);
			!speechSynthesis.speaking
				? readText(text)
				: speechSynthesis.cancel();
		} else {
			console.log('No voice selected');
		}
	};

	// Create a new chat card
	const Chats: React.FC<
		React.HTMLAttributes<HTMLDivElement> & {
			input: string | undefined;
			output: LLMResponse;
		}
	> = ({ input, output }) => {
		const ChatHeader = ({ chatRole }: { chatRole: string }) => {
			return (
				<div className="flex justify-between items-center font-label-large uppercase text-secondary">
					<span>{chatRole}</span>
					<mdui-button-icon
						className="pl-2"
						icon={isPlaying ? 'pause' : 'volume_up'}
						onClick={() => handlePlay(output)}
					/>
				</div>
			);
		};

		return (
			<div className="flex flex-col gap-4">
				{input != '' && (
					<div className="flex flex-col gap-2">
						<ChatHeader chatRole="me" />
						<div className="flex flex-col items-start gap-2">
							<p className="text-body-large text-on-surface-variant">
								{input}
							</p>
						</div>
					</div>
				)}
				<div className="flex flex-col gap-2">
					<ChatHeader chatRole="clara" />
					<div className="flex flex-col items-start gap-2">
						<p className="text-headline-small text-on-surface-variant">
							{output}
						</p>
					</div>
				</div>
			</div>
		);
	};

	const LoadingState: React.FC = () => {
		useEffect(() => {
			const audio = new Audio(chrome.runtime.getURL('sounds/thinking.wav'));

			if (isLoading) {
				audio.play();
				audio.loop = true;
			} else {
				audio.pause();
			}
		}, [isLoading]);

		return (
			<div
				className="flex-col items-center justify-center gap-4"
				style={{ display: isLoading ? 'flex' : 'none' }}
			>
				<img
					src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20in%20Lotus%20Position.png"
					alt="Clara is thinking"
					className="w-1/2 h-1/2"
				/>
				<p className="typo-label-large">Clara is thinking...</p>
			</div>
		);
	};

	const BottomAppBar: React.FC<
		JSX.IntrinsicElements['mdui-bottom-app-bar']
	> = () => {
		const inputRef = React.useRef<HTMLInputElement>(null);
		const [inputValue, setInputValue] = React.useState<string>('');

		useEffect(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, [input]);

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(e.target.value);
		};

		const handleSend = async () => {
			if (inputValue.trim() && currentUrl) {
				setIsLoading(true);
				try {
					const response = await startLLM(currentUrl, inputValue);
					setChats((prevChats) => ({
						...prevChats,
						[currentUrl]: [
							...(prevChats[currentUrl] || []),
							{
								id: Date.now().toString(),
								input: inputValue,
								output: response,
							},
						],
					}));
				} catch (error) {
					console.error('Error starting LLM:', error);
				} finally {
					setIsLoading(false);
					setInputValue('');
				}
			}
		};

		return (
			<mdui-bottom-app-bar>
				<input
					ref={inputRef}
					type={'text'}
					value={inputValue}
					onChange={handleInputChange}
					placeholder={'Ask me anything!'}
					className="w-[calc(100%-5em)] h-full text-body-large text-on-surface-variant"
				/>
				{inputValue.length > 0 ? (
					<mdui-fab icon="send" onClick={handleSend} />
				) : (
					<mdui-fab icon="keyboard_voice" />
				)}
			</mdui-bottom-app-bar>
		);
	};

	const currentChats = currentUrl ? chats[currentUrl] || [] : [];

	return (
		<mdui-layout-main>
			<div
				className="overflow-scroll h-[calc(100vh-8rem)"
				id="scroll-container"
			>
				<div className="flex flex-col gap-4 p-4 divide-y">
					{currentChats.map((chat, index) => (
						<React.Fragment key={index}>
							<Chats
								input={chat.input}
								output={chat.output!}
								aria-label="Chat"
							/>
							<LoadingState />
						</React.Fragment>
					))}
				</div>
			</div>
			<BottomAppBar
				fab-detach
				scroll-behavior="hide"
				scroll-threshold={30}
				scroll-target="#scroll-container"
			/>
		</mdui-layout-main>
	);
};
export default Main;
