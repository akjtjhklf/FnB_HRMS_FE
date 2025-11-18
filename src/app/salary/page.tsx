"use client";

import { useState, useMemo } from "react";
import { useList } from "@refinedev/core";
import {
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
  message,
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
import CustomDataTable, { CustomColumnType } from "@/components/common/CustomDataTable";
import { MonthlyPayroll } from "@/types/payroll";
import { Employee } from "@/types/employee";
import { formatDate } from "@/lib/utils";

// Format currency helper function
const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return '0';
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function SalaryPage() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [viewingPayroll, setViewingPayroll] = useState<MonthlyPayroll | null>(null);

  // Fetch payroll data
  const { query } = useList<MonthlyPayroll>({
    resource: "monthly-payrolls",
    filters: [
      {
        field: "month",
        operator: "eq",
        value: selectedMonth,
      },
    ],
    queryOptions: {
      retry: 1,
    },
  });

  const payrolls = query.data?.data || [];
  const isLoading = query.isLoading;

  // Debug
  if (payrolls.length > 0) {
    console.log('Sample payroll:', {
      employee: payrolls[0].employee_id,
      base_salary: payrolls[0].base_salary,
      gross_salary: payrolls[0].gross_salary,
    });
  }

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

  const handleView = (record: MonthlyPayroll) => {
    setViewingPayroll(record);
  };

  const handleEdit = (record: MonthlyPayroll) => {
    message.info("Chức năng chỉnh sửa bảng lương đang được phát triển");
    // TODO: Open edit modal or navigate to edit page
  };

  const handleRequestEdit = (record: MonthlyPayroll) => {
    message.info("Yêu cầu chỉnh sửa bảng lương đã được gửi");
    // TODO: Create salary request
  };

  const handleExport = () => {
    message.info("Chức năng xuất Excel đang được phát triển");
    // TODO: Export to Excel
  };

  const handleCreatePayroll = () => {
    message.info("Chức năng tạo bảng lương đang được phát triển");
    // TODO: Create new payroll for selected month
  };

  const columns: CustomColumnType<MonthlyPayroll>[] = [
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      render: (employee: any) => {
        if (employee && typeof employee === "object") {
          return employee.full_name || `${employee.employee_code}` || "N/A";
        }
        return "N/A";
      },
      sorter: true,
      filterable: true,
      filterType: "text",
    },
    {
      title: "Lương cơ bản",
      dataIndex: "base_salary",
      key: "base_salary",
      render: (value: number) => {
        if (!value || isNaN(value)) return '0';
        const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return formatted;
      },
      sorter: true,
    },
    {
      title: "Phụ cấp & Thưởng",
      key: "allowances_bonuses",
      render: (_: unknown, record: MonthlyPayroll) => {
        const allowances = parseFloat(record.allowances as any) || 0;
        const bonuses = parseFloat(record.bonuses as any) || 0;
        const total = Math.round(allowances + bonuses);
        const formatted = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return formatted;
      },
    },
    {
      title: "Trừ & Phạt",
      key: "deductions_penalties",
      render: (_: unknown, record: MonthlyPayroll) => {
        const deductions = parseFloat(record.deductions as any) || 0;
        const penalties = parseFloat(record.penalties as any) || 0;
        const total = Math.round(deductions + penalties);
        const formatted = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return (
          <span style={{ color: "#ff4d4f" }}>
            -{formatted}
          </span>
        );
      },
    },
    {
      title: "Tổng lương",
      dataIndex: "gross_salary",
      key: "gross_salary",
      render: (value: number) => {
        if (!value || isNaN(value)) return '0';
        const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return <span style={{ fontWeight: 600 }}>{formatted}</span>;
      },
      sorter: true,
    },
    {
      title: "Thực lãnh",
      dataIndex: "net_salary",
      key: "net_salary",
      render: (value: number) => {
        if (!value || isNaN(value)) return '0';
        const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return (
          <span style={{ fontWeight: 700, color: "#52c41a" }}>
            {formatted}
          </span>
        );
      },
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Nháp", value: "draft" },
        { label: "Chờ duyệt", value: "pending_approval" },
        { label: "Đã duyệt", value: "approved" },
        { label: "Đã thanh toán", value: "paid" },
      ],
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: MonthlyPayroll) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {(record.status === "draft" || record.status === "pending_approval") && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
          )}
          {record.status === "approved" && (
            <Button
              type="link"
              size="small"
              onClick={() => handleRequestEdit(record)}
            >
              Yêu cầu sửa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const getEmployeeName = (employee: any) => {
    if (!employee) return "N/A";
    if (typeof employee === "object") {
      return employee.full_name || employee.employee_code || "N/A";
    }
    return "N/A";
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Bảng lương</h1>
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
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số nhân viên"
              value={stats.total}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lương"
              value={stats.totalGross}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng thực lãnh"
              value={stats.totalNet}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
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
      <Card>
        <CustomDataTable
          data={payrolls}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          searchable={true}
          showFilters={true}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bảng lương`,
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
                <span style={{ color: "#ff4d4f" }}>
                  -{formatCurrency(viewingPayroll.deductions || 0)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phạt">
                <span style={{ color: "#ff4d4f" }}>
                  -{formatCurrency(viewingPayroll.penalties || 0)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tổng lương">
                <span style={{ fontWeight: 600, fontSize: "16px" }}>
                  {formatCurrency(viewingPayroll.gross_salary)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thực lãnh">
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#52c41a",
                  }}
                >
                  {formatCurrency(viewingPayroll.net_salary)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {viewingPayroll.notes && (
              <>
                <Divider orientation="left">Ghi chú</Divider>
                <p style={{ padding: "12px", background: "#f5f5f5", borderRadius: "4px" }}>
                  {viewingPayroll.notes}
                </p>
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
                    {formatDate(new Date(viewingPayroll.approved_at), "dd/MM/yyyy HH:mm")}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
