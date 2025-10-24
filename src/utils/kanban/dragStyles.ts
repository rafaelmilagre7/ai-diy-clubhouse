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

  // Durante o drag, adicionar APENAS propriedades que NÃO conflitam com transform
  if (isDragging) {
    return {
      ...style,
      // CRÍTICO: Não sobrescrever transform - deixar @hello-pangea/dnd controlar 100%
      cursor: 'grabbing',
      zIndex: 9999,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      opacity: 0.9,
    };
  }

  return style;
};
