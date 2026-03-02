# Vinayaka Astro Eng V1 - Project Log

## 2026-03-01 - Full UI Translation: Tamil to English

**Task**: Translate the entire user interface from Tamil to English.

### Changes Made (9 files):

| File | Changes |
|------|---------|
| `index.html` | Title -> "Sri Karpaka Vinayagar Astrology", author -> "Ravichandran", button -> "Calculate", summary table headers -> English, planet name lookups (Sun/Moon/Ascendant) |
| `js/constants.js` | Rashi names -> Mesha/Rishabha/etc, Nakshatra names -> Ashwini/Bharani/etc, Planet names -> Sun/Moon/Mars/etc, Nakshatra lords -> English, Dasha lord names -> English |
| `js/astro_calc.js` | Planet name array -> English (Ascendant, Sun, Moon, Mars, etc.) |
| `js/charts.js` | Glyph mapping -> 3-letter English (Lag, Sun, Moo, Mar, Mer, Jup, Ven, Sat, Rah, Ket, Maa), center text -> English, chart labels: Rasi/Navamsa, city display -> English |
| `js/dignity_and_table.js` | Sign map -> English rashi names, planet dignities keys -> English, dignity labels (Own Sign/Exalted/Debilitated), table headers (House/Planet/Degree/Dignity/Nakshatra Pada/Lord), retrograde marker (R) |
| `js/dashas.js` | All headers/labels -> English (Dasha Sequence, Mahadasha, Bhukti, Antara, Start, End), summary panel -> English (Natal Dasha Balance, Current Age, Current Dasha-Bhukti), timeline markers (Birth/Today), age format (y/m/d), Moon lookup -> English |
| `js/panchanga.js` | Sentence builder -> English format with transliterated Sanskrit terms (Nakshatra, Thithi, Karana, Yoga) |
| `js/sunrise.js` | Weekday names -> English, Day/Night period markers |
| `js/cities.js` | City display names -> English |

### Naming Conventions Used:
- **Rashi**: Mesha, Rishabha, Mithuna, Kataka, Simha, Kanya, Thula, Vrischika, Dhanus, Makara, Kumbha, Meena
- **Planets**: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Ascendant, Maandi
- **Chart Glyphs**: Sun, Moo, Mar, Mer, Jup, Ven, Sat, Rah, Ket, Lag, Maa
- **Dignities**: Own Sign, Exalted, Debilitated
- **Panchanga terms**: English names from Sanskrit transliteration (Pratipada, Vishkambha, Bava, etc.)

### Notes:
- `js/app3.js` and `js/highlighting.js` are legacy files NOT loaded in index.html - left untouched
- Tamil lookup objects in `panchanga.js` (THITHI_NAMES_TAMIL, YOGA_NAMES_TAMIL, etc.) are now dead code but left in place

---

### User Prompt:
> I would like to translate the user interface entirely into English. let me know if you need anything from me.
> can you please use names like Mesha RIshabha etc for the rashi names? You can use Sun Moon etc for planet names and use Three letter glyphs Sun Moo Mar Mer Jup Ven Sat Rah Ket and Lag for the display on the chart.

---

## 2026-03-01 18:30 - Swiss Ephemeris Migration

**Task**: Replace the built-in VSOP-lite planet calculation engine with Swiss Ephemeris (WASM) for higher accuracy.

### Architecture:
- **Package**: `swisseph-wasm` (npm) — Swiss Ephemeris compiled to WebAssembly, self-contained with embedded ephemeris data
- **Loading**: CDN via `<script type="module">` from jsDelivr (`https://cdn.jsdelivr.net/npm/swisseph-wasm@latest/src/swisseph.js`)
- **Ayanamsa**: Lahiri (SE_SIDM_LAHIRI) — standard for Indian/Vedic astrology
- **Fallback**: Built-in VSOP engine remains as automatic fallback if WASM fails to load
- **Node types**: Mean node for Rahu (SE_MEAN_NODE), Ketu = Rahu + 180°

### Changes Made (3 files):

| File | Changes |
|------|---------|
| `js/astro_calc.js` | Added `calculatePlanetaryPositionsSwe()` using Swiss Eph API (`calc_ut`, `houses`, `get_ayanamsa_ut`). Modified `calculatePlanetaryPositions()` to delegate to SWE when `window.sweInstance` is available, otherwise fall back to built-in engine. Added `getAscFromHouseResult()` helper for defensive house result parsing. |
| `js/dignity_and_table.js` | Added 'Ascendant' and 'Maandi' to retrograde exclusion list (these are not planets and should never show retrograde). |
| `index.html` | Added `<script type="module">` block that imports SwissEph from CDN, initializes WASM, sets Lahiri ayanamsa, stores as `window.sweInstance`, and re-renders. Added engine label (`#engineLabel`) in report subtitle showing "Swiss Ephemeris" or "Built-in Engine". Added engine indicator update in `calculatePositions()`. |

