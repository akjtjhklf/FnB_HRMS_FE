"use client";

import { Contract } from "@/types/employee";
import { useList, useDelete, useCreate, useUpdate } from "@refinedev/core";
import { useSelect } from "@refinedev/antd";
import {
  Card,
  Table,
  Button as AntButton,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  App,
} from "antd";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { useConfirmModalStore } from "@/store/confirmModalStore";

interface ContractListProps {
  employeeId: string;
}

interface ContractFormProps {
  employeeId: string;
  initialValues: Contract | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  employeeId,
  initialValues,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { mutate: createContract } = useCreate();
  const { mutate: updateContract } = useUpdate();

  // Watch salary_scheme_id to disable salary input
  const selectedSchemeId = Form.useWatch("salary_scheme_id", form);

  const { selectProps: salarySchemeSelectProps, query: salarySchemeQuery } =
    useSelect({
      resource: "salary-schemes",
      optionLabel: "name",
      optionValue: "id",
      defaultValue:
        typeof initialValues?.salary_scheme_id === "object"
          ? (initialValues.salary_scheme_id as any)?.id
          : initialValues?.salary_scheme_id || undefined,
      pagination: {
        mode: "off",
      },
      filters: [
        {
          field: "is_active",
          operator: "eq",
          value: true,
        },
      ],
    });

  const salarySchemes = salarySchemeQuery.data?.data || [];

  const handleSchemeChange = (value: unknown) => {
    const scheme = salarySchemes.find((s) => s.id === value);
    if (scheme) {
      // Use setTimeout to avoid circular reference warning
      setTimeout(() => {
        form.setFieldValue("salary", (scheme as any).rate);
      }, 0);
    }
  };

  const handleSubmit = async (values: any) => {
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("1. Raw form values:", values);
    console.log("2. salary_scheme_id từ form:", values.salary_scheme_id);

    const contractData = {
      employee_id: employeeId,
      contract_type: values.contract_type,
      start_date: values.start_date?.toDate(),
      end_date: values.end_date?.toDate(),
      base_salary: values.salary ? Number(values.salary) : null,
      salary_scheme_id: values.salary_scheme_id && typeof values.salary_scheme_id === 'object'
        ? (values.salary_scheme_id as any).id
        : values.salary_scheme_id,
      terms: values.terms,
      is_active: !!values.is_active,
    };
    console.log("3. Contract data sẽ gửi lên BE:", contractData);
    console.log("========================");

    if (initialValues) {
      updateContract(
        {
          resource: "contracts",
          id: initialValues.id,
          values: contractData,
        },
        {
          onSuccess: () => {
            message.success("Cập nhật hợp đồng thành công!");
            onSuccess();
          },
          onError: (error: any) => {
            message.error(
              error?.message || "Có lỗi xảy ra khi cập nhật hợp đồng!"
            );
          },
        }
      );
    } else {
      createContract(
        {
          resource: "contracts",
          values: contractData,
        },
        {
          onSuccess: () => {
            message.success("Thêm hợp đồng thành công!");
            onSuccess();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi thêm hợp đồng!");
          },
        }
      );
    }
  };

  // Initialize form values
  // We use initialValues prop to set form values on mount
  // This is better than useEffect for AntD forms in modals if we remount
  const getInitialValues = () => {
    if (initialValues) {
      const salarySchemeId =
        typeof initialValues.salary_scheme_id === "object"
          ? (initialValues.salary_scheme_id as any)?.id
          : initialValues.salary_scheme_id;

      return {
        ...initialValues,
        salary_scheme_id: salarySchemeId,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date)
          : undefined,
        end_date: initialValues.end_date
          ? dayjs(initialValues.end_date)
          : undefined,
        is_active: !!initialValues.is_active,
        salary: initialValues.base_salary, // Map base_salary to salary field
      };
    }
    return {
      employee_id: employeeId,
      is_active: true,
      contract_type: "full_time",
    };
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={getInitialValues()}
      className="mt-4"
      onValuesChange={(changedValues) => {
        if (changedValues.salary_scheme_id) {
          handleSchemeChange(changedValues.salary_scheme_id);
        }
      }}
    >
      <Form.Item
        label="Loại hợp đồng"
        name="contract_type"
        rules={[{ required: true, message: "Vui lòng chọn loại hợp đồng!" }]}
      >
        <Select
          size="large"
          options={[
            { label: "Toàn thời gian", value: "full_time" },
            { label: "Bán thời gian", value: "part_time" },
            { label: "Hợp đồng", value: "contract" },
            { label: "Thực tập", value: "internship" },
          ]}
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label="Ngày bắt đầu"
          name="start_date"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
        >
          <DatePicker
            size="large"
            className="w-full"
            format="DD/MM/YYYY"
            placeholder="Chọn ngày bắt đầu"
          />
        </Form.Item>

        <Form.Item label="Ngày kết thúc" name="end_date">
          <DatePicker
            size="large"
            className="w-full"
            format="DD/MM/YYYY"
            placeholder="Chọn ngày kết thúc (nếu có)"
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Chế độ lương"
        name="salary_scheme_id"
        rules={[{ required: true, message: "Vui lòng chọn chế độ lương!" }]}
      >
        <Select
          options={salarySchemeSelectProps.options}
          loading={salarySchemeSelectProps.loading}
          size="large"
          placeholder="Chọn chế độ lương"
        />
      </Form.Item>

      <Form.Item
        label="Mức lương (VNĐ) - Tự động điền từ chế độ lương"
        name="salary"
        help="Có thể chỉnh sửa nếu muốn ghi đè mức lương chuẩn"
      >
        <InputNumber
          size="large"
          className="w-full"
          min={0}
          disabled={!!selectedSchemeId}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          placeholder="Nhập mức lương (để trống sẽ dùng theo chế độ)"
        />
      </Form.Item>

