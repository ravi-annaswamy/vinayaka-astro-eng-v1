
// J2000 epoch (Julian Day for 2000-01-01 12:00 TT)
var J2000 = 2451545.0;

/**
 * Convert calendar date to Julian Day Number.
 * Uses the standard astronomical algorithm.
 * @param {number} m - Month (1-12)
 * @param {number} d - Day (1-31)
 * @param {number} y - Year
 * @returns {number} Julian Day Number (integer, noon)
 */
function date2jul(m, d, y) {
  if (m <= 2) { y -= 1; m += 12; }
  var A = Math.floor(y / 100);
  var B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524;
}

/**
 * Format hour/minute into a 12-hour AM/PM string.
 * @param {number} hour - 0..23
 * @param {number} minute - 0..59
 * @returns {string} Example: "1:05 PM"
 */
function formatAMPM(hour, minute) {
  let ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  minute = minute < 10 ? '0' + minute : minute;
  let strTime = hour + ':' + minute + ' ' + ampm;
  return strTime;
}

/**
 * Converts Julian day to "YYYY-MM-DD".
 */
function jul2date(jd) {
  let date = new Date(86400000 * (jd - 2440587.5));
  let m = date.getUTCMonth() + 1;
  let d = date.getUTCDate();
  let y = date.getUTCFullYear();
  return y + '-' + m + '-' + d;
}

/**
 * Converts JD to "DD-MM-YYYY".
 */
function jul2dateDDMMYYYY(jd) {
  let date = new Date((jd - 2440587.5) * 86400000);
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  let d = date.getUTCDate();

  let dd = (d < 10) ? '0' + d : d;
  let mm = (m < 10) ? '0' + m : m;
  return dd + '-' + mm + '-' + y;
}

/**
 * Get the system's current Julian day in UTC.
 */
function getSystemJD() {
  let now = new Date();
  let y = now.getUTCFullYear();
  let m = now.getUTCMonth() + 1;
  let d = now.getUTCDate();
  let hour = now.getUTCHours();
  let min = now.getUTCMinutes();

  let jd = date2jul(m, d, y) - 0.5 + (hour + min / 60) / 24.0;
  return jd;
}