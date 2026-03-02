# Vinayaka Astro Eng V1

**Sri Karpaka Vinayaka Astrology** — English-language Vedic astrology web app for generating birth-time planetary charts, Dasha timelines, and Panchanga summaries.

## Features

### Planetary Calculations
- Computes sidereal longitudes for **11 celestial bodies**: Ascendant, Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, and Maandi
- Powered by **Swiss Ephemeris** (self-hosted WASM v0.0.5) with **Lahiri ayanamsa**
- Maandi position derived from sunrise/sunset and Vedic day-period rules

### Charts
- **South Indian** (grid) and **North Indian** (diamond) chart styles with a toggle button (choice persists via localStorage)
- **Rasi** and **Navamsha** charts rendered as SVG with 3-letter planet glyphs (Lag, Sun, Moo, Mar, Mer, Jup, Ven, Sat, Rah, Ket, Maa)
- House coloring: lagna (cyan), kendra houses (light blue), trikona houses (light green)

### Planetary Table
- Columns: House, Planet, Rashi, Nakshatra Pada, Nakshatra Lord
- Inline status abbreviations in parentheses: `(Retr., Exal., Debi., Own., Comb.)`
- **Combustion detection** with standard Vedic orbs per planet (Moon 12°, Mars 17°, Mercury 14°/12°R, Jupiter 11°, Venus 10°/8°R, Saturn 15°)

### Vimshottari Dasha
- Interactive three-level drill-down: click Mahadasha → Bhukti → Antara tables
- Color-coded timeline strip with Birth and Today markers
- Summary panel: natal dasha balance, current age, current dasha-bhukti with end dates
- Current running period highlighted in green

### Panchanga
- Nakshatra (with lord), Thithi (with end time), Karana, Yoga, Paksha
- Sunrise/sunset times and Vedic weekday (Vedic Daytime / Vedic Nighttime)

### Report & Export
- Summary table with date details, location metadata (lat/lon, timezone, DST), and panchanga
- Date format: DD-Mon-YYYY (e.g., 1-Mar-2026) for international clarity
- **Copy report** as PNG image to clipboard (HTTPS required)
- **Download PDF** (landscape A4 via html2canvas + jsPDF)
- Print-friendly CSS

### City Picker
- **28 cities** across 5 regions using native `<optgroup>` dropdown (mobile-friendly):
  - South India (12) — Chennai, Madurai, Coimbatore, etc.
  - North & Central India (5) — New Delhi, Mumbai, Kolkata, Hyderabad, Bengaluru
  - North America (6) — New York, San Francisco, Chicago, Houston, Phoenix, Westlake OH
  - Europe & Middle East (4) — London, Dubai, Cairo, Riyadh
  - Asia Pacific (3) — Colombo, Melbourne, Sydney
- DST support for US cities and London

## UI Inputs

- **Year**: 1800–2200, **Month**, **Day**, **Hour** (0–23), **Minute** (0–59)
- **City**: region-grouped dropdown (28 cities)

## Tech Stack

- Vanilla HTML / CSS / JavaScript — no build system, no framework
- Client-side only (all calculations in the browser)
- SVG chart rendering
- **Swiss Ephemeris** via self-hosted `swisseph-wasm` v0.0.5 (WebAssembly + embedded ephemeris data)
- **html2canvas** + **jsPDF** for report export (CDN)

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main page: input controls, styling, orchestration (`calculatePositions()`), Swiss Eph module loader |
| `js/astro_calc.js` | Swiss Ephemeris integration, nakshatra/pada calculation, Navamsa, Maandi |
| `js/charts.js` | South Indian + North Indian Rasi/Navamsha SVG chart rendering |
| `js/dignity_and_table.js` | Retrograde, dignity, combustion detection, planetary table output |
| `js/dashas.js` | Vimshottari Dasha/Bhukti/Antara generation, timeline strip, interactive tables |
| `js/panchanga.js` | Panchanga calculation (Thithi, Yoga, Karana, Nakshatra, Paksha) |
| `js/cities.js` | 28-city database with coordinates, timezone metadata, DST handling |
| `js/sunrise.js` | NOAA-style sunrise/sunset calculation and Vedic weekday determination |
| `js/date_utils.js` | Julian Day conversions (`date2jul`, `jul2dateDDMMYYYY`, `getSystemJD`) |
| `js/constants.js` | Global arrays: rashi names, nakshatra names/lords, planet names, dasha constants |
| `lib/swisseph-wasm/` | Self-hosted Swiss Ephemeris: JS wrapper, WASM binary, ephemeris data |

## Run Locally

Static client-side app. Requires a local server (ES module imports don't work via `file://`):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Contributors

- **Ravichandran** — original author and domain expert
- **Claude (Anthropic)** — UI translation, Swiss Ephemeris integration, engineering assistance
- **Codex (OpenAI)** — prior development contributions

## Notes

- **Rashi names**: Mesha, Rishabha, Mithuna, Kataka, Simha, Kanya, Thula, Vrischika, Dhanus, Makara, Kumbha, Meena
- **Ayanamsa**: Lahiri (SE_SIDM_LAHIRI) — standard for Indian Vedic astrology
- **Node type**: Mean node for Rahu (SE_MEAN_NODE); Ketu = Rahu + 180°
- Swiss Ephemeris WASM loads asynchronously; the page renders once the engine is ready
- Adding new cities requires updating `js/cities.js` with coordinates, timezone, and DST rules
