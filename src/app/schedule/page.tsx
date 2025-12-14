"use client";

import { ScheduleDashboard } from "@features/schedule/dashboard/ScheduleDashboard";
import { useCanManageSchedule } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScheduleDashboardPage() {
  const isManager = useCanManageSchedule();
  const router = useRouter();

  useEffect(() => {
    // Redirect employees to their schedule page instead of dashboard
    if (!isManager) {
      router.replace("/schedule/my-schedule");
    }
  }, [isManager, router]);

  // Only show dashboard for managers
  if (!isManager) {
    return null;
  }

  return <ScheduleDashboard />;
}
