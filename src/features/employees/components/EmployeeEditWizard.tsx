"use client";

import React, { useEffect } from 'react';
import { Steps, Button, Card, message, theme, Spin } from 'antd';
import { UserOutlined, IdcardOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEmployeeWizardStore } from '../stores/employeeWizardStore';
import { Step1UserAccess } from './steps/Step1UserAccess';
import { Step2EmployeeInfo } from './steps/Step2EmployeeInfo';
import { Step3RFID } from './steps/Step3RFID';
import { useCustomMutation, useGo, useOne } from '@refinedev/core';

const { Step } = Steps;

interface EmployeeEditWizardProps {
    id: string;
}

export const EmployeeEditWizard: React.FC<EmployeeEditWizardProps> = ({ id }) => {
    const { token } = theme.useToken();
    const go = useGo();
    const { currentStep, setStep, formData, updateFormData, reset } = useEmployeeWizardStore();
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch existing employee data
    const { query } = useOne({
        resource: "employees",
        id,
    });
    const { data: employeeData, isLoading } = query;

    const { mutate, mutation } = useCustomMutation<any>();

    // Initialize store with employee data
    useEffect(() => {
        if (employeeData?.data) {
            const emp = employeeData.data;
            const user = (emp as any).user;
            const rfidCards = (emp as any).rfid_cards;

            updateFormData({
                // Step 1: User & Access
                email: user?.email,
                roleId: typeof user?.role === 'object' ? user?.role?.id : user?.role,
                policyIds: user?.policies?.map((p: any) => p.id) || [],

                // Step 2: Employee Info
                employee_code: emp.employee_code,
                first_name: emp.first_name,
                last_name: emp.last_name,
                full_name: emp.full_name,
                phone: emp.phone,
                dob: emp.dob,
                gender: emp.gender,
                personal_id: emp.personal_id,
                address: emp.address,
                hire_date: emp.hire_date,
                status: emp.status,
                default_work_hours_per_week: emp.default_work_hours_per_week,
                max_hours_per_week: emp.max_hours_per_week,
                max_consecutive_days: emp.max_consecutive_days,
                min_rest_hours_between_shifts: emp.min_rest_hours_between_shifts,
                emergency_contact_name: emp.emergency_contact_name,
                emergency_contact_phone: emp.emergency_contact_phone,
                notes: emp.notes,
                scheme_id: emp.scheme_id,
                photo_url: emp.photo_url,

                // Step 3: RFID (Take the first active one if exists)
                rfidCode: rfidCards && rfidCards.length > 0 ? rfidCards[0].card_number : undefined,
            });
        }
    }, [employeeData]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    const steps = [
        {
            title: 'Tài khoản & Quyền truy cập',
            icon: <UserOutlined />,
            content: <Step1UserAccess isEdit={true} />,
        },
        {
            title: 'Thông tin cá nhân',
            icon: <IdcardOutlined />,
            content: <Step2EmployeeInfo />,
        },
        {
            title: 'Thẻ RFID',
            icon: <CreditCardOutlined />,
            content: <Step3RFID />,
        },
    ];

    const next = () => {
        setStep(currentStep + 1);
    };

    const prev = () => {
        setStep(currentStep - 1);
    };

    const handleSubmit = () => {
        mutate(
            {
                url: `employees/${id}/full`, // Assuming backend supports PUT/PATCH at this endpoint or similar
                method: 'patch', // or put
                values: formData,
            },
            {
                onSuccess: () => {
                    messageApi.success('Cập nhật nhân viên thành công!');
                    reset();
                    go({ to: { resource: 'employees', action: 'show', id } });
                },
                onError: (error: any) => {
                    messageApi.error(`Cập nhật nhân viên thất bại: ${error?.message || 'Lỗi không xác định'}`);
                },
            }
        );
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    return (
        <div className="flex flex-col h-full">
            {contextHolder}
            <Card className="mb-6 shadow-sm">
                <Steps current={currentStep}>
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} icon={item.icon} />
                    ))}
                </Steps>
            </Card>

            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm mb-6">
                {steps[currentStep].content}
            </div>

            <div className="flex justify-between bg-white p-4 rounded-lg shadow-sm border-t">
                <Button onClick={() => go({ to: { resource: 'employees', action: 'show', id } })} disabled={mutation.isPending}>
                    Hủy
                </Button>

                <div className="flex gap-2">
                    {currentStep > 0 && (
                        <Button onClick={() => prev()} disabled={mutation.isPending}>
                            Quay lại
                        </Button>
                    )}

                    {currentStep < steps.length - 1 && (
                        <Button type="primary" onClick={() => next()}>
                            Tiếp theo
                        </Button>
                    )}

                    {currentStep === steps.length - 1 && (
                        <Button type="primary" onClick={handleSubmit} loading={mutation.isPending}>
                            Cập nhật
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
