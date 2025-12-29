/**
 * GIS Viewer JavaScript
 * Hamnaghseh PM - Custom viewer logic
 */

let map;
let dataLayer;

/**
 * Initialize GIS Viewer
 */
function initializeGISViewer(config) {
    console.log('🗺️ Initializing GIS Viewer', config);
    
    // Initialize map centered on Iran
    map = L.map('map', {
        center: [32.4279, 53.6880], // Iran center
        zoom: 6,
        zoomControl: true
    });
    
    // Add base layers
    addBaseLayers();
    
    // Add scale control
    L.control.scale({
        imperial: false,
        metric: true,
        position:  'bottomright'
    }).addTo(map);
    
    // Track mouse coordinates
    trackCoordinates();
    
    // Load the GIS file
    loadGISFile(config. fileUrl, config.fileType);
}

/**
 * Add base map layers
 */
function addBaseLayers() {
    // OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Satellite imagery
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19
    });
    
    // Terrain
    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17
    });
    
    // Layer control
    const baseMaps = {
        "🗺️ نقشه پایه": osmLayer,
        "🛰️ تصویر ماهواره‌ای": satelliteLayer,
        "⛰️ نقشه توپوگرافی": terrainLayer
    };
    
    L.control.layers(baseMaps, null, {
        position: 'topleft'
    }).addTo(map);
}

/**
 * Track mouse coordinates
 */
function trackCoordinates() {
    map.on('mousemove', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        document.getElementById('coordinates').innerHTML = 
            `مختصات: ${lat}, ${lng}<br>Lat: ${lat}, Lng: ${lng}`;
    });
}

/**
 * Load GIS file based on type
 */
function loadGISFile(fileUrl, fileType) {
    updateStatus('loading', 'در حال بارگذاری فایل...');
    
    console.log('📂 Loading file:', fileUrl, 'Type:', fileType);
    
    try {
        switch(fileType) {
            case 'kml':
                loadKML(fileUrl);
                break;
            case 'kmz':
                loadKMZ(fileUrl);
                break;
            case 'geojson':
                loadGeoJSON(fileUrl);
                break;
            case 'gpx': 
                loadGPX(fileUrl);
                break;
            case 'shp':
            case 'zip':
                loadShapefile(fileUrl);
                break;
            default:
                updateStatus('error', '❌ فرمت فایل پشتیبانی نمی‌شود');
        }
    } catch (error) {
        console.error('❌ Error loading file:', error);
        updateStatus('error', '❌ خطا در بارگذاری فایل:  ' + error.message);
    }
}

// Load KML file

function loadKML(fileUrl) {
    if (typeof omnivore === 'undefined') {
        updateStatus('error', '❌ کتابخانه Omnivore بارگذاری نشده است');
        return;
    }
    
    dataLayer = omnivore.kml(fileUrl)
        .on('ready', function(e) {
            onDataLoaded(e. target, 'KML');
        })
        .on('error', function(e) {
            updateStatus('error', '❌ خطا در بارگذاری KML');
            console.error(e);
        })
        .addTo(map);
}



// Load KMZ file (compressed KML)

function loadKMZ(fileUrl) {
    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
        updateStatus('error', '❌ کتابخانه JSZip بارگذاری نشده است');
        return;
    }
    
    updateStatus('loading', 'در حال دانلود فایل KMZ.. .');
    
    // Fetch the KMZ file as binary
    fetch(fileUrl)
        .then(response => {
            if (! response.ok) throw new Error('خطا در دریافت فایل KMZ');
            console.log('✅ KMZ file downloaded');
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            updateStatus('loading', 'در حال استخراج KML از KMZ...');
            console.log('📦 Extracting KMZ, size:', arrayBuffer.byteLength);
            
            // Unzip the KMZ
            const zip = new JSZip();
            return zip.loadAsync(arrayBuffer);
        })
        .then(zip => {
            console. log('📂 KMZ extracted, files:', Object.keys(zip.files));
            
            // Find the KML file inside (usually doc. kml or *.kml)
            let kmlFile = null;
            
            zip.forEach((relativePath, file) => {
                console.log('  - Found file:', relativePath);
                if (relativePath.toLowerCase().endsWith('.kml')) {
                    kmlFile = file;
                    console.log('  ✅ KML file found:', relativePath);
                }
            });
            
            if (!kmlFile) {
                throw new Error('فایل KML در داخل KMZ یافت نشد');
            }
            
            return kmlFile. async('string');
        })
        .then(kmlString => {
            console.log('📝 KML content length:', kmlString.length);
            console.log('📝 KML preview:', kmlString.substring(0, 500));
            
            updateStatus('loading', 'در حال نمایش نقشه...');
            
            // Parse KML string with Leaflet Omnivore
            dataLayer = omnivore.kml. parse(kmlString)
                .on('ready', function(e) {
                    console.log('✅ KML parsed successfully');
                    console.log('📊 Layer info:', e.target);
                    onDataLoaded(e.target, 'KMZ');
                })
                .on('error', function(e) {
                    console.error('❌ KML parse error:', e);
                    updateStatus('error', '❌ خطا در تجزیه KML');
                })
                .addTo(map);
            
            console.log('🗺️ Layer added to map:', dataLayer);
        })
        .catch(error => {
            console.error('❌ KMZ Error:', error);
            updateStatus('error', '❌ خطا در بارگذاری KMZ:  ' + error.message);
        });
}

