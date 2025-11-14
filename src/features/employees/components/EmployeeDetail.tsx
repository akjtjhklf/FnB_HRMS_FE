"use client";

import { Employee } from "@/types/employee";
import { Card, Row, Col, Descriptions, Avatar, Tag } from "antd";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeeDetailProps {
  employee: Employee;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee }) => {
  const getStatusTag = (status?: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">Đang làm việc</Tag>;
      case "on_leave":
        return <Tag color="warning">Nghỉ phép</Tag>;
      case "inactive":
        return <Tag color="default">Không hoạt động</Tag>;
      case "terminated":
        return <Tag color="error">Đã nghỉ việc</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="flex items-start gap-6">
          <Avatar
            src={employee.avatar}
            size={120}
            className="bg-blue-500"
            icon={<User />}
          >
            {employee.first_name?.[0]}
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {employee.first_name} {employee.last_name}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>
                  {typeof employee.position_id === "object"
                    ? employee.position_id.name
                    : "Chưa có chức vụ"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span className="font-mono">{employee.employee_code}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                {getStatusTag(employee.employment_status)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card title="Thông tin cá nhân" className="border border-gray-200 shadow-sm">
        <Descriptions column={2} bordered>
          <Descriptions.Item label={<><User className="w-4 h-4 inline mr-2" />Họ</>}>
            {employee.first_name}
          </Descriptions.Item>
          <Descriptions.Item label={<><User className="w-4 h-4 inline mr-2" />Tên</>}>
            {employee.last_name}
          </Descriptions.Item>
          <Descriptions.Item label={<><Mail className="w-4 h-4 inline mr-2" />Email</>}>
            {employee.email}
          </Descriptions.Item>
          <Descriptions.Item label={<><Phone className="w-4 h-4 inline mr-2" />Số điện thoại</>}>
            {employee.phone || "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label={<><Calendar className="w-4 h-4 inline mr-2" />Ngày sinh</>}>
            {employee.date_of_birth ? formatDate(employee.date_of_birth) : "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label={<><User className="w-4 h-4 inline mr-2" />Giới tính</>}>
            {getGenderText(employee.gender)}
          </Descriptions.Item>
          <Descriptions.Item label={<><MapPin className="w-4 h-4 inline mr-2" />Địa chỉ</>} span={2}>
            {employee.address || "Chưa có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Employment Information */}
      <Card title="Thông tin công việc" className="border border-gray-200 shadow-sm">
        <Descriptions column={2} bordered>
          <Descriptions.Item label={<><CreditCard className="w-4 h-4 inline mr-2" />Mã nhân viên</>}>
            <span className="font-mono font-medium">{employee.employee_code}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<><Briefcase className="w-4 h-4 inline mr-2" />Chức vụ</>}>
            {typeof employee.position_id === "object"
              ? employee.position_id.name
              : "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label={<><Calendar className="w-4 h-4 inline mr-2" />Ngày vào làm</>}>
            {employee.hire_date ? formatDate(employee.hire_date) : "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserCheck className="w-4 h-4 inline mr-2" />Trạng thái</>}>
            {getStatusTag(employee.employment_status)}
          </Descriptions.Item>
          <Descriptions.Item label={<><CreditCard className="w-4 h-4 inline mr-2" />Mã thẻ RFID</>} span={2}>
            {employee.rfid_card_id ? (
              <span className="font-mono">{employee.rfid_card_id}</span>
            ) : (
              "Chưa có"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* System Information */}
      <Card title="Thông tin hệ thống" className="border border-gray-200 shadow-sm">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Ngày tạo">
            {employee.created_at ? formatDate(employee.created_at) : "Không rõ"}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {employee.updated_at ? formatDate(employee.updated_at) : "Không rõ"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};
