/* 
   House layout for a standard South Indian chart.
   Each house index (0-11) points to row/col coords for drawing.
*/
var housePositions = [
  { row: 0, col: 1 }, // Aries
  { row: 0, col: 2 }, // Taurus
  { row: 0, col: 3 }, // Gemini
  { row: 1, col: 3 }, // Cancer
  { row: 2, col: 3 }, // Leo
  { row: 3, col: 3 }, // Virgo
  { row: 3, col: 2 }, // Libra
  { row: 3, col: 1 }, // Scorpio
  { row: 3, col: 0 }, // Sagittarius
  { row: 2, col: 0 }, // Capricorn
  { row: 1, col: 0 }, // Aquarius
  { row: 0, col: 0 }  // Pisces
];

function drawSouthChart(x, y, w, h, planetDetails, currentDate, currentTime, currentCity) {
  const mx = w / 4;
  const my = h / 4;
  let s = '<g>\n';

  const glyphMapping = {
    'Ascendant': 'Lag',
    'Sun': 'Sun',
    'Moon': 'Moo',
    'Mars': 'Mar',
    'Mercury': 'Mer',
    'Jupiter': 'Jup',
    'Venus': 'Ven',
    'Saturn': 'Sat',
    'Rahu': 'Rah',
    'Ketu': 'Ket',
    'Maandi': 'Maa',
  };

  let housePlanets = Array.from({length: 12}, () => []);

  planetDetails.forEach((planet) => {
    const houseIndex = Math.floor((planet.longitude % 360) / 30);
    const glyph = glyphMapping[planet.name] || planet.name;
    const degree = Math.ceil(planet.longitude % 30); // Round up to whole number
    housePlanets[houseIndex].push({ glyph, degree });
  });

  // Sort planets in each house as specified
  for (let i = 0; i < 12; i++) {
    if (i <= 5) { // Mesha to Kanya (Aries to Virgo)
      housePlanets[i].sort((a, b) => a.degree - b.degree); // Ascending
    } else { // Tula to Meena (Libra to Pisces)
      housePlanets[i].sort((a, b) => b.degree - a.degree); // Descending
    }
  }

  let lagnaIndex = null;
  const ascPlanet = planetDetails.find(p => p.name === 'Ascendant');
  if (ascPlanet && !isNaN(ascPlanet.longitude)) {
    lagnaIndex = Math.floor((ascPlanet.longitude % 360) / 30);
  }

  const mod12 = (num) => ((num % 12) + 12) % 12;
  let house4, house5, house7, house9, house10;
  if (lagnaIndex !== null) {
    house4 = mod12(lagnaIndex + 3);
    house5 = mod12(lagnaIndex + 4);
    house7 = mod12(lagnaIndex + 6);
    house9 = mod12(lagnaIndex + 8);
    house10 = mod12(lagnaIndex + 9);
  }

  housePositions.forEach((pos, index) => {
    const xd = x + pos.col * mx;
    const yd = y + pos.row * my;
    let fillColor = 'none';
    if (lagnaIndex !== null) {
      if (index === lagnaIndex) {
        fillColor = '#bbeeee';
      } else if (index === house4 || index === house7 || index === house10) {
        fillColor = '#e0f7fa';
      } else if (index === house5 || index === house9) {
        fillColor = '#e8f6e9';
      }
    }
    s += `<rect x="${xd}" y="${yd}" width="${mx}" height="${my}" style="fill:${fillColor};stroke:black;stroke-width:2"/>\n`;
  });

  const rowHeight = 20;
  for (let i = 0; i < 12; i++) {
    const planets = housePlanets[i];
    if (planets.length > 0) {
      const pos = housePositions[i];
      const cellX = x + pos.col * mx;
      const cellY = y + pos.row * my;
      const totalGridHeight = planets.length * rowHeight;
      const verticalOffset = (my - totalGridHeight) / 2;
      for (let j = 0; j < planets.length; j++) {
        const glyphX = cellX + (mx * 0.35);
        const degreeX = cellX + (mx * 0.75);
        const glyphY = cellY + verticalOffset + (j * rowHeight) + (rowHeight / 2);
        // Planet Glyph
        s += `<text x="${glyphX}" y="${glyphY}" fill="black" font-size="18" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${planets[j].glyph}</text>\n`;
        // Planet Degree (rounded up)
        s += `<text x="${degreeX}" y="${glyphY}" fill="black" font-size="14" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${planets[j].degree}°</text>\n`;
      }
    }
  }

  const centerX = x + w / 2;
  const centerY = y + h / 2;
  s += `<text x="${centerX}" y="${centerY}" fill="blue" font-size="15" font-family="monospace" font-weight="bold" text-anchor="middle">Rasi</text>\n`;
  s += '</g>\n';

  return s;
}




