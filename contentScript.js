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

    // when the plus button is clicked
    const addNewBookmarkEventHandler = async () => {
        alert("Add successful");
        const currentTime = youtubePlayer.currentTime; // grabs timestamp

        const newBookmark = {
            time: currentTime,
            desc: "Note at " + getTime(currentTime), // this is where we generate the note
            note: "Enter note here...",
        };

        currentVideoBookmarks = await fetchBookmarks();
        // store a new bookmark sorted by time
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });// ^ stuff needs to be stored in JSON in chrome storage
    };


    // when the bo button is clicked
    const generateNotesEventHandler = async () => {
        alert("Summaries generated!");
        // there is going to be something that grabs the result from the backend
        // which should be a list of JSON {time: seconds or just timestamp "mm:ss:ss"
                                        // , summary:"string"}
        // we load that list to summaries
        // this one is hardcoded for https://www.youtube.com/watch?v=GvQwE2OhL8I&t=128s&ab_channel=LearnCode.academy
        const summaries = [{time:95, summary:"Hidden layers is the black box, and there are several parameters you can tune. "},
                        {time:211, summary:"A real example neural network."},
                        {time:377, summary:"The activation function because we are usually working with non-linear problems."},
                        {time:490, summary:"During backpropagation we calculated error and adjust the weights and biases"},
                        {time:640, summary:"We train a neural network by going through iterations of input data until our estimations are good."}
        ];

        let bmSummarized = [];

        // create a new bm for each summary
        for (let i = 0; i < summaries.length; i++){
            const s = summaries[i];
            let bm = {time:s['time'],
                        desc:"Note at " + getTime(s['time']),
                        note:s['summary']};
            bmSummarized.push(bm);
            }

        currentVideoBookmarks = bmSummarized;
        // set new bookmarks for storage update
        // V1: Wiping out all
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(currentVideoBookmarks.sort((a, b) => a.time - b.time))
        });
    };


    // on NEW video event
    const newVideoLoaded = async() => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
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
            generateBtn.className = "ytp-button " + "generate-btn";
            generateBtn.title = "Click to generate time-stamped summary";

            // grabs ytb leftcontrol & ytb player
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            // add the bookmarkBtn to the control
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
            youtubeLeftControls.appendChild(generateBtn);
            generateBtn.addEventListener("click", generateNotesEventHandler);
        }
    };


    // when the popup.js or background.js sends a message
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") { // when new video loaded
            currentVideo = videoId;
            newVideoLoaded(); // handle actions with new video
        } else if (type === "PLAY"){
            youtubePlayer.currentTime = value; // this is where we jump to timestamp
        } else if ( type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            response(currentVideoBookmarks);
        } else if (type === "EDIT"){
            // updates note content
            const idx = currentVideoBookmarks.findIndex((bm) => bm.time == value[0]);
            currentVideoBookmarks[idx].note = value[1];
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

