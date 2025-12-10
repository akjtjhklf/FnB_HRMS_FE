import React, { useEffect } from 'react';
import { Form, Input, Select, Card, Row, Col, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, VerifiedOutlined } from '@ant-design/icons';
import { useSelect } from '@refinedev/antd';
import { useEmployeeWizardStore } from '../../stores/employeeWizardStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { Password } = Input;

interface Step1UserAccessProps {
    isEdit?: boolean;
}

export const Step1UserAccess: React.FC<Step1UserAccessProps> = ({ isEdit = false }) => {
    const { formData, updateFormData, setStepForm } = useEmployeeWizardStore();
    const [form] = Form.useForm();

    // Register form instance for validation
    useEffect(() => {
        setStepForm(0, form);
        return () => setStepForm(0, null);
    }, [form, setStepForm]);

    // Fetch roles
    const { selectProps: roleSelectProps } = useSelect({
        resource: 'roles',
        optionLabel: 'name',
        optionValue: 'id',
    });

    // Fetch policies
    const { selectProps: policySelectProps } = useSelect({
        resource: 'policies',
        optionLabel: 'name',
        optionValue: 'id',
    });

    useEffect(() => {
        form.setFieldsValue({
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            roleId: formData.roleId,
            policyIds: formData.policyIds,
        });
    }, [formData, form]);

    const onValuesChange = (changedValues: any, allValues: any) => {
        updateFormData(allValues);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Title level={4}>Tài khoản & Quyền truy cập</Title>
                <Text type="secondary">
                    Thiết lập tài khoản đăng nhập và quyền truy cập cho nhân viên.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
                initialValues={formData}
            >
                {/* Thông tin tài khoản */}
                <Card title="🔐 Thông tin tài khoản" className="mb-6 shadow-sm">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                        <Text className="text-sm text-blue-800">
                            💡 <strong>Lưu ý:</strong> Tài khoản này sẽ được sử dụng để đăng nhập vào hệ thống.
                        </Text>
                    </div>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Thư điện tử"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                                tooltip="Email sẽ được dùng làm tên đăng nhập"
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="nhanvien@congty.com"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: !isEdit, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Password
                                    prefix={<LockOutlined />}
                                    placeholder={isEdit ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: !isEdit, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            if (isEdit && !value && !getFieldValue('password')) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập lại mật khẩu"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <Text className="text-sm text-yellow-800">
                            ⚠️ Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu tiên để bảo mật.
                        </Text>
                    </div>
                </Card>

                {/* Phân quyền */}
                <Card title="🛡️ Phân quyền" className="shadow-sm">
                    <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
                        <Text className="text-sm text-green-800">
                            ✅ <strong>Vai trò:</strong> Chọn vai trò để gán quyền truy cập cho nhân viên.
                            Các chính sách sẽ được kế thừa từ vai trò.
                        </Text>
                    </div>

                    <Form.Item
                        label="Vai trò"
                        name="roleId"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                        tooltip="Vai trò xác định quyền truy cập của nhân viên"
                    >
                        <Select
                            {...roleSelectProps}
                            placeholder="Chọn vai trò"
                            size="large"
                            suffixIcon={<SafetyOutlined />}
                            showSearch
                            filterOption={(input, option) =>
                                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded mt-4 mb-4">
                        <Text className="text-sm text-gray-600">
                            📌 <strong>Lưu ý:</strong> Chính sách được quản lý tại cấp độ vai trò.
                            Tuy nhiên, bạn có thể gán thêm các chính sách bổ sung cho nhân viên này bên dưới.
                        </Text>
                    </div>

                    {/* Policy Select */}
                    <Form.Item
                        label={<span>Chính sách bổ sung <span className="text-red-500">*</span></span>}
                        name="policyIds"
                        rules={[
                            // { required: true, message: 'Vui lòng chọn ít nhất một chính sách!' },
                            {
                                validator: (_, value) => {
                                    if (!value || value.length === 0) {
                                        return Promise.reject(new Error('Vui lòng chọn ít nhất một chính sách!'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        tooltip="Gán thêm các quyền cụ thể cho nhân viên này (ngoài quyền từ Role)"
                    >
                        <Select
                            {...policySelectProps}
                            mode="multiple"
                            placeholder="Chọn chính sách (bắt buộc)"
                            size="large"
                            suffixIcon={<VerifiedOutlined />}
                            showSearch
                            filterOption={(input, option) =>
                                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};