/**
 * Draws a North Indian (diamond) Rasi chart in SVG.
 * House positions are FIXED; signs rotate based on ascendant.
 */
function drawNorthChart(x, y, w, h, planetDetails, currentDate, currentTime, currentCity) {
  let s = '<g>\n';

  const glyphMapping = {
    'Ascendant': 'Lag', 'Sun': 'Sun', 'Moon': 'Moo', 'Mars': 'Mar',
    'Mercury': 'Mer', 'Jupiter': 'Jup', 'Venus': 'Ven', 'Saturn': 'Sat',
    'Rahu': 'Rah', 'Ketu': 'Ket', 'Maandi': 'Maa',
  };

  // Key geometry points
  const TL = [x, y], TR = [x + w, y], BR = [x + w, y + h], BL = [x, y + h];
  const T = [x + w / 2, y], R = [x + w, y + h / 2], B = [x + w / 2, y + h], L = [x, y + h / 2];
  const C = [x + w / 2, y + h / 2];
  const P1 = [x + w / 4, y + h / 4], P2 = [x + 3 * w / 4, y + h / 4];
  const P3 = [x + 3 * w / 4, y + 3 * h / 4], P4 = [x + w / 4, y + 3 * h / 4];

  // 12 house polygons (0-indexed: house 1 = index 0)
  const houses = [
    [T, P2, C, P1],   [T, TR, P2],     [TR, R, P2],     [P2, R, P3, C],
    [R, BR, P3],       [BR, B, P3],     [P3, B, P4, C],  [BL, B, P4],
    [L, BL, P4],       [P4, L, P1, C],  [TL, P1, L],     [TL, T, P1],
  ];

  // Find ascendant sign index (0-11)
  const ascPlanet = planetDetails.find(p => p.name === 'Ascendant');
  const ascSignIndex = (ascPlanet && !isNaN(ascPlanet.longitude))
    ? Math.floor((ascPlanet.longitude % 360) / 30) : 0;

  // Draw house fills (lagna, kendra, trikona highlighting)
  houses.forEach((verts, i) => {
    let fill = 'none';
    if (i === 0) fill = '#bbeeee';
    else if (i === 3 || i === 6 || i === 9) fill = '#e0f7fa';
    else if (i === 4 || i === 8) fill = '#e8f6e9';
    const points = verts.map(v => v.join(',')).join(' ');
    s += `<polygon points="${points}" style="fill:${fill};stroke:none"/>\n`;
  });

  // Draw structural lines: outer square
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:none;stroke:black;stroke-width:2"/>\n`;
  // Diamond edges (midpoint to midpoint)
  [[T, R], [R, B], [B, L], [L, T]].forEach(([a, b]) => {
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="black" stroke-width="1"/>\n`;
  });
  // Diagonals (corner to corner)
  [[TL, BR], [TR, BL]].forEach(([a, b]) => {
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="black" stroke-width="1"/>\n`;
  });

  // Group planets by house
  let housePlanets = Array.from({ length: 12 }, () => []);
  planetDetails.forEach(planet => {
    const signIdx = Math.floor((planet.longitude % 360) / 30);
    const houseIdx = ((signIdx - ascSignIndex) + 12) % 12;
    const glyph = glyphMapping[planet.name] || planet.name;
    const degree = Math.ceil(planet.longitude % 30);
    housePlanets[houseIdx].push({ glyph, degree });
  });
  housePlanets.forEach(hp => hp.sort((a, b) => a.degree - b.degree));

  // Centroid helper
  function centroid(verts) {
    const n = verts.length;
    return [
      verts.reduce((sum, v) => sum + v[0], 0) / n,
      verts.reduce((sum, v) => sum + v[1], 0) / n
    ];
  }

  // Sign label positions (near outer edge of each house)
  const signLabelPos = [
    [C[0], T[1] + 16],           // H1: near top
    [TR[0] - 30, T[1] + 14],     // H2: near top-right
    [TR[0] - 14, R[1] - 40],     // H3: near right upper
    [R[0] - 16, C[1]],           // H4: near right
    [BR[0] - 14, R[1] + 44],     // H5: near right lower
    [BR[0] - 30, B[1] - 14],     // H6: near bottom-right
    [C[0], B[1] - 12],           // H7: near bottom
    [BL[0] + 30, B[1] - 14],     // H8: near bottom-left
    [L[0] + 14, L[1] + 44],      // H9: near left lower
    [L[0] + 16, C[1]],           // H10: near left
    [TL[0] + 14, L[1] - 40],     // H11: near left upper
    [TL[0] + 30, T[1] + 14],     // H12: near top-left
  ];

  // Draw sign number labels
  for (let i = 0; i < 12; i++) {
    const signNum = ((ascSignIndex + i) % 12) + 1;
    const [lx, ly] = signLabelPos[i];
    s += `<text x="${lx}" y="${ly}" fill="#999" font-size="12" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${signNum}</text>\n`;
  }

  // Draw planets in each house
  for (let i = 0; i < 12; i++) {
    const planets = housePlanets[i];
    if (planets.length === 0) continue;
    const ctr = centroid(houses[i]);
    const isDiamond = (i === 0 || i === 3 || i === 6 || i === 9);
    // Dynamic row height: triangle houses get tighter spacing when crowded
    const maxHeight = isDiamond ? 80 : 65;
    const rh = Math.min(18, maxHeight / planets.length);
    const fontSize = isDiamond ? 16 : (planets.length > 3 ? 12 : 14);
    const spread = isDiamond ? 22 : 16;
    const totalHeight = planets.length * rh;
    const startY = ctr[1] - totalHeight / 2 + rh / 2;

    for (let j = 0; j < planets.length; j++) {
      const py = startY + j * rh;
      s += `<text x="${ctr[0] - spread}" y="${py}" fill="black" font-size="${fontSize}" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${planets[j].glyph}</text>\n`;
      s += `<text x="${ctr[0] + spread}" y="${py}" fill="black" font-size="${fontSize - 2}" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${planets[j].degree}°</text>\n`;
    }
  }

  // Center label with white background for readability
  s += `<rect x="${C[0] - 26}" y="${C[1] - 10}" width="52" height="20" fill="white" fill-opacity="0.85" stroke="none" rx="3"/>\n`;
  s += `<text x="${C[0]}" y="${C[1] + 2}" fill="blue" font-size="13" font-family="monospace" font-weight="bold" text-anchor="middle">Rasi</text>\n`;
  s += '</g>\n';
  return s;
}

