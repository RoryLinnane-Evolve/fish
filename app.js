const spots = {
  loop: { name: 'Loop Head', type: 'Tide race · rock / mixed ground', score: 91, species: ['Mackerel', 'Bass', 'Pollack'], depth: '12–28m', bottom: 'Fast slope, hard bottom', signals: [16, 24, 18, 14] },
  spanish: { name: 'Spanish Point', type: 'Beach gutter · mixed ground', score: 87, species: ['Bass', 'Flounder', 'Mackerel'], depth: '3–14m', bottom: 'Sand channels, broken reef', signals: [21, 22, 17, 12] },
  lahinch: { name: 'Lahinch Reef', type: 'Outer reef · kelp edge', score: 84, species: ['Pollack', 'Bass', 'Mackerel'], depth: '6–22m', bottom: 'Kelp and rock fingers', signals: [17, 21, 19, 13] },
  doolin: { name: 'Doolin Ledges', type: 'Rock ledges · drop-off', score: 76, species: ['Pollack', 'Mackerel', 'Wrasse'], depth: '10–35m', bottom: 'Stepped rock', signals: [13, 18, 17, 12] },
  black: { name: 'Black Head', type: 'Current line · limestone reef', score: 72, species: ['Mackerel', 'Pollack', 'Coalfish'], depth: '14–40m', bottom: 'Limestone shelf', signals: [12, 17, 16, 11] }
};
const detail = document.getElementById('spotDetail');
function selectSpot(key) {
  const s = spots[key];
  document.getElementById('spotName').textContent = s.name;
  document.getElementById('spotType').textContent = s.type;
  document.getElementById('spotScore').textContent = s.score;
  document.getElementById('speciesTags').innerHTML = s.species.map(x => `<b>${x}</b>`).join('');
  document.getElementById('spotDepth').textContent = s.depth;
  document.getElementById('spotBottom').textContent = s.bottom;
  ['tempSignal','tideSignal','swellSignal','accessSignal'].forEach((id,i)=>document.getElementById(id).textContent=`+${s.signals[i]}`);
  document.querySelectorAll('.spot').forEach(el => el.classList.toggle('selected', el.dataset.spot === key));
  detail.scrollIntoView({behavior:'smooth',block:'nearest'});
}
document.querySelectorAll('.spot').forEach(el => el.addEventListener('click', () => selectSpot(el.dataset.spot)));
document.getElementById('rankingList').innerHTML = Object.values(spots).map((s,i) => `<div class="rank-row"><span class="rank-no">0${i+1}</span><div class="rank-place"><strong>${s.name}</strong><span>${s.species.slice(0,2).join(' · ')}</span></div><div class="rank-bar"><i style="width:${s.score}%"></i></div><span class="rank-score">${s.score}</span></div>`).join('');
let galway = false;
document.getElementById('routeToggle').addEventListener('click', (e) => { galway = !galway; document.querySelector('.route-origin strong').textContent = galway ? 'Galway Harbour' : 'Kilrush Marina'; document.getElementById('window-time').textContent = galway ? '06:10 — 10:05' : '05:40 — 09:20'; e.currentTarget.innerHTML = galway ? 'KILRUSH ROUTE <span>→</span>' : 'GALWAY ROUTE <span>→</span>'; });
document.querySelectorAll('.map-layer').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.map-layer').forEach(x => x.classList.remove('active')); b.classList.add('active'); }));
