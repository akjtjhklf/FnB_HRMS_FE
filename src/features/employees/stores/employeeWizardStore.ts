import { create } from 'zustand';

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
  
  setStep: (step: number) => void;
  updateFormData: (data: Partial<WizardState['formData']>) => void;
  reset: () => void;
}

export const useEmployeeWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  formData: {
    policyIds: [],
    gender: 'male',
    status: 'active'
  },
  setStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  reset: () => set({ 
    currentStep: 0, 
    formData: { policyIds: [], gender: 'male', status: 'active' } 
  }),
}));
