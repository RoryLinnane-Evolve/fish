import { SPECIES } from '../data/spots.js';

export default function SpotDetail({ entry, rank }) {
  const { spot, score } = entry;
  return (
    <article className="spot-detail">
      <div className="spot-detail-top">
        <div>
          <p className="eyebrow">SELECTED MARK · #{String(rank).padStart(2, '0')}</p>
          <h2>{spot.name}</h2>
          <p className="spot-type">{spot.type}</p>
        </div>
        <div className="mini-score">{score.total}</div>
      </div>
      <div className="species-row">
        <span>BEST FOR</span>
        <div>{spot.species.map((id) => <b key={id}>{SPECIES[id].label}</b>)}</div>
      </div>
      <div className="depth-read">
        <span>INFOMAR DEPTH BAND</span>
        <strong>{spot.depthBand[0]}–{spot.depthBand[1]}m</strong>
        <small>{spot.ground}</small>
      </div>
      <div className="signal-list">
        <div><i className={`signal ${cls(score.parts.tide, 40)}`} /><span>Tide & current</span><strong>{score.parts.tide}/40</strong></div>
        <div><i className={`signal ${cls(score.parts.temperature, 25)}`} /><span>Temperature at depth</span><strong>{score.parts.temperature}/25</strong></div>
        <div><i className={`signal ${cls(score.parts.sea, 20)}`} /><span>Swell & sea state</span><strong>{score.parts.sea}/20</strong></div>
        <div><i className={`signal ${cls(score.parts.habitat, 15)}`} /><span>Habitat & access</span><strong>{score.parts.habitat}/15</strong></div>
      </div>
      <p className="spot-note"><strong>Local intel:</strong> {spot.note}</p>
      <p className="spot-access">{spot.access}</p>
      <a className="full-button" href={spot.source} target="_blank" rel="noreferrer">MARK RESEARCH SOURCE <span>↗</span></a>
    </article>
  );
}

function cls(v, max) {
  const r = v / max;
  return r >= 0.7 ? 'good' : r >= 0.45 ? '' : 'muted-signal';
}