### How It Works:
1. Page loads normally — DOMContentLoaded triggers `calculatePositions()` using the built-in VSOP engine (instant)
2. Swiss Ephemeris WASM module loads asynchronously in the background
3. When WASM is initialized (~1-2 seconds), it re-triggers `calculatePositions()` with the higher-accuracy engine
4. All subsequent "Calculate" button clicks use Swiss Ephemeris
5. If WASM fails (no internet, old browser), the built-in engine continues working seamlessly

### Swiss Eph Integration Details:
- **Ascendant**: Computed via `swe.houses(jd, lat, lon, 'W')` (Whole Sign house system), then tropical ascendant converted to sidereal by subtracting ayanamsa from `swe.get_ayanamsa_ut(jd)`
- **Planets**: Computed via `swe.calc_ut(jd, bodyId, SEFLG_SWIEPH | SEFLG_SIDEREAL)` — returns sidereal longitude directly
- **Coordinate convention**: Swiss Eph uses East+/North+ (standard geographic), vs the built-in engine's East-negative convention
- **Time parameter**: Swiss Eph uses Julian Day (jd) directly; converted from Julian centuries via `jd = t * 36525 + 2451545`

### Tested:
- Chennai (India, East longitude, North latitude) — OK
- New York (USA, West longitude, North latitude) — OK
- Melbourne (Australia, East longitude, South latitude) — OK
- All features verified: Rasi chart, Navamsa chart, planet table, dignities, retrograde detection, Dasha calculations, Panchanga

### User Prompt:
> Dont make code changes, but let me know if it makes sense to switch planet position calculation to Swiss Ephemeris engine.
> please go ahead and do it

---

## 2026-03-01 20:00 - North Indian Diamond Chart Toggle + Planets Table Update

**Task**: Add a toggle to display charts in North Indian (diamond) style, and update the planets table to show Rashi names and inline status abbreviations.

### Changes Made (3 files):

| File | Changes |
|------|---------|
| `js/charts.js` | Added `drawNorthChart()` (~100 lines) — draws North Indian diamond Rasi chart with SVG polygons, diagonal lines, sign number labels, and planet placement. Added `drawNorthNavamsaChart()` (~80 lines) — same diamond layout for Navamsa. Modified `displayChart()` and `displayNavamsaChart()` to branch on `currentChartStyle` toggle state. |
| `js/dignity_and_table.js` | Added `COMBUSTION_ORBS` constant with standard Vedic combustion degree orbs per planet. Added `isCombust()` function for combustion detection. Added `buildPlanetDisplayName()` helper to combine planet name with status abbreviations (R, Exa., Deb., Own., Comb.). Rewrote `displayPlanetaryTable()` to add Rashi column, remove Dignity column, and use inline status labels. |
| `index.html` | Added "South Indian / North Indian" segmented toggle buttons with CSS. Added `currentChartStyle` global variable with `localStorage` persistence. Added `setChartStyle()` function to switch styles and re-render. Added print CSS rule to hide toggle. |

### North Indian Chart Geometry:
- Outer square + two diagonals (corner to corner) + diamond (connecting midpoints of sides)
- Creates 12 house regions: 4 diamond quadrilaterals (houses 1,4,7,10) + 8 corner triangles
- House positions are FIXED; signs rotate based on ascendant
- Sign numbers (1-12) shown as small labels near outer edge of each house
- Same house coloring scheme: lagna (cyan), kendras (light blue), trikonas (light green)
- Dynamic row height for crowded triangle houses (up to 8 planets)

### Planets Table Changes:
- **Before**: House | Planet | Dignity | Nakshatra Pada | Nakshatra Lord
- **After**: House | Planet | Rashi | Nakshatra Pada | Nakshatra Lord
- Planet column now shows inline status: `Mars (R) Deb.`, `Mercury Comb.`, `Moon Own.`, etc.
- Combustion orbs: Moon 12°, Mars 17°, Mercury 14° (12° retro), Jupiter 11°, Venus 10° (8° retro), Saturn 15°

### User Prompt:
> I would like to make a few changes: Add option to show North Indian Style charts (toggle).
> One of the example layouts is here for that 'diamond chart'.
> Secondly update the planets table to include a column right after the planet names to show the rashi names Mesha etc. To save real estate, you can drop the planet status column and add (Own., Deb. Exa. Comb. Retro.) to the planet name.
