
import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Briefcase, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface NetworkMatchCardProps {
  match: {
    id: string
    matched_user_id: string
    matched_user_name: string
    matched_user_avatar: string
    matched_user_company: string
    matched_user_position: string
    compatibility_score: number
    match_reason: string
    match_strengths: string[]
    suggested_topics: string[]
    status: string
  }
}

export const NetworkMatchCard = ({ match }: NetworkMatchCardProps) => {
  const { toast } = useToast()

  const connectWithUser = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) throw new Error('Usuário não autenticado')

      const { error: connectionError } = await supabase
        .from('network_connections')
        .insert({
          requester_id: sessionData.session.user.id,
          recipient_id: match.matched_user_id,
          status: 'pending',
        })

      if (connectionError) throw connectionError

      toast({
        title: 'Solicitação enviada!',
        description: `Sua solicitação de conexão foi enviada para ${match.matched_user_name}.`,
      })
    } catch (error) {
      console.error('Error connecting with user:', error)
      toast({
        title: 'Erro ao conectar',
        description: 'Não foi possível enviar a solicitação de conexão.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={match.matched_user_avatar} />
            <AvatarFallback>
              {match.matched_user_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{match.matched_user_name}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {match.matched_user_position} em {match.matched_user_company}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-500" />
          {(match.compatibility_score * 100).toFixed(0)}%
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Por que conectar?</h4>
        <p className="text-sm text-muted-foreground">{match.match_reason}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Tópicos sugeridos</h4>
        <div className="flex flex-wrap gap-2">
          {match.suggested_topics?.map((topic, index) => (
            <Badge key={index} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          className="flex-1 bg-viverblue hover:bg-viverblue/90"
          onClick={connectWithUser}
        >
          <Users className="h-4 w-4 mr-2" />
          Conectar
        </Button>
        <Button variant="outline" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Mensagem
        </Button>
      </div>
    </Card>
  )
}