/**
 * Load GeoJSON file
 */
function loadGeoJSON(fileUrl) {
    fetch(fileUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(geojson => {
            dataLayer = L.geoJSON(geojson, {
                onEachFeature: function(feature, layer) {
                    if (feature.properties) {
                        const props = Object.entries(feature.properties)
                            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                            .join('<br>');
                        layer.bindPopup(props);
                    }
                }
            }).addTo(map);
            
            onDataLoaded(dataLayer, 'GeoJSON');
        })
        .catch(error => {
            updateStatus('error', '❌ خطا در بارگذاری GeoJSON');
            console.error(error);
        });
}

/**
 * Load GPX file
 */
function loadGPX(fileUrl) {
    if (typeof omnivore === 'undefined') {
        updateStatus('error', '❌ کتابخانه Omnivore بارگذاری نشده است');
        return;
    }
    
    dataLayer = omnivore.gpx(fileUrl)
        .on('ready', function(e) {
            onDataLoaded(e.target, 'GPX');
        })
        .on('error', function(e) {
            updateStatus('error', '❌ خطا در بارگذاری GPX');
            console.error(e);
        })
        .addTo(map);
}

/**
 * Load Shapefile (from ZIP)
 */
function loadShapefile(fileUrl) {
    if (typeof shp === 'undefined') {
        updateStatus('error', '❌ کتابخانه Shapefile بارگذاری نشده است');
        return;
    }
    
    shp(fileUrl).then(function(geojson) {
        dataLayer = L.geoJSON(geojson, {
            onEachFeature: function(feature, layer) {
                if (feature.properties) {
                    const props = Object.entries(feature. properties)
                        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                        .join('<br>');
                    layer.bindPopup(props);
                }
            }
        }).addTo(map);
        
        onDataLoaded(dataLayer, 'Shapefile');
    }).catch(function(error) {
        updateStatus('error', '❌ خطا در بارگذاری Shapefile');
        console.error(error);
    });
}

/**
 * Handle successful data load
 */
function onDataLoaded(layer, fileType) {
    console.log('✅ Data loaded successfully:', fileType);
    
    // Zoom to data bounds
    try {
        const bounds = layer.getBounds();
        if (bounds. isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } catch (e) {
        console.warn('Could not fit bounds:', e);
    }
    
    // Count features
    let featureCount = 0;
    try {
        layer.eachLayer(function() { featureCount++; });
    } catch (e) {
        featureCount = 'نامشخص';
    }
    
    // Update status
    updateStatus('success', `✅ فایل ${fileType} بارگذاری شد`);
    
    // Display info
    displayFileInfo({
        type: fileType,
        features: featureCount
    });
}

/**
 * Update status message
 */
function updateStatus(type, message) {
    const statusEl = document.getElementById('status');
    statusEl.className = `status ${type}`;
    statusEl.innerHTML = message;
}

/**
 * Display file information
 */
function displayFileInfo(info) {
    const infoEl = document.getElementById('fileInfo');
    infoEl.innerHTML = `
        <div class="info-item">
            <strong>نوع فایل:</strong> ${info.type}
        </div>
        <div class="info-item">
            <strong>تعداد عوارض:</strong> ${info.features}
        </div>
    `;
}
