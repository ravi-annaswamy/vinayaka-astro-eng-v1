# Vinayaka Astro Eng V1

English-language Vedic astrology web app for generating a birth-time planetary view with South Indian charts and Dasha timelines.

## What this app does

- Computes planetary longitudes (Ascendant, Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) for a selected date/time and city using **Swiss Ephemeris** (Lahiri ayanamsa).
- Calculates and adds **Maandi** based on sunrise/sunset and Vedic day-period rules.
- Renders **Rasi chart** in South Indian layout with 3-letter English glyphs (Lag, Sun, Moo, Mar, Mer, Jup, Ven, Sat, Rah, Ket, Maa).
- Renders **Navamsa chart**.
- Shows sunrise/sunset and Vedic weekday period (Vedic Daytime / Vedic Nighttime).
- Builds a planetary details table with house number, dignity (Own Sign, Exalted, Debilitated), nakshatra/pada, nakshatra lord, and retrograde marker `(R)` where applicable.
- Generates Vimshottari Dasha data in English with interactive Mahadasha, Bhukti, and Antara views plus a visual dasha timeline strip.
- Builds a Panchanga summary (Nakshatra, Thithi, Karana, Yoga, Paksha).

## UI inputs

- Year: `1800` to `2200`
- Month, day, hour, minute
- Predefined city list (India + selected global cities such as London, New York, Chicago, Dubai, Melbourne, etc.)

## Tech stack

- Plain HTML/CSS/JavaScript (no build system, no framework)
- Client-side only calculations
- SVG chart rendering
- **Swiss Ephemeris** via `swisseph-wasm` (WebAssembly, loaded from CDN) — falls back to built-in VSOP engine if unavailable

## Key files

- `index.html`
  Main page, input controls, styling, orchestration (`calculatePositions()`), Swiss Ephemeris module loader.
- `js/astro_calc.js`
  Planetary position shaping — uses Swiss Eph when available, built-in engine as fallback. Nakshatra/Pada, Navamsa calculations.
- `js/planets.js` + `js/planterms2.js`
  Built-in fallback astronomy engine (VSOP-lite terms).
- `js/charts.js`
  South Indian Rasi/Navamsa SVG rendering.
- `js/dignity_and_table.js`
  Retrograde check, dignity mapping, planetary result table output.
- `js/dashas.js`
  Vimshottari Dasha/Bhukti/Antara generation and rendering.
- `js/cities.js`
  City coordinates, timezone metadata, DST handling helpers.
- `js/sunrise.js`
  NOAA-style sunrise/sunset calculation and Vedic weekday determination.
- `js/date_utils.js`
  Date formatting and system Julian day utility.
- `js/panchanga.js`
  Panchanga calculation (Thithi, Yoga, Karana, Nakshatra, Paksha).
- `js/constants.js`
  Global arrays: rashi names (Mesha/Rishabha/…), nakshatra names, planet names, dasha lords.

## Run locally

This is a static client-side app. Because the Swiss Ephemeris module script uses ES module imports, serve it through a local server (not via `file://`):

```bash
cd /Users/raviannaswamy/projects/vinayaka-astro-eng-v1
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Contributors

- **Ravichandran** — original author and domain expert
- **Claude (Anthropic)** — UI translation, Swiss Ephemeris integration, engineering assistance
- **Codex (OpenAI)** — prior development contributions

## Notes

- Rashi names: Mesha, Rishabha, Mithuna, Kataka, Simha, Kanya, Thula, Vrischika, Dhanus, Makara, Kumbha, Meena.
- Planet positions use **Lahiri ayanamsa** (standard for Indian Vedic astrology).
- Swiss Ephemeris loads asynchronously; on first render the built-in engine is used, then the page re-renders automatically with higher-accuracy Swiss Eph results (~1-2 seconds).
- Adding new cities requires updating `js/cities.js` with coordinates and timezone.
