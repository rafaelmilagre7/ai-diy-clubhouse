export interface BuilderStep {
  id: number;
  label: string;
  estimatedStart: number; // em segundos
  estimatedEnd: number;
  status: 'pending' | 'active' | 'completed';
}

export interface BuilderProgress {
  currentStep: number;
  steps: BuilderStep[];
  elapsedTime: number;
  estimatedTotal: number;
}

export const BUILDER_STEPS: Omit<BuilderStep, 'status'>[] = [
  { id: 1, label: 'Iniciando análise', estimatedStart: 0, estimatedEnd: 3 },
  { id: 2, label: 'Conectando Claude Sonnet 4.5', estimatedStart: 3, estimatedEnd: 10 },
  { id: 3, label: 'Analisando contexto e respostas', estimatedStart: 10, estimatedEnd: 25 },
  { id: 4, label: 'Identificando ferramentas necessárias', estimatedStart: 25, estimatedEnd: 40 },
  { id: 5, label: 'Estruturando arquitetura técnica', estimatedStart: 40, estimatedEnd: 50 },
  { id: 6, label: 'Gerando framework de implementação', estimatedStart: 50, estimatedEnd: 80 },
  { id: 7, label: 'Criando diagramas e fluxogramas', estimatedStart: 80, estimatedEnd: 120 },
  { id: 8, label: 'Montando checklist executável', estimatedStart: 120, estimatedEnd: 160 },
  { id: 9, label: 'Salvando solução no banco', estimatedStart: 160, estimatedEnd: 180 },
  { id: 10, label: 'Finalizando e validando', estimatedStart: 180, estimatedEnd: 200 },
];
