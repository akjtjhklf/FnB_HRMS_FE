"use client";

import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Typography, App } from "antd";
import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store";

const { Title } = Typography;

export default function LoginPage() {
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
        message.success("Login successful!");
        
        // Store user data in Zustand
        if (data?.user) {
          setUser(data.user);
          setToken(data.token);
          setRoles(data.roles || []);
        }
        setLoading(false);
      },
      onError: (error: any) => {
        message.error(error?.message || "Login failed");
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6"
      >
        <Card className="shadow-xl">
          <div className="text-center mb-8">
            <Title level={2}>HRMS Login</Title>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
