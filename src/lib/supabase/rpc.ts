
import { supabase } from "./index";

/**
 * Cria políticas públicas de acesso para um bucket específico
 * @param bucketName Nome do bucket para aplicar a política
 * @returns Um objeto indicando o status da operação
 */
export async function createStoragePublicPolicy(bucketName: string) {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`[Storage] Erro ao listar buckets: ${listError.message}`);
      return { success: false, error: listError };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Se o bucket já existir, apenas configurar as políticas
    if (bucketExists) {
      console.log(`[Storage] Bucket ${bucketName} já existe`);
      
      // Tenta chamar o RPC para configurar as políticas
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_storage_public_policy', {
          bucket_name: bucketName
        });
        
        if (rpcError) {
          console.error(`[Storage] Erro ao configurar política para bucket ${bucketName}: ${rpcError.message}`);
          // Mesmo com erro nas políticas, consideramos que o bucket existe
          return { success: true, data: { bucket_exists: true, policies_error: rpcError.message } };
        }
        
        return { success: true, data: rpcData };
      } catch (rpcErr) {
        console.error('[Storage] Erro ao chamar RPC para políticas:', rpcErr);
        // Mesmo com erro na chamada RPC, consideramos que o bucket existe
        return { success: true, data: { bucket_exists: true, rpc_error: String(rpcErr) } };
      }
    }
    
    // Se não existir, tentar criar
    console.log(`[Storage] Criando bucket ${bucketName}...`);
    
    try {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error(`[Storage] Erro ao criar bucket ${bucketName}: ${createError.message}`);
        return { success: false, error: createError };
      }
      
      console.log(`[Storage] Bucket ${bucketName} criado com sucesso`);
      
      // Tenta configurar as políticas para o bucket recém-criado
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_storage_public_policy', {
          bucket_name: bucketName
        });
        
        if (rpcError) {
          console.error(`[Storage] Erro ao configurar política para bucket ${bucketName}: ${rpcError.message}`);
          // Bucket criado, mas com erro nas políticas
          return { success: true, data: { bucket_created: true, policies_error: rpcError.message } };
        }
        
        return { success: true, data: rpcData };
      } catch (rpcErr) {
        console.error('[Storage] Erro ao chamar RPC para políticas:', rpcErr);
        // Bucket criado, mas com erro na chamada RPC
        return { success: true, data: { bucket_created: true, rpc_error: String(rpcErr) } };
      }
    } catch (createErr) {
      console.error('[Storage] Erro ao criar bucket:', createErr);
      return { success: false, error: String(createErr) };
    }
  } catch (error) {
    console.error("[Storage] Erro ao verificar/criar bucket:", error);
    return { success: false, error };
  }
}

/**
 * Verifica se uma tabela existe e retorna suas colunas
 * @param tableName Nome da tabela para verificar
 * @returns Lista de colunas da tabela ou null se houver erro
 */
export async function getTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (error) {
      console.error(`[Schema] Erro ao verificar colunas da tabela ${tableName}:`, error);
      return null;
    }
    
    return data || [];
  } catch (error) {
    console.error(`[Schema] Exceção ao verificar tabela ${tableName}:`, error);
    return null;
  }
}
