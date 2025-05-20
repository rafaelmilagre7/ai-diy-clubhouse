
/**
 * Obtém as iniciais do nome do usuário para exibição em fallbacks de avatar
 */
export const getInitials = (name: string | null): string => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
