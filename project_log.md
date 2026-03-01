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
