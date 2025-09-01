/**
 * Sistema de validação e correção de IDs para o sistema de learning
 * Resolve problemas de IDs incorretos/corrompidos
 */

import { supabase } from '@/lib/supabase';

// Mapeamento de IDs conhecidos incorretos para corretos
const ID_CORRECTIONS: Record<string, string> = {
  // Formação 1.0 - Course ID
  '0681d8e3-7092-4307-b95c-69b18976053e': '0681d0f6-a85f-49ab-b464-2c09b402c495',
  
  // Formação 1.0 - Module ID  
  '78109693-8c8d-404a-8047-4ca5d4593f82': '78199693-8c0d-404a-8b47-4ca5d4593f82',
  
  // Formação Lovable - Course ID
  '3e74c1e6-0e5a-476c-b9eb-ed8f24b632dc': '3e74c4e6-0e0a-476c-b9eb-ed8f24b632dc',
  
  // Formação Lovable - Module ID
  'c2bb1a1b-c9b9-4982-9c6b-f1c5b4a35e22': 'c2bb1a4b-c9b9-4982-9c6b-f1c5b4a35e22',
};

/**
 * Corrige um ID se estiver na lista de IDs conhecidos incorretos
 */
export function correctId(id: string): string {
  const correctedId = ID_CORRECTIONS[id];
  if (correctedId) {
    console.log(`🔧 [ID-CORRECTION] Corrigindo ID: ${id} → ${correctedId}`);
    return correctedId;
  }
  return id;
}

/**
 * Valida se um ID existe no banco de dados
 */
export async function validateCourseId(courseId: string): Promise<{ isValid: boolean; correctedId?: string }> {
  try {
    console.log(`🔍 [VALIDATION] Validando course ID: ${courseId}`);
    
    // Primeiro tenta o ID original
    const { data: originalCourse, error: originalError } = await supabase
      .from('learning_courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (originalCourse && !originalError) {
      console.log(`✅ [VALIDATION] Course ID válido: ${courseId}`);
      return { isValid: true };
    }

    // Se falhou, tenta o ID corrigido
    const correctedId = correctId(courseId);
    if (correctedId !== courseId) {
      const { data: correctedCourse, error: correctedError } = await supabase
        .from('learning_courses')
        .select('id, title')
        .eq('id', correctedId)
        .single();

      if (correctedCourse && !correctedError) {
        console.log(`✅ [VALIDATION] Course ID corrigido é válido: ${correctedId}`);
        return { isValid: true, correctedId };
      }
    }

    console.warn(`❌ [VALIDATION] Course ID inválido: ${courseId}`);
    return { isValid: false };
    
  } catch (error) {
    console.error(`💥 [VALIDATION] Erro ao validar course ID:`, error);
    return { isValid: false };
  }
}

/**
 * Valida se um module ID existe no banco de dados
 */
export async function validateModuleId(moduleId: string): Promise<{ isValid: boolean; correctedId?: string }> {
  try {
    console.log(`🔍 [VALIDATION] Validando module ID: ${moduleId}`);
    
    // Primeiro tenta o ID original
    const { data: originalModule, error: originalError } = await supabase
      .from('learning_modules')
      .select('id, title')
      .eq('id', moduleId)
      .single();

    if (originalModule && !originalError) {
      console.log(`✅ [VALIDATION] Module ID válido: ${moduleId}`);
      return { isValid: true };
    }

    // Se falhou, tenta o ID corrigido
    const correctedId = correctId(moduleId);
    if (correctedId !== moduleId) {
      const { data: correctedModule, error: correctedError } = await supabase
        .from('learning_modules')
        .select('id, title')
        .eq('id', correctedId)
        .single();

      if (correctedModule && !correctedError) {
        console.log(`✅ [VALIDATION] Module ID corrigido é válido: ${correctedId}`);
        return { isValid: true, correctedId };
      }
    }

    console.warn(`❌ [VALIDATION] Module ID inválido: ${moduleId}`);
    return { isValid: false };
    
  } catch (error) {
    console.error(`💥 [VALIDATION] Erro ao validar module ID:`, error);
    return { isValid: false };
  }
}

/**
 * Valida se um lesson ID existe no banco de dados
 */
export async function validateLessonId(lessonId: string): Promise<{ isValid: boolean; correctedId?: string }> {
  try {
    console.log(`🔍 [VALIDATION] Validando lesson ID: ${lessonId}`);
    
    // Primeiro tenta o ID original
    const { data: originalLesson, error: originalError } = await supabase
      .from('learning_lessons')
      .select('id, title')
      .eq('id', lessonId)
      .single();

    if (originalLesson && !originalError) {
      console.log(`✅ [VALIDATION] Lesson ID válido: ${lessonId}`);
      return { isValid: true };
    }

    // Para lessons, não temos correções automáticas, mas podemos buscar por título similar
    console.warn(`❌ [VALIDATION] Lesson ID inválido: ${lessonId}`);
    return { isValid: false };
    
  } catch (error) {
    console.error(`💥 [VALIDATION] Erro ao validar lesson ID:`, error);
    return { isValid: false };
  }
}

/**
 * Busca um curso por título como fallback
 */
export async function findCourseByTitle(title: string): Promise<string | null> {
  try {
    console.log(`🔍 [FALLBACK] Buscando curso por título: ${title}`);
    
    const { data: course, error } = await supabase
      .from('learning_courses')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .single();

    if (course && !error) {
      console.log(`✅ [FALLBACK] Curso encontrado por título: ${course.id}`);
      return course.id;
    }

    return null;
  } catch (error) {
    console.error(`💥 [FALLBACK] Erro ao buscar curso por título:`, error);
    return null;
  }
}

/**
 * Limpa todos os caches relacionados ao learning
 */
export function clearLearningCaches() {
  console.log(`🧹 [CACHE] Limpando caches do learning...`);
  
  // Limpar localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('learning') || key.includes('course') || key.includes('lesson') || key.includes('module'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ [CACHE] Removido: ${key}`);
  });

  // Limpar sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('learning') || key.includes('course') || key.includes('lesson') || key.includes('module'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ [CACHE] Session removido: ${key}`);
  });

  console.log(`✅ [CACHE] Limpeza concluída: ${keysToRemove.length + sessionKeysToRemove.length} itens removidos`);
}