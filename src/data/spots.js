/**
 * Researched shore/inshore marks on the Clare coast (Loop Head to Black Head)
 * plus the Shannon Estuary approaches used from Kilrush, and the Galway Bay
 * side used from Galway.
 *
 * Sources (mark descriptions, target species, ground type):
 *  - sea-angling-ireland.org — "The shore marks of South Clare" and
 *    "The shore marks of North Clare" (Spanish Point, Doughmore, Kilkee,
 *    Loop Head, Black Head, Ballyreen, Fanore).
 *  - fishinginireland.info (Inland Fisheries Ireland) — "Liscannor to Doonbeg"
 *    (Liscannor Beach, Lahinch Beach, Doonbeg marks).
 *  - doonbeg.info — local angling notes; the Irish record bass
 *    (17 lb 4 oz) was taken at Doonbeg.
 *
 * Depth bands are read from INFOMAR bathymetry (INSS/INFOMAR 25 m grid,
 * GSI & Marine Institute, CC BY 4.0) for the ground immediately off each mark.
 */

export const PORTS = {
  kilrush: { id: 'kilrush', name: 'Kilrush Marina', lat: 52.6392, lng: -9.487 },
  galway: { id: 'galway', name: 'Galway Docks', lat: 53.2687, lng: -9.048 }
};

/** Marine model cluster points (must sit in open water for the wave/SST grid). */
export const CLUSTERS = {
  shannon: { id: 'shannon', label: 'Shannon Estuary', lat: 52.58, lng: -9.72 },
  west: { id: 'west', label: 'West Clare', lat: 52.83, lng: -9.58 },
  north: { id: 'north', label: 'North Clare / Galway Bay', lat: 53.12, lng: -9.45 }
};

