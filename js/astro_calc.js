// --------------------------------------------------------------------
// Swiss Ephemeris integration (uses window.sweInstance when available)
// --------------------------------------------------------------------

/**
 * Extract ascendant longitude from Swiss Eph houses() result.
 * Handles multiple possible return formats from different wrapper versions.
 */
function getAscFromHouseResult(result) {
  if (!result) return null;
  if (typeof result.ascendant === 'number') return result.ascendant;
  if (result.ascmc && typeof result.ascmc[0] === 'number') return result.ascmc[0];
  if (Array.isArray(result) && result.length >= 2 &&
      Array.isArray(result[1]) && typeof result[1][0] === 'number') {
    return result[1][0];
  }
  return null;
}

/**
 * Calculate planetary positions using Swiss Ephemeris.
 * Returns the same array format as the built-in engine.
 */
function calculatePlanetaryPositionsSwe(t, cityInfo) {
  const swe = window.sweInstance;
  const jd = t * 36525.0 + 2451545.0;

  // Geographic coords: Swiss Eph uses East+, North+
  let geoLon = parseFloat(cityInfo.longitude.degrees) + parseFloat(cityInfo.longitude.minutes / 60);
  if (cityInfo.longitude.direction === 'W') geoLon *= -1;
  let geoLat = parseFloat(cityInfo.latitude.degrees) + parseFloat(cityInfo.latitude.minutes / 60);
  if (cityInfo.latitude.direction === 'S') geoLat *= -1;

  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL;

  // --- Ascendant ---
  // Get tropical ascendant from houses(), then subtract ayanamsa
  const houseResult = swe.houses(jd, geoLat, geoLon, 'W');
  const tropicalAsc = getAscFromHouseResult(houseResult);
  const ayanamsa = swe.get_ayanamsa_ut(jd);
  let pp = new Array(10);
  pp[0] = tropicalAsc !== null
    ? (((tropicalAsc - ayanamsa) % 360) + 360) % 360
    : 0;

  // --- Planet positions (sidereal via SEFLG_SIDEREAL) ---
  const sweBodyIds = [
    swe.SE_SUN,        // pp[1]
    swe.SE_MOON,       // pp[2]
    swe.SE_MARS,       // pp[3]
    swe.SE_MERCURY,    // pp[4]
    swe.SE_JUPITER,    // pp[5]
    swe.SE_VENUS,      // pp[6]
    swe.SE_SATURN,     // pp[7]
    swe.SE_MEAN_NODE   // pp[8] = Rahu (mean node)
  ];

  for (let i = 0; i < sweBodyIds.length; i++) {
    const pos = swe.calc_ut(jd, sweBodyIds[i], flags);
    pp[i + 1] = ((pos[0] % 360) + 360) % 360;
  }

  // Ketu = Rahu + 180°
  pp[9] = (pp[8] + 180) % 360;

  // --- Build planetaryPositions array (same format as built-in engine) ---
  let signIndices = chPlanets(pp);
  let planetaryPositions = [];
  let planetNames = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (let i = 0; i < planetNames.length; i++) {
    let longitude = pp[i].toFixed(1);
    let zodiacSign = signIndices[i] ? indianZodiacTamil[signIndices[i] - 1] : 'N/A';
    let nakshatraPada = calculateNakshatraPada(pp[i]);
    let nakshatraIndex = Math.floor(pp[i] / 13.33);
    let nakshatraLord = nakshatraLordsTamil[nakshatraIndex % 27];
    let houseNumber = (signIndices[i] - signIndices[0] + 12) % 12 + 1;

    planetaryPositions.push({
      name: planetNames[i],
      nakshatraPada: nakshatraPada.nakshatra + ' ' + nakshatraPada.pada,
      zodiacSign: zodiacSign,
      degree: (pp[i] % 30).toFixed(1),
      longitude: parseFloat(longitude),
      nakshatraLord: nakshatraLord,
      houseNumber: houseNumber
    });
  }

  return planetaryPositions;
}

// --------------------------------------------------------------------

/**
 * Calculate the Nakshatra name (Tamil) and Pada from a given degree.
 * @param {number} degree - Planetary longitude in degrees.
 * @returns {{nakshatra: string, pada: number}}
 */
function calculateNakshatraPada(degree) {
  const degreesPerNakshatra = 40 / 3;  // exactly 13.3333...
  const degreesPerPada = 10 / 3;       // exactly 3.3333...

  const nakshatraIndex = Math.floor(degree / degreesPerNakshatra) % 27;
  const pada = Math.floor((degree % degreesPerNakshatra) / degreesPerPada) + 1;

  const nakshatraName = nakshatraNamesTamil[nakshatraIndex];
  return { nakshatra: nakshatraName, pada: pada };
}

