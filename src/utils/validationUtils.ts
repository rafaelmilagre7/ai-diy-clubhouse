import { isValidPhone } from "@brazilian-utils/brazilian-utils";

export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // URL opcional
  const linkedInRegex = /^(https?:\/\/)?([\w\d]+\.)?linkedin\.com\/in\/[\w\d-]+\/?$/i;
  return linkedInRegex.test(url);
};

export const validateInstagramUrl = (url: string): boolean => {
  if (!url) return true; // URL opcional
  const instagramRegex = /^(https?:\/\/)?([\w\d]+\.)?instagram\.com\/([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)\/?$/i;
  return instagramRegex.test(url);
};

export const validateBrazilianPhone = (phone: string): boolean => {
  if (!phone) return true; // Telefone opcional
  const cleanPhone = phone.replace(/\D/g, "");
  return isValidPhone(cleanPhone); // Using isValidPhone instead of isPhone
};

export const formatSocialUrl = (url: string, type: "linkedin" | "instagram"): string => {
  if (!url) return "";
  
  // Remove whitespace
  url = url.trim();
  
  // Add https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  
  // Add base domain if only username is provided
  if (type === "linkedin" && !url.includes("linkedin.com")) {
    url = `https://linkedin.com/in/${url.replace(/^https?:\/\//i, "")}`;
  } else if (type === "instagram" && !url.includes("instagram.com")) {
    url = `https://instagram.com/${url.replace(/^https?:\/\//i, "")}`;
  }
  
  return url;
};
