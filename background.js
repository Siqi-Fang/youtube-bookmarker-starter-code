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
  