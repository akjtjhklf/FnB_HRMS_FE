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

export default dayjs;
