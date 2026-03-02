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

---

## 2026-03-01 21:00 - Chart Declutter + Planet Status Bracket Format

**Task**: Remove birth details from chart centers; change planet status display to bracket format with comma separation.

### Changes Made (2 files):

| File | Changes |
|------|---------|
| `js/charts.js` | Removed date, time, city, and "Sri Karpaka Vinayagar" text from center of South Indian Rasi chart (kept only "Rasi" label). Removed same from North Indian Rasi chart center, shrunk white background rect to just cover "Rasi" label. Navamsa charts already had only labels — no changes needed. |
| `js/dignity_and_table.js` | Rewrote `buildPlanetDisplayName()` to collect statuses into an array and wrap in parentheses with comma separation. Changed abbreviations: `Retr.` (was `(R)`), `Exal.` (was `Exa.`), `Debi.` (was `Deb.`), `Own.` (unchanged), `Comb.` (unchanged). |

### Planet Status Format:
- **Before**: `Mars (R) Deb.`, `Mercury Comb.`, `Moon Own.`
- **After**: `Mars (Comb.)`, `Mercury (Retr., Comb.)`, `Moon (Own.)`, `Venus (Retr., Debi.)`

### User Prompt:
> I would like to reduce clutter on the chart by removing the birth details inside the chart, just have Rasi and Navamsha both in south and north charts. Secondly, try to put planet status in brackets such as (Comb.)(Retr,)(Exal.)(Debi) (Own.) and if a planet has two status, put them with comma separation in same brackets.

---

## 2026-03-02 02:00 - Critical JD Calculation Bug Fix

**Task**: Fix nakshatra pada and dasha errors reported by user.

### Root Cause
The `calculateDateData()` function in `index.html` had `date2jul(month, day, year) + 0.5` which should have been `- 0.5`. The `date2jul()` function returns the Julian Day Number (JDN), which corresponds to **noon UT**. To get midnight UT (start of civil day), you subtract 0.5. The `+ 0.5` was pushing to midnight of the **next day**, making all planetary positions 1 full day off.

Similarly, `getSystemJD()` in `date_utils.js` was missing the `-0.5` adjustment, making the "today" marker 0.5 days off.

### Impact
- **Moon position**: Off by ~13° (one full nakshatra). Example: Mar 1, 2026 9AM Chennai showed Moon in Magha (120.6°) instead of correct Ashlesha (106.9°).
- **Natal dasha lord**: Ketu instead of correct Mercury.
- **All planet positions**: Shifted by 1 day's motion (negligible for slow planets like Saturn, significant for Moon and Ascendant).
- **Dasha balance**: Incorrect because based on wrong Moon position.

### Fixes Applied (4 files):

| File | Fix |
|------|-----|
| `index.html` (line 1054) | `date2jul(...) + 0.5` → `date2jul(...) - 0.5` — fixes birth chart JD by 1 day |
| `js/date_utils.js` (line 71) | Added `- 0.5` in `getSystemJD()` — fixes "today" JD by 0.5 days |
| `js/astro_calc.js` (line 75) | `13.33` → `40/3` — fixes nakshatra lord precision at boundaries (13.33 ≠ 360/27) |
| `js/astro_calc.js` (line 72) | `parseFloat(pp[i].toFixed(1))` → `pp[i]` — stores full-precision longitude for dasha accuracy |
| `js/charts.js` (lines 44, 180) | `Math.ceil` → `Math.floor` for chart degree display (prevents "30°" showing at sign boundary) |
| `index.html` (script tags) | Bumped all cache busters to `?v=3`/`?v=4` |

### Verification
- **JD check**: `calculateDateData(2026,3,1,3.5)` → JD 2461100.6458 (correct, was 2461101.6458)
- **Makara Sankranti**: Jan 14, 2026 noon Chennai → Sun at 29.9° Dhanus (about to enter Makara) ✓
- **`getSystemJD`**: Difference from correct value = 0 (was 0.5)
- **Moon**: Correctly shows Kataka/Ashlesha/Mercury instead of wrong Simha/Magha/Ketu

### User Prompt
> I see error in nakshatra pada and dasha

---

## 2026-03-02 03:00 - North Indian Chart Counter-Clockwise Fix

**Task**: Fix North Indian kundli house direction from clockwise to counter-clockwise.

### Root Cause
The `houses` array in both `drawNorthChart()` and `drawNorthNavamsaChart()` defined house positions going clockwise from H1 at the top (H1→H2 upper-right→H3 right-upper→H4 right...). Standard North Indian kundli has houses proceeding **counter-clockwise** (H1→H2 upper-left→H3 left-upper→H4 left...).

### Changes Made (2 files):

| File | Changes |
|------|---------|
| `js/charts.js` | Reordered `houses` array in `drawNorthChart()` to go counter-clockwise: H2 upper-left, H3 left-upper, H4 left diamond, H5 left-lower, H6 lower-left, then H8 lower-right, H9 right-lower, H10 right diamond, H11 right-upper, H12 upper-right. Same fix in `drawNorthNavamsaChart()`. Reordered `signLabelPos` arrays in both functions to match. |
| `index.html` | Bumped charts.js cache buster to `?v=5` |

### House Layout (Counter-Clockwise):
```
         H12  |  H1  |  H2
        ------+------+------
         H11  | center|  H3
        ------+------+------
         H10  |  H7  |  H4
        ------+------+------
          H9  |  H8  |  H5/H6
```
(Diamond layout: H1/H4/H7/H10 are diamond quadrilaterals, others are triangles)

### Verification
- Visually confirmed: H1 at top (cyan lagna), houses proceed counter-clockwise
- Both Rasi and Navamsha North Indian charts corrected
- Sign number labels correctly positioned near each house

### User Prompt
> In the north indian kundli the placement of planets is in the anticlockwise, you have made it clockwise.
