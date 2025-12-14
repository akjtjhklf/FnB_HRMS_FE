

import { WeeklyScheduleDetail } from "@features/schedule/weekly-schedules/WeeklyScheduleDetail";

export default async function WeeklyScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <WeeklyScheduleDetail id={id} />;
}
