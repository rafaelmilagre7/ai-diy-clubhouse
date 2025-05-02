
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { moduleId } = req.query;

  if (!moduleId || typeof moduleId !== 'string') {
    return res.status(400).json({ error: 'Module ID is required' });
  }

  try {
    // Buscar a maior ordem atual para as aulas deste módulo
    const { data, error } = await supabase
      .from('learning_lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // Se não houver aulas, começar com 0, caso contrário incrementar o maior valor
    const nextOrderIndex = data && data.length > 0 ? data[0].order_index + 1 : 0;
    
    return res.status(200).json({ 
      data: { nextOrderIndex },
      success: true 
    });
  } catch (error: any) {
    console.error('Erro ao determinar próximo índice de ordem:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro interno do servidor',
      success: false
    });
  }
}
