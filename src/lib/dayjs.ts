import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";

// Extend plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

// Set default locale and timezone
dayjs.locale("vi");
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

// Configure week to start on Monday (day 1) instead of Sunday
// This is used by Ant Design Calendar
const viLocale = dayjs.Ls["vi"];
if (viLocale) {
  viLocale.week = {
    dow: 1, // Monday
    doy: 4,
  };
}

export default dayjs;