/**
 * Calculate the Navamsa position index (0-11) for a given longitude.
 * @param {number} longitude - Planetary longitude.
 * @returns {number} navamsaSign - Index from 0 to 11 representing the navamsa sign.
 */
function calculateNavamsaPosition(longitude) {
  // Determine which sign the planet is in (0-11)
  let sign = Math.floor(longitude / 30);
  // Position within that sign (0 to <30)
  let posInSign = longitude % 30;
  // Navamsa division within the sign
  let navamsa = Math.floor(posInSign / 3.333);
  // Final navamsa sign index
  let navamsaSign = (sign * 9 + navamsa) % 12;
  return navamsaSign;
}

/**
 * Calculate planetary positions given the time t, timeData, and city info.
 * @param {number} t - (Possibly) Julian day or other time factor.
 * @param {Object} timeData - Contains .time etc.
 * @param {Object} cityInfo - Contains lat/lon/timezone data.
 * @returns {Array} Planetary positions array with name, nakshatraPada, etc.
 */
function calculatePlanetaryPositions(t, timeData, cityInfo) {
  // Use Swiss Ephemeris when available (more accurate)
  if (window.sweInstance) {
    return calculatePlanetaryPositionsSwe(t, cityInfo);
  }

  // --- Fall back to built-in VSOP engine ---
  let lon = parseFloat(cityInfo.longitude.degrees) + parseFloat(cityInfo.longitude.minutes / 60);
  if (cityInfo.longitude.direction === 'E') {
    lon *= -1;
  }
  let lat = parseFloat(cityInfo.latitude.degrees) + parseFloat(cityInfo.latitude.minutes / 60);
  if (cityInfo.latitude.direction === 'S') {
    lat *= -1;
  }

  let as = ascendant(t, timeData.time, lon, lat);
  let pp = new Array(10);
  pp[0] = as;

  planets(t, pp, 1);

  let signIndices = chPlanets(pp);
  let planetaryPositions = [];
  let planetNames = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (let i = 0; i < planetNames.length; i++) {
    let longitude = (pp[i] !== undefined && !isNaN(pp[i])) ? pp[i].toFixed(1) : 'N/A';
    let degreeInSign = (pp[i] !== undefined && !isNaN(pp[i])) ? (pp[i] % 30).toFixed(1) : 'N/A';
    let zodiacSign = signIndices[i] ? indianZodiacTamil[signIndices[i] - 1] : 'N/A';
    let nakshatraPada = (pp[i] !== undefined && !isNaN(pp[i]))
      ? calculateNakshatraPada(pp[i])
      : { nakshatra: 'N/A', pada: 'N/A' };
    let nakshatraIndex = Math.floor(pp[i] / 13.33);
    let nakshatraLord = nakshatraLordsTamil[nakshatraIndex % 27];
    let houseNumber = (signIndices[i] - signIndices[0] + 12) % 12 + 1;

    planetaryPositions.push({
      name: planetNames[i],
      nakshatraPada: nakshatraPada.nakshatra + ' ' + nakshatraPada.pada,
      zodiacSign: zodiacSign,
      degree: degreeInSign,
      longitude: parseFloat(longitude),
      nakshatraLord: nakshatraLord,
      houseNumber: houseNumber
    });
  }

  return planetaryPositions;
}

/**
 * Compute Navamsa positions from the main planetary positions array.
 * Sort them by ascending longitude so they appear in an ordered manner.
 */
function calculateNavamsaPositions(planetaryPositions) {
  return planetaryPositions.map((planet) => {
    let navamsaSign = calculateNavamsaPosition(planet.longitude);
    let navamsaSignName = indianZodiacTamil[navamsaSign];
    return { ...planet, navamsaSign: navamsaSignName };
  });
}

function calcnavamsha(ppos) {
  let darray = new Array(10);
  for (let i = 0; i < 10; i++) {
    let m = Math.floor(60 * ppos[i]);
    m /= 200;
    darray[i] = Math.floor(m % 12);
  }
  return darray;
}

/**
 * Return array of signs (1-based) for each planet from raw positions.
 * p is assumed to have 10 elements for 10 planets/points.
 */
function chPlanets(p) {
  let sg = new Array(10);
  for (let i = 0; i < 10; i++) {
    sg[i] = parseInt(Math.floor(p[i]) / 30) + 1;
  }
  return sg;
}
