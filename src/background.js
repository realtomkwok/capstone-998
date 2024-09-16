'use strict';

// With background scripts you can communicate with sidepanel
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { startLLM } from "./lib/helper"

let lastProcessedUrl = '';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

// Read the URL of the current tab and initialize LLM
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'SIDEPANEL_READY') {
		chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
			if (tab && tab.url) {
				await handleTabChange(tab);
			}
		});
	}
});

async function handleTabChange(tab) {
	try {
		if (tab.url === lastProcessedUrl) {
			console.log('Same URL:', tab.url);
			return;
		}

		// Update lastProcessedUrl
		lastProcessedUrl = tab.url;

		await chrome.runtime.sendMessage({
			type: 'UPDATE_URL',
			url: tab.url,
		}).catch(error => {
			console.log('Error sending UPDATE_URL message:', error);
		});

		// Check if the URL is valid
		const urlPattern = new RegExp('^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$');
		
		// If valid URL, start LLM
		if (urlPattern.test(tab.url)) {
			const response = await startLLM(tab.url, 'openai');
			await chrome.runtime.sendMessage({
				type: 'UPDATE_RESPONSE',
				response: response,
			}).catch(error => {
				console.log('Error sending UPDATE_RESPONSE message:', error);
			}).finally(() => {
				console.log('LLM completed and response has been sent to sidepanel');
			});
		} else {
			console.log('Invalid URL:', tab.url);
		}
	} catch (error) {
		console.log(error);
	}
}


// New listener for tab updates
chrome.tabs.onUpdated.addListener((changeInfo, tab) => {
	if (changeInfo.url) {
		handleTabChange(tab);
	}
});