
import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { NavigationButtons } from "./NavigationButtons";

export const PersonalInfoFormController = () => {
  const { progress, updateProgress } = useProgress();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: progress?.personal_info?.name || "",
    email: progress?.personal_info?.email || "",
    phone: progress?.personal_info?.phone || "",
    ddi: progress?.personal_info?.ddi || "+55",
    linkedin: progress?.personal_info?.linkedin || "",
    instagram: progress?.personal_info?.instagram || "",
    country: progress?.personal_info?.country || "Brasil",
    state: progress?.personal_info?.state || "",
    city: progress?.personal_info?.city || "",
    timezone: progress?.personal_info?.timezone || "GMT-3",
  });

  // Atualiza o estado inicial quando o progress for carregado
  useEffect(() => {
    if (progress?.personal_info) {
      setFormData(prev => ({
        ...prev,
        ...progress.personal_info,
        ddi: progress.personal_info.ddi || "+55",
        country: progress.personal_info.country || "Brasil",
        timezone: progress.personal_info.timezone || "GMT-3"
      }));
    }
  }, [progress]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when country changes
      if (field === "country") {
        newData.state = "";
        newData.city = "";
      }

      // Reset city when state changes
      if (field === "state") {
        newData.city = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProgress({
        personal_info: formData,
        current_step: "business_goals",
        completed_steps: [...(progress?.completed_steps || []), "personal_info"],
      });

      toast.success("Dados salvos com sucesso!");
      navigate("/onboarding/business-goals");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <PersonalInfoInputs formData={formData} onChange={handleChange} disabled={isSubmitting} />
      <NavigationButtons isSubmitting={isSubmitting} />
    </form>
  );
};
