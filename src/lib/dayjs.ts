import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";
import updateLocale from "dayjs/plugin/updateLocale";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

// Extend plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);
dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(localeData);

// Update Vietnamese locale to start week on Monday BEFORE setting locale
dayjs.updateLocale("vi", {
  weekStart: 1, // Monday = 1
  week: {
    dow: 1, // First day of week is Monday
    doy: 4, // First week of year must contain 4 January (ISO week)
  },
});

// Set default locale
dayjs.locale("vi");

// Set default timezone
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

// ============================================
// STANDARD CONSTANTS (shared with BE)
// ============================================

/** Standard timezone for the application */
export const TIMEZONE = "Asia/Ho_Chi_Minh";

/** Standard date/time formats */
export const DATE_FORMATS = {
  /** Date only for API/DB: 2025-12-14 */
  DATE_ONLY: "YYYY-MM-DD",

  /** Time only: 14:30:00 */
  TIME_ONLY: "HH:mm:ss",

  /** Time short for display: 14:30 */
  TIME_SHORT: "HH:mm",

  /** Full datetime: 2025-12-14T14:30:00 */
  DATETIME: "YYYY-MM-DDTHH:mm:ss",

  /** Display date format: 14/12/2025 */
  DISPLAY_DATE: "DD/MM/YYYY",

  /** Display datetime: 14/12/2025 14:30 */
  DISPLAY_DATETIME: "DD/MM/YYYY HH:mm",

  /** Display date with day name: 14/12/2025 (Thứ Bảy) */
  DISPLAY_DATE_WITH_DAY: "DD/MM/YYYY (dddd)",
} as const;

export default dayjs;
