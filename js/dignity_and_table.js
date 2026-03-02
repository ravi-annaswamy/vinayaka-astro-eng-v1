// --------------------------------------------------------------------
// Retrograde / dignity code (sample additions)
// --------------------------------------------------------------------

/**
 * Check if planet is retrograde by comparing two longitudes at two times.
 * If planet moves backward from currentDeg to laterDeg, returns true.
 */
function isRetrograde(currentDeg, laterDeg) {
  let diff = laterDeg - currentDeg;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (diff < 0);
}

/**
 * Map from Tamil sign name to index (1-12).
 */
function signNameToIndex(signName) {
  const signMap = {
    'Mesha': 1,
    'Rishabha': 2,
    'Mithuna': 3,
    'Kataka': 4,
    'Simha': 5,
    'Kanya': 6,
    'Thula': 7,
    'Vrischika': 8,
    'Dhanus': 9,
    'Makara': 10,
    'Kumbha': 11,
    'Meena': 12
  };
  return signMap[signName] || 0;
}

/* 
   Defines planet dignities for main Grahas except Rahu/Ketu.
   rulership: array of sign indexes (1..12).
   exaltation: single sign index, 
   debilitation: single sign index.
*/
const planetDignities = {
  'Sun': { rulership: [5], exaltation: 1, debilitation: 7 },
  'Moon': { rulership: [4], exaltation: 2, debilitation: 8 },
  'Mars': { rulership: [1, 8], exaltation: 10, debilitation: 4 },
  'Mercury': { rulership: [3, 6], exaltation: 6, debilitation: 12 },
  'Jupiter': { rulership: [9, 12], exaltation: 4, debilitation: 10 },
  'Venus': { rulership: [2, 7], exaltation: 12, debilitation: 6 },
  'Saturn': { rulership: [10, 11], exaltation: 7, debilitation: 1 }
};

/**
 * Combustion orbs (degrees) for each planet.
 * A planet is combust when within this angular distance of the Sun.
 */
const COMBUSTION_ORBS = {
  'Moon':    { normal: 12, retrograde: 12 },
  'Mars':    { normal: 17, retrograde: 17 },
  'Mercury': { normal: 14, retrograde: 12 },
  'Jupiter': { normal: 11, retrograde: 11 },
  'Venus':   { normal: 10, retrograde: 8 },
  'Saturn':  { normal: 15, retrograde: 15 },
};

/**
 * Check if a planet is combust (too close to the Sun).
 */
function isCombust(planetName, planetLongitude, sunLongitude, isRetro) {
  const orbs = COMBUSTION_ORBS[planetName];
  if (!orbs) return false;
  let dist = Math.abs(planetLongitude - sunLongitude);
  if (dist > 180) dist = 360 - dist;
  return dist < (isRetro ? orbs.retrograde : orbs.normal);
}

/**
 * Build display name with status abbreviations appended.
 * e.g. "Sun Exa.", "Mars (R) Deb.", "Venus Comb."
 */
function buildPlanetDisplayName(planetName, isRetro, dignity, combust) {
  let display = planetName;
  const statuses = [];
  if (isRetro) statuses.push('Retr.');
  const abbrevMap = { 'Own Sign': 'Own.', 'Exalted': 'Exal.', 'Debilitated': 'Debi.' };
  if (abbrevMap[dignity]) statuses.push(abbrevMap[dignity]);
  if (combust) statuses.push('Comb.');
  if (statuses.length > 0) display += ' (' + statuses.join(', ') + ')';
  return display;
}

/**
 * Returns a dignity string ("Own Sign", "Exalted", "Debilitated", or "-") for the
 * given planetName in the given signIndex (1..12).
 */
function getDignity(planetName, signIndex) {
  if (planetName === 'Rahu' || planetName === 'Ketu') return '-';
  let pd = planetDignities[planetName];
  if (!pd) return '-';

  if (signIndex === pd.exaltation) return 'Exalted';
  if (signIndex === pd.debilitation) return 'Debilitated';
  if (pd.rulership.includes(signIndex)) return 'Own Sign';
  return '-';
}

/**
 * Creates an HTML table of planetary info, checking for retrograde and dignity.
 * planetaryPositions = array at time1
 * planetaryPositionsLater = array at a slightly later time to check retrograde
 */
function displayPlanetaryTable(planetaryPositions, planetaryPositionsLater) {
  // Sort by houseNumber, then longitude
  planetaryPositions.sort((a, b) => a.houseNumber - b.houseNumber || a.longitude - b.longitude);
  planetaryPositionsLater.sort((a, b) => a.houseNumber - b.houseNumber || a.longitude - b.longitude);

  // Find Sun's longitude for combustion check
  const sunPlanet = planetaryPositions.find(p => p.name === 'Sun');
  const sunLongitude = sunPlanet ? sunPlanet.longitude : null;

  let table = `
    <table>
      <tr>
        <th>House</th>
        <th>Planet</th>
        <th>Rashi</th>
        <th>Nakshatra <br> Pada</th>
        <th>Nakshatra <br>Lord</th>
      </tr>
  `;

  planetaryPositions.forEach((planet) => {
    const planetLater = planetaryPositionsLater.find(p => p.name === planet.name);
    let isRetro = false;

    if (planet.name !== 'Rahu' && planet.name !== 'Ketu' &&
        planet.name !== 'Ascendant' && planet.name !== 'Maandi' && planetLater) {
      isRetro = isRetrograde(planet.longitude, planetLater.longitude);
    }

    let signIndex = signNameToIndex(planet.zodiacSign);
    let dignity = getDignity(planet.name, signIndex);
    let combust = (sunLongitude !== null) ? isCombust(planet.name, planet.longitude, sunLongitude, isRetro) : false;
    let displayName = buildPlanetDisplayName(planet.name, isRetro, dignity, combust);

    table += `
      <tr>
        <td>${planet.houseNumber}</td>
        <td>${displayName}</td>
        <td>${planet.zodiacSign}</td>
        <td>${planet.nakshatraPada}</td>
        <td>${planet.nakshatraLord}</td>
      </tr>
    `;
  });

  table += '</table>';
  document.getElementById('result').innerHTML = table;
}
