'use strict';

import './sidepanel.css';
import { getAnswerFromLLM } from './lib/helper';

(function() {
	function container() {
		// Display the API keys for testing
		const button = document.getElementById('btn');
		let currentUrl
		document.getElementById('fireCrawlApiKey').innerText = process.env.FIRECRAWL_API_KEY
		document.getElementById('openAiApiKey').innerText = process.env.OPENAI_API_KEY

		// Get the current URL
		async function getCurrentTab() {
			let queryOptions = { active: true, currentWindow: true }
			let [tab] = await chrome.tabs.query(queryOptions)
			return tab
		}

		getCurrentTab().then(tab => {
			document.getElementById('currentUrl').innerText = tab.url
			currentUrl = tab.url
		})


		// Pressing the button will trigger the function
		button.addEventListener('click', async () => {
			const answer = await getAnswerFromLLM(await currentUrl);
			// Read the summary
			const summary = answer.response.summary;
			chrome.tts.speak(summary);
			document.getElementById('summary').innerText = summary;
			document.getElementById('answer').innerHTML = `
			<ul>
</ul>
			`;
		});

		// Stop the reading

	}

	document.addEventListener('DOMContentLoaded', () => {
		container();
	});

	// Communicate with background file by sending a message
	chrome.runtime.sendMessage(
		{
			type: 'GREETINGS',
			payload: {
				message: 'Hello from the sidepanel!',
			},
		},
		(response) => {
			console.log(response.message);
		},
	);

})();
