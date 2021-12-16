<?php
require 'config.php';

$hoursToShow = isset($_GET['hours']) ? $_GET['hours'] : $CONFIG['defaultHoursToShow'];
$numberOfThumbnailsToShow = $CONFIG['numberOfSnapshotsPerHour'] * $hoursToShow;
?>
<html>

<head>
    <title><?php echo $CONFIG['cameraName']; ?> Camera History</title>
    <style>
        :root {
            --timeline-width: <?php echo $numberOfThumbnailsToShow * $CONFIG['thumbnailWidth']; ?>px;
            --thumbnail-width: <?php echo $CONFIG['thumbnailWidth']; ?>px;
        }
    </style>
    <link rel='stylesheet' href='resources/css/style.css'>
    <script>
        const thumbnailWidth = <?php echo $CONFIG['thumbnailWidth']; ?>;
        const snapshotsPath = '<?php echo $CONFIG['snapshotsPath']; ?>';
        const liveViewEnabled = <?php echo $CONFIG['liveViewEnabled'] ? 'true' : 'false'; ?>;
        const liveViewURL = '<?php echo $CONFIG['liveViewURL']; ?>';
    </script>
</head>

<body>
    <div id='timestampWrapper'>
        <div id='timestamp'>
            <?php if ($CONFIG['liveViewEnabled']) { ?>
                <div id='liveDot'></div> Live
            <?php } ?>
        </div>
    </div>
    <div id='viewer'>
        <div id='historyView'>
            <img>
        </div>
        <?php if ($CONFIG['liveViewEnabled']) { ?>
            <div id='liveView'></div>
        <?php } ?>
    </div>
    <div id='timelineWrapper'>
        <div id='timelineMarker'></div>
        <div id='timelineContents'>
            <div id='selectedThumbnailsOverlay' data-selected='false'></div>
            <div id='thumbnails'></div>
        </div>
    </div>
    <script src='resources/js/functions.js'></script>
    <script>
        window.selectedThumbnails = {};

        if (liveViewEnabled) {
            refreshLiveView();
        }

        renderTimeline();

        <?php
            $snapshots = glob($CONFIG['snapshotsPath'] . '*' . $CONFIG['snapshotsExtension']);
            $limitedNumberOfSnapshots = array_slice($snapshots, -$numberOfThumbnailsToShow, $numberOfThumbnailsToShow);
            $index = 0;

            foreach ($limitedNumberOfSnapshots as $snapshot) {
                $index++;

                $filename = str_replace($CONFIG['snapshotsPath'], '', $snapshot);
                $timestamp = str_replace($CONFIG['snapshotsExtension'], '', $filename);

                $timestampParts = explode('-', $timestamp);
                $timestampUnixFormatted = $timestampParts[0] . "-" . $timestampParts[1] . "-" . $timestampParts[2] . " " . $timestampParts[3] . ":" . $timestampParts[4] . ":00";

                $timestampHumanFormatted = date("l, F j, Y g:i A \E\T", strtotime($timestampUnixFormatted));

                echo "addImageToTimeline({
                            filename: '" . $filename . "',
                            timestampFormatted: '$timestampHumanFormatted',
                            index: " . $index . "
                        });";
            }
        ?>
    </script>
</body>

</html>