import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Spin } from "antd";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red" | "purple" | "cyan";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
  cyan: "bg-cyan-50 text-cyan-600",
};

const borderColors = {
  blue: "border-l-4 border-blue-500",
  green: "border-l-4 border-green-500",
  orange: "border-l-4 border-orange-500",
  red: "border-l-4 border-red-500",
  purple: "border-l-4 border-purple-500",
  cyan: "border-l-4 border-cyan-500",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
  onClick,
}) => {
  return (
    <Card
      hover
      className={cn(
        "transition-all duration-300 flex h-full !w-full",
        borderColors[color],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      styles={{
        body: { padding: "24px" ,width: "100%" },
      }}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <Text className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            {title}
          </Text>
          {loading ? (
            <div className="mt-2">
              <Spin size="small" />
            </div>
          ) : (
            <>
              <Title level={2} className="!mb-0 !mt-2">
                {value}
              </Title>
              {trend && (
                <div
                  className={cn(
                    "mt-2 text-sm font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg",
            colorClasses[color]
          )}
        >
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};
