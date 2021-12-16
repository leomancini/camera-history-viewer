
const timestampElement = document.getElementById('timestamp');
const historyView = document.getElementById('historyView');

const liveView = document.getElementById('liveView');
const timestampElementLiveText = timestampElement.innerHTML;

const timelineWrapper = document.getElementById('timelineWrapper');
const thumbnails = document.getElementById('thumbnails');
const selectedThumbnailsOverlay = document.getElementById('selectedThumbnailsOverlay');

function refreshLiveView() {
    setTimeout(function () {
        const latestImage = document.createElement('img');
        latestImage.src = liveViewURL;

        if (liveView.childNodes.length > 2) {
            liveView.removeChild(liveView.childNodes[0]);	
        }

        liveView.appendChild(latestImage);
        
        refreshLiveView();
    }, 1000);
}

function renderTimeline() {
    thumbnails.style.marginLeft = (window.innerWidth / 2);
    const originalTimelineScrollPosition = thumbnails.offsetWidth;

    timelineWrapper.scrollLeft = originalTimelineScrollPosition;

    timelineWrapper.onscroll = function() {
        const scrollPosition = originalTimelineScrollPosition - timelineWrapper.scrollLeft;


        if (scrollPosition > 0 || !liveViewEnabled) {
            const thumbnailIndexAtTimelineMarker = Math.floor(Math.round(scrollPosition) / thumbnailWidth);
            const thumbnailAtTimelineMarker = thumbnails.childNodes[thumbnails.childNodes.length - thumbnailIndexAtTimelineMarker - 1];

            if (thumbnailAtTimelineMarker) {
                timestampElement.innerHTML = thumbnailAtTimelineMarker.dataset.timestampFormatted;

                historyView.style.opacity = 1;
                historyView.querySelector('img').src = thumbnailAtTimelineMarker.src;
            }
        } else {
            timestampElement.innerHTML = timestampElementLiveText;

            historyView.style.opacity = 0;
        }
    }
}

function selectThumbnail() {
    const thumbnail = this;

    if (selectedThumbnailsOverlay.dataset.selected === 'false') {
        // Select first image

        window.firstOfSelectedThumbnails = thumbnail;

        selectedThumbnailsOverlay.classList.add('visible');
        selectedThumbnailsOverlay.dataset.selected = 'true';
        selectedThumbnailsOverlay.style.width = thumbnail.offsetWidth;
        selectedThumbnailsOverlay.style.left = parseInt(thumbnail.offsetLeft) + parseInt(thumbnails.style.marginLeft);
    } else {
        // Select second image
        const originalWidth = parseInt(selectedThumbnailsOverlay.style.width);
        const startPositionOfFirstSelectedThumbnail = parseInt(selectedThumbnailsOverlay.style.left);
        const endPositionOfFirstSelectedThumbnail = parseInt(selectedThumbnailsOverlay.style.left) + thumbnail.offsetWidth;
        
        const startPositionOfSecondSelectedThumbnail = parseInt(thumbnail.offsetLeft) + parseInt(thumbnails.style.marginLeft);
        const endPositionOfSecondSelectedThumbnail = startPositionOfSecondSelectedThumbnail + thumbnail.offsetWidth;

        if (startPositionOfSecondSelectedThumbnail > startPositionOfFirstSelectedThumbnail) {
            // Second image is after first image
            selectedThumbnailsOverlay.style.width = endPositionOfSecondSelectedThumbnail - startPositionOfFirstSelectedThumbnail;

            window.lastOfSelectedThumbnails = thumbnail;
        } else {
            // Second image is before first image
            selectedThumbnailsOverlay.style.left = startPositionOfSecondSelectedThumbnail;
            selectedThumbnailsOverlay.style.width = endPositionOfFirstSelectedThumbnail - startPositionOfSecondSelectedThumbnail;

            window.lastOfSelectedThumbnails = window.firstOfSelectedThumbnails;
            window.firstOfSelectedThumbnails = thumbnail;
        }

        selectedThumbnailsOverlay.dataset.selected = 'false';

        const firstIndexOfSelectedThumbnails = parseInt(window.firstOfSelectedThumbnails.dataset.index);
        const lastIndexOfSelectedThumbnails = parseInt(window.lastOfSelectedThumbnails.dataset.index);

        const selectedThumbnailsFilenames = [];
        
        thumbnails.querySelectorAll('img').forEach(function(thumbnail) {
            if (thumbnail.dataset.index >= firstIndexOfSelectedThumbnails && thumbnail.dataset.index <= lastIndexOfSelectedThumbnails) {
                selectedThumbnailsFilenames.push(thumbnail.dataset.filename);
            } 
        });

        window.selectedThumbnails = {
            start: firstIndexOfSelectedThumbnails,
            end: lastIndexOfSelectedThumbnails,
            filenames: selectedThumbnailsFilenames
        }

        console.log(window.selectedThumbnails);
    }
}

function clearThumbnailSelection() {
    selectedThumbnailsOverlay.classList.remove('visible');
    selectedThumbnailsOverlay.style = '';
    selectedThumbnailsOverlay.dataset.selected = 'false';

    window.selectedThumbnails = {};
}

function addImageToTimeline(params) {
    const timelineImage = document.createElement('img');
    timelineImage.src = `${snapshotsPath}${params.filename}`;
    timelineImage.dataset.timestampFormatted = params.timestampFormatted;
    timelineImage.dataset.filename = params.filename;
    timelineImage.dataset.index = params.index;

    timelineImage.onclick = selectThumbnail;

    selectedThumbnailsOverlay.onclick = clearThumbnailSelection;
    
    thumbnails.appendChild(timelineImage);
}
            
window.onresize = function() {
    thumbnails.style.marginLeft = (window.innerWidth / 2);

    clearThumbnailSelection();
}

document.onclick = function(click) {
    if (click.target.closest('#timelineWrapper') === null) {
        clearThumbnailSelection();
    } 
}