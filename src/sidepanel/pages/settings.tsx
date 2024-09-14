// // src/pages/settings.tsx
// // TODO: 1. Refactor the SettingPage with options to change the LLM provider, speech language, and speed.
// //       2. Move the readText function to `helper.ts` and import it here.
//
//
// import React, {useEffect, useState} from 'react';
// import {readText} from '@lib/helper';
// import '../settings.css';
//
// // const jsonData = {
// // 	message: "Hello, this is a test message!",
// // 	author: "ChatGPT",
// // 	timestamp: "2024-09-11T10:00:00Z"
// // };
//
// const SettingsPage: React.FC = () => {
// 	const [apiKey, setApiKey] = React.useState<string | undefined>(undefined);
// 	const [llmProvider, setLlmProvider] = React.useState('openai');
// 	const [threshold, setThreshold] = React.useState(0.5);
// 	const [purpose, setPurpose] = React.useState('');
// 	const [currentUrl, setCurrentUrl] = useState('');
// 	const [isReading, setIsReading] = useState(false); //
//
// 	useEffect(() => {
// 		// 获取当前页面的 URL
// 		const url = window.location.href;
// 		setCurrentUrl(url);
// 	}, []);
//
// 	const handleConfirm = () => {
// 		// Handle confirm action
// 		console.log('Settings confirmed:', { apiKey, language, threshold, purpose });
// 		if (!isReading) {
// 			const textToRead = jsonData.message; // 从 JSON 数据中提取需要朗读的文本
// 			setIsReading(true); // 防止重复点击
// 			readText(textToRead);
// 			setIsReading(false); // 朗读完成后重置状态
// 		}
// 	};
//
// 	const handleCancel = () => {
// 		// Handle cancel action
// 		console.log('Settings canceled');
// 	};
//
// 	return (
// 		<div id="settings" className="settings">
// 			<h1>Settings</h1>
// 			<label htmlFor="apiKey">Token:</label>
// 			<input
// 				type="text"
// 				id="apiKey"
// 				name="apiKey"
// 				value={apiKey}
// 				onChange={(e) => setApiKey(e.target.value)}
// 			/>
// 			<label htmlFor="language">Language:</label>
// 			<select
// 				id="language"
// 				name="language"
// 				value={language}
// 				onChange={(e) => setLanguage(e.target.value)}
// 			>
// 				<option value="cn">Chinese</option>
// 				<option value="en">English</option>
// 			</select>
// 			<label htmlFor="threshold">Speed:</label>
// 			<input
// 				type="range"
// 				id="threshold"
// 				name="threshold"
// 				min="0"
// 				max="1"
// 				step="0.1"
// 				value={threshold}
// 				onChange={(e) => setThreshold(parseFloat(e.target.value))}
// 			/>
// 			<label htmlFor="purpose">Purpose:</label>
// 			<input
// 				type="text"
// 				id="purpose"
// 				name="purpose"
// 				value={purpose}
// 				onChange={(e) => setPurpose(e.target.value)}
// 			/>
// 			<div className="buttons">
// 				<button type="button" id="confirmButton" onClick={handleConfirm}>Confirm</button>
// 				<button type="button" id="cancelButton" onClick={handleCancel} className="cancel">Cancel</button>
// 			</div>
// 			<div>
// 				<label>Current Page URL:</label>
// 				<input
// 					type="text"
// 					value={currentUrl}
// 					readOnly
// 					className="url-input"
// 				/>
// 			</div>
// 		</div>
// 	);
// };
//
// export default SettingsPage;
