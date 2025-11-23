import { create } from "zustand";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onConfirm: (() => void) | (() => Promise<void>);
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  type?: "default" | "danger" | "warning";
  loading?: boolean;
}

interface ConfirmModalStore extends ConfirmModalState {
  openConfirm: (config: Omit<ConfirmModalState, "isOpen" | "loading">) => void;
  closeConfirm: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConfirmModalStore = create<ConfirmModalStore>((set) => ({
  isOpen: false,
  title: "",
  content: null,
  onConfirm: () => {},
  onCancel: undefined,
  okText: "Xác nhận",
  cancelText: "Hủy",
  type: "default",
  loading: false,

  openConfirm: (config) =>
    set({
      isOpen: true,
      title: config.title,
      content: config.content,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      okText: config.okText || "Xác nhận",
      cancelText: config.cancelText || "Hủy",
      type: config.type || "default",
      loading: false,
    }),

  closeConfirm: () =>
    set({
      isOpen: false,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),
}));