      <Form.Item label="Điều khoản" name="terms">
        <Input.TextArea
          rows={4}
          placeholder="Nhập các điều khoản hợp đồng (nếu có)"
          size="large"
        />
      </Form.Item>

      <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
        <Switch
          checkedChildren="Đang hoạt động"
          unCheckedChildren="Ngừng hoạt động"
        />
      </Form.Item>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <AntButton size="large" onClick={onCancel}>
          Hủy
        </AntButton>
        <AntButton type="primary" size="large" htmlType="submit">
          {initialValues ? "Cập nhật" : "Thêm hợp đồng"}
        </AntButton>
      </div>
    </Form>
  );
};

export const ContractList: React.FC<ContractListProps> = ({ employeeId }) => {
  const { message } = App.useApp();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const { query } = useList<Contract>({
    resource: "contracts",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
    ],
  });

  const { data, isLoading } = query;
  const { mutate: deleteContract } = useDelete();

  const contracts = data?.data || [];

  // ... (keep helper functions like getContractTypeText, getContractStatusTag)
  const getContractTypeText = (type: string) => {
    switch (type) {
      case "full_time":
        return "Toàn thời gian";
      case "part_time":
        return "Bán thời gian";
      case "contract":
        return "Hợp đồng";
      case "internship":
        return "Thực tập";
      default:
        return type;
    }
  };

  const getContractStatusTag = (contract: Contract) => {
    if (!contract.is_active) {
      return <Tag color="error">Đã chấm dứt</Tag>;
    }

    if (
      contract.end_date &&
      dayjs(contract.end_date).isBefore(dayjs(), "day")
    ) {
      return <Tag color="default">Đã hết hạn</Tag>;
    }

    return <Tag color="success">Đang hoạt động</Tag>;
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Xác nhận xóa hợp đồng",
      content: "Bạn có chắc chắn muốn xóa hợp đồng này?",
      okText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        await new Promise((resolve, reject) => {
          deleteContract(
            {
              resource: "contracts",
              id,
            },
            {
              onSuccess: () => {
                message.success("Xóa hợp đồng thành công!");
                resolve(true);
              },
              onError: (error: any) => {
                message.error(
                  error?.message || "Có lỗi xảy ra khi xóa hợp đồng!"
                );
                reject(error);
              },
            }
          );
        });
      },
    });
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  // We need to fetch salary schemes here ONLY for the table display if we want to show names
  // But the table display logic in the original code was using the SAME query as the form
  // which is inefficient if we just want names.
  // For now, let's keep the table display simple or use a separate hook if needed.
  // The original code used `salarySchemes` from the form's hook to display names in the table.
  // Since we moved the hook to the form, the table won't have access to `salarySchemes`.
  // We can either:
  // 1. Duplicate the hook in ContractList (for table display).
  // 2. Just show ID in table for now (or fetch properly).
  // Let's duplicate the hook for now to maintain existing behavior of showing names.

  const { query: salarySchemeQuery } = useSelect({
    resource: "salary-schemes",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      mode: "off", // Fetch all for table lookup if possible, or just default page
    },
  });
  const salarySchemes = salarySchemeQuery.data?.data || [];

  const columns = [
    {
      title: "Loại hợp đồng",
      dataIndex: "contract_type",
      key: "contract_type",
      fixed: "left" as const,
      width: 150,
      render: (type: string) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{getContractTypeText(type)}</span>
        </div>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      width: 130,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-700" />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      width: 130,
      responsive: ["md"] as ("md")[],
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-700" />
          {date ? formatDate(date) : "Không có"}
        </div>
      ),
    },
    {
      title: "Chế độ lương",
      dataIndex: "salary_scheme_id",
      key: "salary_scheme_id",
      width: 150,
      responsive: ["lg"] as ("lg")[],
      render: (value: string | { id: string; name?: string } | null) => {
        // Handle case when Directus populates the relation as object
        if (value && typeof value === "object") {
          return <Tag color="blue">{value.name || value.id}</Tag>;
        }
        // Handle case when it's just a string ID
        const scheme = salarySchemes.find((s) => s.id === value);
        return scheme ? (
          <Tag color="blue">{scheme.name}</Tag>
        ) : value ? (
          <Tag>{value}</Tag>
        ) : (
          <span className="text-gray-700">--</span>
        );
      },
    },
    {
      title: "Lương",
      dataIndex: "base_salary",
      key: "base_salary",
      width: 140,
      responsive: ["sm"] as ("sm")[],
      render: (base_salary: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">
            {base_salary
              ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(base_salary)
              : "Theo chế độ"}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_: any, record: Contract) => getContractStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: Contract) => (
        <div className="flex justify-end gap-1">
          <AntButton
            type="link"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
            title="Sửa"
          />
          <AntButton
            type="link"
            danger
            size="small"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record.id)}
            title="Xóa"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="border border-gray-200 shadow-sm"
        extra={
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Thêm hợp đồng
          </Button>
        }
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Danh sách hợp đồng
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 800 }}
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
            responsive: true,
          }}
          locale={{
            emptyText: (
              <div className="py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có hợp đồng nào</p>
                <Button
                  onClick={handleAdd}
                  className="mt-4 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Thêm hợp đồng đầu tiên
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {editingContract ? "Chỉnh sửa hợp đồng" : "Thêm hợp đồng mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingContract(null);
        }}
        footer={null}
        width={700}
        destroyOnHidden // Important to reset form state
      >
        {isModalOpen && (
          <ContractForm
            employeeId={employeeId}
            initialValues={editingContract}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingContract(null);
            }}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingContract(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
