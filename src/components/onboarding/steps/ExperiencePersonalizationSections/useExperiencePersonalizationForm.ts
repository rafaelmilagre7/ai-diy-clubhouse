
import { useMemo } from "react";
import { useForm } from "react-hook-form";

export function useExperiencePersonalizationForm(initialData: any = {}) {
  const form = useForm({
    defaultValues: {
      interests: initialData.interests || [],
      time_preference: initialData.time_preference || [],
      available_days: initialData.available_days || [],
      networking_availability: typeof initialData.networking_availability === "number" ? initialData.networking_availability : 5,
      skills_to_share: initialData.skills_to_share || [],
      mentorship_topics: initialData.mentorship_topics || [],
    }
  });

  const { watch } = form;
  const isValid = useMemo(() => {
    const formValues = watch();
    return [
      formValues.interests && formValues.interests.length > 0,
      formValues.time_preference && formValues.time_preference.length > 0,
      formValues.available_days && formValues.available_days.length > 0,
      formValues.skills_to_share && formValues.skills_to_share.length > 0,
      formValues.mentorship_topics && formValues.mentorship_topics.length > 0,
      typeof formValues.networking_availability === "number"
    ].every(Boolean);
  }, [watch]);

  function toggleSelect(field: string, value: string) {
    const arr = form.watch(field) || [];
    if (arr.includes(value)) {
      form.setValue(field, arr.filter((v: string) => v !== value), { shouldValidate: true });
    } else {
      form.setValue(field, [...arr, value], { shouldValidate: true });
    }
  }

  return {
    ...form,
    isValid,
    toggleSelect
  };
}
