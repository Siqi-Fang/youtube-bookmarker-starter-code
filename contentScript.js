(() => {
    let youtubeLeftControls, youtubePlayer; // access player & control
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };
    
    // on bookmark btn click event
    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime; // grabs timestamp
        // console.log(currentTime);
        const newBookmark = {
            time: currentTime,
            desc: "Note at " + getTime(currentTime), // this is where we generate the note
        };

        currentVideoBookmarks = await fetchBookmarks();
        // store a new bookmark sorted by time
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });// ^ stuff needs to be stored in JSON in chrome storage
    };

    // on bookmark btn click event
    const generateSummaryEventHandler = async () => {
        // // store a new bookmark sorted by time
        // chrome.storage.sync.set({
        //     [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        // });// ^ stuff needs to be stored in JSON in chrome storage
    };

    // on NEW video event
    const newVideoLoaded = async() => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        // console.log(bookmarkBtnExists);
        currentVideoBookmarks = await fetchBookmarks();
        // Sanity check
        if (!bookmarkBtnExists) {
            /* Bookmark Button */ 
            const bookmarkBtn = document.createElement("img");
            // img we click on for bookmark button
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            /* Generate Button */
            const generateBtn = document.createElement("img");
            generateBtn.src = chrome.runtime.getURL("assets/lightbulb.png");
            generateBtn.className = "ytp-button " + "bookmark-btn";
            generateBtn.title = "Click to generate time-stamped summary";
            
            // grabs ytb leftcontrol & ytb player
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            // add tge bookmarkBtn to the control
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
            youtubeLeftControls.appendChild(generateBtn);
            generateBtn.addEventListener("click", generateSummaryEventHandler);
        }
    };

    // when the background.js sends a message
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        // these ^^^^ are all chrome features
        if (type === "NEW") { // when new video loaded
            currentVideo = videoId;
            newVideoLoaded(); // handle actions with new video
        } else if (type === "PLAY"){
            youtubePlayer.currentTime = value; // this is where we jump to timestamp
        } else if ( type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            response(currentVideoBookmarks);
        } else if ( type === "GENERATE") {
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            response(currentVideoBookmarks);
        }

    });

    newVideoLoaded();
})();

// convert timestamp format
const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
