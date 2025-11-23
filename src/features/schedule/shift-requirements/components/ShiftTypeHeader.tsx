import { Tag } from "antd";

interface ShiftTypeHeaderProps {
    name: string;
    color?: string;
}

export const ShiftTypeHeader = ({ name, color }: ShiftTypeHeaderProps) => {
    return (
        <div className="flex items-center justify-center gap-2">
            <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: color || "#1890ff" }}
            />
            <span className="font-medium">{name}</span>
        </div>
    );
};
