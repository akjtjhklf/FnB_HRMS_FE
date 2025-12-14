"use client";

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Card, Row, Col, Typography, Avatar, Upload } from 'antd';
import { MailOutlined, PhoneOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProfileWizardStore } from '../../stores/profileWizardStore';
import { generateEmployeeAvatarUrl } from '@/utils/avatarGenerator';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const Step1BasicInfo: React.FC = () => {
    const { formData, updateFormData, setStepForm } = useProfileWizardStore();
    const [form] = Form.useForm();

    // Register form instance for validation
    useEffect(() => {
        setStepForm(0, form);
        return () => setStepForm(0, null);
    }, [form, setStepForm]);

    // Set form values when formData changes
    useEffect(() => {
        let dobValue = null;
        if (formData.dob) {
            if (dayjs.isDayjs(formData.dob)) {
                dobValue = formData.dob;
            } else if (typeof formData.dob === 'string') {
                const parsed = dayjs(formData.dob);
                dobValue = parsed.isValid() ? parsed : null;
            }
        }

        form.setFieldsValue({
            employee_code: formData.employee_code,
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            dob: dobValue,
            gender: formData.gender,
            personal_id: formData.personal_id,
            address: formData.address,
            photo_url: formData.photo_url,
        });
    }, [formData, form]);

    const onValuesChange = (changedValues: any, allValues: any) => {
        const processedValues = { ...allValues };

        // Auto-update avatar when name changes
        if (changedValues.first_name || changedValues.last_name) {
            const avatarUrl = generateEmployeeAvatarUrl(
                processedValues.first_name || '',
                processedValues.last_name || ''
            );
            processedValues.photo_url = avatarUrl;
        }

        // Convert dayjs to string for storage
        if (processedValues.dob && dayjs.isDayjs(processedValues.dob) && processedValues.dob.isValid()) {
            processedValues.dob = processedValues.dob.format('YYYY-MM-DD');
        } else if (processedValues.dob && !dayjs.isDayjs(processedValues.dob)) {
            delete processedValues.dob;
        }

        updateFormData(processedValues);
    };

    const handleUploadChange = (info: any) => {
        if (info.file.status === "done" || info.file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updateFormData({ photo_url: e.target?.result as string });
            };
            if (info.file.originFileObj) {
                reader.readAsDataURL(info.file.originFileObj);
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Title level={4}>Thông tin cá nhân</Title>
                <Text type="secondary">Cập nhật thông tin cá nhân của bạn.</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
                initialValues={{
                    employee_code: formData.employee_code,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    gender: formData.gender,
                    personal_id: formData.personal_id,
                    address: formData.address,
                }}
            >
                {/* Avatar Section */}
                <Card className="mb-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
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
                                    src={formData.photo_url}
                                    icon={<UserOutlined />}
                                    className="border-4 border-white shadow-lg"
                                />
                                <div className="mt-3 text-blue-600 font-medium flex items-center justify-center gap-2">
                                    <UploadOutlined />
                                    {formData.photo_url ? "Thay đổi ảnh" : "Tải ảnh lên"}
                                </div>
                            </div>
                        </Upload>
                    </div>
                </Card>

                {/* Hidden field to store photo_url */}
                <Form.Item name="photo_url" hidden>
                    <Input type="hidden" />
                </Form.Item>

                {/* Thông tin cơ bản */}
                <Card title="📋 Thông tin cơ bản" className="mb-6 shadow-sm">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mã nhân viên"
                                name="employee_code"
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Thư điện tử"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input 
                                    prefix={<MailOutlined className="text-gray-700" />}
                                    placeholder="employee@company.com" 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Họ"
                                name="first_name"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Input placeholder="Nguyễn Văn" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Tên"
                                name="last_name"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Input placeholder="An" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Họ và tên đầy đủ"
                                name="full_name"
                                tooltip="Nếu để trống, hệ thống sẽ tự tạo từ Họ + Tên"
                            >
                                <Input placeholder="Nguyễn Văn An" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    {
                                        pattern: /^[0-9]{10,11}$/,
                                        message: 'Số điện thoại không hợp lệ!',
                                    },
                                ]}
                            >
                                <Input 
                                    prefix={<PhoneOutlined className="text-gray-700" />}
                                    placeholder="0912345678" 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Giới tính"
                                name="gender"
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày sinh"
                                name="dob"
                            >
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
                        <Col span={12}>
                            <Form.Item
                                label="CMND/CCCD"
                                name="personal_id"
                            >
                                <Input placeholder="001234567890" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                    >
                        <TextArea
                            placeholder="Nhập địa chỉ đầy đủ"
                            rows={2}
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};
