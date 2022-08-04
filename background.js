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
        let video_id = request.video_id; //this is gonna be a string
        let data = {'data': video_id};
        const init = {
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": JSON.stringify(data), //this is data
            // FLASK side : request.get_json[key]
        }; // POST Method object
        fetch(url, init).then(response => response.json())
        .then(response => {
            sendResponse({data:response});});
        return true; // add this line to make the listener async.
    }
});

