
/**
 * Extrai as iniciais do nome do usuário
 * @param name Nome do usuário
 * @returns Iniciais do nome (até 2 caracteres)
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