/**
 * Draws a North Indian (diamond) Navamsa chart in SVG.
 */
function drawNorthNavamsaChart(x, y, w, h, planetDetails) {
  let s = '<g>\n';

  const glyphMapping = {
    'Ascendant': 'Lag', 'Sun': 'Sun', 'Moon': 'Moo', 'Mars': 'Mar',
    'Mercury': 'Mer', 'Jupiter': 'Jup', 'Venus': 'Ven', 'Saturn': 'Sat',
    'Rahu': 'Rah', 'Ketu': 'Ket', 'Maandi': 'Maa',
  };

  // Key geometry points (same as Rasi North chart)
  const TL = [x, y], TR = [x + w, y], BR = [x + w, y + h], BL = [x, y + h];
  const T = [x + w / 2, y], R = [x + w, y + h / 2], B = [x + w / 2, y + h], L = [x, y + h / 2];
  const C = [x + w / 2, y + h / 2];
  const P1 = [x + w / 4, y + h / 4], P2 = [x + 3 * w / 4, y + h / 4];
  const P3 = [x + 3 * w / 4, y + 3 * h / 4], P4 = [x + w / 4, y + 3 * h / 4];

  const houses = [
    [T, P2, C, P1],   [T, TR, P2],     [TR, R, P2],     [P2, R, P3, C],
    [R, BR, P3],       [BR, B, P3],     [P3, B, P4, C],  [BL, B, P4],
    [L, BL, P4],       [P4, L, P1, C],  [TL, P1, L],     [TL, T, P1],
  ];

  // Find navamsa ascendant sign
  const ascPlanet = planetDetails.find(p => p.name === 'Ascendant');
  const navAscSign = ascPlanet ? calculateNavamsaPosition(ascPlanet.longitude) : 0;

  // Draw structural lines: outer square
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:none;stroke:black;stroke-width:2"/>\n`;
  [[T, R], [R, B], [B, L], [L, T]].forEach(([a, b]) => {
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="black" stroke-width="1"/>\n`;
  });
  [[TL, BR], [TR, BL]].forEach(([a, b]) => {
    s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="black" stroke-width="1"/>\n`;
  });

  // Group planets by navamsa house
  let housePlanets = Array.from({ length: 12 }, () => []);
  planetDetails.forEach(planet => {
    const navSign = calculateNavamsaPosition(planet.longitude);
    const houseIdx = ((navSign - navAscSign) + 12) % 12;
    const glyph = glyphMapping[planet.name] || planet.name;
    housePlanets[houseIdx].push(glyph);
  });

  function centroid(verts) {
    const n = verts.length;
    return [
      verts.reduce((sum, v) => sum + v[0], 0) / n,
      verts.reduce((sum, v) => sum + v[1], 0) / n
    ];
  }

  // Sign label positions (same layout as Rasi)
  const signLabelPos = [
    [C[0], T[1] + 16],           [TR[0] - 30, T[1] + 14],
    [TR[0] - 14, R[1] - 40],     [R[0] - 16, C[1]],
    [BR[0] - 14, R[1] + 44],     [BR[0] - 30, B[1] - 14],
    [C[0], B[1] - 12],           [BL[0] + 30, B[1] - 14],
    [L[0] + 14, L[1] + 44],      [L[0] + 16, C[1]],
    [TL[0] + 14, L[1] - 40],     [TL[0] + 30, T[1] + 14],
  ];

  for (let i = 0; i < 12; i++) {
    const signNum = ((navAscSign + i) % 12) + 1;
    const [lx, ly] = signLabelPos[i];
    s += `<text x="${lx}" y="${ly}" fill="#999" font-size="12" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${signNum}</text>\n`;
  }

  // Draw planets (glyphs only, no degrees) in two-column layout
  const rowHeight = 20;
  for (let i = 0; i < 12; i++) {
    const glyphs = housePlanets[i];
    if (glyphs.length === 0) continue;
    const ctr = centroid(houses[i]);
    const isDiamond = (i === 0 || i === 3 || i === 6 || i === 9);
    const fontSize = isDiamond ? 16 : 14;
    const numRows = Math.ceil(glyphs.length / 2);
    const totalHeight = numRows * rowHeight;
    const startY = ctr[1] - totalHeight / 2 + rowHeight / 2;
    const colSpread = isDiamond ? 28 : 22;

    for (let j = 0; j < glyphs.length; j++) {
      const row = Math.floor(j / 2);
      const col = j % 2;
      const gx = (glyphs.length === 1) ? ctr[0] : ctr[0] + (col === 0 ? -colSpread : colSpread);
      const gy = startY + row * rowHeight;
      s += `<text x="${gx}" y="${gy}" fill="black" font-size="${fontSize}" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${glyphs[j]}</text>\n`;
    }
  }

  // Center label
  s += `<rect x="${C[0] - 40}" y="${C[1] - 10}" width="80" height="20" fill="white" fill-opacity="0.85" stroke="none" rx="3"/>\n`;
  s += `<text x="${C[0]}" y="${C[1] + 2}" fill="blue" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">Navamsha</text>\n`;
  s += '</g>\n';
  return s;
}

