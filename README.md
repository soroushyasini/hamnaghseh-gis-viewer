# Hamnaghseh GIS Viewer

A lightweight, responsive web-based GIS file viewer built for the Hamnaghseh PM survey project management system. Displays various geographic data formats on an interactive Leaflet map with multi-language support (Persian/Farsi RTL).

## 🌟 Features

- **Multiple Format Support**: View KML, KMZ, GeoJSON, GPX, and Shapefile formats
- **Interactive Map**: Pan, zoom, and explore geographic data with smooth controls
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Auto-Zoom**: Automatically fits map to data bounds on load
- **Reset View**: Quick button to return to full data extent
- **Multi-Layer Base Maps**: Switch between OpenStreetMap, satellite imagery, and terrain
- **Coordinate Display**: Real-time mouse position tracking
- **Mobile Optimized**: Auto-minimizing info panel on small screens
- **RTL Support**: Full right-to-left layout for Persian interface
- **Touch-Friendly**: Designed for mobile touch interactions

## 📁 Supported File Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| **KML** | `.kml` | Keyhole Markup Language - Google Earth format |
| **KMZ** | `.kmz` | Compressed KML files (ZIP archive) |
| **GeoJSON** | `.geojson`, `.json` | Standard JSON-based geographic format |
| **GPX** | `.gpx` | GPS Exchange Format - tracks and waypoints |
| **Shapefile** | `.zip`, `.shp` | ESRI Shapefile (must be in ZIP archive with .shp, .shx, .dbf) |

## 📂 Directory Structure

```
hamnaghseh-gis-viewer/
├── index.php              # Main viewer page
├── README.md              # Documentation (this file)
├── css/
│   ├── leaflet.css        # Leaflet core styles
│   └── viewer.css         # Custom viewer styles (v1.0.0)
├── js/
│   ├── leaflet.js         # Leaflet map library
│   ├── leaflet-omnivore.js # KML/KMZ/GPX parser
│   ├── jszip.min.js       # ZIP file handling for KMZ
│   ├── shp.js             # Shapefile parser
│   └── viewer.js          # Custom viewer logic
└── images/                # Map marker icons
```

## 🚀 Installation

### Requirements

- Web server with PHP support (Apache, Nginx, etc.)
- PHP 7.0 or higher
- Modern web browser with JavaScript enabled

### Setup

1. **Clone or download** this repository to your web server directory:
   ```bash
   git clone https://github.com/soroushyasini/hamnaghseh-gis-viewer.git
   cd hamnaghseh-gis-viewer
   ```

2. **Configure web server** to serve the directory (ensure PHP is enabled)

3. **Test installation** by accessing:
   ```
   http://your-domain.com/hamnaghseh-gis-viewer/
   ```

4. **No build step required** - this is a ready-to-use PHP/JavaScript application

## 📖 Usage

### Basic URL Structure

```
http://your-domain.com/hamnaghseh-gis-viewer/index.php?file=FILE_URL&type=FORMAT
```

### Parameters

- `file` (required): URL or path to the GIS file
- `type` (optional): File format - auto-detected from extension if not provided
  - Supported values: `kml`, `kmz`, `geojson`, `gpx`, `shp`, `zip`

### Examples

#### Load KML file:
```
index.php?file=https://example.com/data/survey.kml&type=kml
```

#### Load KMZ file:
```
index.php?file=https://example.com/data/survey.kmz&type=kmz
```

#### Load GeoJSON (auto-detect):
```
index.php?file=https://example.com/data/boundaries.geojson
```

#### Load Shapefile (ZIP):
```
index.php?file=https://example.com/data/parcels.zip&type=shp
```

### Integration with Hamnaghseh PM

This viewer is designed to integrate with the Hamnaghseh PM system. Pass the file URL from your database:

```php
$gis_file_url = "https://hamnaghseh.com/uploads/survey-123.kmz";
$viewer_url = "https://viewer.hamnaghseh.com/index.php?file=" . urlencode($gis_file_url);

echo "<a href='$viewer_url' target='_blank'>مشاهده نقشه</a>";
```

## 🔧 Dependencies

All dependencies are included in the repository:

| Library | Version | Purpose |
|---------|---------|---------|
| **Leaflet** | 1.9.x | Core mapping functionality |
| **Leaflet Omnivore** | Latest | Parse KML, KMZ, GPX, and other formats |
| **JSZip** | 3.x | Extract KML from KMZ files |
| **shp.js** | Latest | Parse ESRI Shapefiles |

## 🌐 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | ✅ Fully supported |
| **Firefox** | 88+ | ✅ Fully supported |
| **Safari** | 14+ | ✅ Fully supported |
| **Edge** | 90+ | ✅ Fully supported |
| **Mobile Safari** | iOS 14+ | ✅ Touch optimized |
| **Chrome Mobile** | 90+ | ✅ Touch optimized |

## 📱 Mobile Responsiveness

### Responsive Breakpoints

- **Desktop**: > 768px - Full layout with expanded info panel
- **Tablet**: 481px - 768px - Smaller UI elements, auto-minimize info
- **Mobile**: 360px - 480px - Compact layout, touch-optimized buttons
- **Small Mobile**: < 360px - Maximum space efficiency

### Mobile Features

- ✅ Info panel auto-minimizes on screens < 768px
- ✅ Buttons positioned to avoid Leaflet zoom controls
- ✅ Touch-friendly button sizes (minimum 44x44px)
- ✅ Reduced padding and font sizes for better space usage
- ✅ Coordinate display remains visible at bottom left
- ✅ Smooth transitions and animations

## 🛠️ Development

### Project Structure

