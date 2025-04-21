
import { useForm } from "react-hook-form";
import { useFormValidation } from "@/hooks/useFormValidation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema de validação com Zod
const personalInfoSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido").min(5, "E-mail inválido"),
  phone: z.string().optional(),
  ddi: z.string().default("+55"),
  linkedin: z.string().optional()
    .refine(val => !val || val.includes("linkedin.com"), {
      message: "Insira uma URL válida do LinkedIn"
    }),
  instagram: z.string().optional()
    .refine(val => !val || val.includes("instagram.com"), {
      message: "Insira uma URL válida do Instagram"
    }),
  country: z.string().default("Brasil"),
  state: z.string().min(2, "Estado é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  timezone: z.string().default("GMT-3")
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const usePersonalInfoForm = (initialData: any) => {
  const { register, handleSubmit, formState: { errors, touchedFields, isValid, isDirty }, control, watch, trigger } = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      ddi: initialData?.ddi || "+55",
      linkedin: initialData?.linkedin || "",
      instagram: initialData?.instagram || "",
      country: initialData?.country || "Brasil",
      state: initialData?.state || "",
      city: initialData?.city || "",
      timezone: initialData?.timezone || "GMT-3"
    }
  });

  // Usar useFormValidation para campos adicionais que precisam de validação personalizada
  const validation = useFormValidation(
    {
      phone: initialData?.phone || "",
      ddi: initialData?.ddi || "+55",
      linkedin: initialData?.linkedin || "",
      instagram: initialData?.instagram || "",
      state: initialData?.state || "",
      city: initialData?.city || ""
    },
    {
      phone: [
        {
          validate: (value: string) => !value || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value),
          message: "Digite no formato (00) 00000-0000"
        }
      ],
      linkedin: [
        {
          validate: (value: string) => !value || value.includes("linkedin.com"),
          message: "Insira uma URL válida do LinkedIn"
        }
      ],
      instagram: [
        {
          validate: (value: string) => !value || value.includes("instagram.com"),
          message: "Insira uma URL válida do Instagram"
        }
      ]
    }
  );

  const validateForm = async () => {
    const isFormValid = await trigger();
    return isFormValid && validation.isValid;
  };

  const formData = watch();

  return {
    register,
    handleSubmit,
    errors,
    touchedFields,
    control,
    validation,
    isValid,
    isDirty,
    formData,
    validateForm,
    trigger
  };
};
