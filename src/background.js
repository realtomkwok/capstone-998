'use strict';

// With background scripts you can communicate with sidepanel
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { startLLM } from "./lib/helper"

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

let lastProcessedUrl = ''

async function handleTabChange(tab) {
	try {
		if (tab.url === lastProcessedUrl) {
			console.log('Same URL:', tab.url);
			return;
		}

		await chrome.runtime.sendMessage({
			type: 'UPDATE_URL',
			url: tab.url,
		}).catch(error => {
			console.log('Error sending UPDATE_URL message:', error);
		});

		const urlPattern = new RegExp('^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$');

		if (urlPattern.test(tab.url)) {
			const response = await startLLM(tab.url, 'openai');
			await chrome.runtime.sendMessage({
				type: 'UPDATE_RESPONSE',
				response: response,
			}).catch(error => {
				console.log('Error sending UPDATE_RESPONSE message:', error);
			});
		} else {
			console.log('Invalid URL:', tab.url);
		}
	} catch (error) {
		console.error('Error in handleTabChange:', error);
	}
}


// New listener for tab updates
chrome.tabs.onUpdated.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
		if (tab && tab.url) {
			await handleTabChange(tab);
		}
	});
});