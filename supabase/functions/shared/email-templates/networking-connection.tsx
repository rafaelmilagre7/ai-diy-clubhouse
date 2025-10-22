import {
  Button,
  Img,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface NetworkingConnectionEmailProps {
  userName: string
  senderName: string
  senderAvatar?: string
  senderCompany?: string
  senderPosition?: string
  connectionUrl: string
  unsubscribeUrl?: string
}

export const NetworkingConnectionEmail = ({
  userName = 'Usuário',
  senderName = 'Novo Contato',
  senderAvatar,
  senderCompany,
  senderPosition,
  connectionUrl = 'https://viverdeia.ai',
  unsubscribeUrl,
}: NetworkingConnectionEmailProps) => (
  <MasterTemplate
    preview={`🤝 ${senderName} quer se conectar com você`}
    heading="🤝 Nova Conexão"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}!</Text>
    
    <Text style={text}>
      Você tem uma nova solicitação de conexão:
    </Text>

    <Section style={profileCard}>
      {senderAvatar && (
        <Img
          src={senderAvatar}
          width="80"
          height="80"
          alt={senderName}
          style={avatar}
        />
      )}
      <Text style={profileName}>{senderName}</Text>
      {senderPosition && (
        <Text style={profileInfo}>
          💼 {senderPosition}
        </Text>
      )}
      {senderCompany && (
        <Text style={profileInfo}>
          🏢 {senderCompany}
        </Text>
      )}
    </Section>

    <Section style={buttonSection}>
      <Button href={connectionUrl} style={buttonPrimary}>
        ✅ Aceitar Conexão
      </Button>
      <Button href={connectionUrl} style={buttonSecondary}>
        👤 Ver Perfil
      </Button>
    </Section>

    <Text style={helpText}>
      💡 Expanda sua rede e descubra novas oportunidades de negócio!
    </Text>
  </MasterTemplate>
)

// ===== STYLES =====

const greeting = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0',
}

const profileCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '32px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const avatar = {
  borderRadius: '50%',
  margin: '0 auto 16px',
  border: '3px solid #6366f1',
}

const profileName = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '12px 0 8px',
}

const profileInfo = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '6px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const buttonPrimary = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 8px 8px',
  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
}

const buttonSecondary = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#6366f1',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 8px 8px',
  border: '2px solid #6366f1',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontStyle: 'italic',
}

export default NetworkingConnectionEmail
