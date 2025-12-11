"use client";

import { useList, useCreate, useGetIdentity, useCustomMutation } from "@refinedev/core";
import {
  Card,
  Statistic,
  Progress,
  Button,
  Tag,
  Table,
  Modal,
  Space,
  Tooltip,
  Input,
  App,
  Form,
  Select,
} from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  CalendarOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TrendingUp, Award, AlertTriangle, Briefcase } from "lucide-react";
import { useState, useMemo } from "react";
import dayjs from "dayjs";

interface WorkHistoryTabProps {
  employeeId: string;
  positionId?: string;
  isOwnProfile?: boolean; // Chỉ hiển thị nút yêu cầu tăng lương nếu là profile của chính mình
}

export const WorkHistoryTab: React.FC<WorkHistoryTabProps> = ({
  employeeId,
  positionId,
  isOwnProfile = false,
}) => {
  const { message } = App.useApp();
  const [bonusDetailVisible, setBonusDetailVisible] = useState(false);
  const [penaltyDetailVisible, setPenaltyDetailVisible] = useState(false);
  const [salaryRequestVisible, setSalaryRequestVisible] = useState(false);
  const [form] = Form.useForm();

  const { mutate: createSalaryRequest } = useCreate();
  const [isCreating, setIsCreating] = useState(false);

  const { data: identity } = useGetIdentity<{ id: string; full_name: string; role: any }>();
  const isAdminOrManager = identity?.role?.name === 'Administrator' || identity?.role?.name === 'Manager';

  const { mutate: approveRequest } = useCustomMutation();
  const { mutate: rejectRequest } = useCustomMutation();

  const handleApproveRequest = (id: string) => {
    Modal.confirm({
      title: "Duyệt yêu cầu",
      content: "Bạn có chắc chắn muốn duyệt yêu cầu này?",
      onOk: () => {
        approveRequest({
          url: `salary-requests/${id}/approve`,
          method: "post",
          values: {
            approved_by: identity?.full_name || "Manager",
          },
          successNotification: () => ({
            message: "Đã duyệt yêu cầu",
            type: "success",
          }),
        }, {
          onSuccess: () => {
            requestsQuery.refetch();
          }
        });
      }
    });
  };

  const handleRejectRequest = (id: string) => {
    Modal.confirm({
      title: "Từ chối yêu cầu",
      content: "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      okText: "Từ chối",
      okButtonProps: { danger: true },
      onOk: () => {
        rejectRequest({
          url: `salary-requests/${id}/reject`,
          method: "post",
          values: {
            rejected_by: identity?.full_name || "Manager",
          },
          successNotification: () => ({
            message: "Đã từ chối yêu cầu",
            type: "success",
          }),
        }, {
          onSuccess: () => {
            requestsQuery.refetch();
          }
        });
      }
    });
  };

  // Fetch active contract to get salary scheme
  const { query: contractQuery } = useList({
    resource: "contracts",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
      {
        field: "is_active",
        operator: "eq",
        value: true,
      },
    ],
  });
  const activeContract = contractQuery.data?.data?.[0];

  // Extract salary_scheme_id - handle both object and string cases
  const salarySchemeId = activeContract?.salary_scheme_id
    ? typeof activeContract.salary_scheme_id === "object"
      ? (activeContract.salary_scheme_id as any).id
      : activeContract.salary_scheme_id
    : null;

  // If salary_scheme_id is already populated as object, use it directly
  const populatedScheme = activeContract?.salary_scheme_id && typeof activeContract.salary_scheme_id === "object"
    ? activeContract.salary_scheme_id as any
    : null;

  // Fetch salary scheme based on contract OR position (only if not already populated)
  const { query: schemeQuery } = useList({
    resource: "salary-schemes",
    filters: [
      salarySchemeId && !populatedScheme
        ? {
          field: "id",
          operator: "eq",
          value: salarySchemeId,
        }
        : {
          field: "position_id",
          operator: "eq",
          value: positionId || "unknown",
        },
    ],
    queryOptions: {
      enabled: !populatedScheme && !!(salarySchemeId || positionId),
    },
  });

  // Fetch schedule assignments (to calculate total shifts)
  const { query: assignmentsQuery } = useList({
    resource: "schedule-assignments",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
      {
        field: "status",
        operator: "eq",
        value: "assigned",
      },
    ],
    pagination: {
      pageSize: 1000,
    },
  });

  // Fetch monthly payrolls (for bonuses/penalties history and total hours)
  const { query: payrollsQuery } = useList({
    resource: "monthly-payrolls",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
    ],
    pagination: {
      pageSize: 1000, // Fetch all history
    },
    sorters: [
      {
        field: "month",
        order: "desc",
      },
    ],
  });

  // Fetch salary requests history
  const { query: requestsQuery } = useList({
    resource: "salary-requests",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
    ],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });
  const salaryRequests = requestsQuery.data?.data || [];

  // Fetch ALL salary schemes for selection (only active ones)
  const { query: allSchemesQuery } = useList({
    resource: "salary-schemes",
    filters: [
      {
        field: "is_active",
        operator: "eq",
        value: true,
      },
    ],
    pagination: {
      pageSize: 100,
    },
    sorters: [
      {
        field: "rate",
        order: "asc",
      },
    ],
  });
  const allSalarySchemes = allSchemesQuery.data?.data || [];

  // Calculate statistics - use populated scheme first, then fetched scheme, then default
  const currentScheme = populatedScheme || schemeQuery.data?.data?.[0] || {
    id: "unknown",
    name: "Chưa thiết lập",
    rate: 0,
    pay_type: "hourly",
    min_hours: 0,
  };

  // Get base_salary from contract if available (overrides scheme rate)
  const currentSalary = activeContract?.base_salary 
    ? Number(activeContract.base_salary) 
    : Number(currentScheme.rate) || 0;

  // Filter salary schemes that have higher rate than current (for raise request)
  // Also include all schemes for flexibility - user may want to request any scheme
  const availableSchemesForRaise = useMemo(() => {
    // Filter out current scheme, show all others sorted by rate (highest first)
    return allSalarySchemes
      .filter((scheme: any) => scheme.id !== currentScheme.id)
      .sort((a: any, b: any) => Number(b.rate) - Number(a.rate));
  }, [allSalarySchemes, currentScheme.id]);

  const assignments = useMemo(
    () => assignmentsQuery.data?.data || [],
    [assignmentsQuery.data?.data]
  );
  const payrolls = useMemo(
    () => payrollsQuery.data?.data || [],
    [payrollsQuery.data?.data]
  );

  // Real data calculations
  const totalHoursWorked = useMemo(() => {
    return payrolls.reduce(
      (sum: number, p: any) => sum + (Number(p.total_work_hours) || 0),
      0
    );
  }, [payrolls]);

  const requiredHoursForRaise = 1000; // Threshold for raise eligibility (can be dynamic later)
  const hoursRemaining = Math.max(0, requiredHoursForRaise - totalHoursWorked);
  const progressPercent = Math.min(
    100,
    (totalHoursWorked / requiredHoursForRaise) * 100
  );

  // Calculate total bonuses and penalties
  const totalBonuses = payrolls.reduce(
    (sum: number, p: any) => sum + (Number(p.bonuses) || 0),
    0
  );
  const totalPenalties = payrolls.reduce(
    (sum: number, p: any) => sum + (Number(p.penalties) || 0),
    0
  );

  // Calculate shifts by position
  const shiftsByPosition = useMemo(() => {
    const positionMap: Record<string, number> = {};
    assignments.forEach((assignment: any) => {
      const posId = assignment.position_id || "unknown";
      positionMap[posId] = (positionMap[posId] || 0) + 1;
    });
    return positionMap;
  }, [assignments]);

  // Bonus/penalty details
  const bonusDetails = payrolls
    .filter((p: any) => Number(p.bonuses) > 0)
    .map((p: any) => ({
      month: p.month,
      amount: p.bonuses,
      reason: p.notes || "Thưởng hiệu suất/Khác",
    }));

  const penaltyDetails = payrolls
    .filter((p: any) => Number(p.penalties) > 0)
    .map((p: any) => ({
      month: p.month,
      amount: p.penalties,
      reason: p.notes || "Vi phạm quy định/Khác",
    }));

  const handleSalaryRequest = () => {
    setSalaryRequestVisible(true);
  };

  const handleSubmitSalaryRequest = async () => {
    try {
      const values = await form.validateFields();
      setIsCreating(true);

      // Get proposed rate - from selected scheme or manual input
      let proposedRate = 0;
      let proposedSchemeId = null;

      if (values.proposed_scheme_id) {
        // Find selected scheme to get the rate
        const selectedScheme = allSalarySchemes.find(
          (s: any) => s.id === values.proposed_scheme_id
        );
        proposedRate = selectedScheme ? Number(selectedScheme.rate) : 0;
        proposedSchemeId = values.proposed_scheme_id;
      } else if (values.proposed_rate) {
        // Use manual input rate
        proposedRate = Number(values.proposed_rate);
      }

      createSalaryRequest(
        {
          resource: "salary-requests",
          values: {
            employee_id: employeeId,
            current_scheme_id:
              currentScheme.id !== "unknown" ? currentScheme.id : null,
            current_rate: currentSalary,
            proposed_scheme_id: proposedSchemeId,
            proposed_rate: proposedRate,
            request_date: dayjs().toISOString(),
            status: "pending",
            note: values.note,
            type: "raise", // Always "raise" for salary increase request
          },
        },
        {
          onSuccess: () => {
            setIsCreating(false);
            message.success({
              content: "✅ Yêu cầu tăng lương đã được gửi thành công!",
              duration: 3,
            });
            setSalaryRequestVisible(false);
            form.resetFields();
            requestsQuery.refetch();
          },
          onError: (error: any) => {
            setIsCreating(false);
            message.error({
              content: `❌ Gửi yêu cầu thất bại: ${error?.message || "Có lỗi xảy ra"
                }`,
              duration: 4,
            });
          },
        }
      );
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const bonusColumns = [
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      render: (text: string) => dayjs(text).format("MM/YYYY"),
    },
    {
      title: "Loại / Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          +{Number(amount).toLocaleString()} VNĐ
        </span>
      ),
    },
  ];

  const penaltyColumns = [
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      render: (text: string) => dayjs(text).format("MM/YYYY"),
    },
    {
      title: "Loại / Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span className="font-semibold text-red-600">
          -{Number(amount).toLocaleString()} VNĐ
        </span>
      ),
    },
  ];

  const getPayTypeLabel = (type: string) => {
    switch (type) {
      case "hourly":
        return "Theo giờ";
      case "fixed_shift":
        return "Theo ca";
      case "monthly":
        return "Theo tháng";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Salary Information */}
      <Card className="border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <DollarOutlined className="text-blue-600" />
              Mức lương hiện tại
            </h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {currentSalary.toLocaleString()} VNĐ
              </span>
              <Tag color={currentScheme.id !== "unknown" ? "blue" : "default"}>
                {currentScheme.name}
              </Tag>
              <Tag color="cyan">{getPayTypeLabel(currentScheme.pay_type)}</Tag>
            </div>
          </div>
          {/* Chỉ hiển thị nút yêu cầu tăng lương trong trang Profile của chính mình */}
          {isOwnProfile && (
            <Button
              type="primary"
              icon={<RiseOutlined />}
              size="large"
              onClick={handleSalaryRequest}
              className="flex items-center gap-2"
              disabled={!activeContract}
              title={!activeContract ? "Bạn cần có hợp đồng đang hoạt động để yêu cầu tăng lương" : ""}
            >
              Yêu cầu tăng lương
            </Button>
          )}
        </div>
      </Card>

      {/* Work Hours Progress */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-orange-600" />
            Tiến độ giờ làm
          </div>
        }
        className="border-l-4 border-l-orange-500"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Statistic
              title="Tổng giờ đã làm"
              value={totalHoursWorked}
              precision={1}
              suffix="giờ"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Statistic
              title="Giờ cần để tăng lương"
              value={requiredHoursForRaise}
              suffix="giờ"
              prefix={<TrendingUp className="w-5 h-5" />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Statistic
              title="Còn lại"
              value={hoursRemaining}
              precision={1}
              suffix="giờ"
              prefix={<CalendarOutlined />}
              valueStyle={{
                color: hoursRemaining <= 100 ? "#52c41a" : "#faad14",
              }}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Tiến độ hoàn thành</span>
              <span className="font-semibold">
                {progressPercent.toFixed(1)}%
              </span>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              status={progressPercent >= 100 ? "success" : "active"}
            />
            {progressPercent >= 100 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-green-700 font-medium">
                  🎉 Chúc mừng! Bạn đã đủ điều kiện để yêu cầu tăng lương.
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bonuses and Penalties - NGANG NHAU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bonuses */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Thưởng
            </div>
          }
          className="border-l-4 border-l-green-500"
          extra={
            <Button
              icon={<EyeOutlined />}
              onClick={() => setBonusDetailVisible(true)}
              disabled={bonusDetails.length === 0}
            >
              Chi tiết
            </Button>
          }
        >
          <Statistic
            value={totalBonuses}
            suffix="VNĐ"
            prefix={<TrophyOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
          <p className="text-gray-500 text-sm mt-2">
            Tổng {bonusDetails.length} lần nhận thưởng
          </p>
        </Card>

        {/* Penalties */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Phạt
            </div>
          }
          className="border-l-4 border-l-red-500"
          extra={
            <Button
              icon={<EyeOutlined />}
              onClick={() => setPenaltyDetailVisible(true)}
              disabled={penaltyDetails.length === 0}
            >
              Chi tiết
            </Button>
          }
        >
          <Statistic
            value={totalPenalties}
            suffix="VNĐ"
            prefix={<WarningOutlined />}
            valueStyle={{ color: "#ff4d4f" }}
          />
          <p className="text-gray-500 text-sm mt-2">
            Tổng {penaltyDetails.length} lần bị phạt
          </p>
        </Card>
      </div>

      {/* Salary Request History - XUỐNG DƯỚI */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <RiseOutlined className="text-blue-600" />
            Lịch sử yêu cầu lương
          </div>
        }
        className="border-l-4 border-l-blue-500"
      >
        <Table
          dataSource={salaryRequests}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
          columns={[
            {
              title: "Ngày tạo",
              dataIndex: "created_at",
              key: "created_at",
              width: 110,
              render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
            },
            {
              title: "Loại",
              dataIndex: "type",
              key: "type",
              width: 100,
              render: (type: string) => (
                <Tag color={type === "raise" ? "blue" : "orange"}>
                  {type === "raise" ? "Tăng lương" : "Điều chỉnh"}
                </Tag>
              ),
            },
            {
              title: "Chi tiết",
              key: "details",
              width: 150,
              render: (_: any, record: any) => {
                if (record.type === "raise") {
                  return (
                    <div className="text-sm">
                      <div>HT: {Number(record.current_rate).toLocaleString()}</div>
                      <div className="font-semibold text-green-600">
                        ĐX: {Number(record.proposed_rate).toLocaleString()}
                      </div>
                    </div>
                  );
                }
                return (
                  <span className={record.adjustment_amount >= 0 ? "text-green-600" : "text-red-600"}>
                    {record.adjustment_amount > 0 ? "+" : ""}
                    {Number(record.adjustment_amount).toLocaleString()}
                  </span>
                );
              },
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              width: 100,
              render: (status: string) => {
                const colors: Record<string, string> = {
                  pending: "gold",
                  approved: "green",
                  rejected: "red",
                };
                const texts: Record<string, string> = {
                  pending: "Chờ duyệt",
                  approved: "Đã duyệt",
                  rejected: "Từ chối",
                };
                return <Tag color={colors[status]}>{texts[status]}</Tag>;
              },
            },
            {
              title: "Ghi chú",
              dataIndex: "manager_note",
              key: "manager_note",
              ellipsis: true,
              render: (text: string, record: any) => text || record.note || "-",
            },
            {
              title: "Thao tác",
              key: "actions",
              width: 150,
              fixed: 'right' as const,
              render: (_: any, record: any) => {
                if (isAdminOrManager && record.status === 'pending') {
                  return (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => handleApproveRequest(record.id)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleRejectRequest(record.id)}
                      >
                        Từ chối
                      </Button>
                    </Space>
                  );
                }
                return null;
              }
            }
          ]}
        />
      </Card>
      {/* Shifts Statistics */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Thống kê ca làm
          </div>
        }
        className="border-l-4 border-l-purple-500"
      >
        <div className="space-y-4">
          <Statistic
            title="Tổng số ca đã làm"
            value={assignments.length}
            suffix="ca"
            prefix={<CalendarOutlined />}
            valueStyle={{ color: "#722ed1" }}
          />

          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-3">Theo vị trí</h4>
            <Space direction="vertical" className="w-full">
              {Object.entries(shiftsByPosition).map(([posId, count]) => (
                <div
                  key={posId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span className="text-gray-700">
                    Vị trí {posId === "unknown" ? "Chưa xác định" : posId}
                  </span>
                  <Tag color="purple">{count} ca</Tag>
                </div>
              ))}
              {Object.keys(shiftsByPosition).length === 0 && (
                <div className="text-center text-gray-700 py-4">
                  Chưa có dữ liệu ca làm
                </div>
              )}
            </Space>
          </div>
        </div>
      </Card>

      {/* Bonus Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Chi tiết thưởng
          </div>
        }
        open={bonusDetailVisible}
        onCancel={() => setBonusDetailVisible(false)}
        footer={null}
        width={700}
      >
        <Table
          columns={bonusColumns}
          dataSource={bonusDetails}
          rowKey="month"
          pagination={{ pageSize: 10 }}
          summary={(data) => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong className="text-green-600">
                    +{totalBonuses.toLocaleString()} VNĐ
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>

      {/* Penalty Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Chi tiết phạt
          </div>
        }
        open={penaltyDetailVisible}
        onCancel={() => setPenaltyDetailVisible(false)}
        footer={null}
        width={700}
      >
        <Table
          columns={penaltyColumns}
          dataSource={penaltyDetails}
          rowKey="month"
          pagination={{ pageSize: 10 }}
          summary={(data) => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong className="text-red-600">
                    -{totalPenalties.toLocaleString()} VNĐ
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>

      {/* Salary Request Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RiseOutlined className="text-blue-600" />
            Yêu cầu tăng lương
          </div>
        }
        open={salaryRequestVisible}
        onCancel={() => {
          setSalaryRequestVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmitSalaryRequest}
        confirmLoading={isCreating}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={600}
        okButtonProps={{
          icon: <RiseOutlined />,
          disabled: isCreating,
        }}
      >
        <div className="space-y-4 mt-4">
          {/* Current Info */}
          <Card
            type="inner"
            size="small"
            className="bg-blue-50 border-blue-200"
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Chế độ lương hiện tại:</span>
                <Tag color="blue">{currentScheme.name}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Mức lương hiện tại:</span>
                <strong className="text-blue-600">
                  {currentSalary.toLocaleString()} VNĐ/
                  {getPayTypeLabel(currentScheme.pay_type)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Số giờ đã làm:</span>
                <strong>{totalHoursWorked.toFixed(1)} giờ</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tiến độ:</span>
                <Tag color={progressPercent >= 100 ? "success" : "warning"}>
                  {progressPercent.toFixed(1)}%
                </Tag>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
          >
            {availableSchemesForRaise.length > 0 ? (
              <Form.Item
                label="Chế độ lương đề xuất"
                name="proposed_scheme_id"
                rules={[
                  { required: true, message: "Vui lòng chọn chế độ lương mong muốn!" },
                ]}
                tooltip="Chọn mức lương bạn mong muốn được xét duyệt"
              >
                <Select
                  size="large"
                  placeholder="Chọn chế độ lương"
                  showSearch
                  optionFilterProp="children"
                >
                  {availableSchemesForRaise.map((scheme: any) => {
                    const schemeRate = Number(scheme.rate) || 0;
                    const diff = schemeRate - currentSalary;
                    const diffPercent = currentSalary > 0 ? (diff / currentSalary * 100) : 0;
                    const isRaise = diff > 0;
                    
                    return (
                      <Select.Option key={scheme.id} value={scheme.id}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{scheme.name}</span>
                          <span className={`ml-2 ${isRaise ? 'text-green-600' : 'text-orange-500'}`}>
                            {schemeRate.toLocaleString()} VNĐ
                            <span className={`text-xs ml-1 ${isRaise ? 'text-green-500' : 'text-orange-400'}`}>
                              ({isRaise ? '+' : ''}{diffPercent.toFixed(0)}%)
                            </span>
                          </span>
                        </div>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                label="Mức lương đề xuất (VNĐ)"
                name="proposed_rate"
                rules={[
                  { required: true, message: "Vui lòng nhập mức lương mong muốn!" },
                ]}
                tooltip="Nhập mức lương bạn mong muốn được xét duyệt"
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    size="large"
                    type="number"
                    min={currentSalary}
                    placeholder={`Ví dụ: ${(currentSalary * 1.1).toLocaleString()}`}
                  />
                  <Button size="large" disabled>VNĐ</Button>
                </Space.Compact>
              </Form.Item>
            )}

            <Form.Item
              label="Lý do yêu cầu"
              name="note"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập lý do yêu cầu tăng lương!",
                },
              ]}
              tooltip="Nêu rõ lý do và thành tích để được xem xét"
            >
              <Input.TextArea
                rows={6}
                placeholder="Ví dụ: Tôi đã làm việc chăm chỉ và đạt được các thành tích sau:&#10;- Hoàn thành xuất sắc KPI trong 6 tháng qua&#10;- Hỗ trợ đào tạo nhân viên mới&#10;- Không vi phạm quy định công ty&#10;..."
                showCount
              />
            </Form.Item>
          </Form>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              💡 <strong>Lưu ý:</strong> Yêu cầu sẽ được gửi đến quản lý để xem
              xét. Thời gian phê duyệt thường là 3-7 ngày làm việc.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
