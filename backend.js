chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    fetch('http://localhost:8080', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({html: message.html})
    })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
});