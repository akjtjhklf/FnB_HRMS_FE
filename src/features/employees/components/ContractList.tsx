"use client";

import { Contract } from "@/types/employee";
import { useList, useDelete, useCreate, useUpdate } from "@refinedev/core";
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
  message,
  InputNumber,
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
import dayjs from "dayjs";
import { useConfirmModalStore } from "@/store/confirmModalStore";

interface ContractListProps {
  employeeId: string;
}

export const ContractList: React.FC<ContractListProps> = ({ employeeId }) => {
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [form] = Form.useForm();

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
  const { mutate: createContract } = useCreate();
  const { mutate: updateContract } = useUpdate();

  const contracts = data?.data || [];

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

  const getContractStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">Đang hoạt động</Tag>;
      case "expired":
        return <Tag color="default">Đã hết hạn</Tag>;
      case "terminated":
        return <Tag color="error">Đã chấm dứt</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
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
    form.setFieldsValue({
      ...contract,
      start_date: contract.start_date ? dayjs(contract.start_date) : undefined,
      end_date: contract.end_date ? dayjs(contract.end_date) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingContract(null);
    form.resetFields();
    form.setFieldsValue({
      employee_id: employeeId,
      status: "active",
      contract_type: "full_time",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const contractData = {
      employee_id: employeeId,
      contract_type: values.contract_type,
      start_date: values.start_date?.toDate(),
      end_date: values.end_date?.toDate(),

      salary: values.salary,
      terms: values.terms,
      status: values.status,
    };

    if (editingContract) {
      updateContract(
        {
          resource: "contracts",
          id: editingContract.id,
          values: contractData,
        },
        {
          onSuccess: () => {
            message.success("Cập nhật hợp đồng thành công!");
            setIsModalOpen(false);
            form.resetFields();
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
            setIsModalOpen(false);
            form.resetFields();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi thêm hợp đồng!");
          },
        }
      );
    }
  };

  const columns = [
    {
      title: "Loại hợp đồng",
      dataIndex: "contract_type",
      key: "contract_type",
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
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {date ? formatDate(date) : "Không có"}
        </div>
      ),
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      render: (salary: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(salary)}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getContractStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: Contract) => (
        <div className="flex justify-end gap-2">
          <AntButton
            type="link"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </AntButton>
          <AntButton
            type="link"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </AntButton>
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
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
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Loại hợp đồng"
            name="contract_type"
            rules={[
              { required: true, message: "Vui lòng chọn loại hợp đồng!" },
            ]}
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
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
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
            label="Mức lương (VNĐ)"
            name="salary"
            rules={[{ required: true, message: "Vui lòng nhập mức lương!" }]}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              placeholder="Nhập mức lương"
            />
          </Form.Item>

          <Form.Item label="Điều khoản" name="terms">
            <Input.TextArea
              rows={4}
              placeholder="Nhập các điều khoản hợp đồng (nếu có)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select
              size="large"
              options={[
                { label: "Đang hoạt động", value: "active" },
                { label: "Đã hết hạn", value: "expired" },
                { label: "Đã chấm dứt", value: "terminated" },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <AntButton
              size="large"
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}
            >
              Hủy
            </AntButton>
            <AntButton type="primary" size="large" htmlType="submit">
              {editingContract ? "Cập nhật" : "Thêm hợp đồng"}
            </AntButton>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
