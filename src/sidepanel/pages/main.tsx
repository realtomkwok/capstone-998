/// <reference types="chrome"/>

import 'mdui';
import 'mdui/mdui.css';

import { LLMChat, LLMProvider, LLMResponse } from '@lib/interface';
import React, { useEffect } from 'react';
import { startLLM } from '@lib/helper';

const Main = () => {
	const [chats, setChats] = React.useState<{ [url: string]: LLMChat[] }>({});
	const [input, setInput] = React.useState<string>('');
	const [llmProvider, setLlmProvider] = React.useState<LLMProvider>('openai');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [currentUrl, setCurrentUrl] = React.useState<string | undefined>();


	useEffect(() => {
		const handleMessage = (message: any) => {
			console.log('Received message:', message)

			if (message.type === 'UPDATE_RESPONSE' && currentUrl) {
				setChats((prevChats) => ({
					...prevChats,
					[currentUrl]: [
						{
							id: Date.now().toString(),
							input: message.input,
							output: message.response,
						},
							...(prevChats[currentUrl] || []),
					],
				}));
				setIsLoading(false);
			} else if (message.type === 'UPDATE_URL') {
				setCurrentUrl(message.url);
				setIsLoading(true);
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);

		return () => {
			chrome.runtime.onMessage.removeListener(handleMessage);
		};
	}, [currentUrl]);

	// Create a new chat card
	const ChatCard = (props: {
		input: string;
		output: LLMResponse;
		url: string;
	}) => {
		return (
			<mdui-card variant="filled">
				<div className={'w-full p-4 flex flex-col gap-4'}>
					<div className="flex flex-col gap-2 w-full">
						<div className="flex flex-row typo-body-large text-on-surface-variant gap-2 items-center w-full overflow-hidden overflow-ellipsis">
							<mdui-icon style={{fontSize: '18px'}} name='public' />
							<div className="overflow-auto overflow-ellipsis whitespace-nowrap max-w-full">{props.url}</div>
						</div>
						<div
							className={
								'typo-headline-small text-on-surface word-break'
							}
						>
							{props.output.answer || 'No answer available'}
						</div>
					</div>
					<div className={'flex flex-row gap-2 justify-end'}>
						<mdui-button-icon icon="download"></mdui-button-icon>
						<mdui-button-icon icon="volume_up"></mdui-button-icon>
					</div>
				</div>
			</mdui-card>
		);
	};

	// Create a wrapper for all chat cards
	const ChatsWrapper = ({
		chats,
		url,
	}: {
		chats: { [url: string]: LLMChat[] };
		url: string | undefined;
	}) => {
		console.log('Rendering with chats:', chats);
		const currentChats = url ? chats[url] || [] : [];

		return (
			<div className={'flex flex-col gap-8'}>
				{currentChats.map((chat) => (
					<ChatCard
						key={chat.id}
						url={url || ''}
						input={chat.input || ''}
						output={chat.output || { answer: 'No answer available.' }}
					/>
				))}
			</div>
		);
	};

	// Send a chat message to the chat list
	async function sendChat(input: string) {
		const fetchResponse = async (input: string): Promise<LLMResponse> => {
			// TODO: Replace `startLLM` with `getAnswerFromLLM` with chat history support: https://js.langchain.com/v0.2/docs/how_to/qa_chat_history_how_to/
			try {
				return await startLLM(input, llmProvider);
			} catch (error) {
				console.error('Error fetching response', error);
				return {
					answer: "I'm sorry, I couldn't find an answer for that.",
				};
			}
		};

		if (input != '' && currentUrl) {
			setInput('');
			setIsLoading(true);
			const output = await fetchResponse(input);
			setChats((prevChats) => ({
				...prevChats,
				[currentUrl]: [
					...(prevChats[currentUrl] || []),
					{
						id: Date.now().toString(),
						input: input,
						output: output,
					},
				],
			}));
			setIsLoading(false);
		} else {
			alert('Please enter a valid URL');
		}
	}

	return (
			<mdui-layout-main>
				<div className="m-4">
				</div>
				<div className={'p-4 chats-anchor'}>
					<ChatsWrapper chats={chats} url={currentUrl} />
				</div>
				{/*<mdui-bottom-app-bar*/}
				{/*	fab-detach*/}
				{/*	scroll-behavior="hide"*/}
				{/*	scroll-threshold={10}*/}
				{/*>*/}
				{/*	<input*/}
				{/*		type={'text'}*/}
				{/*		placeholder={'Type an URL here...'}*/}
				{/*		className={*/}
				{/*			' flex-auto text-body-medium text-on-surface-variant'*/}
				{/*		}*/}
				{/*		value={input}*/}
				{/*		onChange={(e) => setInput(e.target.value)}*/}
				{/*	/>*/}
				{/*	<div className={'flex-grow'} />*/}
				{/*	<mdui-fab*/}
				{/*		icon="send"*/}
				{/*		onClick={() => sendChat(input)}*/}
				{/*	></mdui-fab>*/}
				{/*</mdui-bottom-app-bar>*/}
			</mdui-layout-main>
			);
};
export default Main
