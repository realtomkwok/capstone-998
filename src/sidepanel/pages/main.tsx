import React from 'react';
import { LLMProvider, LLMResponse } from '@lib/interface';
import { getAnswerFromLLM } from '@lib/helper';

import 'mdui';
import 'mdui/mdui.css';

const Main = () => {
	const [chats, setChats] = React.useState<LLMResponse[] | never[]>([]);
	const [input, setInput] = React.useState('');
	const [status, setStatus] = React.useState('idle');
	const [llmProvider, setLlmProvider] = React.useState<LLMProvider>('openai');

	// Create a new chat card
	const ChatCard = (props: { url: string; llmProvider: LLMProvider }) => {
		const [res, setRes] = React.useState<LLMResponse>();

		getAnswerFromLLM(props.url, props.llmProvider).then((res) =>
			setRes(res)
		);

		return (
			<mdui-card variant="filled" clickable>
				<div className={'w-full p-4'}>
					<div>
						<h2
							className={
								'typo-headline-medium text-left text-on-surface'
							}
						>
							{res?.response.summary}
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
	const ChatsWrapper = () => {
		return (
			<div className={'flex gap-8'}>
				{chats.map((res, index) => (
					// TODO: `url` should be replaced by user's input
					<ChatCard
						key={index}
						url={input}
						llmProvider={llmProvider}
					/>
				))}
			</div>
		);
	};

	// If no chats, show welcome message
	const EmptyState = () => {
		return (
			<div>
				<p className="text-left text-display-large font-display-large text-on-surface leading-display-large tracking-display-large">
					Hi! I'm Clara!
				</p>
				<p
					className={
						'font-normal text-on-surface-variant text-display-medium leading-display-medium tracking-display-medium'
					}
				>
					How can I help you today?
				</p>
			</div>
		);
	};

	// Send a chat message to the chat list
	const sendChat = async (input: string) => {
		if (input != '') {
			setInput('');

			await getAnswerFromLLM(input, llmProvider).then((res) =>
				setChats([...chats, res])
			);
		} else {
			alert('Please enter a valid URL');
		}
	};

	return (
		<>
			<mdui-layout-main>
				<div className={'p-4 chats-anchor'}>
					{chats.length === 0 ? <EmptyState /> : <ChatsWrapper />}
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

export default Main;
