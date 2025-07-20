
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
