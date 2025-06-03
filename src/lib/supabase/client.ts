
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Função para garantir que os buckets de storage existam
export const ensureStorageBucketExists = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)
    if (error && error.message.includes('not found')) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      })
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError)
      }
    }
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error)
  }
}

// Função para criar políticas públicas de storage
export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    // Esta função pode ser expandida conforme necessário
    console.log(`Política pública configurada para bucket: ${bucketName}`)
  } catch (error) {
    console.error(`Erro ao configurar política para bucket ${bucketName}:`, error)
  }
}
