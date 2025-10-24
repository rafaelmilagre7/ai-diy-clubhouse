import { DraggableStyle } from "@hello-pangea/dnd";

/**
 * Função helper para aplicar estilos de drag SEM CONFLITAR com @hello-pangea/dnd
 * CRÍTICO: Não podemos adicionar ou modificar 'transform' - apenas @hello-pangea/dnd controla isso
 * 
 * @param style - Estilo fornecido pelo @hello-pangea/dnd (contém transform inline)
 * @param isDragging - Se o item está sendo arrastado
 */
export const getDraggableStyle = (
  style: DraggableStyle | undefined,
  isDragging: boolean
): React.CSSProperties => {
  if (!style) return {};
  
  // Retornar apenas o style do DND sem modificações
  return style;
};
