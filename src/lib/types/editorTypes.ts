
/**
 * Tipos para o editor de soluções do admin
 */

export type SolutionEditorStep = 
  | 'basic-info'  // Informações básicas
  | 'tools'       // Ferramentas necessárias
  | 'materials'   // Materiais para download
  | 'videos'      // Vídeos de instrução
  | 'checklist'   // Checklist de implementação
  | 'publish';    // Revisão e publicação

export interface SolutionEditorState {
  currentStep: number;
  steps: {
    id: SolutionEditorStep;
    title: string;
    description: string;
    completed: boolean;
  }[];
  solution: any; // Referência à solução atual
}
