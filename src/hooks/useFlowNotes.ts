import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { debounce } from 'lodash';

interface FlowNotes {
  [nodeId: string]: string;
}

interface UseFlowNotesProps {
  solutionId: string;
  userId: string;
  initialNotes?: FlowNotes;
}

export const useFlowNotes = ({ 
  solutionId, 
  userId,
  initialNotes = {}
}: UseFlowNotesProps) => {
  const [notes, setNotes] = useState<FlowNotes>(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const { log, logError } = useLogging();

  // Carregar notas do banco ao montar
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_generated_solutions')
          .select('user_notes')
          .eq('id', solutionId)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data?.user_notes) {
          setNotes(data.user_notes as FlowNotes);
          log('Flow notes loaded', { solutionId, noteCount: Object.keys(data.user_notes).length });
        }
      } catch (error) {
        logError('Error loading flow notes', error);
      }
    };

    loadNotes();
  }, [solutionId, userId]);

  // Função para salvar no banco (com debounce)
  const saveNotesToDB = useCallback(
    debounce(async (updatedNotes: FlowNotes) => {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('ai_generated_solutions')
          .update({ 
            user_notes: updatedNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', solutionId)
          .eq('user_id', userId);

        if (error) throw error;

        log('Flow notes saved', { solutionId, noteCount: Object.keys(updatedNotes).length });
      } catch (error) {
        logError('Error saving flow notes', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000), // Debounce de 1 segundo
    [solutionId, userId]
  );

  // Atualizar nota de um nó
  const updateNote = useCallback((nodeId: string, content: string) => {
    const updatedNotes = {
      ...notes,
      [nodeId]: content
    };
    
    setNotes(updatedNotes);
    saveNotesToDB(updatedNotes);
  }, [notes, saveNotesToDB]);

  // Deletar nota
  const deleteNote = useCallback((nodeId: string) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[nodeId];
    
    setNotes(updatedNotes);
    saveNotesToDB(updatedNotes);
  }, [notes, saveNotesToDB]);

  // Obter nota de um nó
  const getNote = useCallback((nodeId: string) => {
    return notes[nodeId] || '';
  }, [notes]);

  return {
    notes,
    isSaving,
    updateNote,
    deleteNote,
    getNote
  };
};
