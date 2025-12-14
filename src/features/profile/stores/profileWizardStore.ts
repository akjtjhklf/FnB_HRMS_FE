import { create } from 'zustand';
import type { FormInstance } from 'antd';

export interface ProfileWizardState {
  currentStep: number;
  formData: {
    // Step 1: Basic Info
    employee_code?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    dob?: string;
    gender?: "male" | "female" | "other";
    personal_id?: string;
    address?: string;
    photo_url?: string;
    
    // Step 2: Emergency & Notes
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
  };
  
  // Form instances for validation
  stepForms: {
    [key: number]: FormInstance | null;
  };
  
  setStep: (step: number) => void;
  updateFormData: (data: Partial<ProfileWizardState['formData']>) => void;
  setStepForm: (step: number, form: FormInstance | null) => void;
  validateCurrentStep: () => Promise<boolean>;
  reset: () => void;
}

const initialFormData = {
  gender: 'male' as const,
};

export const useProfileWizardStore = create<ProfileWizardState>((set, get) => ({
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
    stepForms: {} 
  }),
}));
