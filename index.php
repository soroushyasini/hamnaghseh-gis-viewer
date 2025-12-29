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
    
    <!-- Custom Styles -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family:  Tahoma, Arial, sans-serif;
            direction: rtl;
        }
        
        #map {
            width: 100%;
            height:  100vh;
            position:  absolute;
            top: 0;
            left: 0;
        }
        
        /* Info Panel */
        .info-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow:  0 4px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 350px;
            min-width: 280px;
        }
        
        . info-panel h3 {
            margin:  0 0 15px 0;
            color:  #09375B;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-panel .status {
            padding: 12px;
            background: #f0f9ff;
            border-radius:  8px;
            color: #0369a1;
            font-size: 14px;
            text-align: center;
        }
        
        .info-panel .status.loading {
            background: #fef3c7;
            color: #92400e;
        }
        
        .info-panel .status.error {
            background: #fee2e2;
            color:  #991b1b;
        }
        
        .info-panel . status.success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .info-item {
            margin:  10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-item strong {
            color: #374151;
            display: inline-block;
            min-width: 80px;
        }
        
        /* Loading Spinner */
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top:  3px solid #09375B;
            border-radius: 50%;
            animation:  spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Close Button */
        .close-btn {
            position: absolute;
            top: 10px;
            left: 10px;
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            z-index:  1000;
        }
        
        .close-btn:hover {
            background: #dc2626;
        }
        
        /* Coordinate Display */
        .coordinate-display {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 15px;
            border-radius:  8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 12px;
            font-family: monospace;
            direction: ltr;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <!-- Map Container -->
    <div id="map"></div>
    
    <!-- Close Button -->
    <button class="close-btn" onclick="window.close()">✕ بستن</button>
    
    <!-- Info Panel -->
    <div class="info-panel">
        <h3>📍 اطلاعات نقشه</h3>
        <div id="status" class="status loading">
            <span class="spinner"></span>
            در حال بارگذاری...
        </div>
        <div id="fileInfo" style="margin-top: 15px;"></div>
    </div>
    
    <!-- Coordinate Display -->
    <div class="coordinate-display" id="coordinates">
        مختصات: --
    </div>
    
    <!-- Leaflet JS -->
    <script src="js/leaflet.js"></script>
    
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
            fileUrl: <? php echo json_encode($file_url); ?>,
            fileType: <?php echo json_encode($file_type); ?>
        };
        
        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', function() {
            initializeGISViewer(window.GIS_CONFIG);
        });
    </script>
</body>
</html>
