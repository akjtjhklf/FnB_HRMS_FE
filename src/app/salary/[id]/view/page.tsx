"use client";

import { useOne, useGetIdentity } from "@refinedev/core";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Divider,
  Tag,
  Button,
  Spin,
  Space,
  Statistic,
  Result,
  App,
} from "antd";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { MonthlyPayroll } from "@/features/salary/types";

const { Title, Text } = Typography;

const formatCurrency = (value: number | string | undefined | null) => {
  if (!value) return "0 ₫";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 ₫";
  return num.toLocaleString("vi-VN") + " ₫";
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatMonth = (month: string) => {
  const [year, m] = month.split("-");
  return `Tháng ${parseInt(m)}/${year}`;
};

export default function PayslipViewPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<{ id: string; role?: string }>();
  
  const payrollId = params?.id as string;

  const { query } = useOne<MonthlyPayroll>({
    resource: "monthly-payrolls",
    id: payrollId,
    queryOptions: {
      enabled: !!payrollId,
    },
  });

  const { data, isLoading, isError } = query;
  const payroll = data?.data;

  const getStatusConfig = (status: string) => {
    const statusMap = {
      draft: { 
        color: "default", 
        icon: <FileTextOutlined />, 
        text: "Nháp",
        bgColor: "#f5f5f5",
        borderColor: "#d9d9d9"
      },
      pending_approval: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Chờ duyệt",
        bgColor: "#fffbe6",
        borderColor: "#ffe58f"
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã duyệt",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f"
      },
      paid: { 
        color: "blue", 
        icon: <DollarOutlined />, 
        text: "Đã thanh toán",
        bgColor: "#e6f7ff",
        borderColor: "#91d5ff"
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    message.info("Tính năng tải PDF đang được phát triển");
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" tip="Đang tải phiếu lương...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (isError || !payroll) {
    return (
      <Result
        status="404"
        title="Không tìm thấy phiếu lương"
        subTitle="Phiếu lương bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
        extra={
          <Button type="primary" onClick={() => router.back()}>
            Quay lại
          </Button>
        }
      />
    );
  }

  const statusConfig = getStatusConfig(payroll.status);
  // Support both employee (new) and employee_id (old) fields
  const employee = payroll.employee || (typeof payroll.employee_id === 'object' ? payroll.employee_id : null);

  // Calculate totals
  const baseSalary = parseFloat(payroll.base_salary as any) || 0;
  const allowances = parseFloat(payroll.allowances as any) || 0;
  const bonuses = parseFloat(payroll.bonuses as any) || 0;
  const overtimePay = parseFloat(payroll.overtime_pay as any) || 0;
  const deductions = parseFloat(payroll.deductions as any) || 0;
  const penalties = parseFloat(payroll.penalties as any) || 0;
  const grossSalary = parseFloat(payroll.gross_salary as any) || 0;
  const netSalary = parseFloat(payroll.net_salary as any) || 0;

  const totalEarnings = baseSalary + allowances + bonuses + overtimePay;
  const totalDeductions = deductions + penalties;

  return (
    <div className="payslip-container" style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      {/* Header Actions */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In phiếu lương
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Tải PDF
          </Button>
        </Space>
      </div>

      {/* Payslip Card */}
      <Card 
        className="payslip-card"
        style={{ 
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}
      >
        {/* Company Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          margin: -24,
          marginBottom: 24,
          padding: "32px 24px",
          color: "white"
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  background: "rgba(255,255,255,0.2)", 
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <BankOutlined style={{ fontSize: 28 }} />
                </div>
                <div>
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    PHIẾU LƯƠNG
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
                    {formatMonth(payroll.month)}
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Tag 
                icon={statusConfig.icon}
                style={{ 
                  fontSize: 14, 
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.9)",
                  color: statusConfig.color === "default" ? "#666" : undefined
                }}
                color={statusConfig.color}
              >
                {statusConfig.text}
              </Tag>
            </Col>
          </Row>
        </div>

        {/* Employee Info */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: 24, 
            background: "#fafafa",
            borderRadius: 12
          }}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: "#e6f7ff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <UserOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nhân viên</Text>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {employee?.full_name || "N/A"}
                  </div>
                  <Text type="secondary">{employee?.employee_code || ""}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: "#fff7e6",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <CalendarOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Kỳ lương</Text>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {formatMonth(payroll.month)}
                  </div>
                  <Text type="secondary">Mã phiếu: {payroll.id.substring(0, 8).toUpperCase()}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Salary Breakdown */}
        <Row gutter={24}>
          {/* Earnings */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{ color: "#52c41a" }}>
                  <DollarOutlined /> Thu nhập
                </span>
              }
              size="small"
              style={{ 
                marginBottom: 16,
                borderRadius: 12,
                border: "1px solid #b7eb8f"
              }}
              styles={{ header: { background: "#f6ffed", borderBottom: "1px solid #b7eb8f" } }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text>Lương cơ bản</Text>
                  <Text strong>{formatCurrency(baseSalary)}</Text>
                </div>
                {allowances > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Phụ cấp</Text>
                    <Text strong>{formatCurrency(allowances)}</Text>
                  </div>
                )}
                {bonuses > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Thưởng</Text>
                    <Text strong>{formatCurrency(bonuses)}</Text>
                  </div>
                )}
                {overtimePay > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Lương tăng ca</Text>
                    <Text strong>{formatCurrency(overtimePay)}</Text>
                  </div>
                )}
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ color: "#52c41a" }}>Tổng thu nhập</Text>
                  <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                    {formatCurrency(totalEarnings)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Deductions */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{ color: "#ff4d4f" }}>
                  <FileTextOutlined /> Khấu trừ
                </span>
              }
              size="small"
              style={{ 
                marginBottom: 16,
                borderRadius: 12,
                border: "1px solid #ffa39e"
              }}
              headStyle={{ background: "#fff1f0", borderBottom: "1px solid #ffa39e" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {deductions > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Khấu trừ BHXH, BHYT...</Text>
                    <Text strong>-{formatCurrency(deductions)}</Text>
                  </div>
                )}
                {penalties > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text>Phạt (đi muộn, về sớm...)</Text>
                    <Text strong>-{formatCurrency(penalties)}</Text>
                  </div>
                )}
                {totalDeductions === 0 && (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <Text type="secondary">Không có khoản khấu trừ</Text>
                  </div>
                )}
                <Divider style={{ margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ color: "#ff4d4f" }}>Tổng khấu trừ</Text>
                  <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                    -{formatCurrency(totalDeductions)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Net Salary */}
        <Card
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            borderRadius: 16,
            marginTop: 8
          }}
          styles={{ body: { padding: "24px 32px" } }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
                THỰC LÃNH
              </Text>
              <div style={{ 
                fontSize: 36, 
                fontWeight: 700, 
                color: "white",
                letterSpacing: 1
              }}>
                {formatCurrency(netSalary)}
              </div>
            </Col>
            <Col>
              <div style={{
                width: 80,
                height: 80,
                background: "rgba(255,255,255,0.15)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <DollarOutlined style={{ fontSize: 40, color: "white" }} />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Additional Info */}
        {(payroll.approved_at || payroll.paid_at || payroll.notes) && (
          <>
            <Divider />
            <Descriptions 
              column={{ xs: 1, sm: 2 }}
              size="small"
              styles={{ label: { color: "#8c8c8c" } }}
            >
              {payroll.approved_at && (
                <Descriptions.Item label="Ngày duyệt">
                  {formatDate(payroll.approved_at)}
                </Descriptions.Item>
              )}
              {payroll.paid_at && (
                <Descriptions.Item label="Ngày thanh toán">
                  {formatDate(payroll.paid_at)}
                </Descriptions.Item>
              )}
              {payroll.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {payroll.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Footer */}
        <Divider />
        <div style={{ textAlign: "center", color: "#8c8c8c", fontSize: 12 }}>
          <Text type="secondary">
            Phiếu lương được tạo tự động bởi hệ thống HRMS
          </Text>
          <br />
          <Text type="secondary">
            Mọi thắc mắc xin liên hệ phòng Nhân sự
          </Text>
        </div>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .payslip-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .payslip-card {
            box-shadow: none !important;
            border: 1px solid #d9d9d9 !important;
          }
        }
      `}</style>
    </div>
  );
}
