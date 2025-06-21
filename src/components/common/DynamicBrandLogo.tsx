
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
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

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

  // Atualizar src quando o logoUrl mudar
  useEffect(() => {
    setCurrentSrc(logoUrl);
    setHasError(false);
  }, [logoUrl]);

  const handleError = () => {
    console.warn(`Erro ao carregar logo ${detectedType}, tentando fallback`);
    
    if (!hasError) {
      setHasError(true);
      // Tentar logo local como fallback
      const fallbackSrc = detectedType === 'club' 
        ? '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png'
        : '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png';
      
      setCurrentSrc(fallbackSrc);
    } else {
      // Se o fallback também falhar, usar logo padrão
      setCurrentSrc('https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={altText}
      className={className}
      style={{
        height: height || undefined,
        width: width || undefined
      }}
      onError={handleError}
      onLoad={() => {
        console.log(`[DYNAMIC-LOGO] Logo carregada com sucesso: ${currentSrc}`);
      }}
    />
  );
};

export default DynamicBrandLogo;
