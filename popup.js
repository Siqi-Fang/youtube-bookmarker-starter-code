import { getCurrentTab } from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bm) => {
    const bmTitleElement = document.createElement("div");
    const newbmElement = document.createElement("div");
    const controlsElement = document.createElement("div")

    bmTitleElement.textContent = bm.desc;
    bmTitleElement.className = "bookmark-title";

    controlsElement.className = 'bookmark-controls';

    // Single Bookmark
    newbmElement.id = "bookmark-" + bm.time; // each bm has its own id
    newbmElement.className = "bookmark";
    newbmElement.setAttribute("timestamp", bm.time);

    editNoteEvents("play", onPlay, controlsElement);
    editNoteEvents("delete", onDelete, controlsElement);

    newbmElement.appendChild(bmTitleElement);
    newbmElement.appendChild(controlsElement); // add control button
    bookmarksElement.appendChild(newbmElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0){
        for (let i = 0; i < currentBookmarks.length; i++){
            const bm = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bm)
        }
    } else {
        bookmarksElement.innerHTML = '<i class="row">You have not created a note yet</i>';
    }

    return;
};

// when play button is pressed
const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab(); // grabs tab

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};
// when delete
const onDelete = async e => {
    const activeTab = await getCurrentTab();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDel = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDel.parentNode.removeChild(bookmarkElementToDel);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    })
};
// when generate
const onGenerate= async e => {
    const activeTab = await getCurrentTab();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDel = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDel.parentNode.removeChild(bookmarkElementToDel);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "GENERATE",
        value: bookmarkTime
    })
};

const editNoteEvents =  (src, eventListener, controlParentElement) => {
    // src = play/ edit/ del
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png"
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);


};

document.addEventListener("DOMContentLoaded", async () => {
    // console.log("successfully loaded the popup html")

    // Grabs current video
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get('v');

    // todo: use currentVideo(videoID) to get captions

    // we are actually watching video
    if (activeTab.url.includes("youtube.com/watch") && currentVideo){
        // chrome.storage.sync.set in contentScript.js
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]):[];
            viewBookmarks(currentVideoBookmarks);
        });
    } else { // otherwise show message
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">Not on a youtube video page.</div>';
    }
});
