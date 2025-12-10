"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Sử dụng next/navigation cho App Router
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Typography, App, Space, Divider } from "antd";
import { Card } from "@/components/ui";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store";
import LogoImage from "@/assets/logo.png";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { mutate: login } = useLogin();
  const [loading, setLoading] = React.useState(false);
  const { message } = App.useApp();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setRoles = useAuthStore((state) => state.setRoles);

  const onFinish = (values: any) => {
    setLoading(true);
    login(values, {
      onSuccess: (data: any) => {
        message.success("Đăng nhập thành công!");
        setLoading(false);
        
        // Refine sẽ tự động redirect về "/" (đã config trong authProviderClient)
        // "/" sẽ redirect về dashboard nếu đã authenticated
      },
      onError: (error: any) => {
        message.error(error?.message || "Đăng nhập thất bại");
        setLoading(false);
      },
    });
  };

  // Quick login for testing
  const quickLogin = () => {
    form.setFieldsValue({
      email: "admin@example.com",
      password: "admin123",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md animate-in">
        <Card className="shadow-2xl border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <Image
                src={LogoImage}
                alt="Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <Title level={2} className="!mb-2">
              Greasy Worm HRMS
            </Title>
            <Text className="text-gray-500">Đăng nhập để tiếp tục</Text>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              label="Thư điện tử"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="admin@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<LoginOutlined />}
                  loading={loading}
                  className="!h-12"
                >
                  Đăng nhập
                </Button>

                <Divider plain>
                  <Text className="text-xs text-gray-400">HOẶC</Text>
                </Divider>

                <Button
                  type="dashed"
                  block
                  onClick={quickLogin}
                  className="!h-10"
                >
                  Điền thông tin demo (Test)
                </Button>
              </Space>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Text className="text-xs text-gray-400">
              © 2025 HRMS. Bảo lưu mọi quyền.
            </Text>
          </div>
        </Card>

        {/* Demo Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text strong className="text-blue-700 block mb-2">
            🔐 Thông tin đăng nhập demo:
          </Text>
          <Text className="text-sm text-blue-600 block">
            Email: admin@example.com
          </Text>
          <Text className="text-sm text-blue-600 block">
            Mật khẩu: admin123
          </Text>
        </div>
      </div>
    </div>
  );
}
