import dayjs from "@/lib/dayjs";

interface DayHeaderProps {
    date: dayjs.Dayjs;
}

export const DayHeader = ({ date }: DayHeaderProps) => {
    // Capitalize first letter of day name (e.g. "thứ hai" -> "Thứ Hai")
    const dayName = date.format("dddd");
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    return (
        <div>
            <div className="font-semibold text-gray-700">{capitalizedDayName}</div>
            <div className="text-gray-500 text-xs">{date.format("DD/MM/YYYY")}</div>
        </div>
    );
};
