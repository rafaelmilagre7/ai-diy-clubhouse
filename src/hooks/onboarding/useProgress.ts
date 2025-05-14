
// Re-exportando o hook useProgress com as melhorias implementadas
import { useProgress as useProgressOriginal } from "../useProgress";

/**
 * Re-exporta o hook useProgress para manter compatibilidade com imports
 * nos módulos do onboarding
 */
export const useProgress = useProgressOriginal;