```
hamnaghseh-gis-viewer/
├── Frontend (User Interface)
│   ├── index.php          # Main HTML + PHP logic
│   └── css/viewer.css     # Styling and responsive design
├── JavaScript (Logic)
│   └── js/viewer.js       # Map initialization, file loading, UI controls
└── Assets
    ├── css/leaflet.css    # Leaflet base styles
    ├── js/*.js            # Third-party libraries
    └── images/            # Map markers and icons
```

### Key Functions

#### `initializeGISViewer(config)`
Initializes the map, base layers, and starts file loading.

#### `loadGISFile(fileUrl, fileType)`
Routes file loading to appropriate handler based on type.

#### `onDataLoaded(layer, fileType)`
Called after successful load - handles auto-zoom and UI updates.

#### `resetView()`
Returns map to full data extent.

#### `toggleInfoPanel()`
Minimizes/maximizes the info panel.

#### `checkMobileView()`
Auto-minimizes info panel on mobile devices.

### Customization

#### Change Base Maps

Edit `js/viewer.js` in the `addBaseLayers()` function:

```javascript
const customLayer = L.tileLayer('https://your-tiles-url/{z}/{x}/{y}.png', {
    attribution: 'Your attribution',
    maxZoom: 19
});
```

#### Modify Styles

Edit `css/viewer.css` to customize:
- Colors and themes
- Button positions
- Panel sizes
- Responsive breakpoints
- Animations

#### Add New File Format

1. Add format to `$supported_formats` array in `index.php`
2. Create loader function in `js/viewer.js`
3. Add case to `loadGISFile()` switch statement

### CSS Cache Busting

The CSS file includes version parameter for cache management:
```html
<link rel="stylesheet" href="css/viewer.css?v=1.0.0" />
```

Increment version number after CSS changes to force browser refresh.

## 🐛 Troubleshooting

### File Won't Load

**Issue**: "❌ خطا در بارگذاری فایل"

**Solutions**:
- ✅ Check file URL is accessible and not blocked by CORS
- ✅ Verify file format matches `type` parameter
- ✅ Ensure file is not corrupted
- ✅ Check browser console for detailed error messages

### Map Shows But No Data

**Issue**: Map loads but geographic data doesn't appear

**Solutions**:
- ✅ Check if file contains valid geographic data
- ✅ Verify coordinate system (should be WGS84/EPSG:4326)
- ✅ Check browser console for parsing errors
- ✅ Try opening file in QGIS or other GIS software to verify

### KMZ Files Not Working

**Issue**: KMZ files fail to extract or load

**Solutions**:
- ✅ Verify `jszip.min.js` is loaded (check browser console)
- ✅ Ensure KMZ file contains a `.kml` file inside
- ✅ Check KMZ file is not password protected
- ✅ Try manually extracting KMZ and loading the KML instead

### Mobile Layout Issues

**Issue**: UI elements overlap or look wrong on mobile

**Solutions**:
- ✅ Clear browser cache to load latest `viewer.css?v=1.0.0`
- ✅ Check viewport meta tag is present in HTML
- ✅ Test in device mode in Chrome DevTools
- ✅ Verify CSS breakpoints match your screen size

### Buttons on Wrong Side

**Issue**: Buttons appear on left instead of right

**Solutions**:
- ✅ Clear browser cache - old CSS might be cached
- ✅ Verify `viewer.css` has buttons with `right: 10px` not `left: 10px`
- ✅ Check for conflicting custom CSS

### Auto-Zoom Not Working

**Issue**: Map doesn't zoom to data after loading

**Solutions**:
- ✅ This is fixed in v1.0.0 - ensure `viewer.js` has the dataBounds fix
- ✅ Check browser console for bounds calculation errors
- ✅ Verify data has valid coordinates

## 📋 Version History

### Version 1.0.0 (2025-01-29)

**Major Refactoring Release**

- ✅ Separated CSS into external file (`css/viewer.css`)
- ✅ Moved buttons from left to right side
- ✅ Added minimize/maximize toggle for info panel
- ✅ Implemented mobile-responsive design with auto-minimize
- ✅ Fixed dataBounds bug in reset view functionality
- ✅ Added comprehensive documentation
- ✅ Improved touch interactions for mobile devices
- ✅ Added smooth transitions and animations
- ✅ Better RTL (right-to-left) layout support

### Version 0.9.x (Previous)

- Initial development version
- Basic KML/KMZ/GeoJSON/GPX/Shapefile support
- Simple layout with inline styles

## 📄 License

This project is part of the Hamnaghseh PM survey management system.

**Copyright © 2025 Soroush Yasini**

All rights reserved. This software is proprietary and confidential.

## 👥 Credits & Acknowledgments

### Developer
- **Soroush Yasini** - Lead Developer & Project Manager
- Email: contact@hamnaghseh.com
- GitHub: [@soroushyasini](https://github.com/soroushyasini)

### Open Source Libraries
- **Leaflet** - © CloudMade, Vladimir Agafonkin
- **Leaflet Omnivore** - © Mapbox
- **JSZip** - © Stuart Knightley
- **shp.js** - © Calvin Metcalf

### Special Thanks
- OpenStreetMap contributors for base map tiles
- ESRI for satellite imagery tiles
- OpenTopoMap for terrain tiles

---

## 🔗 Links

- **Project Repository**: https://github.com/soroushyasini/hamnaghseh-gis-viewer
- **Hamnaghseh PM**: https://hamnaghseh.com
- **Issue Tracker**: https://github.com/soroushyasini/hamnaghseh-gis-viewer/issues
- **Documentation**: This README file

---

**Built with ❤️ for efficient survey data management**

