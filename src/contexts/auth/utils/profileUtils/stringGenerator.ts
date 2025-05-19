
// Função para gerar strings aleatórias 
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

// Função para gerar um avatar temporário com base no nome do usuário
export function generateInitialsAvatar(name: string): string {
  // Extrair as iniciais (até 2 caracteres)
  const initials = name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
    
  // Cores de fundo possíveis (tons suaves)
  const backgroundColors = [
    '#e9f5e9', '#e3f2fd', '#fff8e1', 
    '#f3e5f5', '#e8f5e9', '#e0f7fa',
    '#fff3e0', '#f1f8e9', '#e8eaf6'
  ];
  
  // Escolher uma cor aleatoriamente baseada no nome
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % backgroundColors.length;
    
  // Construir um svg em base64
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="${backgroundColors[colorIndex]}" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" 
            font-weight="bold" fill="#555" text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>
  `;
  
  // Converter para base64
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
