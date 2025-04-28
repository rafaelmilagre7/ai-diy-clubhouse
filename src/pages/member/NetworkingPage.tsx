
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { NetworkMatchCard } from '@/components/networking/NetworkMatchCard'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const NetworkingPage = () => {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = React.useState(false)

  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ['network-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_match_view')
        .select('*')
        .order('compatibility_score', { ascending: false })

      if (error) throw error
      return data
    },
  })

  const generateMatches = async () => {
    try {
      setIsGenerating(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado')
      }

      const response = await supabase.functions.invoke('generate-matches', {
        body: { user_id: sessionData.session.user.id },
      })

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar matches')
      }

      toast({
        title: 'Matches atualizados!',
        description: 'Novas conexões foram encontradas para você.',
      })

      refetch()
    } catch (error) {
      console.error('Error generating matches:', error)
      toast({
        title: 'Erro ao gerar matches',
        description: 'Não foi possível atualizar suas conexões no momento. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Networking</h1>
          <p className="text-muted-foreground mt-2">
            Descubra conexões relevantes baseadas no seu perfil e interesses
          </p>
        </div>
        <Button 
          onClick={generateMatches} 
          className="bg-viverblue hover:bg-viverblue/90"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Conexões...
            </>
          ) : (
            'Encontrar Novas Conexões'
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : matches?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Nenhuma conexão encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Clique em "Encontrar Novas Conexões" para descobrir pessoas interessantes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches?.map((match) => (
            <NetworkMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NetworkingPage
