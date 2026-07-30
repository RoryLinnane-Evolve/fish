import { CLUSTERS } from '../data/spots.js';

/**
 * Live marine conditions from the Open-Meteo Marine API
 * (MeteoFrance MFWAM wave model + NOAA/ECMWF SST, open data, no key).
 * One request fetches all three Clare coast cluster points.
 */
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';

export async function fetchMarine() {
  const clusters = Object.values(CLUSTERS);
  const params = new URLSearchParams({
    latitude: clusters.map((c) => c.lat).join(','),
    longitude: clusters.map((c) => c.lng).join(','),
    hourly: [
      'wave_height',
      'wave_period',
      'wave_direction',
      'sea_surface_temperature',
      'sea_level_height_msl'
    ].join(','),
    timezone: 'Europe/Dublin',
    forecast_days: '2'
  });
  const res = await fetch(`${MARINE_URL}?${params}`);
  if (!res.ok) throw new Error(`Marine API ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json];
  const byCluster = {};
  clusters.forEach((c, i) => {
    byCluster[c.id] = normalise(list[i]);
  });
  return byCluster;
}

function normalise(raw) {
  const h = raw.hourly;
  const hours = h.time.map((t, i) => ({
    time: t,
    waveHeight: h.wave_height[i],
    wavePeriod: h.wave_period[i],
    waveDirection: h.wave_direction[i],
    sst: h.sea_surface_temperature[i],
    seaLevel: h.sea_level_height_msl[i]
  }));
  return { hours, utcOffsetSeconds: raw.utc_offset_seconds };
}

/** Index of the hour closest to now. */
export function nowIndex(cluster) {
  const now = Date.now();
  let best = 0;
  let bestDiff = Infinity;
  cluster.hours.forEach((hr, i) => {
    const diff = Math.abs(new Date(hr.time).getTime() - now);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  });
  return best;
}

/**
 * Extract tide events (high/low water) from the hourly sea-level series by
 * fitting a parabola through each local extremum for sub-hour timing.
 */
export function tideEvents(cluster) {
  const hrs = cluster.hours;
  const events = [];
  for (let i = 1; i < hrs.length - 1; i++) {
    const [a, b, c] = [hrs[i - 1].seaLevel, hrs[i].seaLevel, hrs[i + 1].seaLevel];
    if (a == null || b == null || c == null) continue;
    const isHigh = b >= a && b >= c && b !== a;
    const isLow = b <= a && b <= c && b !== a;
    if (!isHigh && !isLow) continue;
    const denom = a - 2 * b + c;
    const frac = denom !== 0 ? 0.5 * (a - c) / denom : 0;
    const t = new Date(new Date(hrs[i].time).getTime() + frac * 3600e3);
    const level = b - 0.25 * (a - c) * frac;
    events.push({ type: isHigh ? 'high' : 'low', time: t, level: Math.round(level * 100) / 100 });
  }
  return events;
}

/** Current tide state: level, rate (m/hr), phase label, next event. */
export function tideState(cluster) {
  const i = nowIndex(cluster);
  const hrs = cluster.hours;
  const level = hrs[i].seaLevel;
  const prev = hrs[Math.max(0, i - 1)].seaLevel;
  const rate = Math.round((level - prev) * 100) / 100;
  const events = tideEvents(cluster);
  const next = events.find((e) => e.time.getTime() > Date.now());
  const phase = rate > 0.05 ? 'flood' : rate < -0.05 ? 'ebb' : 'slack';
  return { level, rate, phase, next, events };
}

/**
 * Estimate the temperature profile through the water column from the modelled
 * SST using a seasonal two-layer (mixed layer + thermocline) approximation
 * for Irish coastal water. Summer stratification ≈1.5–2.5 °C over 40 m;
 * winter columns are near-isothermal. Depth in metres, result °C.
 */
export function temperatureAtDepth(sst, depth, month = new Date().getMonth() + 1) {
  const stratification = [0.1, 0.1, 0.2, 0.5, 1.0, 1.6, 2.2, 2.4, 1.8, 1.0, 0.4, 0.2][month - 1];
  const mixedLayer = 8; // m — typical inshore summer mixed-layer depth
  if (depth <= mixedLayer) return round1(sst - (depth / mixedLayer) * 0.2 * stratification);
  const below = Math.min((depth - mixedLayer) / 32, 1);
  return round1(sst - 0.2 * stratification - below * stratification);
}

export function profileForSpot(sst, maxDepth) {
  const steps = [0, Math.round(maxDepth * 0.2), Math.round(maxDepth * 0.45), Math.round(maxDepth * 0.7), maxDepth];
  return steps.map((d) => ({ depth: d, temp: temperatureAtDepth(sst, d) }));
}

function round1(x) { return Math.round(x * 10) / 10; }

export function fmtTime(d) {
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false });
}
