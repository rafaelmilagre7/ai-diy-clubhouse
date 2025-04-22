
import { OnboardingProgress } from "@/types/onboarding";

/**
 * Builder base que implementa a lógica comum para todos os builders específicos
 * Garante consistência na forma como os dados são armazenados e estruturados
 * Inclui suporte para metadados semânticos que facilitam interpretação por IA
 */
export function buildBaseUpdate(
  sectionKey: string,
  data: any,
  progress: OnboardingProgress | null,
  options: {
    topLevelFields?: string[];
    useFieldMapping?: boolean;
    fieldMapping?: Record<string, string>;
    metadata?: Record<string, any>;
  } = {}
) {
  const { topLevelFields = [], useFieldMapping = false, fieldMapping = {}, metadata = {} } = options;
  const updateObj: any = {};
  
  // Se não há dados ou o progresso é nulo, não há o que atualizar
  if (!data || !progress) {
    console.log(`Dados vazios ou progresso nulo para ${sectionKey}, retornando objeto vazio.`);
    return updateObj;
  }
  
  console.log(`Construindo update para seção ${sectionKey} com dados:`, data);

  try {
    // 1. Verificar dados dentro de um objeto aninhado com o nome da seção
    const nestedData = data[sectionKey] || {};
    
    // 2. Obter dados diretos que podem estar fora de um objeto aninhado
    const directData: Record<string, any> = {};
    
    // Coletar todos os campos diretos com base nos campos esperados ou todos os campos se não especificado
    if (topLevelFields.length > 0) {
      topLevelFields.forEach(field => {
        if (field in data) {
          directData[field] = data[field];
        }
      });
    } else {
      // Se não foram especificados campos, coletar todos os campos diretos
      // exceto o próprio campo da seção
      Object.keys(data).forEach(field => {
        if (field !== sectionKey) {
          directData[field] = data[field];
        }
      });
    }
    
    // 3. Verificar se temos dados existentes armazenados para mesclar
    const existingSectionData = progress[sectionKey as keyof OnboardingProgress] || {};
    
    // Assegurar que existingSectionData seja um objeto e não string
    const baseData = typeof existingSectionData === 'string' 
      ? {} 
      : (existingSectionData as Record<string, any>);
    
    // 4. Mesclar dados: existentes + dados aninhados + dados diretos
    const mergedSectionData = {
      ...baseData,
      ...nestedData,
      // Adicionar metadados se fornecidos
      ...(Object.keys(metadata).length > 0 ? { _metadata: metadata } : {})
    };
    
    // 5. Adicionar dados diretos no objeto da seção
    if (Object.keys(directData).length > 0) {
      Object.entries(directData).forEach(([key, value]) => {
        // Usar mapeamento de campo se ativado
        const targetKey = useFieldMapping ? (fieldMapping[key] || key) : key;
        mergedSectionData[targetKey] = value;
      });
    }
    
    // 6. Adicionar timestamp de última atualização para rastreabilidade
    mergedSectionData._last_updated = new Date().toISOString();
    
    // 7. Atualizar o objeto da seção
    updateObj[sectionKey] = mergedSectionData;
    
    // 8. Para compatibilidade, também atualizar campos de nível superior
    if (Object.keys(directData).length > 0) {
      Object.entries(directData).forEach(([key, value]) => {
        updateObj[key] = value;
      });
    }
    
    // 9. Para compatibilidade reversa, copiar campos aninhados para o nível superior
    // se existirem no modelo de dados
    Object.entries(mergedSectionData).forEach(([key, value]) => {
      // Verificar se é um campo que também existe no nível superior 
      // e não é um campo de metadados (começando com _)
      if (topLevelFields.includes(key) && !key.startsWith('_')) {
        updateObj[key] = value;
      }
    });
    
    console.log(`Objeto de atualização construído para ${sectionKey}:`, updateObj);
    return updateObj;
  } catch (error) {
    console.error(`Erro ao construir objeto de atualização para ${sectionKey}:`, error);
    return updateObj;
  }
}
