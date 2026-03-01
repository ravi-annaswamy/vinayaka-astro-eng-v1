// panchanga.js

const AstroConsts = {
  THITHI_LENGTH: 12,
  YOGA_LENGTH: 13.3333333,
  KARANA_LENGTH: 6,
  MILLIS_IN_HR: 3600000,
  PAN_APPROXIMATION: 0.01
};

function getMoonSunDiff(sun, moon) {
  let diff = moon >= sun ? moon - sun : (moon + 360) - sun;
  if (diff > 180) diff -= 180;
  return diff;
}

const THITHI_NAMES = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi",
  "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

const THITHI_NAMES_TAMIL = {
  Pratipada: "பிரதமை",
  Dvitiya: "த்விதியை",
  Tritiya: "த்ரிதியை",
  Chaturthi: "சதுர்த்தி",
  Panchami: "பஞ்சமி",
  Shashthi: "ஷஷ்டி",
  Saptami: "ஸப்தமி",
  Ashtami: "அஷ்டமி",
  Navami: "நவமி",
  Dashami: "தசமி",
  Ekadashi: "ஏகாதசி",
  Dvadashi: "த்வாதசி",
  Trayodashi: "த்ரயோதசி",
  Chaturdashi: "சதுர்த்தசி",
  "Purnima/Amavasya": "பௌர்ணமி/அமாவாசை"
};

function findThithi(sun, moon, diffSpeed, timeZone) {
  const diff = getMoonSunDiff(sun, moon);
  const thithiIndex = Math.floor(diff / AstroConsts.THITHI_LENGTH);
  const bal = AstroConsts.THITHI_LENGTH - (diff % AstroConsts.THITHI_LENGTH);
  const endTime = (bal / diffSpeed) + timeZone;

  return { name: THITHI_NAMES[thithiIndex], endTime };
}

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti"
];

const YOGA_NAMES_TAMIL = {
  Vishkambha: "விஷ்கம்ப",
  Priti: "ப்ரீதி",
  Ayushman: "ஆயுஷ்மான்",
  Saubhagya: "சௌபாக்யம்",
  Shobhana: "சோபனம்",
  Atiganda: "அதிகண்டம்",
  Sukarma: "சுகர்மா",
  Dhriti: "த்ருதி",
  Shoola: "சூலம்",
  Ganda: "கண்டம்",
  Vriddhi: "வ்ருத்தி",
  Dhruva: "த்ருவம்",
  Vyaghata: "வ்யாகாதம்",
  Harshana: "ஹர்ஷணம்",
  Vajra: "வஜ்ரம்",
  Siddhi: "சித்தி",
  Vyatipata: "வியதிபாதம்",
  Variyana: "வரியான்",
  Parigha: "பரிகம்",
  Shiva: "சிவம்",
  Siddha: "சித்தம்",
  Sadhya: "சாத்யம்",
  Shubha: "சுபம்",
  Shukla: "சுக்லம்",
  Brahma: "பிரம்மம்",
  Indra: "இந்திரம்",
  Vaidhriti: "வைதிருதி"
};

function findYoga(sun, moon, totalSpeed, timeZone) {
  const pos = (sun + moon) % 360;
  const yogaIndex = Math.floor(pos / AstroConsts.YOGA_LENGTH);
  const bal = AstroConsts.YOGA_LENGTH - (pos % AstroConsts.YOGA_LENGTH);
  const endTime = (bal / totalSpeed) + timeZone;

  return { name: YOGA_NAMES[yogaIndex], endTime };
}

const KARANA_NAMES = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garija",
  "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

const KARANA_NAMES_TAMIL = {
  Bava: "பவ",
  Balava: "பலவ",
  Kaulava: "கௌலவ",
  Taitila: "தைதில",
  Garija: "கரஜ",
  Vanija: "வணிஜ",
  Vishti: "விஷ்டி",
  Shakuni: "சகுனி",
  Chatushpada: "சதுஷ்பாத",
  Naga: "நாக",
  Kimstughna: "கிம்ஸ்துக்ன"
};

const PAKSHA_TAMIL = {
  "Shukla Paksha": "சுக்ல பக்ஷ",
  "Krishna Paksha": "கிருஷ்ண பக்ஷ"
};

function calcKarana(sun, moon, diffSpeed, thithiEnd, timeZone) {
  const position = getMoonSunDiff(sun, moon);
  const karanaIndex = Math.floor((position % AstroConsts.THITHI_LENGTH) / AstroConsts.KARANA_LENGTH);
  const firstBal = AstroConsts.KARANA_LENGTH - (position % AstroConsts.KARANA_LENGTH);
  const firstEndTime = firstBal / diffSpeed + timeZone;

  const secondKaranaIndex = (karanaIndex + 1) % KARANA_NAMES.length;

  return {
    firstKarana: { name: KARANA_NAMES[karanaIndex], endTime: firstEndTime },
    secondKarana: { name: KARANA_NAMES[secondKaranaIndex], endTime: thithiEnd }
  };
}

function calcPaksha(sun, moon) {
  return (moon >= sun && moon - sun < 180) ? "Shukla Paksha" : "Krishna Paksha";
}

// panchanga.js

function calculatePanchanga(sunPosition, moonPosition, sunSpeed, moonSpeed, adjustedTimeZone) {
  const totalSpeed = sunSpeed + moonSpeed;
  const diffSpeed = moonSpeed - sunSpeed;

  const thithi = findThithi(sunPosition, moonPosition, diffSpeed, adjustedTimeZone);
  const yoga = findYoga(sunPosition, moonPosition, totalSpeed, adjustedTimeZone);
  const karana = calcKarana(sunPosition, moonPosition, diffSpeed, thithi.endTime, adjustedTimeZone);
  const paksha = calcPaksha(sunPosition, moonPosition);
  const nakshatraInfo = calculateNakshatraPada(moonPosition);

  return {
    thithi,
    yoga,
    karana,
    paksha,
    nakshatraInfo
  };
}

function displayPanchang(thithi, yoga, karana, paksha, nakshatraInfo) {
  const sentence = buildPanchangaSentence(thithi, yoga, karana, paksha, nakshatraInfo);
  const inlineLine = document.getElementById('panchangaLine');
  if (inlineLine) {
    inlineLine.textContent = sentence;
    return;
  }

  document.getElementById('panchangInfo').innerHTML = `
    <p>${sentence}</p>
  `;
}

function buildPanchangaSentence(thithi, yoga, karana, paksha, nakshatraInfo) {
  const thithiName = thithi.name;
  const yogaName = yoga.name;
  const pakshaName = paksha;
  const karanaName = karana.firstKarana.name;
  const thithiEnd = formatPanchangaTime(thithi.endTime);
  return `${nakshatraInfo.nakshatra} Nakshatra | ${pakshaName} | ${thithiName} Thithi (until ${thithiEnd}) | ${karanaName} Karana | ${yogaName} Yoga`;
}

function formatPanchangaTime(hoursValue) {
  const normalized = ((hoursValue % 24) + 24) % 24;
  const hh = Math.floor(normalized);
  const mm = Math.floor((normalized - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
