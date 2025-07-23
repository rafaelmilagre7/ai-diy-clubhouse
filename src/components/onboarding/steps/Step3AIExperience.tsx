import React, { useState } from 'react';
import { Bot, Zap, CheckSquare } from 'lucide-react';
import { useTools } from '@/hooks/useTools';

interface AIExperienceData {
  experience_level: string;
  implementation_status: string;
  implementation_approach: string;
  current_tools: string[];
}

interface Step3AIExperienceProps {
  initialData?: Partial<AIExperienceData>;
  onDataChange: (data: Partial<AIExperienceData>) => void;
  onNext: () => void;
}

export const Step3AIExperience: React.FC<Step3AIExperienceProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  // Estados básicos
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experience_level || '');
  const [implementationStatus, setImplementationStatus] = useState(initialData?.implementation_status || '');
  const [implementationApproach, setImplementationApproach] = useState(initialData?.implementation_approach || '');
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.current_tools || []);

  const { tools, isLoading } = useTools();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!experienceLevel || !implementationStatus || !implementationApproach) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Notificar dados finais
    const finalData: AIExperienceData = {
      experience_level: experienceLevel,
      implementation_status: implementationStatus,
      implementation_approach: implementationApproach,
      current_tools: selectedTools
    };

    console.log('[Step3] Enviando dados:', finalData);
    onDataChange(finalData);
    onNext();
  };

  const handleToolToggle = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter(t => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  };

  // Simplificar ferramentas - apenas as primeiras 10 para teste
  const simpleTools = tools.slice(0, 10);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Bot size={64} style={{ margin: '0 auto 16px', color: '#0066cc' }} />
        <p style={{ color: '#666', fontSize: '18px' }}>
          Vamos entender sua experiência atual com IA para criar o melhor plano de aprendizado
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Nível de experiência */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500' }}>
            <Zap size={16} />
            Qual é seu nível de experiência com IA?
          </label>
          <select 
            value={experienceLevel} 
            onChange={(e) => setExperienceLevel(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione seu nível</option>
            <option value="beginner">Iniciante - Nunca usei ferramentas de IA</option>
            <option value="basic">Básico - Uso algumas ferramentas ocasionalmente</option>
            <option value="intermediate">Intermediário - Uso IA regularmente no trabalho</option>
            <option value="advanced">Avançado - Implemento soluções de IA na empresa</option>
          </select>
        </div>

        {/* Status de implementação */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Qual é o status da implementação de IA na sua empresa?
          </label>
          <select 
            value={implementationStatus} 
            onChange={(e) => setImplementationStatus(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione o status atual</option>
            <option value="not_started">Ainda não começamos</option>
            <option value="exploring">Estamos explorando possibilidades</option>
            <option value="testing">Testando algumas ferramentas</option>
            <option value="implementing">Implementando soluções</option>
            <option value="advanced">Já temos IA integrada aos processos</option>
          </select>
        </div>

        {/* Abordagem de implementação */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Como pretende implementar IA na sua empresa?
          </label>
          <select 
            value={implementationApproach} 
            onChange={(e) => setImplementationApproach(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">Selecione sua abordagem</option>
            <option value="myself">Eu mesmo vou fazer</option>
            <option value="team">Meu time</option>
            <option value="hire">Quero contratar</option>
          </select>
        </div>

        {/* Ferramentas */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '500' }}>
            <CheckSquare size={16} />
            Quais ferramentas de IA você já usa? (selecione todas que se aplicam)
          </label>
          
          {isLoading ? (
            <p>Carregando ferramentas...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {simpleTools.map((tool) => (
                <label 
                  key={tool.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedTools.includes(tool.name) ? '#f0f8ff' : '#fff'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.name)}
                    onChange={() => handleToolToggle(tool.name)}
                  />
                  <span style={{ fontSize: '14px' }}>{tool.name}</span>
                </label>
              ))}
              
              {/* Opção "Nenhuma ainda" */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedTools.includes('Nenhuma ainda') ? '#f0f8ff' : '#fff'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes('Nenhuma ainda')}
                  onChange={() => handleToolToggle('Nenhuma ainda')}
                />
                <span style={{ fontSize: '14px' }}>Nenhuma ainda</span>
              </label>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={!experienceLevel || !implementationStatus || !implementationApproach}
          style={{ 
            width: '100%', 
            padding: '12px 24px', 
            backgroundColor: experienceLevel && implementationStatus && implementationApproach ? '#0066cc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: experienceLevel && implementationStatus && implementationApproach ? 'pointer' : 'not-allowed'
          }}
        >
          Continuar
        </button>
      </form>
    </div>
  );
};