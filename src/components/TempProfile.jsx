import { profileForSpot } from '../lib/marine.js';
import { SPECIES } from '../data/spots.js';

/**
 * Water-column temperature at the selected mark, derived from the live SST
 * and a seasonal mixed-layer/thermocline model for Irish inshore water.
 */
export default function TempProfile({ entry }) {
  const { spot, score } = entry;
  const sst = score.conditions.sst;
  const maxDepth = spot.depthBand[1];
  const profile = profileForSpot(sst, maxDepth);
  const drop = (profile[0].temp - profile[profile.length - 1].temp).toFixed(1);
  const feedTop = Math.max(2, Math.round(maxDepth * 0.15));
  const feedBottom = Math.round(maxDepth * 0.55);
  const primary = SPECIES[spot.species[0]].label;
  const secondary = spot.species[1] ? SPECIES[spot.species[1]].label.toLowerCase() : null;

  return (
    <article className="profile-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">WATER COLUMN</p><h2>Temperature by depth</h2></div>
        <span className="compact-select">{spot.name.toUpperCase()}</span>
      </div>
      <div className="profile-content">
        <div className="profile-graphic">
          {profile.map((p, i) => (
            <span key={p.depth} className="profile-pt" style={{ top: `${8 + i * 20}%`, left: `${10 + i * 16}%` }}>
              {p.temp.toFixed(1)}°
            </span>
          ))}
        </div>
        <div className="depth-axis">
          {profile.map((p, i) => (
            <span key={p.depth}>
              {p.depth}m <em>{label(i, p.depth, feedTop, feedBottom)}</em>
            </span>
          ))}
        </div>
        <div className="interpretation">
          <span className="interpret-icon">✦</span>
          <p>
            <strong>Read:</strong> {drop}°C drop from surface to {maxDepth}m.{' '}
            {Number(drop) < 1.5
              ? `A well-mixed column keeps ${primary.toLowerCase()}${secondary ? ` and ${secondary}` : ''} active through `
              : `Stratification is pushing feeding above the thermocline — work `}
            <b>{feedTop}–{feedBottom}m</b>
            {score.conditions.tide.phase === 'flood' ? ' on the flood.' : score.conditions.tide.phase === 'ebb' ? ' on the ebb.' : ' over slack water.'}
          </p>
        </div>
      </div>
    </article>
  );
}

function label(i, depth, feedTop, feedBottom) {
  if (i === 0) return 'Surface';
  if (depth >= feedTop && depth <= feedBottom) return 'Active feed zone';
  if (i === 3) return 'Thermocline';
  return 'Bottom water';
}
