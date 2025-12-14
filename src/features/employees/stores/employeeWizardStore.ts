import { create } from 'zustand';
import type { FormInstance } from 'antd';

export interface WizardState {
  currentStep: number;
  formData: {
    // Step 1: User & Access
    email?: string;
    password?: string;
    confirmPassword?: string;
    roleId?: string;
    policyIds?: string[];
    
    // Step 2: Employee Info - Basic
    employee_code?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
    dob?: string;
    gender?: "male" | "female" | "other";
    personal_id?: string;
    address?: string;
    
    // Step 2: Employee Info - Work
    hire_date?: string;
    status?: "active" | "on_leave" | "suspended" | "terminated";
    default_work_hours_per_week?: number;
    max_hours_per_week?: number;
    max_consecutive_days?: number;
    min_rest_hours_between_shifts?: number;
    
    // Step 2: Employee Info - Emergency & Notes
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
    
    // Optional
    department_id?: string;
    position_id?: string;
    scheme_id?: string;
    photo_url?: string;
    
    // Step 3: RFID
    rfidCode?: string;
  };
  
  // Form instances for validation
  stepForms: {
    [key: number]: FormInstance | null;
  };
  
  setStep: (step: number) => void;
  updateFormData: (data: Partial<WizardState['formData']>) => void;
  setStepForm: (step: number, form: FormInstance | null) => void;
  validateCurrentStep: () => Promise<boolean>;
  reset: () => void;
}

const initialFormData = {
  policyIds: [],
  gender: 'male' as const,
  status: 'active' as const,
  min_rest_hours_between_shifts: 0, // Default value
  max_hours_per_week: 56, // Default value
  max_consecutive_days: 7, // Default value
};

export const useEmployeeWizardStore = create<WizardState>((set, get) => ({
  currentStep: 0,
  formData: { ...initialFormData },
  stepForms: {},
  
  setStep: (step) => set({ currentStep: step }),
  
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  
  setStepForm: (step, form) => set((state) => ({
    stepForms: { ...state.stepForms, [step]: form }
  })),
  
  validateCurrentStep: async () => {
    const { currentStep, stepForms } = get();
    const currentForm = stepForms[currentStep];
    
    if (!currentForm) {
      return true; // No form to validate
    }
    
    try {
      await currentForm.validateFields();
      return true;
    } catch (error) {
      return false;
    }
  },
  
  reset: () => set({ 
    currentStep: 0, 
    formData: { ...initialFormData },
    stepForms: {},
  }),
}));
