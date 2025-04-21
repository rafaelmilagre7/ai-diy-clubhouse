
export function validatePersonalInfoForm(formData: any) {
  const errors: Record<string, string> = {};
  if (!formData.phone.trim()) {
    errors.phone = "O telefone é obrigatório";
  } else if (!/^[0-9]{8,15}$/.test(formData.phone.replace(/\D/g, ""))) {
    errors.phone = "Formato de telefone inválido";
  }
  if (!formData.state.trim()) {
    errors.state = "O estado é obrigatório";
  }
  if (!formData.city.trim()) {
    errors.city = "A cidade é obrigatória";
  }
  if (formData.linkedin && !formData.linkedin.includes("linkedin.com")) {
    errors.linkedin = "URL do LinkedIn inválida";
  }
  if (formData.instagram && !formData.instagram.includes("instagram.com")) {
    errors.instagram = "URL do Instagram inválida";
  }
  return errors;
}
