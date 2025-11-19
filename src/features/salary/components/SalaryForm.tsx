"use client";

import { useForm } from "@refinedev/antd";
import { useRouter, useParams } from "next/navigation";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  App,
  Divider,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";
import { MonthlyPayroll } from "@/types/payroll";
import { useSelect } from "@refinedev/antd";
import { Employee } from "@/types/employee";

interface SalaryFormProps {
  action: "create" | "edit";
}

export const SalaryForm = ({ action }: SalaryFormProps) => {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { formProps, saveButtonProps, onFinish } = useForm<MonthlyPayroll>({
    action,
    resource: "monthly-payrolls",
    id: action === "edit" ? id : undefined,
    redirect: false,
    onMutationSuccess: () => {
      message.success(
        action === "create"
          ? "Tạo bảng lương thành công"
          : "Cập nhật bảng lương thành công"
      );
      setTimeout(() => {
        router.push("/salary");
      }, 500);
    },
  });

  const { selectProps: employeeSelectProps } = useSelect<Employee>({
    resource: "employees",
    optionLabel: (item) =>
      `${item.first_name} ${item.last_name} - ${item.employee_code}`,
    optionValue: "id",
  });

  // Generate months for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    return {
      label: date.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      }),
      value: monthStr,
    };
  });

  const statusOptions = [
    { label: "Nháp", value: "draft" },
    { label: "Chờ duyệt", value: "pending_approval" },
    { label: "Đã duyệt", value: "approved" },
    { label: "Đã thanh toán", value: "paid" },
  ];

  const handleCancel = () => {
    router.push("/salary");
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card
        title={
          <div className="flex items-center gap-2">
            <DollarOutlined />
            <span className="text-lg md:text-xl font-semibold">
              {action === "create" ? "Tạo bảng lương mới" : "Chỉnh sửa bảng lương"}
            </span>
          </div>
        }
        className="shadow-sm border border-gray-200"
      >
        <Form
          {...formProps}
          layout="vertical"
          onFinish={(values: any) => {
            // Convert all string values to numbers
            const base_salary = Number(values.base_salary) || 0;
            const allowances = Number(values.allowances) || 0;
            const bonuses = Number(values.bonuses) || 0;
            const overtime_pay = Number(values.overtime_pay) || 0;
            const deductions = Number(values.deductions) || 0;
            const penalties = Number(values.penalties) || 0;

            const gross_salary = base_salary + allowances + bonuses + overtime_pay;
            const net_salary = gross_salary - deductions - penalties;

            onFinish({
              ...values,
              base_salary,
              allowances,
              bonuses,
              overtime_pay,
              deductions,
              penalties,
              gross_salary,
              net_salary,
            });
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Nhân viên"
              name="employee_id"
              rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
            >
              <Select
                {...employeeSelectProps}
                placeholder="Chọn nhân viên"
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                disabled={action === "edit"}
              />
            </Form.Item>

            <Form.Item
              label="Tháng"
              name="month"
              rules={[{ required: true, message: "Vui lòng chọn tháng" }]}
            >
              <Select
                options={monthOptions}
                placeholder="Chọn tháng"
                disabled={action === "edit"}
              />
            </Form.Item>
          </div>

          <Divider orientation="left">Thông tin lương</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Lương cơ bản"
              name="base_salary"
              rules={[
                { required: true, message: "Vui lòng nhập lương cơ bản" },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập lương cơ bản"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>

            <Form.Item label="Phụ cấp" name="allowances">
              <InputNumber
                className="w-full"
                placeholder="Nhập phụ cấp"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>

            <Form.Item label="Thưởng" name="bonuses">
              <InputNumber
                className="w-full"
                placeholder="Nhập thưởng"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>

            <Form.Item label="Lương làm thêm" name="overtime_pay">
              <InputNumber
                className="w-full"
                placeholder="Nhập lương làm thêm"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>

            <Form.Item label="Khấu trừ" name="deductions">
              <InputNumber
                className="w-full"
                placeholder="Nhập khấu trừ"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>

            <Form.Item label="Phạt" name="penalties">
              <InputNumber
                className="w-full"
                placeholder="Nhập phạt"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                addonAfter="VNĐ"
                min={0}
              />
            </Form.Item>
          </div>

          <Divider orientation="left">Trạng thái và ghi chú</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              initialValue="draft"
            >
              <Select options={statusOptions} placeholder="Chọn trạng thái" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea
                rows={4}
                placeholder="Nhập ghi chú (tùy chọn)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>

          <Divider />

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                {...saveButtonProps}
              >
                {action === "create" ? "Tạo mới" : "Lưu thay đổi"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
