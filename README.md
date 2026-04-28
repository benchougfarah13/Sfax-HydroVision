# Sfax Water Observatory
> Geospatial monitoring of water vulnerability, drought, and climate resilience in Sfax, Tunisia

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Combines satellite imagery (Sentinel-2, Sentinel-5P) with geospatial data to track drought, water accessibility, and climate trends.

## 6 Core Modules

| Module | Purpose |
|--------|---------|
| **Map Observatory** | Interactive multi-layer geospatial visualization |
| **Drought Monitoring** | SPI3, SPEI, NDVI trends (2015-2025) |
| **Climate Analysis** | NDVI composite & vegetation health |
| **Water Quality** | Water accessibility by 16 delegations |
| **DRASTIC** | Groundwater vulnerability risk (0-226 scale) |
| **Water Proximity** | Water Proximity progress tracking |


## Project Structure

```
src/pages/
├── MapObservatory.tsx      # Interactive geospatial map
├── DroughtMonitoring.tsx   # SPI3, SPEI, NDVI time-series
├── ClimateAnalysis.tsx     # NDVI vegetation trends
├── WaterQuality.tsx        # 16-delegation accessibility
├── drastic.tsx             # Groundwater vulnerability
├── Water Proximity.tsx        # Water Proximity progress tracking
└── Login.tsx               # Authentication

public/
├── *.geojson               # Boundary, dams, lakes, rivers, hotspots
├── DRASTIC_Map.tif         # Vulnerability raster
└── sdg_task/               # Climate CSV & GeoTIFF data
```

## Quick Start

**Prerequisites**: Node.js 16+

```bash
git clone https://github.com/yourusername/Sfax-HydroVision.git
cd sfax-water-observatory
npm install
npm run dev       # Starts at http://localhost:3000
```

**Build**: 
```bash
npm run build     # Production build
npm run lint      # TypeScript check
```

## Climate Indices

- **NDVI**: Vegetation health from Sentinel-2 L2A
- **SPI3**: 3-month precipitation anomaly
- **SPEI**: Precipitation minus evapotranspiration

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: description"`
4. Push & open a PR

## License

MIT License – See [LICENSE](LICENSE)

## Resources

- [Leaflet.js](https://leafletjs.com/) – Interactive maps
- [React Docs](https://react.dev/) – UI framework
- [USGS DRASTIC](https://water.usgs.gov/) – Groundwater methodology
- [Copernicus](https://scihub.copernicus.eu/) – Sentinel data
