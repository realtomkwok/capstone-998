document.addEventListener('DOMContentLoaded', function() {
    var headContent = document.head.innerHTML; // Extract the inner HTML of the <head>
    var bodyContent = document.body.innerHTML;
    var filteredHTML = "<head>" + headContent + "</head><body>" + bodyContent + "</body>";

    console.log("123");
    chrome.runtime.sendMessage({html: filteredHTML});
});