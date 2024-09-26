'use strict';

// Communication between background script and sidepanel
// Should call the LLM when the sidepanel is ready
// The content should be refreshed when the tab is changed
// Prevent the same URL from being processed multiple times

import { startLLM } from './lib/helper';
import { urlPattern } from './lib/helper';
let processedUrls = {};

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

// Initialize processedUrls from storage
chrome.storage.local.get('processedUrls', (result) => {
	processedUrls = result.processedUrls || {};
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
		console.log('Starting LLM');
		const response = await startLLM(url, 'openai');
		processedUrls[url] = response;
		chrome.storage.local.set({ processedUrls: processedUrls }, () => {
			console.log('Stored processedUrls:', processedUrls);
		});
		await chrome.runtime.sendMessage({
			type: 'UPDATE_RESPONSE',
			response: response,
			url: url,
		});
		console.log('LLM completed and response sent to sidepanel already.');
	} catch (error) {
		console.error('Error handling new URL:', error);
	}
}