/**
 * Draws the Navamsa chart (in SVG).
 * @param {number} x - Top-left x offset.
 * @param {number} y - Top-left y offset.
 * @param {number} w - Chart width.
 * @param {number} h - Chart height.
 * @param {Array} planetDetails - Planet info array.
 * @returns {string} An SVG string representing the Navamsa chart.
 */
function drawNavamsaChart(x, y, w, h, planetDetails) {
  const mx = w / 4; // width of each house
  const my = h / 4; // height of each house
  let s = '<g>\n';
  
  // Glyph mapping: key = full name, value = new glyph.
  const glyphMapping = {
    'Ascendant': 'Lag',
    'Sun': 'Sun',
    'Moon': 'Moo',
    'Mars': 'Mar',
    'Mercury': 'Mer',
    'Jupiter': 'Jup',
    'Venus': 'Ven',
    'Saturn': 'Sat',
    'Rahu': 'Rah',
    'Ketu': 'Ket',
    'Maandi': 'Maa',
  };

  // Create an array (for 12 houses) to group glyphs by navamsa.
  let housePlanets = [];
  for (let i = 0; i < 12; i++) {
    housePlanets.push([]);
  }
  
  // Group each planet’s glyph into its corresponding navamsa house.
  planetDetails.forEach((planet) => {
    let navamsaSign = calculateNavamsaPosition(planet.longitude);
    const glyph = glyphMapping[planet.name] || planet.name;
    housePlanets[navamsaSign].push(glyph);
  });

  // Draw the chart grid (houses).
  housePositions.forEach((pos) => {
    const xd = x + pos.col * mx;
    const yd = y + pos.row * my;
    s += `<rect x="${xd}" y="${yd}" width="${mx}" height="${my}" style="fill:none;stroke:black;stroke-width:2"/>\n`;
  });
  
  // For each house, layout the glyphs in a two-column grid centered in the cell.
  const rowHeight = 22; // vertical space for each row
  for (let i = 0; i < 12; i++) {
    const glyphs = housePlanets[i];
    if (glyphs.length > 0) {
      const pos = housePositions[i];
      const cellX = x + pos.col * mx;
      const cellY = y + pos.row * my;
      const numRows = Math.ceil(glyphs.length / 2);
      const totalGridHeight = numRows * rowHeight;
      const verticalOffset = (my - totalGridHeight) / 2;
      for (let j = 0; j < glyphs.length; j++) {
        const row = Math.floor(j / 2);
        const col = j % 2;
        const glyphX = (glyphs.length === 1) ? cellX + (mx / 2) : cellX + (col === 0 ? (mx * 0.30) : (mx * 0.70));
        const glyphY = cellY + verticalOffset + (row * rowHeight) + (rowHeight / 2);
        s += `<text x="${glyphX}" y="${glyphY}" fill="black" font-size="18" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${glyphs[j]}</text>\n`;
      }
    }
  }
  
  // Center the Navamsa chart label.
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  s += `<text x="${centerX}" y="${centerY}" fill="blue" font-size="16" font-family="monospace" font-weight="bold" font-color="blue" text-anchor="middle">Navamsha</text>\n`;
  s += '</g>\n';
  return s;
}

