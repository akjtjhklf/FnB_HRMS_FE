"use client";

import React, { useEffect } from 'react';
import { Steps, Button, Card, message, Spin, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useProfileWizardStore } from '../stores/profileWizardStore';
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2EmergencyNotes } from './steps/Step2EmergencyNotes';
import { useCustomMutation, useGetIdentity, useOne } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Step } = Steps;

export const ProfileEditWizard: React.FC = () => {
    const router = useRouter();
    const { currentStep, setStep, formData, updateFormData, reset, validateCurrentStep } = useProfileWizardStore();
    const [messageApi, contextHolder] = message.useMessage();

    // Get current user's identity
    const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<{ 
        employee_id?: string; 
        employee?: { id: string } 
    }>();
    
    // Get employee_id from either identity.employee.id (populated) or identity.employee_id (just ID)
    const employeeId = identity?.employee?.id || identity?.employee_id;

    // Fetch existing employee data
    const { query } = useOne({
        resource: "employees",
        id: employeeId || "",
        queryOptions: {
            enabled: !!employeeId,
        },
    });
    const { data: employeeData, isLoading: isEmployeeLoading } = query;

    const { mutate, mutation } = useCustomMutation<any>();

    // Initialize store with employee data
    useEffect(() => {
        if (employeeData?.data) {
            const emp = employeeData.data as any;

            updateFormData({
                // Step 1: Basic Info
                employee_code: emp.employee_code,
                first_name: emp.first_name,
                last_name: emp.last_name,
                full_name: emp.full_name,
                email: emp.email,
                phone: emp.phone,
                dob: emp.dob,
                gender: emp.gender,
                personal_id: emp.personal_id,
                address: emp.address,
                photo_url: emp.photo_url,

                // Step 2: Emergency & Notes
                emergency_contact_name: emp.emergency_contact_name,
                emergency_contact_phone: emp.emergency_contact_phone,
                notes: emp.notes,
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
            title: 'Thông tin cá nhân',
            icon: <UserOutlined />,
            content: <Step1BasicInfo />,
        },
        {
            title: 'Liên hệ & Ghi chú',
            icon: <PhoneOutlined />,
            content: <Step2EmergencyNotes />,
        },
    ];

    const next = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            setStep(currentStep + 1);
        } else {
            messageApi.warning('Vui lòng điền đầy đủ thông tin bắt buộc!');
        }
    };

    const prev = () => {
        setStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        const isValid = await validateCurrentStep();
        if (!isValid) {
            messageApi.warning('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        mutate(
            {
                url: `employees/${employeeId}`,
                method: 'patch',
                values: formData,
            },
            {
                onSuccess: () => {
                    messageApi.success('✅ Cập nhật thông tin thành công!');
                    reset();
                    router.push('/profile');
                },
                onError: (error: any) => {
                    const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi không xác định';
                    messageApi.error(`❌ Cập nhật thất bại: ${errorMsg}`);
                },
            }
        );
    };

    const isLoading = isIdentityLoading || isEmployeeLoading;

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <Spin size="large">
                    <div className="pt-8 text-gray-500">Đang tải thông tin...</div>
                </Spin>
            </div>
        );
    }

    // No employee linked to user
    if (!employeeId) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <Empty
                    description="Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên. Vui lòng liên hệ quản trị viên."
                />
            </div>
        );
    }

    // No employee data found
    if (!employeeData?.data) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <Empty
                    description="Không tìm thấy thông tin nhân viên"
                />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {contextHolder}
            
            {/* Back Link */}
            <div className="mb-6">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    <ArrowLeftOutlined className="mr-2" />
                    Quay lại hồ sơ
                </Link>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Steps Header */}
                <Card className="mb-6 shadow-sm">
                    <Steps current={currentStep}>
                        {steps.map((item) => (
                            <Step key={item.title} title={item.title} icon={item.icon} />
                        ))}
                    </Steps>
                </Card>

                {/* Step Content */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    {steps[currentStep].content}
                </div>

                {/* Navigation Buttons */}
                <Card className="shadow-sm sticky bottom-4 border-t-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <Button 
                            onClick={() => router.push('/profile')} 
                            disabled={mutation.isPending}
                        >
                            Hủy
                        </Button>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button onClick={prev} disabled={mutation.isPending}>
                                    Quay lại
                                </Button>
                            )}

                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={next}>
                                    Tiếp theo
                                </Button>
                            )}

                            {currentStep === steps.length - 1 && (
                                <Button 
                                    type="primary" 
                                    onClick={handleSubmit} 
                                    loading={mutation.isPending}
                                >
                                    Cập nhật
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
