"use client";

import { useForm, useSelect } from "@refinedev/antd";
import { useDelete, HttpError } from "@refinedev/core";
import { Employee } from "@/types/employee";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Upload,
  Avatar,
  Card,
  Divider,
  Space,
  Button as AntButton,
  InputNumber,
  Tooltip,
  App,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useConfirmModalStore } from "@/store/confirmModalStore";

interface EmployeeFormComponentProps {
  action: "create" | "edit";
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormComponentProps> = ({
  action,
  id,
  onSuccess,
  onCancel,
}) => {
  const { message } = App.useApp();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);

  const { formProps, saveButtonProps, query, onFinish, form } = useForm<Employee>({
    action,
    resource: "employees",
    id,
    redirect: false,
    onMutationSuccess: () => {
      if (action === "create") {
        message.success("✅ Thêm nhân viên thành công!");
      } else {
        message.success("✅ Cập nhật nhân viên thành công!");
      }
      onSuccess?.();
    },
    onMutationError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Có lỗi xảy ra!";
      message.error(`❌ ${errorMsg}`);
    },
    mutationMode: "pessimistic",
  });

  const { mutate: deleteEmployee } = useDelete();

  // Use useSelect for positions dropdown with search and pagination
  const { selectProps: positionSelectProps } = useSelect({
    resource: "positions",
    optionLabel: "name",
    optionValue: "id",
    debounce: 300,
    onSearch: (value) => [
      {
        field: "name",
        operator: "contains",
        value,
      },
    ],
  });

  // Handle form values transformation
  const handleFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
      hire_date: values.hire_date
        ? dayjs(values.hire_date).format("YYYY-MM-DD")
        : null,
      termination_date: values.termination_date
        ? dayjs(values.termination_date).format("YYYY-MM-DD")
        : null,
      photo_url: avatarUrl || values.photo_url,
    };

    // If creating new employee and account credentials provided
    if (action === "create" && values.create_account) {
      try {
        // First create employee
        await onFinish(formattedValues);

        // Then create user account (this would be handled by backend)
        // The backend should create the user when employee is created with username/password
        message.info("Tài khoản đăng nhập đã được tạo cho nhân viên");
      } catch (error) {
        console.error("Error creating employee with account:", error);
      }
    } else {
      onFinish(formattedValues);
    }
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === "done" || info.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      if (info.file.originFileObj) {
        reader.readAsDataURL(info.file.originFileObj);
      }
    }
  };

  const handleDelete = () => {
    openConfirm({
      title: "⚠️ Xác nhận xóa nhân viên",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa nhân viên <strong>{employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}</strong> không?
          </p>
          <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        if (id) {
          await deleteEmployee({
            resource: "employees",
            id: id as string,
          });
          message.success("✅ Xóa nhân viên thành công!");
          setTimeout(() => {
            onSuccess?.();
          }, 500);
        }
      },
    });
  };

  const employee = query?.data?.data;

  // Transform date fields for edit mode
  React.useEffect(() => {
    if (action === "edit" && employee && form) {
      form.setFieldsValue({
        ...employee,
        dob: employee.dob ? dayjs(employee.dob) : undefined,
        hire_date: employee.hire_date ? dayjs(employee.hire_date) : undefined,
        termination_date: employee.termination_date
          ? dayjs(employee.termination_date)
          : undefined,
      });
    }
  }, [employee, form, action]);

  return (
    <Form
      {...formProps}
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        status: "active",
        gender: "male",
      }}
      size="large"
      className="max-w-5xl mx-auto"
    >
      {/* Avatar Section */}
      <Card className="mb-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="py-6">
          <Upload
            name="avatar"
            showUploadList={false}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            accept="image/*"
          >
            <div className="cursor-pointer inline-block">
              <Avatar
                size={120}
                src={avatarUrl || employee?.photo_url}
                icon={<UserOutlined />}
                className="border-4 border-white shadow-lg"
              />
              <div className="mt-3 text-blue-600 font-medium flex items-center justify-center gap-2">
                <UploadOutlined />
                {avatarUrl || employee?.photo_url
                  ? "Thay đổi ảnh"
                  : "Tải ảnh lên"}
              </div>
            </div>
          </Upload>
        </div>
      </Card>

      {/* Basic Information */}
      <Card title="📋 Thông tin cơ bản" className="mb-6">
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Mã nhân viên"
              name="employee_code"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhân viên!" },
                { min: 3, message: "Mã nhân viên phải có ít nhất 3 ký tự!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-700" />}
                placeholder="VD: EMP001"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Thư điện tử"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-700" />}
                placeholder="employee@company.com"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ"
              name="first_name"
              rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
            >
              <Input placeholder="Nguyễn Văn" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tên"
              name="last_name"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input placeholder="An" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Họ và tên đầy đủ"
          name="full_name"
          extra="Nếu để trống, hệ thống sẽ tự động tạo từ Họ và Tên"
        >
          <Input placeholder="Nguyễn Văn An" />
        </Form.Item>

        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-700" />}
                placeholder="0912345678"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Giới tính" name="gender">
              <Select
                placeholder="Chọn giới tính"
                options={[
                  { label: "Nam", value: "male" },
                  { label: "Nữ", value: "female" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="CMND/CCCD" name="personal_id">
              <Input placeholder="001234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Địa chỉ" name="address">
          <Input.TextArea
            placeholder="Nhập địa chỉ đầy đủ"
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Card>

      {/* Work Information */}
      <Card title="💼 Thông tin công việc" className="mb-6">
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày vào làm" name="hire_date">
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày vào làm"
              />
            </Form.Item>
          </Col>
          {/* <Col xs={24} md={12}>
            <Form.Item label="Ngày nghỉ việc" name="termination_date">
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày nghỉ việc (nếu có)"
              />
            </Form.Item>
          </Col> */}
        </Row>

        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select
                placeholder="Chọn trạng thái"
                options={[
                  { label: "🟢 Đang làm việc", value: "active" },
                  { label: "🟡 Nghỉ phép", value: "on_leave" },
                  { label: "🔴 Tạm ngưng", value: "suspended" },
                  { label: "⚫ Đã nghỉ việc", value: "terminated" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Chế độ lương"
              name="scheme_id"
              tooltip="Chọn chế độ lương áp dụng cho nhân viên"
            >
              <Select
                placeholder="Chọn chế độ lương"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(String(input).toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Giờ làm mặc định/tuần"
              name="default_work_hours_per_week"
              tooltip="Số giờ làm việc tiêu chuẩn mỗi tuần"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={168}
                placeholder="40"
                addonAfter="giờ"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Giờ làm tối đa/tuần"
              name="max_hours_per_week"
              tooltip="Số giờ làm việc tối đa được phép"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={168}
                placeholder="48"
                addonAfter="giờ"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Số ngày liên tiếp tối đa"
              name="max_consecutive_days"
              tooltip="Số ngày làm việc liên tiếp tối đa"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={30}
                placeholder="7"
                addonAfter="ngày"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Thời gian nghỉ tối thiểu giữa các ca"
          name="min_rest_hours_between_shifts"
          tooltip="Số giờ nghỉ ngơi tối thiểu giữa 2 ca làm việc"
        >
          <InputNumber
            className="w-full"
            min={0}
            max={48}
            placeholder="8"
            addonAfter="giờ"
            style={{ maxWidth: 300 }}
          />
        </Form.Item>
      </Card>

      {/* Emergency Contact */}
      <Card title="🚨 Liên hệ khẩn cấp" className="mb-6">
        <Row gutter={[24, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Tên người liên hệ" name="emergency_contact_name">
              <Input placeholder="Nguyễn Văn B" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="emergency_contact_phone"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-700" />}
                placeholder="0987654321"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Additional Notes */}
      <Card title="📝 Ghi chú" className="mb-6">
        <Form.Item
          name="notes"
          extra="Ghi chú thêm về nhân viên (không bắt buộc)"
        >
          <Input.TextArea
            placeholder="Nhập ghi chú..."
            rows={4}
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Card>

      {/* Account Creation Section - Only for new employees */}
      {action === "create" && (
        <Card title="🔐 Tạo tài khoản đăng nhập" className="mb-6 border-l-4 border-l-green-500">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Tạo tài khoản để nhân viên có thể đăng nhập vào hệ thống.
              Nếu không tạo, nhân viên sẽ không thể truy cập hệ thống.
            </p>
          </div>

          <Form.Item
            name="create_account"
            valuePropName="checked"
            initialValue={true}
          >
            <Space direction="vertical" className="w-full">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={(e) => {
                    form.setFieldValue("create_account", e.target.checked);
                  }}
                  defaultChecked
                />
                <span className="font-medium">Tạo tài khoản đăng nhập cho nhân viên</span>
              </label>
            </Space>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, current) => prev.create_account !== current.create_account}>
            {({ getFieldValue }) =>
              getFieldValue("create_account") ? (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[
                          { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                          { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự!" },
                          {
                            pattern: /^[a-zA-Z0-9_]+$/,
                            message: "Chỉ được dùng chữ, số và gạch dưới!",
                          },
                        ]}
                        tooltip="Tên đăng nhập để nhân viên truy cập hệ thống"
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-700" />}
                          placeholder="vd: nguyenvana"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                          { required: true, message: "Vui lòng nhập mật khẩu!" },
                          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                        ]}
                        tooltip="Mật khẩu mặc định cho nhân viên"
                      >
                        <Input.Password
                          placeholder="Nhập mật khẩu"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu tiên để bảo mật.
                    </p>
                  </div>
                </div>
              ) : null
            }
          </Form.Item>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="sticky bottom-4 shadow-lg border-t-4 border-blue-500">
        <div className="flex justify-between items-center">
          {action === "edit" && (
            <Tooltip title="Xóa nhân viên này">
              <AntButton
                danger
                size="large"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Xóa
              </AntButton>
            </Tooltip>
          )}
          <div className="flex gap-3 ml-auto">
            <AntButton size="large" icon={<CloseOutlined />} onClick={onCancel}>
              Hủy
            </AntButton>
            <AntButton
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              {...saveButtonProps}
            >
              {action === "create" ? "Thêm nhân viên" : "Cập nhật"}
            </AntButton>
          </div>
        </div>
      </Card>
    </Form>
  );
};
