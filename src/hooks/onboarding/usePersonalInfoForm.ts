
import { useForm } from "react-hook-form";
import { useFormValidation } from "@/hooks/useFormValidation";
import { toast } from "sonner";

export const usePersonalInfoForm = (initialData: any, onSubmit: (data: any) => void) => {
  const { register, handleSubmit, formState: { errors, touchedFields }, control } = useForm({
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
    },
    mode: "onChange"
  });

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

  const onFormSubmit = async (data: any) => {
    if (!validation.isValid) {
      toast.error("Por favor, corrija os erros antes de continuar");
      return;
    }
    
    try {
      await onSubmit({
        personal_info: {
          ...data
        }
      });
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    }
  };

  return {
    register,
    handleSubmit,
    onFormSubmit,
    errors,
    touchedFields,
    control,
    validation
  };
};