/**
 * Display the main (Rasi) chart in an SVG container.
 */
function displayChart(planetaryPositions, year, month, day, hour, minutes) {
  let currentDate = day + '-' + month + '-' + year;
  let currentTime = formatAMPM(hour, minutes);
  let selectedCity = document.getElementById('city').value;
  let currentCity = selectedCity;

  let svgContent;
  if (typeof currentChartStyle !== 'undefined' && currentChartStyle === 'north') {
    svgContent = drawNorthChart(4, 4, 392, 392, planetaryPositions, currentDate, currentTime, currentCity);
  } else {
    svgContent = drawSouthChart(4, 4, 392, 392, planetaryPositions, currentDate, currentTime, currentCity);
  }
  document.getElementById('chartContainer').innerHTML =
    '<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
    svgContent + '</svg>';
}


/**
 * Display the Navamsa chart in an SVG container.
 */
function displayNavamsaChart(navamsaPositions) {
  navamsaPositions.sort((a, b) => a.longitude - b.longitude);

  let navamsaSvgContent;
  if (typeof currentChartStyle !== 'undefined' && currentChartStyle === 'north') {
    navamsaSvgContent = drawNorthNavamsaChart(4, 4, 392, 392, navamsaPositions);
  } else {
    navamsaSvgContent = drawNavamsaChart(4, 4, 392, 392, navamsaPositions);
  }
  document.getElementById('navamsaChartContainer').innerHTML =
    '<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" version="1.1">' +
    navamsaSvgContent + '</svg>';
}
