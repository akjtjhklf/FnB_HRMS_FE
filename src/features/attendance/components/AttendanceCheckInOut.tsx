"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "antd";
import { Clock, MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { message } from "antd";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function AttendanceCheckInOut() {
    const [loading, setLoading] = useState(false);
    const { mutate: checkIn } = useCustomMutation();
    const { mutate: checkOut } = useCustomMutation();

    const [currentStatus, setCurrentStatus] = useState<"checked-out" | "checked-in">("checked-out");
    const [lastAction, setLastAction] = useState<{ time: string; type: string } | null>(null);

    const handleCheckIn = async () => {
        setLoading(true);
        checkIn(
            {
                url: "/attendance/check-in",
                method: "post",
                values: {
                    location: "Office",
                },
            },
            {
                onSuccess: () => {
                    message.success("Check-in thành công!");
                    setCurrentStatus("checked-in");
                    setLastAction({ time: new Date().toISOString(), type: "check-in" });
                    setLoading(false);
                },
                onError: (error: any) => {
                    message.error(error?.message || "Check-in thất bại");
                    setLoading(false);
                },
            }
        );
    };

    const handleCheckOut = async () => {
        setLoading(true);
        checkOut(
            {
                url: "/attendance/check-out",
                method: "post",
                values: {},
            },
            {
                onSuccess: () => {
                    message.success("Check-out thành công!");
                    setCurrentStatus("checked-out");
                    setLastAction({ time: new Date().toISOString(), type: "check-out" });
                    setLoading(false);
                },
                onError: (error: any) => {
                    message.error(error?.message || "Check-out thất bại");
                    setLoading(false);
                },
            }
        );
    };

    return (
        <Card className="p-8">
            <div className="text-center space-y-6">
                {/* Status Badge */}
                <div className="flex justify-center">
                    {currentStatus === "checked-in" ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full">
                            <CheckCircle2 size={20} />
                            <span className="font-semibold">Đã Check-in</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full">
                            <XCircle size={20} />
                            <span className="font-semibold">Chưa Check-in</span>
                        </div>
                    )}
                </div>

                {/* Current Time */}
                <div className="text-center">
                    <div className="text-6xl font-bold text-gray-800">
                        {format(new Date(), "HH:mm:ss")}
                    </div>
                    <div className="text-gray-500 mt-2">
                        {format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}
                    </div>
                </div>

                {/* Last Action Info */}
                {lastAction && (
                    <div className="text-sm text-gray-600">
                        <p>
                            {lastAction.type === "check-in" ? "Check-in" : "Check-out"} lúc:{" "}
                            {format(new Date(lastAction.time), "HH:mm:ss")}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-8">
                    {currentStatus === "checked-out" ? (
                        <Button
                            size="large"
                            type="primary"
                            onClick={handleCheckIn}
                            loading={loading}
                            className="min-w-[200px] h-14 text-lg bg-green-600 hover:bg-green-700"
                            icon={<Clock size={20} />}
                        >
                            Check In
                        </Button>
                    ) : (
                        <Button
                            size="large"
                            danger
                            onClick={handleCheckOut}
                            loading={loading}
                            className="min-w-[200px] h-14 text-lg"
                            icon={<Clock size={20} />}
                        >
                            Check Out
                        </Button>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <MapPin size={24} className="mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Vị trí</p>
                        <p className="font-semibold">Office</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <Calendar size={24} className="mx-auto text-purple-600 mb-2" />
                        <p className="text-sm text-gray-600">Ca làm việc</p>
                        <p className="font-semibold">Ca sáng</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <Clock size={24} className="mx-auto text-orange-600 mb-2" />
                        <p className="text-sm text-gray-600">Giờ làm</p>
                        <p className="font-semibold">8:00 - 17:00</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
