# Pelagic — Clare coast fishing intelligence

Single-page React application that scores thirteen researched shore/inshore fishing
marks on the west coast of County Clare, Ireland, against live marine conditions.

## Features

- **Interactive Leaflet map** — Esri Ocean base with an INFOMAR / INSS 25 m
  bathymetry WMS overlay (Geological Survey Ireland & Marine Institute, CC BY 4.0).
- **Live marine model** — tide (sea level), swell height/period/direction and sea
  surface temperature from the Open-Meteo Marine API (MFWAM / ECMWF), fetched for
  three coastal cluster points (Shannon mouth, west Clare, north Clare/Galway Bay).
- **Tide engine** — high/low water extraction with sub-hour parabolic timing,
  flood/ebb/slack phase and rate.
- **Water column** — seasonal two-layer temperature-by-depth estimate with an
  active-feed-zone read for the selected mark.
- **Transparent ranking** — 40% tide & current, 25% temperature at fishing depth,
  20% swell / sea state, 15% habitat & access. Every mark shows its component scores.
- **Departure planning** — Kilrush Marina or Galway Docks route with the best
  fishing window in the next 24 h.

## Stack

React 18 + Vite, Leaflet. No backend; all data fetched client-side from open APIs.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production bundle in dist/
```

## Data lineage

- Bathymetry & seabed: [INFOMAR](https://www.infomar.ie/data) 25 m grid — contains
  Irish Public Sector Data (Geological Survey Ireland & Marine Institute), CC BY 4.0.
- Waves, SST & sea level: [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api).
- Marks researched from [sea-angling-ireland.org](https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm)
  and [Inland Fisheries Ireland](https://fishinginireland.info/liscannor-to-doonbeg/).

**Safety:** decision support only — not for navigation. Check local notices and
weather before departing.
