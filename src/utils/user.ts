
export const getInitials = (name?: string): string => {
  if (!name) return "U";
  
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatUserName = (name?: string): string => {
  if (!name) return "Usuário";
  return name;
};

export const getUserDisplayName = (profile: { name?: string; email?: string }): string => {
  return profile.name || profile.email?.split("@")[0] || "Usuário";
};

export const getTimeBasedGreeting = (): string => {
  const now = new Date();
  // Converter para horário de Brasília (UTC-3)
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  const hour = brasiliaTime.getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};
