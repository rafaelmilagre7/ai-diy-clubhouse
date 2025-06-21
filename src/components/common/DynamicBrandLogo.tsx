
import React from 'react';
import { getBrandLogo, detectUserType, UserType } from '@/services/brandLogoService';

interface DynamicBrandLogoProps {
  /** Tipo específico de usuário (sobrescreve a detecção automática) */
  userType?: UserType;
  /** Role do convite para detecção automática */
  inviteRole?: string;
  /** Parâmetros da URL para detecção automática */
  urlParams?: URLSearchParams;
  /** Tipo padrão se não conseguir detectar */
  defaultType?: UserType;
  /** Classes CSS adicionais */
  className?: string;
  /** Altura da logo */
  height?: string | number;
  /** Largura da logo */
  width?: string | number;
  /** Alt text para acessibilidade */
  alt?: string;
}

export const DynamicBrandLogo: React.FC<DynamicBrandLogoProps> = ({
  userType,
  inviteRole,
  urlParams,
  defaultType = 'club',
  className = 'mx-auto h-20 w-auto',
  height,
  width,
  alt
}) => {
  // Detectar tipo de usuário se não foi especificado
  const detectedType = userType || detectUserType({
    inviteRole,
    urlParams,
    defaultType
  });

  // Obter a logo correta
  const logoUrl = getBrandLogo(detectedType);

  // Gerar alt text dinâmico
  const altText = alt || `Logo ${detectedType === 'club' ? 'VIVER DE IA Club' : 'FORMAÇÃO VIVER DE IA'}`;

  return (
    <img
      src={logoUrl}
      alt={altText}
      className={className}
      style={{
        height: height || undefined,
        width: width || undefined
      }}
      onError={(e) => {
        // Fallback para logo padrão em caso de erro
        console.warn(`Erro ao carregar logo ${detectedType}, usando fallback`);
        (e.target as HTMLImageElement).src = 'https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif';
      }}
    />
  );
};

export default DynamicBrandLogo;
