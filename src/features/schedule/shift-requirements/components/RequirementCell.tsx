import { Button, Tag, Tooltip } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";

interface RequirementCellProps {
    shift: Shift | null;
    requirements: ShiftPositionRequirement[];
    onAdd: (shiftId: string) => void;
    onEdit: (requirement: ShiftPositionRequirement) => void;
}

export const RequirementCell = ({
    shift,
    requirements,
    onAdd,
    onEdit,
}: RequirementCellProps) => {
    if (!shift) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50/50 rounded p-2 border border-dashed border-gray-200">
                <span className="text-gray-400 text-xs">Không có ca</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 min-h-[80px] p-1">
            {requirements.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {requirements.map((req) => {
                        const position = req.position || (req as any).position_id;
                        const positionName = typeof position === "object" ? position.name : "Chưa có";

                        return (
                            <div
                                key={req.id}
                                className="group flex items-center justify-between px-2 py-1.5 bg-white border border-gray-100 rounded hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => onEdit(req)}
                            >
                                <span className="text-xs font-medium text-gray-700 truncate mr-2" title={positionName}>
                                    {positionName}
                                </span>
                                <Tag
                                    color="blue"
                                    className="m-0 text-[10px] px-1 leading-tight border-none bg-blue-50 text-blue-600"
                                >
                                    {req.required_count}
                                </Tag>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-gray-400 text-xs italic">Chưa có yêu cầu</span>
                </div>
            )}

            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onAdd(shift.id)}
                className="w-full text-xs text-gray-500 hover:text-blue-500 hover:border-blue-500 mt-auto"
            >
                Thêm
            </Button>
        </div>
    );
};
