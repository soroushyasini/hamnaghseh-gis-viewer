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

/**
 * Load KMZ file (compressed KML)
 */
function loadKMZ(fileUrl) {
    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
        updateStatus('error', '❌ کتابخانه JSZip بارگذاری نشده است');
        return;
    }
    
    updateStatus('loading', 'در حال دانلود فایل KMZ...');
    
    // Fetch the KMZ file as binary
    fetch(fileUrl)
        .then(response => {
            if (!response.ok) throw new Error('خطا در دریافت فایل KMZ');
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
            console.log('📂 KMZ extracted, files:', Object.keys(zip.files));
            
            // Find the KML file inside (usually doc.kml or *. kml)
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
            
            return kmlFile.async('string');
        })
        .then(kmlString => {
            console.log('📝 KML content length:', kmlString. length);
            console.log('📝 KML preview:', kmlString.substring(0, 500));
            
            updateStatus('loading', 'در حال نمایش نقشه.. .');
            
            // Create a Blob URL for the KML string
            const kmlBlob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
            const kmlUrl = URL.createObjectURL(kmlBlob);
            
            console.log('🔗 Created KML blob URL:', kmlUrl);
            
            // Load using omnivore with the blob URL
            dataLayer = omnivore.kml(kmlUrl)
                .on('ready', function(e) {
                    console.log('✅ KMZ loaded and parsed successfully');
                    console.log('📊 KMZ Layer info:', e.target);
                    
                    // ✅ FIX: Call onDataLoaded to update UI and auto-zoom
                    onDataLoaded(e.target, 'KMZ');
                    
                    // Clean up blob URL
                    URL.revokeObjectURL(kmlUrl);
                })
                .on('error', function(e) {
                    console.error('❌ KML parse error from KMZ:', e);
                    updateStatus('error', '❌ خطا در تجزیه KML از KMZ');
                    URL.revokeObjectURL(kmlUrl);
                })
                .addTo(map);
            
            console.log('🗺️ KMZ layer added to map');
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
 * Global variable to store data bounds
 */
let dataBounds = null;

/**
 * Reset view to show all data
 */
function resetView() {
    if (dataBounds && dataBounds.isValid()) {
        console.log('🔄 Resetting view to data bounds');
        map.fitBounds(dataBounds, { 
            padding: [50, 50],
            maxZoom: 18
        });
    } else if (dataLayer) {
        console.log('🔄 Recalculating bounds');
        try {
            const bounds = dataLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { 
                    padding: [50, 50],
                    maxZoom: 18
                });
            }
        } catch (e) {
            console.warn('⚠️ Could not reset view:', e);
            // Fallback to Iran center
            map.setView([32.4279, 53.6880], 6);
        }
    } else {
        // No data loaded, go to Iran center
        map.setView([32.4279, 53.6880], 6);
    }
}
/**
 * Handle successful data load
 */


function onDataLoaded(layer, fileType) {
    console.log('✅ Data loaded successfully:', fileType);
    console.log('📊 Layer object:', layer);
    
    let featureCount = 0;
    let bounds = null;
    
    try {
        // Count layers
        layer.eachLayer(function() { 
            featureCount++; 
        });
        
        console.log('📍 Feature count:', featureCount);
        
        // Get bounds
        bounds = layer.getBounds();
        console.log('📐 Bounds:', bounds);
        
        // ✅ FIX: Save bounds BEFORE checking validity
        if (bounds && bounds.isValid()) {
            dataBounds = bounds;  // Move this line HERE
            console.log('💾 Saved bounds for reset function');
            console.log('✅ Zooming to bounds...');
            
            map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 18
            });
        } else {
            console.warn('⚠️ Bounds not valid, checking individual layers...');
            
            // Try to get bounds from individual layers
            let allBounds = [];
            layer.eachLayer(function(l) {
                if (l.getBounds) {
                    allBounds.push(l.getBounds());
                } else if (l.getLatLng) {
                    // For point features
                    const latlng = l.getLatLng();
                    allBounds.push(L.latLngBounds([latlng, latlng]));
                }
            });
            
            if (allBounds.length > 0) {
                // Combine all bounds
                let combinedBounds = allBounds[0];
                for (let i = 1; i < allBounds.length; i++) {
                    combinedBounds.extend(allBounds[i]);
                }
                
                dataBounds = combinedBounds;
                console.log('💾 Saved combined bounds for reset function');
                console.log('✅ Zooming to combined bounds...');
                map.fitBounds(combinedBounds, { 
                    padding: [50, 50],
                    maxZoom: 18
                });
            } else {
                console.warn('⚠️ No bounds found, using default view');
            }
        }
    } catch (e) {
        console.error('❌ Error getting bounds:', e);
        
        // Fallback: Try to find any coordinates
        try {
            let firstCoord = null;
            layer.eachLayer(function(l) {
                if (!firstCoord) {
                    if (l.getLatLng) {
                        firstCoord = l.getLatLng();
                    } else if (l.getLatLngs) {
                        const latlngs = l.getLatLngs();
                        if (latlngs.length > 0) {
                            firstCoord = latlngs[0][0] || latlngs[0];
                        }
                    }
                }
            });
            
            if (firstCoord) {
                console.log('✅ Zooming to first coordinate:', firstCoord);
                map.setView(firstCoord, 15);
            }
        } catch (e2) {
            console.error('❌ Could not zoom to data:', e2);
        }
    }
    
    // Update status
    updateStatus('success', `✅ فایل ${fileType} بارگذاری شد`);
    
    // Display info
    displayFileInfo({
        type: fileType,
        features: featureCount,
        bounds: bounds ? 'موجود' : 'نامشخص'
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

/**
 * Toggle info panel minimize/maximize
 */
function toggleInfoPanel() {
    const panel = document.getElementById('infoPanel');
    const icon = document.getElementById('toggleIcon');
    
    panel.classList.toggle('minimized');
    
    if (panel.classList.contains('minimized')) {
        icon.textContent = '+';
        console.log('ℹ️ Info panel minimized');
    } else {
        icon.textContent = '−';
        console.log('ℹ️ Info panel expanded');
    }
}

/**
 * Auto-minimize info panel on mobile
 */
function checkMobileView() {
    if (window.innerWidth <= 768) {
        const panel = document.getElementById('infoPanel');
        const icon = document.getElementById('toggleIcon');
        
        if (!panel.classList.contains('minimized')) {
            panel.classList.add('minimized');
            icon.textContent = '+';
            console.log('📱 Auto-minimized for mobile view');
        }
    }
}

// Call on load and resize
window.addEventListener('DOMContentLoaded', checkMobileView);
window.addEventListener('resize', checkMobileView);

