import {getAnswerFromLLM} from "./lib/helpers";

console.log("Content script loaded.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed.");
    chrome.runtime.sendMessage({ html: document.documentElement.outerHTML });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message, 'from sender:', sender);
    if (message.data) {
        const website = message.data.website;
        const summary = message.data.summary;
        console.log(`Website: ${website}`);
        console.log(`Summary: ${summary}`);
        speakText(`Website: ${website}. Summary: ${summary}`);
    }
});


function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}
