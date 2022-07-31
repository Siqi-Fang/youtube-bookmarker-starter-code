chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) { // make sure we are on a youtube page
      const queryParameters = tab.url.split("?")[1]; // grab video id from url
      const urlParameters = new URLSearchParams(queryParameters);
  
      chrome.tabs.sendMessage(tabId, { // send message to the video
        type: "NEW",
        videoId: urlParameters.get("v"),
      });
    }
  });


// can only connect to external servers in background.js for security reason
// SEE https://www.chromium.org/Home/chromium-security/extension-content-script-fetches/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.contentScriptQuery == "getSummary") {
        const url = 'http://127.0.0.1:5000/response';
        fetch(url).then(response => response.json())
        .then(response => {
            sendResponse({data:response});
        });
        return true; // add this line to async.
    }
});