/** Preferred sea-surface temperature bands (°C) and peak months per species. */
export const SPECIES = {
  bass: { label: 'Bass', band: [12, 18], months: [5, 6, 7, 8, 9, 10] },
  mackerel: { label: 'Mackerel', band: [11, 16], months: [6, 7, 8, 9] },
  flounder: { label: 'Flounder', band: [6, 15], months: [1, 2, 8, 9, 10, 11, 12] },
  pollack: { label: 'Pollack', band: [8, 14], months: [4, 5, 6, 7, 8, 9, 10] },
  wrasse: { label: 'Wrasse', band: [10, 17], months: [5, 6, 7, 8, 9] },
  ray: { label: 'Thornback ray', band: [9, 15], months: [4, 5, 6, 7, 8, 9, 10] },
  tope: { label: 'Tope', band: [12, 18], months: [6, 7, 8, 9] },
  dogfish: { label: 'Dogfish', band: [8, 15], months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  conger: { label: 'Conger', band: [8, 14], months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  seatrout: { label: 'Sea trout', band: [8, 14], months: [6, 7, 8, 9] },
  trigger: { label: 'Triggerfish', band: [14, 19], months: [7, 8, 9] }
};

/**
 * kind: 'surf' (storm beach), 'rock' (platform/ledge), 'sheltered' (pier/estuary)
 * structure: 0–1 static habitat quality (reef edges, channels, tide races)
 * tideBias: state that fishes best at the mark per the angling literature
 */
export const SPOTS = [
  {
    id: 'loop-head',
    name: 'Loop Head & Kilbaha',
    lat: 52.5688, lng: -9.8985,
    cluster: 'west', kind: 'rock',
    type: 'Headland tide race · rock ledges',
    ground: 'Fast slope onto hard rock, kelp gullies',
    depthBand: [15, 40],
    species: ['mackerel', 'pollack', 'wrasse', 'trigger', 'bass'],
    structure: 0.95, tideBias: 'flood',
    access: 'Long ledges; only in settled seas — swell wraps the head.',
    note: 'Superb wrasse and pollack ground the whole way round the head; triggerfish in late summer.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'carrigaholt',
    name: 'Carrigaholt Castle & Pier',
    lat: 52.5836, lng: -9.703,
    cluster: 'shannon', kind: 'sheltered',
    type: 'Estuary pier · rough ground',
    ground: 'Coloured estuary water over mixed bottom',
    depthBand: [4, 20],
    species: ['ray', 'dogfish', 'flounder', 'mackerel', 'conger'],
    structure: 0.7, tideBias: 'flood',
    access: 'Easy pier access; fishes day and night in the coloured water.',
    note: 'Sheltered Shannon mark — thornbacks and dogfish are the staple, mackerel off the pier in summer.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'cappa',
    name: 'Cappa Pier & Scattery Roads',
    lat: 52.632, lng: -9.508,
    cluster: 'shannon', kind: 'sheltered',
    type: 'Sheltered estuary pier',
    ground: 'Shallow banks off Scattery Island',
    depthBand: [3, 16],
    species: ['flounder', 'ray', 'tope', 'dogfish'],
    structure: 0.65, tideBias: 'flood',
    access: 'Beside Kilrush Marina; fishable in almost any weather.',
    note: 'Famous pack-tope and thornback water in the shallow Scattery channels.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'kilkee',
    name: 'Kilkee — Duggerna Reef',
    lat: 52.6779, lng: -9.658,
    cluster: 'west', kind: 'rock',
    type: 'Reef platform (Pollock Holes)',
    ground: 'Limestone reef, deep pots and gullies',
    depthBand: [5, 25],
    species: ['wrasse', 'pollack', 'mackerel', 'dogfish'],
    structure: 0.85, tideBias: 'low',
    access: 'Platform exposed near low water; big Atlantic rollers are lethal here.',
    note: 'The reef pots hold ballan wrasse; pollack and mackerel off the outer edge.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'doughmore',
    name: 'Doughmore Strand (Doonbeg)',
    lat: 52.7566, lng: -9.526,
    cluster: 'west', kind: 'surf',
    type: 'Storm beach · surf gutters',
    ground: 'Clean sand with outer banks',
    depthBand: [2, 10],
    species: ['bass', 'flounder', 'ray', 'tope', 'dogfish'],
    structure: 0.8, tideBias: 'highlow',
    access: 'Southern end fishes best; unusual mark — best right on high or low water.',
    note: 'The Irish record bass (17 lb 4 oz) came off the sand at Doonbeg.',
    source: 'https://fishinginireland.info/liscannor-to-doonbeg/'
  },
  {
    id: 'quilty',
    name: 'Quilty & Seafield Pier',
    lat: 52.8175, lng: -9.456,
    cluster: 'west', kind: 'sheltered',
    type: 'Pier · mixed ground behind Mutton Island',
    ground: 'Sand and weedy reef in the lee of Mutton Island',
    depthBand: [3, 14],
    species: ['bass', 'flounder', 'mackerel', 'dogfish'],
    structure: 0.7, tideBias: 'flood',
    access: 'Pier and rock options; watch weed banks after storms.',
    note: 'A previous Irish record bass was taken just above Quilty.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'spanish-point',
    name: 'Spanish Point',
    lat: 52.848, lng: -9.4405,
    cluster: 'west', kind: 'surf',
    type: 'Beach · reef edges',
    ground: 'Sand gutters between Armada reefs',
    depthBand: [2, 12],
    species: ['flounder', 'bass', 'wrasse', 'mackerel', 'pollack'],
    structure: 0.75, tideBias: 'flood',
    access: 'Beach fishes into darkness; spin the rocks either side in daylight.',
    note: 'Named for the 1588 Armada wreck on the reefs around Mutton Island.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20s.htm'
  },
  {
    id: 'lahinch',
    name: 'Lahinch Beach & Inagh Estuary',
    lat: 52.931, lng: -9.348,
    cluster: 'west', kind: 'surf',
    type: 'Surf beach · river estuary',
    ground: 'Storm sand, main channel of the Inagh',
    depthBand: [1, 8],
    species: ['bass', 'flounder', 'seatrout'],
    structure: 0.75, tideBias: 'flood',
    access: 'Fish the river end away from bathers; lures in the channel at high water.',
    note: 'Classic Clare surf mark — bass and flounder in a working surf, sea trout in the channel.',
    source: 'https://fishinginireland.info/liscannor-to-doonbeg/'
  },
  {
    id: 'liscannor',
    name: 'Liscannor Beach & Pier',
    lat: 52.9366, lng: -9.389,
    cluster: 'west', kind: 'surf',
    type: 'Beach near river mouth',
    ground: 'Sand, lug beds by the Inagh mouth',
    depthBand: [2, 10],
    species: ['bass', 'flounder'],
    structure: 0.65, tideBias: 'flood',
    access: 'Park at the lay-by past the pitch & putt; fish 200 m east toward the river.',
    note: 'Best in early flood or high water with lugworm and sandeel.',
    source: 'https://fishinginireland.info/liscannor-to-doonbeg/'
  },
  {
    id: 'doolin',
    name: 'Doolin Point',
    lat: 53.0114, lng: -9.409,
    cluster: 'north', kind: 'rock',
    type: 'Rock point · beach corner',
    ground: 'Flags and boulders north of the beach',
    depthBand: [4, 18],
    species: ['bass', 'mackerel', 'pollack', 'flounder'],
    structure: 0.7, tideBias: 'flood',
    access: 'Spin over the rocks at the north end; ferry swell can make it unfishable.',
    note: 'Bass and mackerel spinning over rock; flatfish on the sand.',
    source: 'https://www.ballyvaughan-cottages.com/burren/sea-angling-shore'
  },
  {
    id: 'ballyreen',
    name: 'Ballyreen Ledges',
    lat: 53.068, lng: -9.364,
    cluster: 'north', kind: 'rock',
    type: 'Competition rock ledges',
    ground: 'Clean ground off deep ledges, foul close in',
    depthBand: [8, 30],
    species: ['wrasse', 'pollack', 'mackerel', 'ray', 'conger'],
    structure: 0.85, tideBias: 'any',
    access: 'Ledges are numbered for competitions; a drop net helps with better fish.',
    note: 'Deep fertile water under the Burren — rays and even porbeagle recorded.',
    source: 'https://www.ballyvaughan-cottages.com/burren/sea-angling-shore'
  },
  {
    id: 'fanore',
    name: 'Fanore Beach',
    lat: 53.1216, lng: -9.28,
    cluster: 'north', kind: 'surf',
    type: 'Storm beach · river channel',
    ground: 'Sand with the Caher river channel',
    depthBand: [1, 8],
    species: ['bass', 'flounder', 'dogfish', 'ray'],
    structure: 0.7, tideBias: 'flood',
    access: 'Get the right side of the river; bait and advice in the village shop.',
    note: 'Night fishing puts thornbacks on the sand; bass off the southern rocks.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20n.htm'
  },
  {
    id: 'black-head',
    name: 'Black Head',
    lat: 53.1531, lng: -9.264,
    cluster: 'north', kind: 'rock',
    type: 'Deep rock platform · current line',
    ground: 'Limestone shelf into deep Galway Bay water',
    depthBand: [10, 35],
    species: ['mackerel', 'pollack', 'wrasse', 'conger', 'ray'],
    structure: 0.8, tideBias: 'flood',
    access: 'Marks numbered on the rocks; know the hot-spots or you will blank.',
    note: 'Competition-grade mark at the mouth of Galway Bay; sting ray recorded.',
    source: 'https://www.sea-angling-ireland.org/shore%20-%20clare%20n.htm'
  }
];
