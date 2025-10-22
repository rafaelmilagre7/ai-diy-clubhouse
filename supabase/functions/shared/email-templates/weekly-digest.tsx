import {
  Button,
  Hr,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface WeeklyDigestEmailProps {
  userName: string
  weekStart: string
  weekEnd: string
  newSuggestions: number
  newConnections: number
  badgesEarned: number
  totalLikes: number
  dashboardUrl: string
  unsubscribeUrl?: string
  topActivities?: Array<{
    icon: string
    title: string
    description: string
    url: string
  }>
}

export const WeeklyDigestEmail = ({
  userName = 'Usuário',
  weekStart = '01/01/2024',
  weekEnd = '07/01/2024',
  newSuggestions = 0,
  newConnections = 0,
  badgesEarned = 0,
  totalLikes = 0,
  dashboardUrl = 'https://viverdeia.ai',
  unsubscribeUrl,
  topActivities = [],
}: WeeklyDigestEmailProps) => (
  <MasterTemplate
    preview={`📊 Seu resumo semanal: ${weekStart} - ${weekEnd}`}
    heading="📊 Resumo Semanal"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}! 👋</Text>
    
    <Text style={text}>
      Aqui está o resumo da sua semana na plataforma <strong>Viver de IA</strong>:
    </Text>

    <Section style={periodBadge}>
      📅 {weekStart} - {weekEnd}
    </Section>

    {/* Stats Grid */}
    <Section style={statsGrid}>
      <div style={statCard}>
        <div style={statIcon}>💡</div>
        <div style={statNumber}>{newSuggestions}</div>
        <div style={statLabel}>Novas Sugestões</div>
      </div>
      <div style={statCard}>
        <div style={statIcon}>🤝</div>
        <div style={statNumber}>{newConnections}</div>
        <div style={statLabel}>Novas Conexões</div>
      </div>
      <div style={statCard}>
        <div style={statIcon}>🏆</div>
        <div style={statNumber}>{badgesEarned}</div>
        <div style={statLabel}>Badges Ganhos</div>
      </div>
      <div style={statCard}>
        <div style={statIcon}>❤️</div>
        <div style={statNumber}>{totalLikes}</div>
        <div style={statLabel}>Curtidas Recebidas</div>
      </div>
    </Section>

    {/* Top Activities */}
    {topActivities.length > 0 && (
      <>
        <Hr style={divider} />
        <Text style={sectionTitle}>🌟 Destaques da Semana</Text>
        
        {topActivities.map((activity, index) => (
          <Section key={index} style={activityCard}>
            <div style={activityIcon}>{activity.icon}</div>
            <div style={activityContent}>
              <Text style={activityTitle}>{activity.title}</Text>
              <Text style={activityDesc}>{activity.description}</Text>
            </div>
          </Section>
        ))}
      </>
    )}

    <Hr style={divider} />

    <Section style={buttonSection}>
      <Button href={dashboardUrl} style={button}>
        📈 Ver Dashboard Completo
      </Button>
    </Section>

    <Text style={motivationalText}>
      🚀 Continue assim! Sua participação está fazendo a diferença na comunidade.
    </Text>
  </MasterTemplate>
)

// ===== STYLES =====

const greeting = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0',
}

const periodBadge = {
  backgroundColor: '#d1fae5',
  color: '#065f46',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  margin: '32px 0',
}

const statCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
}

const statIcon = {
  fontSize: '32px',
  marginBottom: '8px',
}

const statNumber = {
  color: '#0ABAB5',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '8px 0 4px',
}

const statLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const sectionTitle = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
}

const activityCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '16px',
  margin: '12px 0',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
}

const activityIcon = {
  fontSize: '28px',
  minWidth: '40px',
}

const activityContent = {
  flex: '1',
}

const activityTitle = {
  color: '#111827',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 6px',
}

const activityDesc = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0ABAB5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px -1px rgba(10, 186, 181, 0.4)',
}

const motivationalText = {
  color: '#059669',
  fontSize: '15px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontWeight: '500',
  padding: '16px',
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
}

export default WeeklyDigestEmail
