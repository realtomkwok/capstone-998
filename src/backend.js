let tabsReady = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.tab) {
        tabsReady[sender.tab.id] = true;
        console.log(`Tab ${sender.tab.id} is ready.`);
    }

    if (message.html && sender.tab) {
        processMessage(message.html, sender.tab.id);
    }
});

function processMessage(html, tabId) {
    const jsonData = JSON.stringify({ html: html });
    console.log("Sending this data to the server:", jsonData);
    fetch('http://ec2-13-55-69-254.ap-southeast-2.compute.amazonaws.com/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const website = data.response.website;
            const summary = data.response.summary;
            sendMessageWithRetry(tabId, { website, summary }, 5, 1000);
        })
        .catch(error => console.error('Error:', error));
}

function sendMessageWithRetry(tabId, data, retries, delay) {
    if (tabsReady[tabId]) {
        chrome.tabs.sendMessage(tabId, { data: data }).catch(error => {
            console.error('Error sending message:', error);
        });
        console.log(`Message sent to tab ${tabId}.`);
    } else if (retries > 0) {
        console.log(`Content script not ready for tab ${tabId}, retrying in ${delay}ms...`);
        setTimeout(() => {
            sendMessageWithRetry(tabId, data, retries - 1, delay);
        }, delay);
    } else {
        console.log(`Failed after retry: Content script still not ready for tab ${tabId}.`);
    }
}

chrome.tabs.onRemoved.addListener(tabId => {
    delete tabsReady[tabId];
    console.log(`Tab ${tabId} removed.`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        delete tabsReady[tabId];
        console.log(`Tab ${tabId} reloading, resetting readiness.`);
    }
});
