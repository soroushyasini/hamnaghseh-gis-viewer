<?php
/**
 * GIS Viewer - Hamnaghseh PM
 * Displays KML, KMZ, Shapefile, GeoJSON, GPX on interactive map
 */

// Get parameters
$file_url = isset($_GET['file']) ? $_GET['file'] : '';
$file_type = isset($_GET['type']) ? strtolower($_GET['type']) : '';

// Validate file URL (basic security)
if (empty($file_url)) {
    die('❌ فایل مشخص نشده است');
}

// Determine file type from extension if not provided
if (empty($file_type)) {
    $file_type = strtolower(pathinfo($file_url, PATHINFO_EXTENSION));
}

// Supported formats
$supported_formats = ['kml', 'kmz', 'geojson', 'gpx', 'shp', 'zip'];
if (!in_array($file_type, $supported_formats)) {
    die('❌ فرمت فایل پشتیبانی نمی‌شود');
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مشاهده نقشه GIS - هم‌نقشه</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="css/leaflet.css" />
    
    <!-- Custom Viewer CSS with cache busting -->
    <link rel="stylesheet" href="css/viewer.css?v=1.0.0" />
</head>
<body>
    <!-- Map Container -->
    <div id="map"></div>
    
    <!-- Close Button - RIGHT SIDE -->
    <button class="close-btn" onclick="window.close()">✕ بستن</button>

    <!-- Reset View Button - RIGHT SIDE -->
    <button class="reset-view-btn" title="بازگشت به نمای کامل" aria-label="Reset view to show all data">
        🔍 نمای کامل
    </button>
    
    <!-- Info Panel with Minimize Toggle -->
    <div class="info-panel" id="infoPanel">
        <h3>
            <span>📍 اطلاعات نقشه</span>
            <button class="minimize-toggle" id="minimizeBtn" title="کوچک کردن / بزرگ کردن" aria-label="Toggle info panel">
                <span id="toggleIcon">−</span>
            </button>
        </h3>
        <div class="info-content">
            <div id="status" class="status loading">
                <span class="spinner"></span>
                در حال بارگذاری...
            </div>
            <div id="fileInfo" style="margin-top: 15px;"></div>
        </div>
    </div>
    
    <!-- Coordinate Display -->
    <div class="coordinate-display" id="coordinates">
        مختصات: --
    </div>
    
    <!-- Leaflet JS -->
    <script src="js/leaflet.js"></script>

    <!-- JSZip for KMZ support -->
    <script src="js/jszip.min.js"></script>
    
    <!-- Omnivore for KML/KMZ/GPX -->
    <script src="js/leaflet-omnivore.js"></script>
    
    <!-- Shapefile support -->
    <script src="js/shp.js"></script>
    
    <!-- Custom Viewer JS -->
    <script src="js/viewer.js"></script>
    
    <!-- Initialize Viewer -->
    <script>
        // Pass PHP variables to JavaScript
        window.GIS_CONFIG = {
            fileUrl: <?php echo json_encode($file_url); ?>,
            fileType: <?php echo json_encode($file_type); ?>
        };
        
        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', function() {
            initializeGISViewer(window.GIS_CONFIG);
        });
    </script>
</body>
</html>
