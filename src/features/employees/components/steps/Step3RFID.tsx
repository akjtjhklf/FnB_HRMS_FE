import React, { useEffect } from 'react';
import { Form, Input, Card, Typography } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { useEmployeeWizardStore } from '../../stores/employeeWizardStore';

const { Title, Text } = Typography;

export const Step3RFID: React.FC = () => {
    const { formData, updateFormData } = useEmployeeWizardStore();
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            rfidCode: formData.rfidCode,
        });
    }, [formData, form]);

    const onValuesChange = (changedValues: any, allValues: any) => {
        updateFormData(allValues);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Title level={4}>Thẻ RFID (Tùy chọn)</Title>
                <Text type="secondary">
                    Bạn có thể gán thẻ RFID cho nhân viên để quản lý chấm công.
                    Bước này có thể bỏ qua và gán sau.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
                initialValues={formData}
            >
                <Card className="shadow-sm">
                    <div className="text-center mb-6">
                        <CreditCardOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                    </div>

                    <Form.Item
                        label="Mã thẻ RFID"
                        name="rfidCode"
                        extra="Quét hoặc nhập mã thẻ RFID của nhân viên"
                    >
                        <Input
                            placeholder="VD: RFID123456789"
                            size="large"
                            prefix={<CreditCardOutlined />}
                        />
                    </Form.Item>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded mt-4">
                        <Text className="text-sm text-blue-800">
                            💡 <strong>Lưu ý:</strong> Nếu chưa có thẻ RFID, bạn có thể bỏ qua bước này
                            và gán thẻ cho nhân viên sau thông qua trang quản lý thẻ RFID.
                        </Text>
                    </div>
                </Card>
            </Form>
        </div>
    );
};
