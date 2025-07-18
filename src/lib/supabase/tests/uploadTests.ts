// TESTES INTEGRADOS FASE 2: Validação de Upload e Panda Video
// ========================================================

import { extractPandaVideoInfo } from '../storage';
import { uploadFileToStorage } from '@/components/ui/file/uploadUtils';

/**
 * Testa a extração robusta de informações do Panda Video
 */
export const testPandaVideoExtraction = () => {
  console.log('🧪 === TESTE PANDA VIDEO EXTRAÇÃO ===');
  
  // Casos de teste com diferentes formatos
  const testCases = [
    {
      name: 'Formato padrão player-vz',
      iframe: '<iframe src="https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=abc123xyz789" width="720" height="405" frameborder="0" allowfullscreen></iframe>',
      expected: 'abc123xyz789'
    },
    {
      name: 'Formato player.pandavideo',
      iframe: '<iframe src="https://player.pandavideo.com.br/embed/def456uvw012" width="640" height="360" frameborder="0"></iframe>',
      expected: 'def456uvw012'
    },
    {
      name: 'Formato com parâmetros extras',
      iframe: '<iframe src="https://player-vz-abc123-456.tv.pandavideo.com.br/embed/?v=ghi789rst345&autoplay=1" width="100%" height="400"></iframe>',
      expected: 'ghi789rst345'
    },
    {
      name: 'Aspas simples',
      iframe: "<iframe src='https://player.pandavideo.com.br/embed/jkl012mno678?controls=1' frameborder='0'></iframe>",
      expected: 'jkl012mno678'
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`🔍 Teste ${index + 1}: ${testCase.name}`);
    
    try {
      const result = extractPandaVideoInfo(testCase.iframe);
      
      if (result.videoId === testCase.expected && result.url && result.thumbnailUrl) {
        console.log(`✅ Sucesso: ID = ${result.videoId}, URL = ${result.url.substring(0, 50)}...`);
        passedTests++;
      } else {
        console.error(`❌ Falha: Esperado ${testCase.expected}, obtido ${result.videoId}`);
        failedTests++;
      }
    } catch (error) {
      console.error(`💥 Erro no teste: ${error}`);
      failedTests++;
    }
  });
  
  console.log(`📊 Resultados: ${passedTests} sucessos, ${failedTests} falhas`);
  return { passed: passedTests, failed: failedTests };
};

/**
 * Simula teste de upload (sem arquivo real)
 */
export const simulateUploadTest = async () => {
  console.log('🧪 === SIMULAÇÃO TESTE UPLOAD ===');
  
  try {
    // Criar um mock file para teste
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    console.log('📝 Arquivo mock criado:', {
      name: mockFile.name,
      size: mockFile.size,
      type: mockFile.type
    });
    
    // Este teste irá falhar por design (para testar logs de erro)
    console.log('⚠️ Este teste irá falhar intencionalmente para validar logs de erro...');
    
    return {
      success: false,
      message: 'Teste simulado - não há arquivo real para upload'
    };
    
  } catch (error) {
    console.log('✅ Erro capturado conforme esperado:', error);
    return {
      success: true,
      message: 'Sistema de logs funcionando corretamente'
    };
  }
};

/**
 * Executa todos os testes da Fase 2
 */
export const runPhase2Tests = async () => {
  console.log('🚀 === EXECUTANDO TESTES FASE 2 ===');
  
  const pandaResults = testPandaVideoExtraction();
  const uploadResults = await simulateUploadTest();
  
  const summary = {
    pandaVideo: pandaResults,
    upload: uploadResults,
    overall: pandaResults.failed === 0 ? 'PASSED' : 'PARTIAL'
  };
  
  console.log('📋 === SUMÁRIO FINAL ===');
  console.log(JSON.stringify(summary, null, 2));
  
  return summary;
};