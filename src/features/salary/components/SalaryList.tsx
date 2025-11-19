"use client";

import { useTable } from "@refinedev/antd";
import { useCreate } from "@refinedev/core";
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
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { MonthlyPayroll } from "@/types/payroll";
import { Employee } from "@/types/employee";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";
import { useRouter } from "next/navigation";

const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return "0";
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const SalaryList = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState<MonthlyPayroll | null>(null);
  const [requestForm] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<MonthlyPayroll | null>(null);
  const [searchText, setSearchText] = useState("");

  const { mutate: createRequest } = useCreate();

  const { tableProps } = useTable<MonthlyPayroll>({
    resource: "monthly-payrolls",
    syncWithLocation: false,
    pagination: { pageSize: 20 },
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

  const payrolls = useMemo(() => tableProps.dataSource || [], [tableProps.dataSource]);

  const getEmployeeName = (employee: any) => {
    if (!employee) return "N/A";
    if (typeof employee === "object") {
      return employee.full_name || employee.employee_code || "N/A";
    }
    return "N/A";
  };

  // Filter payrolls by search text
  const filteredPayrolls = useMemo(() => {
    if (!searchText) return payrolls;
    const searchLower = searchText.toLowerCase();
    return payrolls.filter((p) => {
      const employeeName = getEmployeeName(p.employee_id).toLowerCase();
      return employeeName.includes(searchLower);
    });
  }, [payrolls, searchText]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPayrolls.length;
    const totalGross = filteredPayrolls.reduce((sum, p) => {
      const value = parseFloat(p.gross_salary as any) || 0;
      return sum + value;
    }, 0);
    const totalNet = filteredPayrolls.reduce((sum, p) => {
      const value = parseFloat(p.net_salary as any) || 0;
      return sum + value;
    }, 0);
    const totalDeductions = filteredPayrolls.reduce((sum, p) => {
      const ded = parseFloat(p.deductions as any) || 0;
      const pen = parseFloat(p.penalties as any) || 0;
      return sum + ded + pen;
    }, 0);

    return { total, totalGross, totalNet, totalDeductions };
  }, [filteredPayrolls]);

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
    router.push(`/salary/${record.id}/edit`);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setViewingPayroll(null);
  };

  const handleRequestEdit = (record: MonthlyPayroll) => {
    setCurrentPayroll(record);
    setRequestModalOpen(true);
    requestForm.resetFields();
  };

  const handleSubmitRequest = async () => {
    try {
      const values = await requestForm.validateFields();
      
      createRequest(
        {
          resource: "salary-requests",
          values: {
            employee_id: typeof currentPayroll?.employee_id === "object" 
              ? (currentPayroll?.employee_id as Employee).id 
              : currentPayroll?.employee_id,
            current_rate: currentPayroll?.base_salary,
            proposed_rate: currentPayroll?.base_salary,
            request_date: new Date().toISOString(),
            status: "pending",
            note: values.reason,
          },
        },
        {
          onSuccess: () => {
            message.success("Yêu cầu chỉnh sửa đã được gửi thành công");
            setRequestModalOpen(false);
            setCurrentPayroll(null);
            requestForm.resetFields();
          },
          onError: () => {
            message.error("Gửi yêu cầu thất bại, vui lòng thử lại");
          },
        }
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleExport = () => {
    message.info("Chức năng xuất Excel đang được phát triển");
  };

  const handleCreatePayroll = () => {
    router.push("/salary/create");
  };

  const getActionItems = (record: MonthlyPayroll): ActionItem[] => [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: () => handleView(record),
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: "request",
      label: "Yêu cầu sửa",
      icon: <SendOutlined />,
      onClick: () => handleRequestEdit(record),
    },
  ];

  const columns: any[] = [
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      ellipsis: true,
      width: 200,
      render: (employee: any) => {
        const name = getEmployeeName(employee);
        return <span className="font-medium text-gray-900">{name}</span>;
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
        <span className="text-gray-700">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Phụ cấp & Thưởng",
      key: "allowances_bonuses",
      width: 140,
      align: "right" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const allowances = parseFloat(record.allowances as any) || 0;
        const bonuses = parseFloat(record.bonuses as any) || 0;
        const total = Math.round(allowances + bonuses);
        return <span className="text-green-600">+{formatCurrency(total)}</span>;
      },
    },
    {
      title: "Trừ & Phạt",
      key: "deductions_penalties",
      width: 120,
      align: "right" as const,
      render: (_: any, record: MonthlyPayroll) => {
        const deductions = parseFloat(record.deductions as any) || 0;
        const penalties = parseFloat(record.penalties as any) || 0;
        const total = Math.round(deductions + penalties);
        return <span className="text-red-600">-{formatCurrency(total)}</span>;
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
        <span className="font-semibold text-gray-900">
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
        <span className="font-bold text-green-600">{formatCurrency(value)}</span>
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
      onFilter: (value: any, record: MonthlyPayroll) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: MonthlyPayroll) => (
        <ActionPopover actions={getActionItems(record)} />
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarOutlined className="text-xl text-green-600" />
            </div>
            Bảng lương
          </h1>
          <p className="text-gray-500 mt-2 ml-0 md:ml-[52px] text-sm md:text-base">
            Quản lý lương và thưởng nhân viên
          </p>
        </div>
        <Space wrap size="small" className="w-full md:w-auto">
          <Input.Search
            placeholder="Tìm theo tên nhân viên..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-[250px]"
          />
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            className="w-full md:w-[200px]"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePayroll}
          >
            <span className="hidden md:inline">Tạo bảng lương</span>
            <span className="md:hidden">Tạo</span>
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            <span className="hidden md:inline">Xuất Excel</span>
            <span className="md:hidden">Xuất</span>
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-4 md:mb-6">
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
      <Card className="shadow-sm border border-gray-200">
        <Table
          {...tableProps}
          dataSource={filteredPayrolls}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            total: filteredPayrolls.length,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bảng lương`,
          }}
        />
      </Card>

      {/* Payroll Detail Drawer */}
      <Drawer
        open={drawerOpen}
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            Chi tiết phiếu lương
          </div>
        }
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? "100%" : 700}
        onClose={handleCloseDrawer}
        styles={{ body: { paddingTop: 16 } }}
      >
        {viewingPayroll && (
          <div>
            <Descriptions column={1} bordered size="small">
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
                {getStatusTag(viewingPayroll.status)}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Chi tiết lương</Divider>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Lương cơ bản">
                <span className="font-semibold">
                  {formatCurrency(viewingPayroll.base_salary)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phụ cấp">
                <span className="text-green-600">
                  +{formatCurrency(viewingPayroll.allowances || 0)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thưởng">
                <span className="text-green-600">
                  +{formatCurrency(viewingPayroll.bonuses || 0)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Lương làm thêm">
                <span className="text-green-600">
                  +{formatCurrency(viewingPayroll.overtime_pay || 0)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Khấu trừ">
                <span className="text-red-600">
                  -{formatCurrency(viewingPayroll.deductions || 0)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt">
                <span className="text-red-600">
                  -{formatCurrency(viewingPayroll.penalties || 0)} VNĐ
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tổng lương">
                <span className="font-semibold text-base">
                  {formatCurrency(viewingPayroll.gross_salary)} VNĐ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thực lãnh">
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(viewingPayroll.net_salary)} VNĐ
                </span>
              </Descriptions.Item>
            </Descriptions>

            {viewingPayroll.notes && (
              <>
                <Divider orientation="left">Ghi chú</Divider>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  {viewingPayroll.notes}
                </div>
              </>
            )}

            {viewingPayroll.approved_at && (
              <>
                <Divider orientation="left">Thông tin duyệt</Divider>
                <Descriptions column={1} bordered size="small">
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
            Yêu cầu chỉnh sửa bảng lương
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
      >
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Nhân viên:</strong>{" "}
            {getEmployeeName(currentPayroll?.employee_id)}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Tháng:</strong> {currentPayroll?.month}
          </p>
        </div>
        <Form form={requestForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do yêu cầu chỉnh sửa"
            rules={[
              { required: true, message: "Vui lòng nhập lý do yêu cầu" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
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
    </div>
  );
};
