import {
  Button,
  Img,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface GamificationBadgeEmailProps {
  userName: string
  badgeName: string
  badgeDescription: string
  badgeIcon?: string
  badgeUrl: string
  totalBadges: number
  unsubscribeUrl?: string
}

export const GamificationBadgeEmail = ({
  userName = 'Usuário',
  badgeName = 'Conquistador',
  badgeDescription = 'Você desbloqueou uma nova conquista!',
  badgeIcon,
  badgeUrl = 'https://viverdeia.ai',
  totalBadges = 1,
  unsubscribeUrl,
}: GamificationBadgeEmailProps) => (
  <MasterTemplate
    preview={`🏆 Novo badge: ${badgeName}!`}
    heading="🏆 Conquista Desbloqueada!"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Parabéns, {userName}! 🎉</Text>
    
    <Text style={text}>
      Você acabou de desbloquear uma nova conquista na plataforma:
    </Text>

    <Section style={badgeCard}>
      <div style={badgeIconContainer}>
        {badgeIcon ? (
          <Img
            src={badgeIcon}
            width="100"
            height="100"
            alt={badgeName}
            style={badgeIconImg}
          />
        ) : (
          <div style={badgeIconPlaceholder}>🏆</div>
        )}
      </div>
      <Text style={badgeTitle}>{badgeName}</Text>
      <Text style={badgeDesc}>{badgeDescription}</Text>
      
      <div style={statsBox}>
        <div style={statItem}>
          <div style={statNumber}>{totalBadges}</div>
          <div style={statLabel}>Total de Badges</div>
        </div>
      </div>
    </Section>

    <Section style={buttonSection}>
      <Button href={badgeUrl} style={button}>
        🎖️ Ver Minha Coleção
      </Button>
    </Section>

    <Text style={helpText}>
      Continue participando e desbloqueie ainda mais conquistas! 🚀
    </Text>
  </MasterTemplate>
)

// ===== STYLES =====

const greeting = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const badgeCard = {
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '3px solid #f59e0b',
  borderRadius: '16px',
  padding: '40px 32px',
  margin: '32px 0',
  textAlign: 'center' as const,
  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
}

const badgeIconContainer = {
  marginBottom: '20px',
}

const badgeIconImg = {
  margin: '0 auto',
  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
}

const badgeIconPlaceholder = {
  fontSize: '80px',
  lineHeight: '100px',
  margin: '0 auto',
  textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const badgeTitle = {
  color: '#78350f',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
}

const badgeDesc = {
  color: '#92400e',
  fontSize: '15px',
  margin: '8px 0 24px',
}

const statsBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '24px',
}

const statItem = {
  textAlign: 'center' as const,
}

const statNumber = {
  color: '#78350f',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const statLabel = {
  color: '#92400e',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.4)',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontStyle: 'italic',
}

export default GamificationBadgeEmail
