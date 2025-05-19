
/**
 * Gera uma string aleatória de determinado comprimento
 * @param length Comprimento da string
 * @returns String aleatória
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Gera um email aleatório para testes
 * @returns Email de teste
 */
export function generateTestEmail(): string {
  return `test.${generateRandomString(8)}@example.com`;
}

/**
 * Gera um nome aleatório para testes
 * @returns Nome de teste
 */
export function generateTestName(): string {
  const firstNames = ['Ana', 'João', 'Maria', 'Pedro', 'Carla', 'Lucas', 'Julia'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}
