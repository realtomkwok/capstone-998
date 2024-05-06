document.getElementById('sendHtml').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: getPageHtml
        });
    });
});

function getPageHtml() {
    console.log(document.documentElement.innerHTML); // Log the page HTML to the console
}
