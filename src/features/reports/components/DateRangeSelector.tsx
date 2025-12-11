"use client";

import { Radio, DatePicker, Space } from "antd";
import { DateRangeType } from "@/types/report";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangeSelectorProps {
  rangeType: DateRangeType;
  onRangeTypeChange: (type: DateRangeType) => void;
  startDate?: string;
  endDate?: string;
  onDateChange: (start?: string, end?: string) => void;
}

export const DateRangeSelector = ({
  rangeType,
  onRangeTypeChange,
  startDate,
  endDate,
  onDateChange,
}: DateRangeSelectorProps) => {
  const handleQuickRange = (type: DateRangeType) => {
    onRangeTypeChange(type);
    const now = dayjs();
    let start: Dayjs;
    let end = now;

    switch (type) {
      case "day":
        start = now;
        break;
      case "week":
        start = now.startOf("week");
        break;
      case "month":
        start = now.startOf("month");
        break;
      case "year":
        start = now.startOf("year");
        break;
      default:
        return;
    }

    onDateChange(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  };

  const handleCustomRange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates) {
      onDateChange(dateStrings[0], dateStrings[1]);
    } else {
      onDateChange(undefined, undefined);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        2. Chọn khoảng thời gian
      </h3>
      <Space direction="vertical" size="middle" className="w-full">
        <Radio.Group
          value={rangeType}
          onChange={(e) => handleQuickRange(e.target.value)}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="day">Hôm nay</Radio.Button>
          <Radio.Button value="week">Tuần này</Radio.Button>
          <Radio.Button value="month">Tháng này</Radio.Button>
          <Radio.Button value="year">Năm này</Radio.Button>
          <Radio.Button value="custom">Tùy chỉnh</Radio.Button>
        </Radio.Group>

        {rangeType === "custom" && (
          <RangePicker
            size="large"
            format="DD/MM/YYYY"
            onChange={handleCustomRange}
            value={
              startDate && endDate
                ? [dayjs(startDate), dayjs(endDate)]
                : undefined
            }
            className="w-full md:w-auto"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        )}

        {rangeType !== "custom" && startDate && endDate && (
          <div className="text-sm text-gray-700">
            📅 Từ <strong>{dayjs(startDate).format("DD/MM/YYYY")}</strong> đến{" "}
            <strong>{dayjs(endDate).format("DD/MM/YYYY")}</strong>
          </div>
        )}
      </Space>
    </div>
  );
};
