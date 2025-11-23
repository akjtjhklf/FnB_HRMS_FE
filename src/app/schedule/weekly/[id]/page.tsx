"use client";

import { WeeklyScheduleDetail } from "@features/schedule/weekly-schedules/WeeklyScheduleDetail";


export default function WeeklyScheduleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <WeeklyScheduleDetail id={params.id} />;
}
