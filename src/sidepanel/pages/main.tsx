/// <reference types="chrome"/>

import 'mdui';
import 'mdui/mdui.css';

import { LLMChat, LLMProvider, LLMResponse } from '@lib/interface';
import React, { useEffect } from 'react';
import { startLLM } from '@lib/helper';

const Main = (props: {
	url: string | undefined;
	isLoading: boolean;
	initResponse: LLMResponse | undefined;
}) => {
	const [chats, setChats] = React.useState<LLMChat[]>([]);
	const [input, setInput] = React.useState('');
	const [llmProvider, setLlmProvider] = React.useState<LLMProvider>('openai');
	const [isLoading, setIsLoading] = React.useState(props.isLoading);

	useEffect(() => {
		if (
			props.url &&
			props.initResponse &&
			!isLoading &&
			chats.length === 0
		) {
			setChats([
				{
					id: Date.now().toString(),
					input: props.url,
					output: props.initResponse,
				},
			]);
			setIsLoading(false);
		}
	}, [props.url, props.isLoading, llmProvider]);

	// Create a new chat card
	const ChatCard = (props: {
		input: string;
		output: LLMResponse;
		url: string;
	}) => {
		return (
			<mdui-card variant="filled" clickable>
				<div className={'w-full p-4'}>
					<div>
						<h2
							className={
								'typo-headline-medium text-left text-on-surface'
							}
						>
							{props.output.answer || 'No answer available'}
						</h2>
						<p
							className={
								'my-1 typo-body-large text-left text-on-surface-variant'
							}
						>
							{props.url}
						</p>
					</div>
					<div className={'flex flex-col gap-2'}>
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
		chats: LLMChat[];
		url: string | undefined;
	}) => {
		console.log('Rendering with chats:', chats);
		return (
			<div className={'flex gap-8'}>
				{chats.map((chat) => (
					// TODO: `url` should be replaced by user's input
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

		if (input != '') {
			setInput('');
			setIsLoading(true);
			const output = await fetchResponse(input);
			setChats((prevChats) => [
				...prevChats,
				{
					id: Date.now().toString(),
					input: input,
					output: output,
				},
			]);
			setIsLoading(false);
		} else {
			alert('Please enter a valid URL');
		}
	}

	return (
		<>
			<mdui-layout-main>
				<div className="m-4">
					<mdui-segmented-button-group
						id="segmented-button-group"
						full-width
						selects="single"
						value="openai"
					>
						<mdui-segmented-button
							onClick={() => setLlmProvider('openai')}
							value="openai"
							className="controls-border"
						>
							OpenAI
						</mdui-segmented-button>
						<mdui-segmented-button
							onClick={() => setLlmProvider('anthropic')}
							value="anthropic"
							className="controls-border"
						>
							Anthropic
						</mdui-segmented-button>
					</mdui-segmented-button-group>
				</div>
				<div className={'p-4 chats-anchor'}>
					<ChatsWrapper chats={chats} url={props.url} />
				</div>
			</mdui-layout-main>

			<mdui-bottom-app-bar
				fab-detach
				scroll-behavior="hide"
				scroll-threshold={10}
			>
				<input
					type={'text'}
					placeholder={'Type an URL here...'}
					className={
						' flex-auto text-body-medium text-on-surface-variant'
					}
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<div className={'flex-grow'} />
				<mdui-fab
					icon="send"
					onClick={() => sendChat(input)}
				></mdui-fab>
			</mdui-bottom-app-bar>
		</>
	);
};
export default Main
