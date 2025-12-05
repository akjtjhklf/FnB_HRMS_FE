"use client";

import { useOne, useGetIdentity } from "@refinedev/core";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Button,
  Spin,
  Space,
  Result,
  App,
  Alert,
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
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { MonthlyPayroll } from "@/features/salary/types";

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

const { Title, Text } = Typography;

export default function MyPayslipPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<{ id: string; employee_id?: string; full_name?: string }>();
  
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

  // Fetch employee info if not populated in payroll
  const { query: employeeQuery } = useOne({
    resource: "employees",
    id: payroll?.employee_id || "",
    queryOptions: {
      enabled: !!payroll?.employee_id && !payroll?.employee,
    },
  });

  // Get employee from payroll or from separate query
  const employee = payroll?.employee || (employeeQuery?.data?.data as any) || null;

  // Security check: only allow viewing own payslip
  const isOwnPayslip = payroll?.employee_id === identity?.employee_id || 
                       payroll?.employee_id === identity?.id;

  const getStatusConfig = (status: string) => {
    const statusMap = {
      draft: { 
        color: "default", 
        icon: <FileTextOutlined />, 
        text: "Nháp",
      },
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
      paid: { 
        color: "blue", 
        icon: <DollarOutlined />, 
        text: "Đã thanh toán",
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
        <Spin size="large" tip="Đang tải phiếu lương..." />
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
          <Button type="primary" onClick={() => router.push("/salary/my-salary")}>
            Xem bảng lương của tôi
          </Button>
        }
      />
    );
  }

  const statusConfig = getStatusConfig(payroll.status);

  // Calculate totals
  const baseSalary = parseFloat(payroll.base_salary as any) || 0;
  const allowances = parseFloat(payroll.allowances as any) || 0;
  const bonuses = parseFloat(payroll.bonuses as any) || 0;
  const overtimePay = parseFloat(payroll.overtime_pay as any) || 0;
  const deductions = parseFloat(payroll.deductions as any) || 0;
  const penalties = parseFloat(payroll.penalties as any) || 0;
  const netSalary = parseFloat(payroll.net_salary as any) || 0;

  const totalEarnings = baseSalary + allowances + bonuses + overtimePay;
  const totalDeductions = deductions + penalties;

  return (
    <div className="payslip-container" style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      {/* Header Actions */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push("/salary/my-salary")}
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

      {/* Security Notice for paid payslips */}
      {payroll.status === "paid" && (
        <Alert
          message="Phiếu lương đã thanh toán"
          description={`Lương tháng ${formatMonth(payroll.month)} đã được chuyển vào tài khoản của bạn${payroll.paid_at ? ` vào ngày ${formatDate(payroll.paid_at)}` : ""}.`}
          type="success"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 24, borderRadius: 12 }}
          className="no-print"
        />
      )}

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

        {/* Work Summary */}
        {(payroll.total_work_days || payroll.total_work_hours) && (
          <Card
            title="📊 Thông tin công"
            size="small"
            style={{ marginBottom: 24, borderRadius: 12 }}
          >
            <Row gutter={16}>
              {payroll.total_work_days !== undefined && (
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#1890ff" }}>
                      {payroll.total_work_days}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Ngày công</Text>
                  </div>
                </Col>
              )}
              {payroll.total_work_hours !== undefined && (
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
                      {parseFloat(payroll.total_work_hours as any).toFixed(1)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Giờ làm</Text>
                  </div>
                </Col>
              )}
              {payroll.late_days !== undefined && payroll.late_days > 0 && (
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#fa8c16" }}>
                      {payroll.late_days}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Ngày đi muộn</Text>
                  </div>
                </Col>
              )}
              {payroll.absent_days !== undefined && payroll.absent_days > 0 && (
                <Col span={6}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "#ff4d4f" }}>
                      {payroll.absent_days}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Ngày nghỉ</Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        )}

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
              headStyle={{ background: "#f6ffed", borderBottom: "1px solid #b7eb8f" }}
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
            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
            borderRadius: 16,
            marginTop: 8
          }}
          bodyStyle={{ padding: "24px 32px" }}
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

        {/* Notes */}
        {payroll.notes && (
          <>
            <Divider />
            <Card size="small" style={{ background: "#fafafa", borderRadius: 8 }}>
              <Text type="secondary">Ghi chú:</Text>
              <div style={{ marginTop: 8 }}>{payroll.notes}</div>
            </Card>
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
