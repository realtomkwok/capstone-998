// TODO: Add a hotkey command to trigger the extension and initial prompt
import {getAnswerFromLLM} from "./lib/helpers";

document.getElementById('confirmButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
            if (tabs[0].url.startsWith('http://') || tabs[0].url.startsWith('https://')) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: getAnswerFromLLM(tabs[0].url)
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error injecting script: ", chrome.runtime.lastError.message);
                    } else {
                        console.log("Script injected successfully.", results);
                    }
                });
            } else {
                console.error("Cannot inject scripts into pages with this URL schema: " + tabs[0].url);
            }
        } else {
            console.error("No accessible tab or URL found.");
        }
    })
})