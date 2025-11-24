import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Card, Row, Col, Typography, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { useEmployeeWizardStore } from '../../stores/employeeWizardStore';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const Step2EmployeeInfo: React.FC = () => {
    const { formData, updateFormData } = useEmployeeWizardStore();
    const [form] = Form.useForm();

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

        let hireDateValue = null;
        if (formData.hire_date) {
            if (dayjs.isDayjs(formData.hire_date)) {
                hireDateValue = formData.hire_date;
            } else if (typeof formData.hire_date === 'string') {
                const parsed = dayjs(formData.hire_date);
                hireDateValue = parsed.isValid() ? parsed : null;
            }
        }

        form.setFieldsValue({
            employee_code: formData.employee_code,
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: formData.full_name,
            phone: formData.phone,
            dob: dobValue,
            gender: formData.gender,
            personal_id: formData.personal_id,
            address: formData.address,
            hire_date: hireDateValue,
            status: formData.status || 'active',
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            notes: formData.notes,
            default_work_hours_per_week: formData.default_work_hours_per_week,
            max_hours_per_week: formData.max_hours_per_week,
            max_consecutive_days: formData.max_consecutive_days,
            min_rest_hours_between_shifts: formData.min_rest_hours_between_shifts,
        });
    }, [formData, form]);

    const onValuesChange = (changedValues: any, allValues: any) => {
        const processedValues = { ...allValues };

        // Convert dayjs to string for storage
        if (processedValues.dob && dayjs.isDayjs(processedValues.dob) && processedValues.dob.isValid()) {
            processedValues.dob = processedValues.dob.format('YYYY-MM-DD');
        } else if (processedValues.dob && !dayjs.isDayjs(processedValues.dob)) {
            delete processedValues.dob;
        }

        if (processedValues.hire_date && dayjs.isDayjs(processedValues.hire_date) && processedValues.hire_date.isValid()) {
            processedValues.hire_date = processedValues.hire_date.format('YYYY-MM-DD');
        } else if (processedValues.hire_date && !dayjs.isDayjs(processedValues.hire_date)) {
            delete processedValues.hire_date;
        }

        updateFormData(processedValues);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Title level={4}>Thông tin cá nhân</Title>
                <Text type="secondary">Nhập đầy đủ thông tin nhân viên.</Text>
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
                    phone: formData.phone,
                    gender: formData.gender,
                    personal_id: formData.personal_id,
                    address: formData.address,
                    status: formData.status || 'active',
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    notes: formData.notes,
                    default_work_hours_per_week: formData.default_work_hours_per_week,
                    max_hours_per_week: formData.max_hours_per_week,
                    max_consecutive_days: formData.max_consecutive_days,
                    min_rest_hours_between_shifts: formData.min_rest_hours_between_shifts,
                }}
            >
                {/* Thông tin cơ bản */}
                <Card title="📋 Thông tin cơ bản" className="mb-6 shadow-sm">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mã nhân viên"
                                name="employee_code"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Input placeholder="VD: NV001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                            >
                                <Input placeholder="+84 900 000 000" />
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
                                label="Ngày sinh"
                                name="dob"
                            >
                                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
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
                                label="CMND/CCCD"
                                name="personal_id"
                            >
                                <Input placeholder="001234567890" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="status"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">🟢 Đang làm việc</Option>
                                    <Option value="on_leave">🟡 Nghỉ phép</Option>
                                    <Option value="suspended">🔴 Tạm ngưng</Option>
                                    <Option value="terminated">⚫ Đã nghỉ việc</Option>
                                </Select>
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

                {/* Thông tin công việc */}
                <Card title="💼 Thông tin công việc" className="mb-6 shadow-sm">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày vào làm"
                                name="hire_date"
                            >
                                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày vào làm" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="mb-4">
                        <Text strong>Giờ làm việc</Text>
                    </div>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Giờ làm mặc định/tuần"
                                name="default_work_hours_per_week"
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
                        <Col span={8}>
                            <Form.Item
                                label="Giờ làm tối đa/tuần"
                                name="max_hours_per_week"
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
                        <Col span={8}>
                            <Form.Item
                                label="Số ngày làm liên tiếp tối đa"
                                name="max_consecutive_days"
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
                                <Input placeholder="0987654321" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Ghi chú */}
                <Card title="📝 Ghi chú" className="shadow-sm">
                    <Form.Item
                        name="notes"
                        extra="Ghi chú thêm về nhân viên (không bắt buộc)"
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
