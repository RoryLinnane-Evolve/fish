import { useCallback, useEffect, useMemo, useState } from 'react';
import ClareMap from './components/ClareMap.jsx';
import SpotDetail from './components/SpotDetail.jsx';
import TempProfile from './components/TempProfile.jsx';
import { SPOTS, PORTS, CLUSTERS } from './data/spots.js';
import { fetchMarine, nowIndex, tideState, fmtTime } from './lib/marine.js';
import { rankSpots, bestWindow } from './lib/scoring.js';

const PORT_CLUSTER = { kilrush: 'shannon', galway: 'north' };

export default function App() {
  const [clusters, setClusters] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState('loop-head');
  const [port, setPort] = useState('kilrush');
  const [showBathy, setShowBathy] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchMarine()
      .then((data) => alive && setClusters(data))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  const ranked = useMemo(
    () => (clusters ? rankSpots(SPOTS, clusters) : []),
    [clusters]
  );
  const onSelect = useCallback((id) => setSelected(id), []);

  if (error) {
    return (
      <div className="boot-screen">
        <strong>Marine data unavailable</strong>
        <p>Open-Meteo marine model could not be reached ({error}). Reload to retry.</p>
      </div>
    );
  }
  if (!clusters) {
    return <div className="boot-screen"><span className="loader" /> Loading live marine conditions…</div>;
  }

  const portCluster = clusters[PORT_CLUSTER[port]];
  const i = nowIndex(portCluster);
  const now = portCluster.hours[i];
  const tide = tideState(portCluster);
  const west = clusters.west;
  const westNow = west.hours[nowIndex(west)];
  const win = bestWindow(portCluster);
  const sel = ranked.find((r) => r.spot.id === selected) ?? ranked[0];
  const selRank = ranked.indexOf(sel) + 1;
  const dayScore = Math.round(ranked.slice(0, 5).reduce((a, r) => a + r.score.total, 0) / 5);
  const today = new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'short' }).toUpperCase();

  return (
    <>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">⌁</span><span>pelagic</span></div>
        <div className="region-tag">CLARE COAST / IRELAND</div>
        <nav>
          <a className="active" href="#overview"><span>▦</span> Conditions overview</a>
          <a href="#map"><span>◎</span> Grounds explorer</a>
          <a href="#ranking"><span>↗</span> Spot ranking</a>
          <a href="#method"><span>◌</span> Method & data</a>
        </nav>
        <div className="sidebar-bottom">
          <p>SAFETY FIRST</p>
          <span>Decision support only.<br />Check local notices and weather.</span>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">OPERATIONS DESK <span className="live-dot" /> LIVE MARINE MODEL</p>
            <h1>Clare coast <span>fishing outlook</span></h1>
            <p className="subhead">Live tide, swell and water temperature scored against thirteen researched marks.</p>
          </div>
          <div className="header-controls">
            <button className="date-control">TODAY · {today} <span>⌄</span></button>
            <div className="avatar">RL</div>
          </div>
        </header>

        <section className="route-card" aria-label="Departure plan">
          <div className="route-origin"><span className="origin-dot" /><div><small>DEPARTURE</small><strong>{PORTS[port].name}</strong></div></div>
          <div className="route-line"><i /><i /><i /></div>
          <div className="route-destination"><span className="target-dot" /><div><small>BEST WINDOW · NEXT 24H</small><strong>{win ? `${fmtTime(win.from)} — ${fmtTime(win.to)}` : '—'}</strong></div></div>
          <div className="route-divider" />
          <div><small>TIDE NOW</small><strong className="teal">{tide.phase === 'flood' ? 'Flooding' : tide.phase === 'ebb' ? 'Ebbing' : 'Slack'} {tide.level >= 0 ? '+' : ''}{tide.level?.toFixed(1)}m</strong></div>
          <div><small>SEA STATE</small><strong>{now.waveHeight?.toFixed(1)}m · {Math.round(now.wavePeriod)}s</strong></div>
          <button
            className="outline-button"
            onClick={() => setPort(port === 'kilrush' ? 'galway' : 'kilrush')}
          >
            {port === 'kilrush' ? 'GALWAY ROUTE' : 'KILRUSH ROUTE'} <span>→</span>
          </button>
        </section>

        <section id="overview" className="metric-grid">
          <article className="metric-card">
            <div className="card-label"><span className="metric-icon">≋</span> TIDE / {PORTS[port].name.split(' ')[0].toUpperCase()}</div>
            <div className="metric-value">{tide.level >= 0 ? '+' : ''}{tide.level?.toFixed(1)}<small>m</small></div>
            <div className="metric-meta">
              <span className={tide.rate >= 0 ? 'up' : 'down'}>{tide.rate >= 0 ? '↑' : '↓'} {Math.abs(tide.rate).toFixed(2)}m/hr</span>
              {tide.next && <> · {tide.next.type === 'high' ? 'High' : 'Low'} {fmtTime(tide.next.time)}</>}
            </div>
            <TideSpark cluster={portCluster} />
          </article>
          <article className="metric-card">
            <div className="card-label"><span className="metric-icon">◒</span> SEA SURFACE TEMP</div>
            <div className="metric-value">{now.sst?.toFixed(1)}<small>°C</small></div>
            <div className="metric-meta">Seasonal band {now.sst >= 12 && now.sst <= 18 ? <span className="pill good">FAVOURABLE</span> : <span className="pill">MARGINAL</span>}</div>
            <div className="temp-gradient"><span /><span /><span /><span /></div>
          </article>
          <article className="metric-card">
            <div className="card-label"><span className="metric-icon">≈</span> SWELL / WEST CLARE</div>
            <div className="metric-value">{westNow.waveHeight?.toFixed(1)}<small>m</small></div>
            <div className="metric-meta">{Math.round(westNow.wavePeriod)}s period · {compass(westNow.waveDirection)} {Math.round(westNow.waveDirection)}°</div>
            <SwellSpark cluster={west} />
          </article>
          <article className="metric-card">
            <div className="card-label"><span className="metric-icon">✦</span> TODAY'S INDEX</div>
            <div className="score-wrap"><div className="score">{dayScore}</div><div><strong>{dayScore >= 70 ? 'Strong' : dayScore >= 50 ? 'Fair' : 'Poor'}</strong><span>top-5 mark average</span></div></div>
            <div className="progress"><i style={{ width: `${dayScore}%` }} /></div>
          </article>
        </section>

        <section id="map" className="content-grid">
          <article className="map-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">INTELLIGENCE MAP</p><h2>Productive grounds</h2></div>
              <div className="map-actions">
                <button className={`map-layer ${showBathy ? 'active' : ''}`} onClick={() => setShowBathy(true)}>INFOMAR bathymetry</button>
                <button className={`map-layer ${showBathy ? '' : 'active'}`} onClick={() => setShowBathy(false)}>Ocean base</button>
              </div>
            </div>
            <div className="map-shell">
              <ClareMap ranked={ranked} selected={sel.spot.id} onSelect={onSelect} showBathy={showBathy} />
              <div className="map-legend"><span><i className="legend-dot hot" /> Score ≥ 70</span><span><i className="legend-dot" /> Monitored mark</span><span>⚓ Departure port</span></div>
            </div>
          </article>
          <SpotDetail entry={sel} rank={selRank} />
        </section>

        <section className="lower-grid">
          <TempProfile entry={sel} />
          <article id="ranking" className="ranking-panel">
            <div className="panel-heading"><div><p className="eyebrow">OPPORTUNITY QUEUE</p><h2>Ranked for this window</h2></div><a href="#method">How scored →</a></div>
            <div className="ranking-list">
              {ranked.map(({ spot, score }, idx) => (
                <button key={spot.id} className={`rank-row ${spot.id === sel.spot.id ? 'rank-selected' : ''}`} onClick={() => onSelect(spot.id)}>
                  <span className="rank-no">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="rank-place"><strong>{spot.name}</strong><span>{spot.type}</span></span>
                  <span className="rank-bar"><i style={{ width: `${score.total}%` }} /></span>
                  <span className="rank-score">{score.total}</span>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section id="method" className="method-bar">
          <div>
            <span className="method-icon">◇</span>
            <div>
              <strong>Transparent spot score</strong>
              <p>40% tide & current · 25% temperature at fishing depth · 20% swell / sea state · 15% habitat & access</p>
            </div>
          </div>
          <div className="source-note">
            <span>DATA LINEAGE</span>
            <p>
              Bathymetry & seabed: <a href="https://www.infomar.ie/data" target="_blank" rel="noreferrer">INFOMAR</a> 25m
              grid — contains Irish Public Sector Data (Geological Survey Ireland & Marine Institute), CC BY 4.0.
              Waves, SST & sea level: <a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noreferrer">Open-Meteo Marine API</a> (MFWAM / ECMWF).
              Marks researched from <a href="https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm" target="_blank" rel="noreferrer">sea-angling-ireland.org</a> and
              <a href="https://fishinginireland.info/liscannor-to-doonbeg/" target="_blank" rel="noreferrer"> Inland Fisheries Ireland</a>. Not for navigation.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function compass(deg) {
  if (deg == null) return '—';
  const pts = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return pts[Math.round(deg / 22.5) % 16];
}

function TideSpark({ cluster }) {
  const hrs = cluster.hours.slice(0, 30);
  const levels = hrs.map((h) => h.seaLevel ?? 0);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const pts = levels.map((v, idx) => `${(idx / (levels.length - 1)) * 300},${44 - ((v - min) / (max - min || 1)) * 38}`).join(' ');
  return (
    <div className="tide-chart" aria-hidden="true">
      <svg viewBox="0 0 300 50" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon points={`${pts} 300,50 0,50`} fill="currentColor" opacity=".08" />
      </svg>
    </div>
  );
}

function SwellSpark({ cluster }) {
  const start = nowIndex(cluster);
  const hrs = cluster.hours.slice(start, start + 10);
  const max = Math.max(...hrs.map((h) => h.waveHeight ?? 0), 1);
  return (
    <div className="swell-bars" aria-hidden="true">
      {hrs.map((h, idx) => <b key={idx} style={{ height: `${Math.max(4, ((h.waveHeight ?? 0) / max) * 34)}px` }} />)}
    </div>
  );
}
