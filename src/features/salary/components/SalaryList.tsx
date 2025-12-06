import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useTable } from "@refinedev/antd";
import { useCreate, useCustomMutation, useUpdate, useGetIdentity } from "@refinedev/core";
// @ts-ignore
import debounce from "lodash/debounce";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Select,
  Drawer,
  Descriptions,
  Divider,
  App,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Tabs,
  Dropdown,
  Tooltip,
  Checkbox,
  Alert,
  List,
  Avatar,
  Progress,
} from "antd";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import type { MenuProps } from "antd";
import {
  DollarOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  SwapOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Settings } from "lucide-react";
import { SalarySchemeList } from "./SalarySchemeList";
import { SalaryForm } from "./SalaryForm";
import { SalaryRequests } from "./SalaryRequests";
import { CustomDrawer } from "@/components/common/CustomDrawer";
import { formatDate } from "@/lib/utils";
import { MonthlyPayroll } from "@/features/salary/types";

interface ActionItem {
  key: string;
  label: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}

const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return "0";
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const SalaryList = () => {
  const { data: user } = useGetIdentity<any>();
  
  // Check role name trực tiếp thay vì dùng usePermissions
  const roleName = user?.role?.name;
  const isAdminOrManager = roleName === 'Administrator' || roleName === 'Manager';
  
  // Debug log
  console.log('🔍 User identity:', user);
  console.log('🔍 Role name:', roleName);
  console.log('🔍 isAdminOrManager:', isAdminOrManager);

  const { message } = App.useApp();
  const router = useRouter();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState<MonthlyPayroll | null>(null);
  const [requestForm] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<MonthlyPayroll | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<MonthlyPayroll | null>(null);
  const [searchText, setSearchText] = useState("");
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateMonth, setGenerateMonth] = useState<dayjs.Dayjs | null>(dayjs());
  // Send payslip modal state
  const [sendPayslipModalOpen, setSendPayslipModalOpen] = useState(false);
  const [sendPayslipTarget, setSendPayslipTarget] = useState<MonthlyPayroll | null>(null);
  const [sendPayslipOptions, setSendPayslipOptions] = useState({
    sendNotification: true,
    sendEmail: false,
  });
  // Bulk send payslip modal state
  const [bulkSendModalOpen, setBulkSendModalOpen] = useState(false);

  const { mutate: createRequest } = useCreate();
  const { mutate: generatePayroll, mutation } = useCustomMutation();
  const isGenerating = mutation?.isPending || false;
  const { mutate: updatePayroll } = useUpdate();

  const { tableProps, setFilters, tableQuery: tableQueryResult } = useTable<MonthlyPayroll>({
    resource: "monthly-payrolls",
    syncWithLocation: false,
    pagination: { pageSize: 20, mode: "server" },
    sorters: {
      initial: [{ field: "month", order: "desc" }],
    },
    filters: {
      permanent: [
        {
          field: "month",
          operator: "eq",
          value: selectedMonth,
        },
      ],
    },
  });

  // Debounced search function for server-side search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters([
          {
            field: "search",
            operator: "contains",
            value: value || undefined,
          },
        ]);
      }, 500),
    [setFilters]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const payrolls = useMemo(() => tableProps.dataSource || [], [tableProps.dataSource]);

  const getEmployeeName = (record: any) => {
    // Try to get employee from multiple sources
    const employee = record?.employee || record?.employee_id;
    if (!employee) return "N/A";
    // If employee is a string (just ID), return placeholder
    // If employee is an object with name
    if (typeof employee === "object") {
      return employee.full_name || employee.employee_code || employee.id?.slice(0, 8) || "N/A";
    }
    return "N/A";
  };

  const getEmployeeCode = (record: any) => {
    const employee = record?.employee || record?.employee_id;
    if (!employee || typeof employee !== "object") return "";
    return employee.employee_code || "";
  };

  // Filter payrolls by search text - removed client side, use server-side search instead
  // const filteredPayrolls = useMemo(() => {
  //   if (!searchText) return payrolls;
  //   const searchLower = searchText.toLowerCase();
  //   return payrolls.filter((p) => {
  //     const employeeName = getEmployeeName(p.employee_id).toLowerCase();
  //     return employeeName.includes(searchLower);
  //   });
  // }, [payrolls, searchText]);

  // Calculate statistics from current page data
  const stats = useMemo(() => {
    const pagination = tableProps.pagination;
    const total = (pagination && typeof pagination === 'object' && 'total' in pagination) ? pagination.total : payrolls.length;
    const totalGross = payrolls.reduce((sum, p) => {
      const value = parseFloat(p.gross_salary as any) || 0;
      return sum + value;
    }, 0);
    const totalNet = payrolls.reduce((sum, p) => {
      const value = parseFloat(p.net_salary as any) || 0;
      return sum + value;
    }, 0);
    const totalDeductions = payrolls.reduce((sum, p) => {
      const ded = parseFloat(p.deductions as any) || 0;
      const pen = parseFloat(p.penalties as any) || 0;
      return sum + ded + pen;
    }, 0);

    return { total, totalGross, totalNet, totalDeductions };
  }, [payrolls, tableProps.pagination]);

  // Generate month options for last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      options.push({ value, label });
    }
    return options;
  }, []);

  const getStatusTag = (status: string) => {
    const statusMap = {
      draft: { color: "default", icon: <FileTextOutlined />, text: "Nháp" },
      pending_approval: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Chờ duyệt",
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã duyệt",
      },
      paid: { color: "blue", icon: <DollarOutlined />, text: "Đã thanh toán" },
    };
    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const handleView = (record: MonthlyPayroll) => {
    setViewingPayroll(record);
    setDrawerOpen(true);
  };

  const handleEdit = (record: MonthlyPayroll) => {
    setEditingPayroll(record);
    setEditDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setViewingPayroll(null);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false);
    setEditingPayroll(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditDrawer();
    tableQueryResult?.refetch?.();
  };

  const handleRequestEdit = (record: MonthlyPayroll) => {
    setCurrentPayroll(record);
    setRequestModalOpen(true);
    requestForm.resetFields();
  };

  const handleSubmitRequest = async () => {
    try {
      const values = await requestForm.validateFields();

      const employeeId = typeof currentPayroll?.employee_id === "object"
        ? (currentPayroll?.employee_id as any).id
        : currentPayroll?.employee_id;

      createRequest(
        {
          resource: "salary-requests",
          values: {
            employee_id: employeeId,
            type: "adjustment",
            payroll_id: currentPayroll?.id,
            adjustment_amount: values.adjustment_amount,
            reason: values.reason,
            request_date: new Date(),
            status: "pending",
          },
        },
        {
          onSuccess: () => {
            message.success("Yêu cầu chỉnh sửa đã được gửi thành công");
            setRequestModalOpen(false);
            setCurrentPayroll(null);
            requestForm.resetFields();
          },
          onError: (error: any) => {
            const errorMsg = error?.response?.data?.error?.message || "Gửi yêu cầu thất bại, vui lòng thử lại";
            message.error(errorMsg);
          },
        }
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleLock = (record: MonthlyPayroll) => {
    updatePayroll(
      {
        resource: "monthly-payrolls",
        id: record.id,
        values: {}, // No body needed for this custom endpoint usually, but update expects values. 
        // Actually we should use useCustom for custom endpoints like /lock.
        // But let's use the custom endpoint via useCustomMutation if possible, or just standard update if we mapped it.
        // Wait, I mapped PUT /:id/lock. useUpdate calls PATCH /:id by default.
        // So I must use useCustom.
      },
      {
        onSuccess: () => {
          // This won't work because useUpdate calls PATCH.
          // I need to use useCustom for PUT /lock
        }
      }
    );
  };

  // Correct way to call custom endpoints
  const { mutate: lockPayroll } = useCustomMutation();
  const { mutate: unlockPayroll } = useCustomMutation();

  const onLock = (id: string) => {
    lockPayroll({
      url: `monthly-payrolls/${id}/lock`,
      method: "put",
      values: {},
      successNotification: (data, values, resource) => {
        return {
          message: "Đã khóa bảng lương",
          description: "Bảng lương đã chuyển sang trạng thái chờ duyệt",
          type: "success",
        };
      },
      errorNotification: (data, values, resource) => {
        return {
          message: "Lỗi khóa bảng lương",
          description: "Vui lòng thử lại",
          type: "error",
        };
      },
    }, {
      onSuccess: () => {
        tableQueryResult?.refetch?.();
      }
    });
  };

  const onUnlock = (id: string) => {
    unlockPayroll({
      url: `monthly-payrolls/${id}/unlock`,
      method: "put",
      values: {},
      successNotification: (data, values, resource) => {
        return {
          message: "Đã mở khóa bảng lương",
          description: "Bảng lương đã chuyển sang trạng thái nháp",
          type: "success",
        };
      },
    }, {
      onSuccess: () => {
        tableQueryResult?.refetch?.();
      }
    });
  };

  // Hook để duyệt bảng lương
  const { mutate: approvePayroll } = useCustomMutation();

  const onApprove = (id: string) => {
    Modal.confirm({
      title: "Duyệt bảng lương",
      content: "Bạn có chắc muốn duyệt bảng lương này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: () => {
        approvePayroll({
          url: `monthly-payrolls/${id}/approve`,
          method: "post",
          values: {},
          successNotification: () => ({
            message: "Đã duyệt bảng lương",
            description: "Bảng lương đã được duyệt thành công",
            type: "success",
          }),
          errorNotification: (error) => ({
            message: "Lỗi duyệt bảng lương",
            description: error?.response?.data?.message || "Vui lòng thử lại",
            type: "error",
          }),
        }, {
          onSuccess: () => {
            tableQueryResult?.refetch?.();
          }
        });
      },
    });
  };

  // Hook để thay đổi trạng thái linh hoạt
  const { mutate: changeStatusMutation } = useCustomMutation();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusChangePayroll, setStatusChangePayroll] = useState<MonthlyPayroll | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statusOptions = [
    { value: "draft", label: "Nháp", color: "default", icon: <FileTextOutlined /> },
    { value: "pending_approval", label: "Chờ duyệt", color: "gold", icon: <ClockCircleOutlined /> },
    { value: "approved", label: "Đã duyệt", color: "green", icon: <CheckCircleOutlined /> },
    { value: "paid", label: "Đã thanh toán", color: "blue", icon: <DollarOutlined /> },
  ];

  const handleOpenStatusModal = (record: MonthlyPayroll) => {
    setStatusChangePayroll(record);
    setSelectedStatus(record.status || "draft");
    setStatusModalOpen(true);
  };

  const handleChangeStatus = () => {
    if (!statusChangePayroll || !selectedStatus) return;

    const currentStatus = statusChangePayroll.status || "draft";
    if (currentStatus === selectedStatus) {
      message.info("Trạng thái không thay đổi");
      setStatusModalOpen(false);
      return;
    }

    changeStatusMutation({
      url: `monthly-payrolls/${statusChangePayroll.id}/change-status`,
      method: "post",
      values: { status: selectedStatus },
      successNotification: () => ({
        message: "Cập nhật trạng thái thành công",
        description: `Đã chuyển sang trạng thái "${statusOptions.find(s => s.value === selectedStatus)?.label}"`,
        type: "success",
      }),
      errorNotification: (error: any) => ({
        message: "Lỗi cập nhật trạng thái",
        description: error?.response?.data?.error?.message || error?.message || "Vui lòng thử lại",
        type: "error",
      }),
    }, {
      onSuccess: () => {
        setStatusModalOpen(false);
        setStatusChangePayroll(null);
        setSelectedStatus(null);
        tableQueryResult?.refetch?.();
      }
    });
  };

  // Hook để đánh dấu đã thanh toán
  const { mutate: markAsPaidMutation } = useCustomMutation();

  const onMarkAsPaid = (id: string) => {
    Modal.confirm({
      title: "Đánh dấu đã thanh toán",
      content: "Bạn có chắc muốn đánh dấu bảng lương này đã được thanh toán?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        markAsPaidMutation({
          url: `monthly-payrolls/${id}/mark-paid`,
          method: "post",
          values: {},
          successNotification: () => ({
            message: "Đã cập nhật",
            description: "Bảng lương đã được đánh dấu đã thanh toán",
            type: "success",
          }),
          errorNotification: (error: any) => ({
            message: "Lỗi cập nhật",
            description: error?.response?.data?.error?.message || "Vui lòng thử lại",
            type: "error",
          }),
        }, {
          onSuccess: () => {
            tableQueryResult?.refetch?.();
          }
        });
      },
    });
  };

  const handleGeneratePayroll = () => {
    if (!generateMonth) {
      message.error("Vui lòng chọn tháng");
      return;
    }

    generatePayroll({
      url: "monthly-payrolls/generate",
      method: "post",
      values: {
        month: generateMonth.format("YYYY-MM"),
      },
      successNotification: (data, values, resource) => {
        return {
          message: "Tạo bảng lương thành công",
          description: `Đã tạo bảng lương cho tháng ${generateMonth.format("MM/YYYY")}`,
          type: "success",
        };
      },
      errorNotification: (error) => {
        return {
          message: "Lỗi tạo bảng lương",
          description: error?.response?.data?.message || "Vui lòng thử lại",
          type: "error",
        };
      }
    }, {
      onSuccess: (data) => {
        console.log('✅ Payroll generated:', data);
        setGenerateModalOpen(false);

        // Switch to the generated month
        const newMonth = generateMonth.format("YYYY-MM");
        setSelectedMonth(newMonth);

        // Force refetch with delay to ensure data is saved
        setTimeout(() => {
          console.log('🔄 Refetching payroll list...');
          tableQueryResult?.refetch?.();
        }, 1000);
      }
    });
  };

  const handleExport = () => {
    message.info("Chức năng xuất Excel đang được phát triển");
  };

  const handleCreatePayroll = () => {
    router.push("/salary/create");
  };

  // Hook để gửi phiếu lương
  const { mutate: sendPayslipMutation, mutation: sendPayslipState } = useCustomMutation();
  const isSendingPayslip = sendPayslipState?.isPending || false;

  // Open send payslip modal with payroll data
  const handleOpenSendPayslipModal = (record: MonthlyPayroll) => {
    setSendPayslipTarget(record);
    setSendPayslipOptions({ sendNotification: true, sendEmail: false });
    setSendPayslipModalOpen(true);
  };

  // Handle send payslip from modal
  const handleConfirmSendPayslip = () => {
    if (!sendPayslipTarget) return;
    
    const employeeName = getEmployeeName(sendPayslipTarget);
    
    sendPayslipMutation(
      {
        url: `monthly-payrolls/${sendPayslipTarget.id}/send-payslip`,
        method: "post",
        values: {
          sendNotification: sendPayslipOptions.sendNotification,
          sendEmail: sendPayslipOptions.sendEmail,
        },
        successNotification: () => ({
          message: "Gửi phiếu lương thành công",
          description: `Đã gửi phiếu lương cho ${employeeName}`,
          type: "success",
        }),
        errorNotification: (error) => ({
          message: "Gửi phiếu lương thất bại",
          description: error?.response?.data?.message || "Vui lòng thử lại",
          type: "error",
        }),
      },
      {
        onSuccess: () => {
          setSendPayslipModalOpen(false);
          setSendPayslipTarget(null);
          tableQueryResult?.refetch?.();
        },
      }
    );
  };

  const handleSendPayslip = (record: MonthlyPayroll) => {
    handleOpenSendPayslipModal(record);
  };

  // Open bulk send modal
  const handleOpenBulkSendModal = () => {
    const approvedPayrolls = payrolls.filter((p) => p.status === "approved" || p.status === "paid");
    if (approvedPayrolls.length === 0) {
      message.warning("Không có bảng lương nào ở trạng thái đã duyệt hoặc đã thanh toán");
      return;
    }
    setSendPayslipOptions({ sendNotification: true, sendEmail: false });
    setBulkSendModalOpen(true);
  };

  // Handle bulk send payslip
  const handleConfirmBulkSendPayslip = () => {
    const approvedPayrolls = payrolls.filter((p) => p.status === "approved" || p.status === "paid");
    
    sendPayslipMutation(
      {
        url: `monthly-payrolls/send-payslip-bulk`,
        method: "post",
        values: { 
          payrollIds: approvedPayrolls.map((p) => p.id),
          sendNotification: sendPayslipOptions.sendNotification,
          sendEmail: sendPayslipOptions.sendEmail,
        },
        successNotification: (data) => ({
          message: "Gửi phiếu lương thành công",
          description: `Đã gửi ${(data as any)?.data?.sent || 0} phiếu lương`,
          type: "success",
        }),
        errorNotification: (error) => ({
          message: "Gửi phiếu lương thất bại",
          description: error?.response?.data?.message || "Vui lòng thử lại",
          type: "error",
        }),
      },
      {
        onSuccess: () => {
          setBulkSendModalOpen(false);
          tableQueryResult?.refetch?.();
        },
      }
    );
  };

  const getActionItems = (record: MonthlyPayroll): ActionItem[] => {
    const items: ActionItem[] = [
      {
        key: "view",
        label: "Xem chi tiết",
        icon: <EyeOutlined />,
        onClick: () => handleView(record),
      },
    ];

    // Treat undefined/null status as "draft"
    const status = record.status || "draft";

    // Admin/Manager: Có các quyền quản lý (edit, lock, unlock, send payslip) nhưng KHÔNG có "Yêu cầu sửa"
    if (isAdminOrManager) {
      if (status === "draft") {
        items.push({
          key: "edit",
          label: "Chỉnh sửa",
          icon: <EditOutlined />,
          onClick: () => handleEdit(record),
        });
        items.push({
          key: "lock",
          label: "Khóa (Gửi duyệt)",
          icon: <LockOutlined />,
          onClick: () => onLock(record.id),
        });
      }

      if (status === "pending_approval") {
        items.push({
          key: "approve",
          label: "Duyệt",
          icon: <CheckCircleOutlined className="text-green-600" />,
          onClick: () => onApprove(record.id),
        });
        items.push({
          key: "unlock",
          label: "Mở khóa (Sửa lại)",
          icon: <UnlockOutlined />,
          onClick: () => onUnlock(record.id),
        });
      }

      // Cho phép gửi phiếu lương khi đã duyệt hoặc đã thanh toán
      if (status === "approved" || status === "paid") {
        items.push({
          key: "send-payslip",
          label: "Gửi phiếu lương",
          icon: <MailOutlined />,
          onClick: () => handleSendPayslip(record),
        });
      }

      // Đánh dấu đã thanh toán cho bảng lương đã duyệt
      if (status === "approved") {
        items.push({
          key: "mark-paid",
          label: "Đánh dấu đã thanh toán",
          icon: <DollarOutlined className="text-green-600" />,
          onClick: () => onMarkAsPaid(record.id),
        });
      }

      // Thay đổi trạng thái (dành cho Admin/Manager)
      items.push({
        key: "change-status",
        label: "Thay đổi trạng thái",
        icon: <SwapOutlined className="text-blue-600" />,
        onClick: () => handleOpenStatusModal(record),
      });
    } else {
      // Employee: Chỉ có nút "Yêu cầu sửa" cho bảng lương của chính mình
      items.push({
        key: "request",
        label: "Yêu cầu sửa",
        icon: <SendOutlined />,
        onClick: () => handleRequestEdit(record),
      });
    }

    return items;
  };

  const columns: any[] = [
    {
      title: "Nhân viên",
      key: "employee",
      ellipsis: true,
      width: 200,
      fixed: "left" as const,
      align: "left" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const name = getEmployeeName(record);
        const code = getEmployeeCode(record);

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            {code && <span className="text-xs text-gray-500">{code}</span>}
          </div>
        );
      },
    },
    {
      title: <div className="whitespace-nowrap">Lương cơ bản</div>,
      dataIndex: "base_salary",
      key: "base_salary",
      width: 130,
      align: "right" as const,
      sorter: true,
      render: (value: number) => (
        <span className="text-gray-700 whitespace-nowrap">{formatCurrency(value)}</span>
      ),
    },
    {
      title: <div className="whitespace-nowrap">Phụ cấp-Thưởng</div>,
      key: "allowances_bonuses",
      width: 130,
      align: "right" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const allowances = parseFloat(record.allowances as any) || 0;
        const bonuses = parseFloat(record.bonuses as any) || 0;
        const total = Math.round(allowances + bonuses);
        return <span className="text-green-600 whitespace-nowrap">+{formatCurrency(total)}</span>;
      },
    },
    {
      title: <div className="whitespace-nowrap">Ngày công</div>,
      key: "work_days",
      width: 90,
      align: "center" as const,
      render: (_: any, record: any) => (
        <span className="font-medium">{record.total_work_days || 0} ngày</span>
      ),
    },
    {
      title: <div className="whitespace-nowrap">Phạt</div>,
      key: "penalties_breakdown",
      width: 110,
      align: "right" as const,
      render: (_: any, record: any) => {
        const latePenalty = parseFloat(record.late_penalty || 0);
        const earlyPenalty = parseFloat(record.early_leave_penalty || 0);
        const total = latePenalty + earlyPenalty;
        return total > 0 ? (
          <span className="text-red-600 whitespace-nowrap">-{formatCurrency(total)}</span>
        ) : (
          <span className="text-gray-400">0</span>
        );
      },
    },
    {
      title: <div className="whitespace-nowrap">Khấu trừ</div>,
      key: "deductions",
      width: 110,
      align: "right" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const deductions = parseFloat(record.deductions as any) || 0;
        const penalties = parseFloat(record.penalties as any) || 0;
        const total = Math.round(deductions + penalties);
        return <span className="text-red-600 whitespace-nowrap">-{formatCurrency(total)}</span>;
      },
    },
    {
      title: <div className="whitespace-nowrap">Tổng lương</div>,
      dataIndex: "gross_salary",
      key: "gross_salary",
      width: 130,
      align: "right" as const,
      sorter: true,
      render: (value: number) => (
        <span className="font-semibold text-gray-900 whitespace-nowrap">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: <div className="whitespace-nowrap">Thực lãnh</div>,
      dataIndex: "net_salary",
      key: "net_salary",
      width: 140,
      align: "right" as const,
      sorter: true,
      render: (value: number) => (
        <span className="font-bold text-green-600 whitespace-nowrap">{formatCurrency(value)}</span>
      ),
    },
    {
      title: <div className="whitespace-nowrap">Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center" as const,
      filters: [
        { text: "Nháp", value: "draft" },
        { text: "Chờ duyệt", value: "pending_approval" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Đã thanh toán", value: "paid" },
      ],
      onFilter: (value: any, record: MonthlyPayroll) => (record.status || "draft") === value,
      render: (status: string) => getStatusTag(status || "draft"),
    },
    {
      title: <div className="whitespace-nowrap">Thao tác</div>,
      key: "actions",
      fixed: "right" as const,
      width: 180,
      align: "center" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const status = record.status || "draft";
        const actionItems = getActionItems(record);
        console.log('🔧 Actions for record:', record.id, 'status:', status, 'isAdmin:', isAdminOrManager, 'items:', actionItems.map(i => i.key));
        return (
          <Space>
            {actionItems.map(item => (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                onClick={item.onClick}
                title={typeof item.label === 'string' ? item.label : undefined}
              />
            ))}
          </Space>
        );
      },
    },
  ];

  const items = [
    {
      key: "payroll",
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          Bảng lương
        </span>
      ),
      children: (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bảng lương
              </h1>
              <p className="text-gray-500 mt-1">Quản lý lương và thưởng nhân viên</p>
            </div>
            <Space>
              <Input
                placeholder="Tìm theo tên nhân viên..."
                allowClear
                value={searchText}
                onChange={handleSearchChange}
                style={{ width: 250 }}
                prefix={<SearchOutlined className="text-gray-400" />}
              />
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={monthOptions}
                style={{ width: 200 }}
              />
              {isAdminOrManager && (
                <>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setGenerateModalOpen(true)}
                    size="large"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Tính lương
                  </Button>
                  <Button
                    icon={<MailOutlined />}
                    onClick={handleOpenBulkSendModal}
                    size="large"
                    loading={isSendingPayslip}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Gửi phiếu lương
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleCreatePayroll}
                    size="large"
                  >
                    Tạo thủ công
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExport} size="large">
                    Xuất Excel
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={12} sm={12} md={6}>
              <Card size="small" className="shadow-sm">
                <Statistic
                  title="Tổng NV"
                  value={stats.total}
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: "18px" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card size="small" className="shadow-sm">
                <Statistic
                  title="Tổng lương"
                  value={stats.totalGross}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card size="small" className="shadow-sm">
                <Statistic
                  title="Thực lãnh"
                  value={stats.totalNet}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card size="small" className="shadow-sm">
                <Statistic
                  title="Khấu trừ"
                  value={stats.totalDeductions}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#ff4d4f", fontSize: "18px" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Payroll Table */}
          <div className="bg-white rounded-lg shadow">
            <Table
              {...tableProps}
              columns={columns}
              rowKey="id"
              key={`payroll-table-${roleName || 'loading'}`}
              scroll={{ x: 1200 }}
              pagination={{
                ...tableProps.pagination,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bảng lương`,
              }}
            />
          </div>
        </>
      ),
    },
    {
      key: "schemes",
      label: (
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Chế độ lương
        </span>
      ),
      children: <SalarySchemeList />,
    },
    {
      key: "requests",
      label: (
        <span className="flex items-center gap-2">
          <SendOutlined className="w-4 h-4" />
          Yêu cầu lương
        </span>
      ),
      children: <SalaryRequests />,
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <Tabs defaultActiveKey="payroll" items={isAdminOrManager ? items : items.filter(i => i.key === 'payroll')} />
      </div>

      {/* Payroll Detail Drawer */}
      <Drawer
        open={drawerOpen}
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span className="text-base md:text-lg">Chi tiết phiếu lương</span>
          </div>
        }
        width={700}
        onClose={handleCloseDrawer}
        styles={{ body: { paddingTop: 16 } }}
      >
        {viewingPayroll && (
          <div className="space-y-4">
            <Descriptions column={1} bordered size="small" className="text-sm">
              <Descriptions.Item label="Nhân viên">
                <span className="font-semibold">
                  {getEmployeeName(viewingPayroll)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tháng">
                {new Date(viewingPayroll.month + "-01").toLocaleDateString(
                  "vi-VN",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(viewingPayroll.status || 'draft')}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="text-sm md:text-base my-3">Chấm công</Divider>

            <Descriptions column={1} bordered size="small" className="text-sm">
              <Descriptions.Item label="Tổng ngày công">
                <span className="font-semibold">
                  {(viewingPayroll as any).total_work_days || 0} ngày
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng giờ làm">
                {(viewingPayroll as any).total_work_hours || 0} giờ
              </Descriptions.Item>
              <Descriptions.Item label="Phút đi muộn">
                <span className="text-orange-600">
                  {(viewingPayroll as any).total_late_minutes || 0} phút
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phút về sớm">
                <span className="text-orange-600">
                  {(viewingPayroll as any).total_early_leave_minutes || 0} phút
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="text-sm md:text-base my-3">Chi tiết lương</Divider>

            <Descriptions column={1} bordered size="small" className="text-sm">
              <Descriptions.Item label="Lương cơ bản">
                <span className="font-semibold">
                  {formatCurrency(Number(viewingPayroll.base_salary))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phụ cấp">
                <span className="text-green-600">
                  +{formatCurrency(Number(viewingPayroll.allowances || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thưởng">
                <span className="text-green-600">
                  +{formatCurrency(Number(viewingPayroll.bonuses || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Lương làm thêm">
                <span className="text-green-600">
                  +{formatCurrency(Number(viewingPayroll.overtime_pay || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt đi muộn">
                <span className="text-red-600">
                  -{formatCurrency(Number((viewingPayroll as any).late_penalty || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt về sớm">
                <span className="text-red-600">
                  -{formatCurrency(Number((viewingPayroll as any).early_leave_penalty || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Khấu trừ">
                <span className="text-red-600">
                  -{formatCurrency(Number(viewingPayroll.deductions || 0))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt khác">
                <span className="text-red-600">
                  -{formatCurrency(Number(viewingPayroll.penalties || 0))} VNĐ
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider className="my-3" />

            <Descriptions column={1} bordered size="middle" className="text-sm md:text-base">
              <Descriptions.Item label="Tổng lương">
                <span className="font-semibold text-base">
                  {formatCurrency(Number(viewingPayroll.gross_salary))} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thực lãnh">
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(Number(viewingPayroll.net_salary))} VNĐ
                </span>
              </Descriptions.Item>
            </Descriptions>

            {viewingPayroll.notes && (
              <>
                <Divider orientation="left" className="text-sm md:text-base my-3">Ghi chú</Divider>
                <div className="p-3 bg-gray-50 rounded text-xs md:text-sm">
                  {viewingPayroll.notes}
                </div>
              </>
            )}

            {viewingPayroll.approved_at && (
              <>
                <Divider orientation="left" className="text-sm md:text-base my-3">Thông tin duyệt</Divider>
                <Descriptions column={1} bordered size="small" className="text-sm">
                  <Descriptions.Item label="Người duyệt">
                    {viewingPayroll.approved_by || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày duyệt">
                    {formatDate(viewingPayroll.approved_at)}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Request Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SendOutlined />
            <span className="text-base md:text-lg">Yêu cầu chỉnh sửa bảng lương</span>
          </div>
        }
        open={requestModalOpen}
        onCancel={() => {
          setRequestModalOpen(false);
          setCurrentPayroll(null);
          requestForm.resetFields();
        }}
        onOk={handleSubmitRequest}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={500}
        centered
      >
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-xs md:text-sm text-blue-800 mb-1">
            <strong>Nhân viên:</strong>{" "}
            {getEmployeeName(currentPayroll)}
          </p>
          <p className="text-xs md:text-sm text-blue-800">
            <strong>Tháng:</strong> {currentPayroll?.month}
          </p>
        </div>
        <Form form={requestForm} layout="vertical">
          <Form.Item
            name="adjustment_amount"
            label="Số tiền điều chỉnh (VNĐ)"
            help="Nhập số dương để tăng, số âm để giảm"
          >
            <InputNumber
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              parser={(value) => value!.replace(/\./g, "")}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Lý do yêu cầu chỉnh sửa"
            rules={[
              { required: true, message: "Vui lòng nhập lý do yêu cầu" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do chi tiết (ví dụ: Thiếu thưởng KPI tháng 10, chưa tính phụ cấp đi lại...)"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Payroll Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined />
            <span className="text-base md:text-lg">Tính lương tự động</span>
          </div>
        }
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        onOk={handleGeneratePayroll}
        okText="Bắt đầu tính"
        cancelText="Hủy"
        confirmLoading={isGenerating}
        centered
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">Chọn tháng để tính lương cho tất cả nhân viên đang hoạt động.</p>
          <DatePicker
            picker="month"
            className="w-full"
            size="large"
            value={generateMonth}
            onChange={setGenerateMonth}
            format="MM/YYYY"
          />
          <p className="mt-4 text-xs text-gray-500">
            * Hệ thống sẽ dựa trên Hợp đồng lao động và Salary Scheme để tính toán.
            <br />
            * Bảng lương sẽ được tạo ở trạng thái Nháp.
          </p>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title={null}
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          setStatusChangePayroll(null);
          setSelectedStatus(null);
        }}
        footer={null}
        width={480}
        centered
        className="status-change-modal"
      >
        {statusChangePayroll && (
          <div className="py-2">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <SwapOutlined className="text-3xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Thay đổi trạng thái</h2>
              <p className="text-gray-500 text-sm mt-1">Cập nhật trạng thái phiếu lương</p>
            </div>

            {/* Employee Info */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <EmployeeAvatar 
                  photoUrl={statusChangePayroll.employee?.avatar}
                  name={statusChangePayroll.employee?.full_name}
                  size={48}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {statusChangePayroll.employee?.full_name || "N/A"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Tháng {statusChangePayroll.month || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Flow */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-center gap-4">
                {/* Current Status */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Hiện tại</p>
                  <Tag
                    color={statusOptions.find((s) => s.value === (statusChangePayroll.status || "draft"))?.color || "default"}
                    className="text-sm px-3 py-1"
                    icon={statusOptions.find((s) => s.value === (statusChangePayroll.status || "draft"))?.icon}
                  >
                    {statusOptions.find((s) => s.value === (statusChangePayroll.status || "draft"))?.label || statusChangePayroll.status}
                  </Tag>
                </div>

                {/* Arrow */}
                <div className="text-gray-400 text-2xl">→</div>

                {/* New Status */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Mới</p>
                  {selectedStatus && selectedStatus !== (statusChangePayroll.status || "draft") ? (
                    <Tag
                      color={statusOptions.find((s) => s.value === selectedStatus)?.color || "default"}
                      className="text-sm px-3 py-1"
                      icon={statusOptions.find((s) => s.value === selectedStatus)?.icon}
                    >
                      {statusOptions.find((s) => s.value === selectedStatus)?.label}
                    </Tag>
                  ) : (
                    <Tag className="text-sm px-3 py-1">Chọn trạng thái</Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 font-medium mb-2">Chọn trạng thái mới</p>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions
                  .filter((s) => s.value !== (statusChangePayroll.status || "draft"))
                  .map((status) => (
                    <Button
                      key={status.value}
                      type={selectedStatus === status.value ? "primary" : "default"}
                      className={`h-auto py-3 ${selectedStatus === status.value ? '' : 'border-gray-200'}`}
                      style={selectedStatus === status.value ? { 
                        backgroundColor: status.color === 'default' ? '#666' : 
                          status.color === 'gold' ? '#faad14' :
                          status.color === 'green' ? '#52c41a' :
                          status.color === 'blue' ? '#1890ff' : '#666'
                      } : {}}
                      onClick={() => setSelectedStatus(status.value)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>

            {/* Warning */}
            <Alert
              type="warning"
              showIcon
              message="Lưu ý"
              description="Thay đổi trạng thái sẽ được ghi nhận trong lịch sử. Hành động này không thể hoàn tác."
              className="mb-4"
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="large" 
                className="flex-1"
                onClick={() => {
                  setStatusModalOpen(false);
                  setStatusChangePayroll(null);
                  setSelectedStatus(null);
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                size="large" 
                className="flex-1"
                disabled={!selectedStatus || selectedStatus === (statusChangePayroll.status || "draft")}
                onClick={handleChangeStatus}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Drawer */}
      <CustomDrawer
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        title="Chỉnh sửa bảng lương"
        width="66%"
        mode="edit"
      >
        {editingPayroll && (
          <SalaryForm
            action="edit"
            id={editingPayroll.id}
            onSuccess={handleEditSuccess}
            onCancel={handleCloseEditDrawer}
          />
        )}
      </CustomDrawer>

      {/* Send Payslip Modal - Single Employee */}
      <Modal
        title={null}
        open={sendPayslipModalOpen}
        onCancel={() => {
          setSendPayslipModalOpen(false);
          setSendPayslipTarget(null);
        }}
        footer={null}
        width={520}
        centered
        className="send-payslip-modal"
      >
        {sendPayslipTarget && (
          <div className="py-2">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <MailOutlined className="text-3xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Gửi phiếu lương</h2>
              <p className="text-gray-500 text-sm mt-1">Xác nhận gửi phiếu lương cho nhân viên</p>
            </div>

            {/* Employee Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
              <div className="flex items-center gap-4">
                <EmployeeAvatar 
                  photoUrl={sendPayslipTarget.employee?.avatar}
                  name={sendPayslipTarget.employee?.full_name}
                  size={56}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {sendPayslipTarget.employee?.full_name || "N/A"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {sendPayslipTarget.employee?.employee_code || "N/A"}
                  </p>
                </div>
                <Tag color="blue" className="text-sm">
                  <CalendarOutlined className="mr-1" />
                  {sendPayslipTarget.month || 'N/A'}
                </Tag>
              </div>
            </div>

            {/* Salary Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <DollarOutlined className="text-green-500" />
                  Thông tin lương
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lương cơ bản</span>
                  <span className="font-medium">{formatCurrency(Number(sendPayslipTarget.base_salary))} VNĐ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phụ cấp & Thưởng</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(Number(sendPayslipTarget.allowances || 0) + Number(sendPayslipTarget.bonuses || 0))} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Khấu trừ</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(Number(sendPayslipTarget.deductions || 0) + Number(sendPayslipTarget.penalties || 0))} VNĐ
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Thực lãnh</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatCurrency(Number(sendPayslipTarget.net_salary))} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Send Options */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BellOutlined className="text-blue-500" />
                Tùy chọn gửi
              </h4>
              <div className="space-y-2">
                <Checkbox 
                  checked={sendPayslipOptions.sendNotification}
                  onChange={(e) => setSendPayslipOptions(prev => ({ ...prev, sendNotification: e.target.checked }))}
                >
                  <span className="text-gray-700">Gửi thông báo trong hệ thống</span>
                </Checkbox>
                <Checkbox 
                  checked={sendPayslipOptions.sendEmail}
                  onChange={(e) => setSendPayslipOptions(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  disabled
                >
                  <span className="text-gray-400">Gửi email (Đang phát triển)</span>
                </Checkbox>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center mb-4">
              {getStatusTag(sendPayslipTarget.status || 'draft')}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="large" 
                className="flex-1"
                onClick={() => {
                  setSendPayslipModalOpen(false);
                  setSendPayslipTarget(null);
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                size="large" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                icon={<SendOutlined />}
                loading={isSendingPayslip}
                onClick={handleConfirmSendPayslip}
              >
                Gửi phiếu lương
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Send Payslip Modal */}
      <Modal
        title={null}
        open={bulkSendModalOpen}
        onCancel={() => setBulkSendModalOpen(false)}
        footer={null}
        width={600}
        centered
        className="bulk-send-payslip-modal"
      >
        {(() => {
          const approvedPayrolls = payrolls.filter((p) => p.status === "approved" || p.status === "paid");
          const totalNetSalary = approvedPayrolls.reduce((sum, p) => sum + (parseFloat(p.net_salary as any) || 0), 0);
          
          return (
            <div className="py-2">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <MailOutlined className="text-3xl text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Gửi phiếu lương hàng loạt</h2>
                <p className="text-gray-500 text-sm mt-1">Gửi phiếu lương cho tất cả nhân viên đã duyệt</p>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 mb-4 border border-purple-100">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title={<span className="text-gray-600">Số nhân viên</span>}
                      value={approvedPayrolls.length}
                      prefix={<UserOutlined className="text-purple-500" />}
                      valueStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span className="text-gray-600">Tháng lương</span>}
                      value={selectedMonth}
                      prefix={<CalendarOutlined className="text-blue-500" />}
                      valueStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span className="text-gray-600">Tổng tiền</span>}
                      value={totalNetSalary}
                      formatter={(value) => `${formatCurrency(Number(value))}`}
                      suffix="VNĐ"
                      valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}
                    />
                  </Col>
                </Row>
              </div>

              {/* Employee List Preview */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileTextOutlined className="text-blue-500" />
                    Danh sách nhân viên
                  </h4>
                  <Tag color="green">{approvedPayrolls.length} phiếu lương</Tag>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <List
                    size="small"
                    dataSource={approvedPayrolls.slice(0, 10)}
                    renderItem={(item) => (
                      <List.Item className="px-4">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                            <span className="font-medium text-gray-800">
                              {getEmployeeName(item)}
                            </span>
                          </div>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(Number(item.net_salary))} VNĐ
                          </span>
                        </div>
                      </List.Item>
                    )}
                  />
                  {approvedPayrolls.length > 10 && (
                    <div className="px-4 py-2 text-center text-gray-500 text-sm bg-gray-50">
                      ... và {approvedPayrolls.length - 10} nhân viên khác
                    </div>
                  )}
                </div>
              </div>

              {/* Send Options */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BellOutlined className="text-blue-500" />
                  Tùy chọn gửi
                </h4>
                <div className="space-y-2">
                  <Checkbox 
                    checked={sendPayslipOptions.sendNotification}
                    onChange={(e) => setSendPayslipOptions(prev => ({ ...prev, sendNotification: e.target.checked }))}
                  >
                    <span className="text-gray-700">Gửi thông báo trong hệ thống</span>
                  </Checkbox>
                  <Checkbox 
                    checked={sendPayslipOptions.sendEmail}
                    onChange={(e) => setSendPayslipOptions(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    disabled
                  >
                    <span className="text-gray-400">Gửi email (Đang phát triển)</span>
                  </Checkbox>
                </div>
              </div>

              {/* Info Alert */}
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Lưu ý"
                description="Chỉ những phiếu lương ở trạng thái 'Đã duyệt' hoặc 'Đã thanh toán' mới được gửi."
                className="mb-4"
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  size="large" 
                  className="flex-1"
                  onClick={() => setBulkSendModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  icon={<SendOutlined />}
                  loading={isSendingPayslip}
                  onClick={handleConfirmBulkSendPayslip}
                >
                  Gửi {approvedPayrolls.length} phiếu lương
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
