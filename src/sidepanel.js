'use strict';

import './sidepanel.css';
import { getAnswerFromLLM } from './lib/helper';

(async function() {
	async function app() {
		try {
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
				if (request.type === 'UPDATE_URL') {
					// Display the developer message in the sidepanel
					const devMessage = document.getElementById('devMessage');
					const currentUrl = request.url;
					const url = document.createElement('div');
					url.innerText = currentUrl;
					devMessage.appendChild(url);

					try {
						getAnswerFromLLM(currentUrl).then((response) => {
							if (response) {
								// Display the answer in the sidepanel
								const summary = document.getElementById('summary');
								summary.innerText = response.response.summary;
								devMessage.appendChild(document.createTextNode(`${response.metadata.toString()}`));
							}
						});
					} catch (error) {
						const errors = document.createElement('div');
						errors.className = 'error';
						devMessage.appendChild(errors);
						errors.innerHTML = `<p>Error: ${error}</p>`;
					}
				}
			})
		} catch (error) {
			console.error('Error::', error);
		}
	}

	// Render the app
	document.addEventListener('DOMContentLoaded', () => {
		app();
	})

})()
