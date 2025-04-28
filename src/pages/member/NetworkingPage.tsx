
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NetworkMatchCard } from '@/components/networking/NetworkMatchCard'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Users } from 'lucide-react'
import { useLogging } from '@/hooks/useLogging'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const NetworkingPage = () => {
  const { toast } = useToast()
  const { logError } = useLogging()
  const [compatibilityFilter, setCompatibilityFilter] = useState('all')

  // Buscar diretamente os perfis dos usuários com informações de compatibilidade
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['network-profiles', compatibilityFilter],
    queryFn: async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !sessionData.session) {
          throw new Error('Usuário não autenticado')
        }

        const currentUserId = sessionData.session.user.id

        // Buscar perfis de onboarding com dados de personalização
        const { data, error } = await supabase
          .from('onboarding_profile_view')
          .select('*')
          .neq('user_id', currentUserId)

        if (error) throw error

        // Buscar dados do usuário atual para calcular compatibilidade
        const { data: currentUser, error: currentUserError } = await supabase
          .from('onboarding_profile_view')
          .select('*')
          .eq('user_id', currentUserId)
          .single()

        if (currentUserError) {
          throw new Error('Não foi possível carregar seus dados de perfil')
        }

        // Calcular compatibilidade entre perfis
        const profilesWithCompatibility = data.map(profile => {
          const compatibility = calculateCompatibility(currentUser, profile)
          return {
            ...profile,
            compatibility_score: compatibility.score,
            match_reason: compatibility.reason,
            match_strengths: compatibility.strengths,
            suggested_topics: compatibility.topics
          }
        })

        // Filtrar por compatibilidade se necessário
        let filteredProfiles = profilesWithCompatibility
        if (compatibilityFilter === 'high') {
          filteredProfiles = profilesWithCompatibility.filter(p => p.compatibility_score >= 0.7)
        } else if (compatibilityFilter === 'medium') {
          filteredProfiles = profilesWithCompatibility.filter(p => p.compatibility_score >= 0.4 && p.compatibility_score < 0.7)
        }

        // Ordenar por compatibilidade
        return filteredProfiles.sort((a, b) => b.compatibility_score - a.compatibility_score)
      } catch (error) {
        logError('fetch-profiles', error)
        toast({
          title: 'Erro ao carregar perfis',
          description: 'Não foi possível carregar os perfis dos membros. Tente novamente mais tarde.',
          variant: 'destructive',
        })
        throw error
      }
    },
  })

  // Função para calcular compatibilidade entre perfis
  const calculateCompatibility = (currentUser: any, otherUser: any) => {
    // Extrair interesses e habilidades dos usuários
    const currentUserInterests = extractArray(currentUser.experience_personalization?.interests)
    const currentUserSkills = extractArray(currentUser.experience_personalization?.skills_to_share)
    const otherUserInterests = extractArray(otherUser.experience_personalization?.interests)
    const otherUserSkills = extractArray(otherUser.experience_personalization?.skills_to_share)
    
    // Calcular pontuações de compatibilidade
    let score = 0
    const commonInterests = currentUserInterests.filter(i => otherUserInterests.includes(i))
    const complementarySkills = currentUserInterests.filter(i => otherUserSkills.includes(i))
    
    // Aumentar pontuação com base em interesses comuns e habilidades complementares
    if (commonInterests.length > 0) score += 0.3 * (commonInterests.length / Math.max(currentUserInterests.length, 1))
    if (complementarySkills.length > 0) score += 0.7 * (complementarySkills.length / Math.max(currentUserInterests.length, 1))
    
    // Garantir que a pontuação esteja entre 0 e 1
    score = Math.min(Math.max(score, 0), 1)
    
    // Gerar razão do match e pontos fortes
    const reason = commonInterests.length > 0 
      ? `Vocês têm ${commonInterests.length} interesses em comum e ${otherUser.profile_name} pode compartilhar conhecimentos em áreas do seu interesse.`
      : `${otherUser.profile_name} tem habilidades que podem complementar seus interesses.`
    
    const strengths = [
      ...(commonInterests.length > 0 ? [`Interesses em comum: ${commonInterests.slice(0, 3).join(', ')}`] : []),
      ...(complementarySkills.length > 0 ? [`Habilidades complementares: ${complementarySkills.slice(0, 3).join(', ')}`] : []),
    ]
    
    // Gerar tópicos sugeridos para conversas
    const topics = [
      ...(commonInterests.length > 0 ? commonInterests.slice(0, 2) : []),
      ...(complementarySkills.length > 0 ? complementarySkills.slice(0, 2) : []),
    ]
    
    return {
      score,
      reason,
      strengths,
      topics
    }
  }
  
  // Utilidade para extrair arrays de dados JSON
  const extractArray = (jsonData: any): string[] => {
    if (!jsonData) return []
    try {
      if (typeof jsonData === 'string') {
        const parsed = JSON.parse(jsonData)
        return Array.isArray(parsed) ? parsed : []
      }
      return Array.isArray(jsonData) ? jsonData : []
    } catch (e) {
      return []
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Networking</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Conecte-se com outros membros baseado em interesses e habilidades complementares
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Select 
            value={compatibilityFilter} 
            onValueChange={setCompatibilityFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por compatibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              <SelectItem value="high">Alta compatibilidade</SelectItem>
              <SelectItem value="medium">Média compatibilidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : profiles?.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <h3 className="text-lg font-semibold">Nenhum membro encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Não encontramos outros membros com base no filtro atual. Tente alterar o filtro ou volte mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {profiles?.map((profile) => (
            <NetworkMatchCard 
              key={profile.user_id} 
              match={{
                id: profile.user_id,
                matched_user_id: profile.user_id,
                matched_user_name: profile.profile_name || 'Membro',
                matched_user_avatar: profile.profile_avatar || '',
                matched_user_company: profile.profile_company || 'Empresa não informada',
                matched_user_position: profile.professional_info?.current_position || 'Cargo não informado',
                matched_user_email: profile.personal_info?.email || '',
                matched_user_phone: profile.personal_info?.phone || undefined,
                compatibility_score: profile.compatibility_score || 0,
                match_reason: profile.match_reason || '',
                match_strengths: profile.match_strengths || [],
                suggested_topics: profile.suggested_topics || [],
                status: 'pending'
              }} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NetworkingPage
