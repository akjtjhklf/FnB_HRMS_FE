import { create } from "zustand";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overtimeHours: number;
  pendingRequests: number;
  devicesOnline: number;
}

interface DashboardStore {
  stats: DashboardStats;
  loading: boolean;
  selectedPeriod: "today" | "week" | "month" | "year";
  setStats: (stats: Partial<DashboardStats>) => void;
  setLoading: (loading: boolean) => void;
  setSelectedPeriod: (period: "today" | "week" | "month" | "year") => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: {
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    overtimeHours: 0,
    pendingRequests: 0,
    devicesOnline: 0,
  },
  loading: false,
  selectedPeriod: "today",
  setStats: (stats: Partial<DashboardStats>) =>
    set((state: DashboardStore) => ({
      stats: { ...state.stats, ...stats },
    })),
  setLoading: (loading: boolean) => set({ loading }),
  setSelectedPeriod: (period: "today" | "week" | "month" | "year") => set({ selectedPeriod: period }),
}));
