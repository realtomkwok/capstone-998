document.addEventListener('DOMContentLoaded', function() {
    var htmlContent = document.documentElement.innerHTML;
    console.log("123");
    chrome.runtime.sendMessage({html: htmlContent});
});