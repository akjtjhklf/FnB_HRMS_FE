"use client";

import React, { useEffect } from 'react';
import { Form, Input, Card, Row, Col, Typography } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useProfileWizardStore } from '../../stores/profileWizardStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Step2EmergencyNotes: React.FC = () => {
    const { formData, updateFormData, setStepForm } = useProfileWizardStore();
    const [form] = Form.useForm();

    // Register form instance for validation
    useEffect(() => {
        setStepForm(1, form);
        return () => setStepForm(1, null);
    }, [form, setStepForm]);

    // Set form values when formData changes
    useEffect(() => {
        form.setFieldsValue({
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            notes: formData.notes,
        });
    }, [formData, form]);

    const onValuesChange = (_changedValues: any, allValues: any) => {
        updateFormData(allValues);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Title level={4}>Liên hệ khẩn cấp & Ghi chú</Title>
                <Text type="secondary">Thông tin liên hệ trong trường hợp khẩn cấp.</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
                initialValues={{
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    notes: formData.notes,
                }}
            >
                {/* Liên hệ khẩn cấp */}
                <Card title="🚨 Liên hệ khẩn cấp" className="mb-6 shadow-sm">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người liên hệ"
                                name="emergency_contact_name"
                            >
                                <Input placeholder="Nguyễn Văn B" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="emergency_contact_phone"
                                rules={[
                                    {
                                        pattern: /^[0-9]{10,11}$/,
                                        message: 'Số điện thoại không hợp lệ!',
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
                    <Text type="secondary" className="text-sm">
                        Thông tin này sẽ được sử dụng trong trường hợp khẩn cấp tại nơi làm việc.
                    </Text>
                </Card>

                {/* Ghi chú */}
                <Card title="📝 Ghi chú cá nhân" className="shadow-sm">
                    <Form.Item
                        name="notes"
                        extra="Ghi chú thêm về bản thân (không bắt buộc)"
                    >
                        <TextArea
                            placeholder="Nhập ghi chú..."
                            rows={4}
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};
