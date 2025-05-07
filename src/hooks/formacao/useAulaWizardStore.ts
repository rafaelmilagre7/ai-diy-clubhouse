
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AulaFormValues } from '../../components/formacao/aulas/types';

interface AulaWizardState {
  formData: Partial<AulaFormValues>;
  currentStep: number;
  moduleId: string | null;
  setFormData: (data: Partial<AulaFormValues>) => void;
  updateFormField: <K extends keyof AulaFormValues>(
    field: K, 
    value: AulaFormValues[K]
  ) => void;
  setCurrentStep: (step: number) => void;
  setModuleId: (id: string | null) => void;
  reset: () => void;
}

// Estado inicial do formulário
const initialState: Partial<AulaFormValues> = {
  title: "",
  description: "",
  objective: "",
  difficulty: "medium",
  estimated_time: "30",
  thumbnail_url: "",
  videos: [],
  materials: [],
  is_published: false,
  is_featured: false
};

export const useAulaWizardStore = create<AulaWizardState>()(
  persist(
    (set) => ({
      formData: initialState,
      currentStep: 0,
      moduleId: null,
      
      setFormData: (data) => set({ formData: data }),
      
      updateFormField: (field, value) => 
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value
          }
        })),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setModuleId: (id) => set({ moduleId: id }),
      
      reset: () => set({ 
        formData: initialState, 
        currentStep: 0,
        moduleId: null
      })
    }),
    {
      name: 'aula-wizard-storage',
    }
  )
);
