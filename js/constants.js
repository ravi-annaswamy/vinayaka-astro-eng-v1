
/* 
  Global variables (chart data, zodiac arrays, etc.)
  Some remain as var for broad scope usage in this file.
*/
var country,
    tzname,
    chName,
    chDate,
    chTime,
    chPlace,
    chZone,
    chLon,
    chLat,
    chStyle,
    atlasData,
    chInfo;


// Western, Indian, and Tamil zodiac sign arrays
var westernZodiac = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
];
var indianZodiac = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena'
];
var indianZodiacTamil = [
  'Mesha',
  'Rishabha',
  'Mithuna',
  'Kataka',
  'Simha',
  'Kanya',
  'Thula',
  'Vrischika',
  'Dhanus',
  'Makara',
  'Kumbha',
  'Meena'
];

/* 
   Nakshatra names in English and Tamil, 
   plus their lords (planetary rulers).
*/
var nakshatraNames = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
  'Anuradha', 'Jyeshta', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];
var nakshatraNamesTamil = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
  'Anuradha', 'Jyeshta', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

var planetsTamil = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
  'Ascendant'
];

var nakshatraLordsTamil = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury'
];

const MAANTI_OFFSETS = {
  0: { day: 156, night: 240 },    // Sunday
  1: { day: 132,  night: 216 },   // Monday
  2: { day: 108, night: 192 },    // Tuesday
  3: { day: 84, night: 336 },    // Wednesday
  4: { day: 60, night: 312 },    // Thursday 
  5: { day: 36, night: 288 },    // Friday
  6: { day: 12, night: 264 },    // Saturday 
};


var sml = false,
    plstr = 'AsSuMoMaMeJuVeSaRaKe',
    zdstr = 'ArTaGeCnLeViLiScSgCpAqPi',
    nakstr = 'AswBhaKriRohMriArdPunPusAslMagP.PU.PHasChiSwaVisAnuJyeMulP.SU.SShrDhaShaP.BU.BRev',
    dlist = new Array(81),
    dashyr = [7, 20, 6, 10, 7, 18, 16, 19, 17],
    dlnam = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'],
    dlnamtam = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'],
    dlstr = 'KeVeSuMoMaRaJuSaMe',
    ns = [100, 86, 16, 2, 2, 18, 10, 178, 2, 208, 16, 352, 100, 270, 196, 352, 280, 270, 192, 178, 280, 86, 196, 2];