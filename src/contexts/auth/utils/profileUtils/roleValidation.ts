
import { UserRole } from "@/lib/supabase";

/**
 * Validates if the user's role matches the required role
 */
export function validateRole(
  userRole: string | UserRole, 
  requiredRole: string | string[]
): boolean {
  // Se o userRole for um objeto, pegue a propriedade name
  const roleName = typeof userRole === 'object' ? userRole.name : userRole;
  
  // Se requiredRole for um array, verifica se o userRole está nesse array
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(roleName);
  }
  
  // Senão, compara diretamente
  return roleName === requiredRole;
}
