import { DraggableStyle } from "@hello-pangea/dnd";

/**
 * Função helper para garantir que os estilos de drag funcionem corretamente
 * sem conflitos com transformações CSS personalizadas.
 * 
 * @param style - Estilo fornecido pelo react-beautiful-dnd
 * @param isDragging - Se o item está sendo arrastado
 */
export const getDraggableStyle = (
  style: DraggableStyle | undefined,
  isDragging: boolean
): React.CSSProperties => {
  if (!style) return {};

  // Durante o drag, preservar APENAS as transformações do @hello-pangea/dnd
  // e remover qualquer transformação customizada que possa conflitar
  if (isDragging) {
    return {
      ...style,
      // Forçar GPU acceleration para performance
      transform: style.transform,
      // Garantir que o card siga o cursor exatamente
      transition: 'none',
      // Manter cursor apropriado
      cursor: 'grabbing',
      // Z-index alto para ficar acima de tudo
      zIndex: 9999,
    };
  }

  return style;
};
