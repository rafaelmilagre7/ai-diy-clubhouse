
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Star } from 'lucide-react'
import { ContactModal } from './ContactModal'

interface NetworkMatchCardProps {
  match: {
    id: string
    matched_user_id: string
    matched_user_name: string
    matched_user_avatar: string
    matched_user_company: string
    matched_user_position: string
    matched_user_email: string
    matched_user_phone?: string
    compatibility_score: number
    match_reason: string
    match_strengths: string[]
    suggested_topics: string[]
    status: string
  }
}

export const NetworkMatchCard = ({ match }: NetworkMatchCardProps) => {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <Card className="flex flex-col p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarImage src={match.matched_user_avatar} />
            <AvatarFallback>
              {match.matched_user_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{match.matched_user_name}</h3>
            <p className="text-sm text-muted-foreground">
              {match.matched_user_position} em {match.matched_user_company}
            </p>
            <Badge variant="secondary" className="inline-flex items-center mt-2">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {(match.compatibility_score * 100).toFixed(0)}% de compatibilidade
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Por que conectar?</h4>
            <p className="text-sm text-muted-foreground">{match.match_reason}</p>
          </div>

          {match.suggested_topics && match.suggested_topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tópicos sugeridos</h4>
              <div className="flex flex-wrap gap-2">
                {match.suggested_topics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            className="w-full bg-viverblue hover:bg-viverblue/90"
            onClick={() => setShowContact(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Ver Contato
          </Button>
        </div>
      </Card>

      <ContactModal 
        open={showContact}
        onOpenChange={setShowContact}
        contactInfo={{
          name: match.matched_user_name,
          email: match.matched_user_email,
          phone: match.matched_user_phone,
        }}
      />
    </>
  )
}
