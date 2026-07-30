import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SPOTS, PORTS } from '../data/spots.js';

/**
 * Interactive Leaflet map of the Clare coast.
 * Base: Esri World Ocean Base. Overlay: INFOMAR / INSS 25 m bathymetry
 * shaded relief (Geological Survey Ireland & Marine Institute, CC BY 4.0)
 * served from the GSI image host as an ArcGIS ImageServer WMS.
 */
const INFOMAR_WMS =
  'https://gsi.geodata.gov.ie/imagehost/services/Marine/IE_GSI_MI_Bathymetry_25m_IE_Waters_WGS84_LAT_GRID/ImageServer/WMSServer';
const INFOMAR_SHADE =
  'https://maps.marine.ie/arcgis/rest/services/Infomar/All_Surveys_ShadedRelief_NE/ImageServer/exportImage';

function spotIcon(rank, score, active) {
  return L.divIcon({
    className: '',
    html: `<div class="pin ${active ? 'pin-active' : ''} ${score >= 70 ? 'pin-hot' : ''}">
             <span class="pin-rank">${String(rank).padStart(2, '0')}</span>
             <span class="pin-score">${score}</span>
           </div>`,
    iconSize: [52, 26],
    iconAnchor: [26, 13]
  });
}

const portIcon = L.divIcon({
  className: '',
  html: '<div class="port-pin">⚓</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

export default function ClareMap({ ranked, selected, onSelect, showBathy }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});
  const bathyRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      center: [52.86, -9.45],
      zoom: 9,
      scrollWheelZoom: true,
      attributionControl: true
    });
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Esri, GEBCO, NOAA · Bathymetry: INFOMAR (GSI & Marine Institute) CC BY 4.0', maxZoom: 13 }
    ).addTo(map);

    bathyRef.current = L.tileLayer.wms(INFOMAR_WMS, {
      layers: '0',
      styles: 'default',
      format: 'image/png',
      transparent: true,
      opacity: 0.55,
      attribution: 'INFOMAR bathymetry 25m'
    });

    Object.values(PORTS).forEach((p) => {
      L.marker([p.lat, p.lng], { icon: portIcon, interactive: false }).addTo(map);
      L.tooltip({ permanent: true, direction: 'right', className: 'port-label', offset: [12, 0] })
        .setContent(p.name)
        .setLatLng([p.lat, p.lng])
        .addTo(map);
    });

    leafletRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !bathyRef.current) return;
    if (showBathy) bathyRef.current.addTo(map);
    else bathyRef.current.remove();
  }, [showBathy]);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    ranked.forEach(({ spot, score }, i) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: spotIcon(i + 1, score.total, spot.id === selected),
        title: spot.name,
        alt: spot.name
      });
      marker.bindTooltip(spot.name, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => onSelect(spot.id));
      marker.addTo(map);
      markersRef.current[spot.id] = marker;
    });
  }, [ranked, selected, onSelect]);

  return <div ref={mapRef} className="leaflet-shell" role="application" aria-label="Map of Clare coast fishing marks" />;
}

export { INFOMAR_SHADE };
