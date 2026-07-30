import { SPECIES } from '../data/spots.js';
import { nowIndex, tideState, temperatureAtDepth } from './marine.js';

/**
 * Transparent opportunity score for each mark, 0–100.
 *
 *   40% tide & current  — tide phase/rate vs the state the mark fishes best on
 *   25% temperature     — water temp in the mark's fishing depth band vs the
 *                          preferred bands of its target species (plus season)
 *   20% sea state       — wave height/period vs what the mark type wants
 *                          (surf beaches want a working sea; rock ledges calm)
 *   15% habitat/access  — static structure quality from the INFOMAR seabed
 *                          context and the angling literature
 */
export function scoreSpot(spot, clusters) {
  const cluster = clusters[spot.cluster];
  if (!cluster) return null;
  const i = nowIndex(cluster);
  const hr = cluster.hours[i];
  const tide = tideState(cluster);

  const tideScore = scoreTide(spot, tide);
  const tempScore = scoreTemperature(spot, hr.sst);
  const seaScore = scoreSea(spot, hr.waveHeight, hr.wavePeriod);
  const habitatScore = spot.structure;

  const total = Math.round(
    tideScore * 40 + tempScore * 25 + seaScore * 20 + habitatScore * 15
  );

  return {
    total,
    parts: {
      tide: Math.round(tideScore * 40),
      temperature: Math.round(tempScore * 25),
      sea: Math.round(seaScore * 20),
      habitat: Math.round(habitatScore * 15)
    },
    conditions: { ...hr, tide }
  };
}

function scoreTide(spot, tide) {
  const moving = Math.min(Math.abs(tide.rate) / 0.45, 1); // 0.45 m/hr ≈ strong springs flow
  switch (spot.tideBias) {
    case 'flood': return tide.phase === 'flood' ? 0.55 + 0.45 * moving : 0.25 + 0.3 * moving;
    case 'ebb': return tide.phase === 'ebb' ? 0.55 + 0.45 * moving : 0.25 + 0.3 * moving;
    case 'low': return tide.phase === 'slack' ? 0.85 : 0.7 - 0.35 * moving;
    case 'highlow': return tide.phase === 'slack' ? 0.95 : 0.45 - 0.15 * moving;
    default: return 0.5 + 0.5 * moving;
  }
}

function scoreTemperature(spot, sst) {
  const month = new Date().getMonth() + 1;
  const midDepth = (spot.depthBand[0] + spot.depthBand[1]) / 2;
  const waterTemp = temperatureAtDepth(sst, midDepth, month);
  let sum = 0;
  for (const id of spot.species) {
    const sp = SPECIES[id];
    const [lo, hi] = sp.band;
    const inBand = waterTemp >= lo && waterTemp <= hi
      ? 1
      : Math.max(0, 1 - Math.min(Math.abs(waterTemp - lo), Math.abs(waterTemp - hi)) / 4);
    const inSeason = sp.months.includes(month) ? 1 : 0.35;
    sum += inBand * inSeason;
  }
  return sum / spot.species.length;
}

function scoreSea(spot, waveHeight, wavePeriod) {
  if (waveHeight == null) return 0.5;
  const period = wavePeriod ?? 8;
  const groundswell = Math.min(Math.max((period - 6) / 8, 0), 1); // long-period = cleaner sea
  switch (spot.kind) {
    case 'surf': {
      // Surf beaches want a working sea ~0.7–1.8 m, not flat, not a storm.
      const ideal = 1.2;
      const fit = Math.max(0, 1 - Math.abs(waveHeight - ideal) / 1.4);
      return Math.min(1, fit * (0.7 + 0.3 * groundswell));
    }
    case 'rock': {
      // Exposed ledges are unsafe and unfishable in a big sea.
      if (waveHeight > 2.2) return 0.05;
      return Math.max(0, 1 - waveHeight / 2.2) * (0.8 + 0.2 * groundswell);
    }
    default: // sheltered estuary/pier marks barely care
      return Math.max(0.55, 1 - waveHeight / 6);
  }
}

/** Rank all spots for the current window. */
export function rankSpots(spots, clusters) {
  return spots
    .map((s) => ({ spot: s, score: scoreSpot(s, clusters) }))
    .filter((r) => r.score)
    .sort((a, b) => b.score.total - a.score.total);
}

/**
 * Best fishing window in the next 24 h for a departure port: the 3–4 h block
 * around the flooding tide with the most marks in a fishable sea state.
 */
export function bestWindow(cluster) {
  const hrs = cluster.hours;
  const start = nowIndex(cluster);
  let best = null;
  for (let i = start; i < Math.min(hrs.length - 3, start + 24); i++) {
    let block = 0;
    for (let j = i; j < i + 4; j++) {
      const rising = j > 0 && hrs[j].seaLevel > hrs[j - 1].seaLevel;
      const calmish = hrs[j].waveHeight != null && hrs[j].waveHeight < 1.8;
      block += (rising ? 1 : 0.3) * (calmish ? 1 : 0.4);
    }
    if (!best || block > best.value) best = { value: block, index: i };
  }
  if (!best) return null;
  return { from: new Date(hrs[best.index].time), to: new Date(hrs[best.index + 3].time) };
}
