"use client";

import { useTable } from "@refinedev/antd";
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
  Modal,
  Descriptions,
  Divider,
  Tooltip,
  App,
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
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  full_name?: string;
  employee_code?: string;
}

interface MonthlyPayroll {
  id: string;
  employee_id: string | Employee;
  month: string;
  base_salary: number;
  allowances?: number;
  bonuses?: number;
  overtime_pay?: number;
  deductions?: number;
  penalties?: number;
  gross_salary: number;
  net_salary: number;
  status: "draft" | "pending_approval" | "approved" | "paid";
  notes?: string;
  approved_by?: string;
  approved_at?: string;
}

const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return "0";
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const SalaryList = () => {
  const { message } = App.useApp();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [viewingPayroll, setViewingPayroll] = useState<MonthlyPayroll | null>(null);

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

  const payrolls = tableProps.dataSource || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = payrolls.length;
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
    const paid = payrolls.filter((p) => p.status === "paid").length;
    const pending = payrolls.filter((p) => p.status === "pending_approval").length;

    return { total, totalGross, totalNet, totalDeductions, paid, pending };
  }, [payrolls]);

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
      pending_approval: { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "green", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      paid: { color: "blue", icon: <DollarOutlined />, text: "Đã thanh toán" },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return "N/A";
    if (typeof employee === "object") {
      return employee.full_name || employee.employee_code || "N/A";
    }
    return "N/A";
  };

  const handleView = (record: MonthlyPayroll) => {
    setViewingPayroll(record);
  };

  const handleEdit = (record: MonthlyPayroll) => {
    message.info("Chức năng chỉnh sửa bảng lương đang được phát triển");
  };

  const handleRequestEdit = (record: MonthlyPayroll) => {
    message.info("Yêu cầu chỉnh sửa bảng lương đã được gửi");
  };

  const handleExport = () => {
    message.info("Chức năng xuất Excel đang được phát triển");
  };

  const handleCreatePayroll = () => {
    message.info("Chức năng tạo bảng lương đang được phát triển");
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      ellipsis: true,
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
      sorter: true,
      render: (value: number) => (
        <span className="text-gray-700">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Phụ cấp & Thưởng",
      key: "allowances_bonuses",
      width: 140,
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
      sorter: true,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Thực lãnh",
      dataIndex: "net_salary",
      key: "net_salary",
      width: 140,
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
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: MonthlyPayroll) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          {(record.status === "draft" || record.status === "pending_approval") && (
            <Tooltip title="Chỉnh sửa">
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            </Tooltip>
          )}
          {record.status === "approved" && (
            <Tooltip title="Yêu cầu sửa">
              <Button type="text" onClick={() => handleRequestEdit(record)}>
                Yêu cầu
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarOutlined className="text-xl text-green-600" />
            </div>
            Bảng lương
          </h1>
          <p className="text-gray-500 mt-2 ml-[52px]">Quản lý lương và thưởng nhân viên</p>
        </div>
        <Space>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePayroll}>
            Tạo bảng lương
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng số nhân viên"
              value={stats.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng lương"
              value={stats.totalGross}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng thực lãnh"
              value={stats.totalNet}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng khấu trừ"
              value={stats.totalDeductions}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payroll Table */}
      <Card className="shadow-sm border border-gray-200">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bảng lương`,
          }}
        />
      </Card>

      {/* Payroll Detail Modal */}
      <Modal
        title="Chi tiết phiếu lương"
        open={!!viewingPayroll}
        onCancel={() => setViewingPayroll(null)}
        footer={[
          <Button key="close" onClick={() => setViewingPayroll(null)}>
            Đóng
          </Button>,
          viewingPayroll?.status === "approved" && (
            <Button
              key="request"
              type="primary"
              onClick={() => {
                handleRequestEdit(viewingPayroll);
                setViewingPayroll(null);
              }}
            >
              Yêu cầu chỉnh sửa
            </Button>
          ),
        ]}
        width={700}
      >
        {viewingPayroll && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Nhân viên" span={2}>
                {getEmployeeName(viewingPayroll.employee_id as Employee)}
              </Descriptions.Item>
              <Descriptions.Item label="Tháng">
                {new Date(viewingPayroll.month + "-01").toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(viewingPayroll.status)}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Chi tiết lương</Divider>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Lương cơ bản">
                {formatCurrency(viewingPayroll.base_salary)}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ cấp">
                +{formatCurrency(viewingPayroll.allowances || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Thưởng">
                +{formatCurrency(viewingPayroll.bonuses || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Lương làm thêm">
                +{formatCurrency(viewingPayroll.overtime_pay || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Khấu trừ (đồng phục, ứng trước, v.v.)">
                <span className="text-red-600">
                  -{formatCurrency(viewingPayroll.deductions || 0)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt">
                <span className="text-red-600">
                  -{formatCurrency(viewingPayroll.penalties || 0)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tổng lương">
                <span className="font-semibold text-base">
                  {formatCurrency(viewingPayroll.gross_salary)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thực lãnh">
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(viewingPayroll.net_salary)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {viewingPayroll.notes && (
              <>
                <Divider orientation="left">Ghi chú</Divider>
                <p className="p-3 bg-gray-50 rounded">{viewingPayroll.notes}</p>
              </>
            )}

            {viewingPayroll.approved_at && (
              <>
                <Divider orientation="left">Thông tin duyệt</Divider>
                <Descriptions column={1} bordered>
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
      </Modal>
    </div>
  );
};
