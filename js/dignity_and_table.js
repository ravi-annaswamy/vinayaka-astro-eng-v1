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

  let table = `
    <table>
      <tr>
        <th>House</th>
        <th>Planet</th>
        <th>Dignity</th>
        <th>Nakshatra <br> Pada</th>
        <th>Nakshatra <br>Lord</th>
      </tr>
  `;

  planetaryPositions.forEach((planet) => {
    const planetLater = planetaryPositionsLater.find(p => p.name === planet.name);
    let retroSymbol = '';

    if (planet.name !== 'Rahu' && planet.name !== 'Ketu' && planetLater) {
      if (isRetrograde(planet.longitude, planetLater.longitude)) {
        retroSymbol = '(R)';
      }
    }

    let signIndex = signNameToIndex(planet.zodiacSign);
    let dignity = getDignity(planet.name, signIndex);

    table += `
      <tr>
        <td>${planet.houseNumber}</td>
        <td>${planet.name} ${retroSymbol}</td>
        <td>${dignity}</td>
        <td>${planet.nakshatraPada}</td>
        <td>${planet.nakshatraLord}</td>
      </tr>
    `;
  });

  table += '</table>';
  document.getElementById('result').innerHTML = table;
}
