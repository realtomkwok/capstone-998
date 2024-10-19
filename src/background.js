'use strict';

// Communication between background script and sidepanel
// Should call the LLM when the sidepanel is ready
// The content should be refreshed when the tab is changed
// Prevent the same URL from being processed multiple times

import { readText, startLLM, urlPattern} from './lib/helper';
import { INIT_PROMPT } from "./lib/prompts"
import { getStorage } from './lib/storage';
import { RESPONSES } from './lib/responses';

let processedUrls = {};
const storage = getStorage();

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

// Initialize processedUrls from storage
await storage.setItem('processedUrls', {}).then(() => {
	console.log('Initialized processedUrls:', processedUrls);
});

// Read the URL of the current tab and initialize LLM
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'SIDEPANEL_READY') {
		console.log('Sidepanel ready message received');
		updateCurrentTab();
	}
});

// Listen for tab changes
chrome.tabs.onActivated.addListener(updateCurrentTab);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		console.log('Tab updated with new URL:', changeInfo.url);
		updateCurrentTab();
	}
});

async function updateCurrentTab() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab && tab.url && urlPattern.test(tab.url)) {
			console.log('Current tab URL:', tab.url);
			console.log('Processed URLs:', Object.keys(processedUrls));

			await chrome.runtime.sendMessage({
				type: 'UPDATE_URL',
				url: tab.url,
			})

			if (!processedUrls[tab.url]) {
				console.log('URL not processed before, handling new URL');
				await handleNewUrl(tab.url);
			} else {
				console.log('URL already processed');
			}
		}
	} catch (error) {
		console.error('Error updating current tab:', error);
	}
}

async function handleNewUrl(url) {
	console.log('Handling new URL:', url);
	await chrome.runtime
		.sendMessage({
			type: 'UPDATE_URL',
			url: url,
		})
		.catch((error) => {
			console.log('Error sending UPDATE_URL message:', error);
		});

	try {
		const response = await startLLM(url, INIT_PROMPT);
		processedUrls[url] = response;
		await chrome.runtime.sendMessage({
			type: 'UPDATE_RESPONSE',
			response: response,
			url: url,
		});
		chrome.storage.local.set({ processedUrls: processedUrls }, () => {
			console.log(response);
		});

		// Play notification sound
		const successSound = new Audio(chrome.runtime.getURL('sounds/success.wav'));
		successSound.play();

		// Read out the LLM response
		readText(response);
	} catch (error) {
		console.error('Error handling new URL:', error);
		const errorSound = new Audio(chrome.runtime.getURL('sounds/error.wav'));
		errorSound.play();
		readText(RESPONSES.error.message);
	}
}