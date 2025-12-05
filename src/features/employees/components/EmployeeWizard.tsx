"use client";

import React from 'react';
import { Steps, Button, Card, theme } from 'antd';
import { UserOutlined, IdcardOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEmployeeWizardStore } from '../stores/employeeWizardStore';
import { Step1UserAccess } from './steps/Step1UserAccess';
import { Step2EmployeeInfo } from './steps/Step2EmployeeInfo';
import { Step3RFID } from './steps/Step3RFID';
import { useCustomMutation, useGo, useGetIdentity } from '@refinedev/core';
import { toast } from '@/utils/toast';

const { Step } = Steps;

interface UserIdentity {
  id: string;
  email: string;
}

export const EmployeeWizard: React.FC = () => {
    const { token } = theme.useToken();
    const go = useGo();
    const { data: currentUser } = useGetIdentity<UserIdentity>();
    const { currentStep, setStep, formData, reset, validateCurrentStep } = useEmployeeWizardStore();

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

    const next = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            setStep(currentStep + 1);
        } else {
            toast.validationError('Vui lòng điền đầy đủ thông tin bắt buộc trước khi tiếp tục!');
        }
    };

    const prev = () => {
        setStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        // Validate current step before submit
        const isValid = await validateCurrentStep();
        if (!isValid) {
            toast.validationError('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Chuẩn bị dữ liệu để gửi, loại bỏ confirmPassword và đảm bảo roleId là string
        const submitData = {
            ...formData,
            user_id: currentUser?.id, // Link employee với current user
            roleId: typeof formData.roleId === 'object' 
                ? (formData.roleId as any)?.id || (formData.roleId as any)?.value 
                : formData.roleId,
            policyIds: (formData.policyIds || []).map((p: any) => 
                typeof p === 'object' ? p?.id || p?.value : p
            ),
        };
        // Loại bỏ confirmPassword vì BE không cần
        delete (submitData as any).confirmPassword;

        console.log('[EmployeeWizard] Submit data:', submitData);
        
        mutate(
            {
                url: 'employees/full',
                method: 'post',
                values: submitData,
            },
            {
                onSuccess: () => {
                    toast.crudSuccess('create', 'nhân viên');
                    reset();
                    go({ to: { resource: 'employees', action: 'list' } });
                },
                onError: (error: any) => {
                    toast.crudError('create', 'nhân viên', error);
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
                    <Button type="primary" onClick={next}>
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
