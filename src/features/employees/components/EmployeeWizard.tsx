"use client";

import React from 'react';
import { Steps, Button, Card, message, theme } from 'antd';
import { UserOutlined, IdcardOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEmployeeWizardStore } from '../stores/employeeWizardStore';
import { Step1UserAccess } from './steps/Step1UserAccess';
import { Step2EmployeeInfo } from './steps/Step2EmployeeInfo';
import { Step3RFID } from './steps/Step3RFID';
import { useCustomMutation, useGo } from '@refinedev/core';

const { Step } = Steps;

export const EmployeeWizard: React.FC = () => {
    const { token } = theme.useToken();
    const go = useGo();
    const { currentStep, setStep, formData, reset } = useEmployeeWizardStore();

    const { mutate, mutation } = useCustomMutation<any>();

    const steps = [
        {
            title: 'Tài khoản & Quyền truy cập',
            icon: <UserOutlined />,
            content: <Step1UserAccess />,
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
                url: 'employees/full',
                method: 'post',
                values: formData,
            },
            {
                onSuccess: () => {
                    message.success('Tạo nhân viên thành công!');
                    reset();
                    go({ to: { resource: 'employees', action: 'list' } });
                },
                onError: (error: any) => {
                    message.error(`Tạo nhân viên thất bại: ${error?.message || 'Lỗi không xác định'}`);
                },
            }
        );
    };

    return (
        <div className="flex flex-col h-full">
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
                {currentStep > 0 ? (
                    <Button onClick={() => prev()} disabled={mutation.isPending}>
                        Quay lại
                    </Button>
                ) : (
                    <div />
                )}

                {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Tiếp theo
                    </Button>
                )}

                {currentStep === steps.length - 1 && (
                    <Button type="primary" onClick={handleSubmit} loading={mutation.isPending}>
                        Tạo nhân viên
                    </Button>
                )}
            </div>
        </div>
    );
};
