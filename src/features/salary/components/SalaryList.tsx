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
} from "antd";
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
} from "@ant-design/icons";
import { Settings } from "lucide-react";
import { SalarySchemeList } from "./SalarySchemeList";
import { SalaryForm } from "./SalaryForm";
import { SalaryRequests } from "./SalaryRequests";
import { CustomDrawer } from "@/components/common/CustomDrawer";
import { formatDate } from "@/lib/utils";

// Define MonthlyPayroll interface locally
interface MonthlyPayroll {
  id: string;
  employee_id: any;
  month: string;
  salary_scheme_id?: string | null;
  base_salary: number | string;
  allowances: number | string;
  bonuses: number | string;
  overtime_pay: number | string;
  deductions: number | string;
  penalties: number | string;
  gross_salary: number | string;
  net_salary: number | string;
  total_work_hours?: number | string;
  status?: string;
  notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

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

  const getEmployeeName = (employee: any) => {
    if (!employee) return "N/A";
    // If employee is a string (just ID), return placeholder
    if (typeof employee === "string") {
      return `Employee ${employee.slice(0, 8)}...`;
    }
    // If employee is an object with name
    if (typeof employee === "object") {
      return employee.full_name || employee.employee_code || employee.id?.slice(0, 8) || "N/A";
    }
    return "N/A";
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

  const handleSendPayslip = (record: MonthlyPayroll) => {
    const employeeName = getEmployeeName(record.employee_id);
    Modal.confirm({
      title: "Gửi phiếu lương",
      content: `Bạn có muốn gửi phiếu lương cho ${employeeName}?`,
      okText: "Gửi",
      cancelText: "Hủy",
      onOk: () => {
        sendPayslipMutation(
          {
            url: `monthly-payrolls/${record.id}/send-payslip`,
            method: "post",
            values: {},
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
          }
        );
      },
    });
  };

  const handleSendPayslipsBulk = () => {
    const approvedPayrolls = payrolls.filter((p) => p.status === "approved" || p.status === "paid");
    if (approvedPayrolls.length === 0) {
      message.warning("Không có bảng lương nào ở trạng thái đã duyệt hoặc đã thanh toán");
      return;
    }
    
    Modal.confirm({
      title: "Gửi phiếu lương hàng loạt",
      content: `Bạn có muốn gửi phiếu lương cho ${approvedPayrolls.length} nhân viên?`,
      okText: "Gửi tất cả",
      cancelText: "Hủy",
      onOk: () => {
        sendPayslipMutation(
          {
            url: `monthly-payrolls/send-payslip-bulk`,
            method: "post",
            values: { payrollIds: approvedPayrolls.map((p) => p.id) },
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
          }
        );
      },
    });
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
      dataIndex: "employee_id",
      key: "employee",
      ellipsis: true,
      width: 200,
      fixed: "left" as const,
      render: (employee: any) => {
        const name = getEmployeeName(employee);
        const code = typeof employee === 'object' ? employee.employee_code : '';

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            {code && <span className="text-xs text-gray-500">{code}</span>}
          </div>
        );
      },
    },
    {
      title: "Lương cơ bản",
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
      title: "Phụ cấp & Thưởng",
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
      title: "Ngày công",
      key: "work_days",
      width: 90,
      align: "center" as const,
      render: (_: any, record: any) => (
        <span className="font-medium">{record.total_work_days || 0} ngày</span>
      ),
    },
    {
      title: "Phạt",
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
      title: "Trừ & Khấu trừ",
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
      title: "Tổng lương",
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
      title: "Thực lãnh",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
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
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 180,
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
                    onClick={handleSendPayslipsBulk}
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
                  {getEmployeeName(viewingPayroll.employee_id)}
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
            {getEmployeeName(currentPayroll?.employee_id)}
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
            * Bảng lương sẽ được tạo ở trạng thái "Nháp".
          </p>
        </div>
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
    </div>
  );
};
