'use strict';

// With background scripts you can communicate with sidepanel
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { getAnswerFromLLM } from './lib/helper';

// chrome.tabs.onCreated.addListener((tab) => {
// 	console.log('Tab created::', tab)
// 	if (tab.id) {
// 		console.log('Tab id::', tab.id)
// 		chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
// 			if (tabId === tab.id && changeInfo.url && tab.status !== 'unloaded') {
// 				console.log('URL retrieved::', changeInfo.url)
// 				getAnswerFromLLM(changeInfo.url).then((response) => {
// 					if (response) {
// 						chrome.runtime.sendMessage(tabId, {
// 							type: 'GET_ANSWER',
// 							answer: response
// 						})
// 					}
// 				})
// 			}
// 		})
// 	}
// })

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

// Read the URL of the current tab
chrome.tabs.onActivated.addListener(async () => {
	try {
		let queryOptions = { active: true, currentWindow: true };
		let [tab] = await chrome.tabs.query(queryOptions);
		if (tab.url) {
			await chrome.runtime.sendMessage({
				type: 'UPDATE_URL',
				url: tab.url,
			});
		}

	} catch (error) {
		console.error('Error::', error);
	}
});
