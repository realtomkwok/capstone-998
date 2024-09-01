// Import dependencies
import React from 'react';

import 'mdui';
import 'mdui/mdui.css';
import '@components/sidepanel/sidepanel.css';
import { getAnswerFromLLM } from '@lib/helper';

const ChatInput: React.FC = () => {
	return (
		<input type={'text'} className={'chat-input'}
		       placeholder={'Type a message...'} />
	);
};

function downloadResponse(content: string, fileName: string = 'json.txt', contentType: string = 'text/plain') {
	let a = document.createElement('a');
	let file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

function getAnswer(url: string) {
	getAnswerFromLLM(url).then((response) => {
		downloadResponse(JSON.stringify(response));

		console.log(response);
	});
}

const Sidepanel: React.FC = () => {
	return (
		<mdui-layout full-height={true}>
			<mdui-top-app-bar>
				<mdui-button-icon icon="menu"></mdui-button-icon>
				<mdui-top-app-bar-title>Clara</mdui-top-app-bar-title>
				<mdui-button-icon icon="tune"></mdui-button-icon>
			</mdui-top-app-bar>
			<mdui-bottom-app-bar fab-detach scroll-behavior="hide"
			                     scroll-threshold={10} className="btm-app-bar">
				<ChatInput />
				<div style={{ flexGrow: 1 }}></div>
				<mdui-fab icon="send"
				          onClick={() => getAnswer('https://abc.net.au/news')}></mdui-fab>
			</mdui-bottom-app-bar>

			<div className="chats-anchor">
				<div className="cards-container"></div>
			</div>
		</mdui-layout>
	);
};

export default Sidepanel;
