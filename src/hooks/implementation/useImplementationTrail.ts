
// Reexporta do novo index centralizado e mantém tipos para retrocompatibilidade
export * from "./useImplementationTrail/index";
export type ImplementationRecommendation = {
  solutionId: string;
  justification: string;
};
export type ImplementationTrail = {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
};
