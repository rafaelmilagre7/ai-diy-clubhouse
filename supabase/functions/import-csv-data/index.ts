import { getSupabaseServiceClient } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseServiceClient();
    
    console.log('🔄 [CSV-IMPORT] Iniciando importação do CSV...');
    
    // Ler o arquivo CSV
    const csvResponse = await fetch('https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/certificates/usuarios_adicionais.csv');
    
    if (!csvResponse.ok) {
      throw new Error(`Erro ao carregar CSV: ${csvResponse.status}`);
    }
    
    const csvText = await csvResponse.text();
    const lines = csvText.split('\n');
    
    console.log(`📄 [CSV-IMPORT] CSV carregado com ${lines.length} linhas`);
    
    // Processar cabeçalho para encontrar índices das colunas
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const emailIndex = 1; // Coluna 2 (índice 1) - Email do usuário
    const masterEmailIndex = 7; // Coluna 8 (índice 7) - Acesso vinculado a
    
    console.log('📋 [CSV-IMPORT] Cabeçalhos encontrados:', headers);
    
    const updates: Array<{userEmail: string, masterEmail: string}> = [];
    let processedLines = 0;
    
    // Processar cada linha do CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const userEmail = values[emailIndex]?.toLowerCase().trim();
      const masterEmail = values[masterEmailIndex]?.toLowerCase().trim();
      
      if (userEmail && masterEmail && userEmail !== masterEmail) {
        updates.push({ userEmail, masterEmail });
        processedLines++;
      }
    }
    
    console.log(`🔍 [CSV-IMPORT] ${processedLines} linhas processadas para update`);
    
    // Executar updates em lotes
    let updatedCount = 0;
    let errorCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ master_email: update.masterEmail })
            .eq('email', update.userEmail)
            .is('master_email', null); // Só atualizar se master_email for NULL
          
          if (!error) {
            updatedCount++;
          } else {
            console.warn(`❌ [CSV-IMPORT] Erro ao atualizar ${update.userEmail}:`, error.message);
            errorCount++;
          }
        } catch (err) {
          console.warn(`❌ [CSV-IMPORT] Erro interno para ${update.userEmail}:`, err);
          errorCount++;
        }
      }
      
      // Log do progresso a cada lote
      console.log(`📊 [CSV-IMPORT] Progresso: ${Math.min(i + batchSize, updates.length)}/${updates.length} processados`);
    }
    
    // Verificar estatísticas finais
    const { data: stats, error: statsError } = await supabase.rpc('get_user_stats_corrected');
    
    const result = {
      success: true,
      message: `Importação concluída! ${updatedCount} usuários atualizados com master_email`,
      details: {
        totalLinesProcessed: processedLines,
        usersUpdated: updatedCount,
        errors: errorCount,
        finalStats: stats || null
      }
    };
    
    console.log('✅ [CSV-IMPORT] Importação finalizada:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('🚨 [CSV-IMPORT] Erro crítico:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Falha na importação do CSV'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});