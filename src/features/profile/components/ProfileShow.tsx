"use client";

import { useShow, useGetIdentity } from "@refinedev/core";
import { Employee } from "@/types/employee";
import { Button, Avatar, Tag, Tabs, Card, Space } from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined,
} from "@ant-design/icons";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  FileText, 
  UserCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { ProfileContractList } from "./ProfileContractList";
import { WorkHistoryTab } from "./WorkHistoryTab";
import { TrendingUp } from "lucide-react";

export const ProfileShow = () => {
  const router = useRouter();
  
  // Get current user's identity to retrieve employee_id
  const { data: identity } = useGetIdentity<{ employee_id: string }>();
  const employeeId = identity?.employee_id || "1"; // Fallback to "1" for demo

  const { query } = useShow<Employee>({
    resource: "employees",
    id: employeeId,
    queryOptions: {
      enabled: true, // Always enabled for demo
    },
  });

  const { data: employee, isLoading } = query;

  const getStatusColor = (status: string) => {
    const colors = {
      active: "success",
      on_leave: "warning",
      terminated: "default",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: "Đang làm việc",
      on_leave: "Nghỉ phép",
      terminated: "Đã nghỉ việc",
    };
    return texts[status as keyof typeof texts] || "Không xác định";
  };

  // Mock data for demo if no data available
  const employeeData = employee?.data || {
    id: "1",
    employee_code: "EMP001",
    first_name: "Nguyễn",
    last_name: "An",
    full_name: "Nguyễn Văn An",
    email: "nguyen.van.an@company.com",
    phone: "0912345678",
    gender: "male",
    dob: "1990-01-15",
    personal_id: "001234567890",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    hire_date: "2020-01-01",
    status: "active",
    default_work_hours_per_week: 40,
    photo_url: "",
    emergency_contact_name: "Nguyễn Văn B",
    emergency_contact_phone: "0987654321",
    notes: "Nhân viên xuất sắc",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="mb-4"
          >
            Quay lại
          </Button>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <Avatar 
                src={employeeData.photo_url} 
                size={100} 
                className="mx-auto mb-4"
              >
                {employeeData.first_name?.[0]}
              </Avatar>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {employeeData.full_name || `${employeeData.first_name} ${employeeData.last_name}`}
              </h2>
              
              <p className="text-gray-500 mb-3">{employeeData.employee_code}</p>
              
              <Tag color={getStatusColor(employeeData.status)} className="mb-4">
                {getStatusText(employeeData.status)}
              </Tag>

              <div className="space-y-3 text-left mt-6">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{employeeData.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Số điện thoại</p>
                    <p className="text-sm font-medium">
                      {employeeData.phone ? formatPhoneNumber(employeeData.phone) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Ngày sinh</p>
                    <p className="text-sm font-medium">
                      {employeeData.dob ? formatDate(employeeData.dob) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Ngày vào làm</p>
                    <p className="text-sm font-medium">
                      {employeeData.hire_date ? formatDate(employeeData.hire_date) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Địa chỉ</p>
                    <p className="text-sm font-medium">{employeeData.address || "-"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <Card>
              <Tabs
                defaultActiveKey="info"
                items={[
                  {
                    key: "info",
                    label: (
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Thông tin cá nhân
                      </span>
                    ),
                    children: (
                      <div>
                        {/* Action Buttons */}
                        <div className="mb-6 flex gap-3">
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => router.push(`/profile/edit`)}
                          >
                            Chỉnh sửa
                          </Button>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Personal Info */}
                          <Card type="inner" title="Thông tin cá nhân" size="small">
                            <Space direction="vertical" className="w-full" size="middle">
                              <div>
                                <p className="text-gray-500 text-sm">Họ và tên đầy đủ</p>
                                <p className="font-medium">
                                  {employeeData.full_name || `${employeeData.first_name} ${employeeData.last_name}`}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Giới tính</p>
                                <p className="font-medium">
                                  {employeeData.gender === 'male' ? 'Nam' : 
                                   employeeData.gender === 'female' ? 'Nữ' : 'Khác'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Ngày sinh</p>
                                <p className="font-medium">
                                  {employeeData.dob ? formatDate(employeeData.dob) : "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">CMND/CCCD</p>
                                <p className="font-medium">{employeeData.personal_id || "-"}</p>
                              </div>
                            </Space>
                          </Card>

                          {/* Contact Info */}
                          <Card type="inner" title="Thông tin liên hệ" size="small">
                            <Space direction="vertical" className="w-full" size="middle">
                              <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className="font-medium">{employeeData.email || "-"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Số điện thoại</p>
                                <p className="font-medium">
                                  {employeeData.phone ? formatPhoneNumber(employeeData.phone) : "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Địa chỉ</p>
                                <p className="font-medium">{employeeData.address || "-"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Liên hệ khẩn cấp</p>
                                <p className="font-medium">
                                  {employeeData.emergency_contact_phone ? 
                                    formatPhoneNumber(employeeData.emergency_contact_phone) : "-"}
                                </p>
                              </div>
                            </Space>
                          </Card>

                          {/* Work Info */}
                          <Card type="inner" title="Thông tin công việc" size="small">
                            <Space direction="vertical" className="w-full" size="middle">
                              <div>
                                <p className="text-gray-500 text-sm">Mã nhân viên</p>
                                <p className="font-medium">{employeeData.employee_code}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Ngày vào làm</p>
                                <p className="font-medium">
                                  {employeeData.hire_date ? formatDate(employeeData.hire_date) : "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Trạng thái</p>
                                <Tag color={getStatusColor(employeeData.status)}>
                                  {getStatusText(employeeData.status)}
                                </Tag>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Giờ làm/tuần</p>
                                <p className="font-medium">
                                  {employeeData.default_work_hours_per_week || 40} giờ
                                </p>
                              </div>
                            </Space>
                          </Card>

                          {/* Notes */}
                          <Card type="inner" title="Ghi chú" size="small">
                            <p className="text-gray-600">
                              {employeeData.notes || "Không có ghi chú"}
                            </p>
                          </Card>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "contracts",
                    label: (
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Hợp đồng
                      </span>
                    ),
                    children: <ProfileContractList employeeId={employeeId} />,
                  },
                  {
                    key: "work_history",
                    label: (
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Quá trình làm việc
                      </span>
                    ),
                    children: <WorkHistoryTab employeeId={employeeId} />,
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
