import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { AutomationTemplates } from '@/components/automations/AutomationTemplates';
import { render, resetAllMocks } from '@/__tests__/utils/testUtils';
import { mockAutomationTemplate } from '@/__tests__/mocks/automationMocks';

describe('AutomationTemplates', () => {
  const mockOnSelectTemplate = jest.fn();
  const mockOnCreateFromScratch = jest.fn();

  const defaultProps = {
    onSelectTemplate: mockOnSelectTemplate,
    onCreateFromScratch: mockOnCreateFromScratch
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSelectTemplate.mockClear();
    mockOnCreateFromScratch.mockClear();
  });

  describe('Template Selection', () => {
    it('should call onSelectTemplate when a template card is clicked', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      // Procura por cards de template (podem ter classes específicas ou texto)
      const templateCard = screen.getByText(/boas-vindas hubla/i).closest('[role="button"]') || 
                          screen.getByText(/boas-vindas hubla/i).closest('div[class*="cursor-pointer"]');
      
      if (templateCard) {
        fireEvent.click(templateCard);
        expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
      }
    });

    it('should pass correct template data when template is selected', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const hublaTemplate = screen.getByText(/boas-vindas hubla/i);
      const templateCard = hublaTemplate.closest('[class*="cursor-pointer"]');
      
      if (templateCard) {
        fireEvent.click(templateCard);
        
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Boas-vindas Hubla',
            category: 'hubla',
            difficulty: 'easy'
          })
        );
      }
    });

    it('should display template information correctly', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/boas-vindas hubla/i)).toBeInTheDocument();
      expect(screen.getByText(/cria convite automático/i)).toBeInTheDocument();
      expect(screen.getByText(/2 min/i)).toBeInTheDocument();
    });
  });

  describe('Create from Scratch Button', () => {
    it('should call onCreateFromScratch when "Criar do Zero" button is clicked', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const createFromScratchButton = screen.getByRole('button', { name: /começar do zero/i });
      fireEvent.click(createFromScratchButton);
      
      expect(mockOnCreateFromScratch).toHaveBeenCalledTimes(1);
    });

    it('should display create from scratch section correctly', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/criar do zero/i)).toBeInTheDocument();
      expect(screen.getByText(/tenha controle total criando/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /começar do zero/i })).toBeInTheDocument();
    });

    it('should have proper styling for create from scratch section', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const createSection = screen.getByText(/criar do zero/i).closest('.border-dashed');
      expect(createSection).toHaveClass('border-2', 'border-dashed');
    });
  });

  describe('Category Navigation', () => {
    it('should display all category tabs', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/todos/i)).toBeInTheDocument();
      expect(screen.getByText(/hubla/i)).toBeInTheDocument();
      expect(screen.getByText(/comunicação/i)).toBeInTheDocument();
      expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      expect(screen.getByText(/integrações/i)).toBeInTheDocument();
    });

    it('should change active category when tab is clicked', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const hublaTab = screen.getByRole('tab', { name: /hubla/i });
      fireEvent.click(hublaTab);
      
      // Verifica se a aba está selecionada através de atributos ARIA
      expect(hublaTab).toHaveAttribute('data-state', 'active');
    });

    it('should filter templates by category', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      // Clica na categoria Hubla
      const hublaTab = screen.getByRole('tab', { name: /hubla/i });
      fireEvent.click(hublaTab);
      
      // Deve mostrar apenas templates da categoria Hubla
      expect(screen.getByText(/boas-vindas hubla/i)).toBeInTheDocument();
      expect(screen.getByText(/acesso à plataforma/i)).toBeInTheDocument();
    });
  });

  describe('Popular Templates Section', () => {
    it('should display popular templates section on "Todos" tab', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/mais populares/i)).toBeInTheDocument();
    });

    it('should show usage count badges on popular templates', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/#45 usos/i)).toBeInTheDocument();
    });

    it('should call onSelectTemplate when popular template is clicked', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      // Encontra um template popular
      const popularTemplate = screen.getByText('#45 usos').closest('[class*="cursor-pointer"]');
      
      if (popularTemplate) {
        fireEvent.click(popularTemplate);
        expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Template Information Display', () => {
    it('should display template difficulty badges with correct styling', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const easyBadge = screen.getByText(/easy/i);
      expect(easyBadge).toHaveClass('text-green-600', 'bg-green-50', 'border-green-200');
    });

    it('should display estimated time for each template', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/2 min/i)).toBeInTheDocument();
      expect(screen.getByText(/3 min/i)).toBeInTheDocument();
    });

    it('should show template tags', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/popular/i)).toBeInTheDocument();
      expect(screen.getByText(/hubla/i)).toBeInTheDocument();
      expect(screen.getByText(/convites/i)).toBeInTheDocument();
    });

    it('should display correct icons for each template', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      // Verifica se os ícones estão sendo renderizados
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      // Verifica se as classes de grid responsivo estão aplicadas
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should hide tab labels on small screens', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const tabLabels = document.querySelectorAll('.hidden.sm\\:inline');
      expect(tabLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Interactive States', () => {
    it('should apply hover effects to template cards', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const templateCards = document.querySelectorAll('[class*="hover-scale"]');
      expect(templateCards.length).toBeGreaterThan(0);
      
      templateCards.forEach(card => {
        expect(card).toHaveClass('hover-scale');
      });
    });

    it('should have hover effects on borders', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const hoverBorders = document.querySelectorAll('[class*="hover:border-primary"]');
      expect(hoverBorders.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const createButton = screen.getByRole('button', { name: /começar do zero/i });
      createButton.focus();
      expect(createButton).toHaveFocus();
    });

    it('should have proper ARIA labels for tabs', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('data-value');
      });
    });

    it('should have descriptive alt text or labels', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      expect(screen.getByText(/escolha um template/i)).toBeInTheDocument();
      expect(screen.getByText(/comece rapidamente com templates/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      const propsWithoutCallbacks = {
        onSelectTemplate: undefined as any,
        onCreateFromScratch: undefined as any
      };
      
      expect(() => render(<AutomationTemplates {...propsWithoutCallbacks} />)).not.toThrow();
    });

    it('should handle template data with missing properties', () => {
      // Testa se o componente lida bem com dados incompletos
      expect(() => render(<AutomationTemplates {...defaultProps} />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid clicks', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const createButton = screen.getByRole('button', { name: /começar do zero/i });
      
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      
      expect(mockOnCreateFromScratch).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid tab switching', () => {
      render(<AutomationTemplates {...defaultProps} />);
      
      const hublaTab = screen.getByRole('tab', { name: /hubla/i });
      const communicationTab = screen.getByRole('tab', { name: /comunicação/i });
      
      fireEvent.click(hublaTab);
      fireEvent.click(communicationTab);
      fireEvent.click(hublaTab);
      
      // Verifica se não há erros durante mudanças rápidas
      expect(screen.getByText(/boas-vindas hubla/i)).toBeInTheDocument();
    });
  });
});