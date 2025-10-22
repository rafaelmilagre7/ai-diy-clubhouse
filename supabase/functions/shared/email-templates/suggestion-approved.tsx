import {
  Button,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface SuggestionApprovedEmailProps {
  userName: string
  suggestionTitle: string
  approverName: string
  approvalMessage?: string
  suggestionUrl: string
  votesCount: number
  unsubscribeUrl?: string
}

export const SuggestionApprovedEmail = ({
  userName = 'Usuário',
  suggestionTitle = 'Sua Sugestão',
  approverName = 'Administrador',
  approvalMessage,
  suggestionUrl = 'https://viverdeia.ai',
  votesCount = 0,
  unsubscribeUrl,
}: SuggestionApprovedEmailProps) => (
  <MasterTemplate
    preview={`✅ Sua sugestão "${suggestionTitle}" foi aprovada!`}
    heading="✅ Sugestão Aprovada!"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Parabéns, {userName}! 🎉</Text>
    
    <Text style={text}>
      Sua sugestão foi <strong>aprovada</strong> e agora está ativa na plataforma!
    </Text>

    <Section style={approvalCard}>
      <div style={approvalIcon}>✅</div>
      <Text style={suggestionTitle as any}>{suggestionTitle}</Text>
      
      {approvalMessage && (
        <Section style={messageBox}>
          <div style={messageLabel}>💬 Mensagem do aprovador:</div>
          <Text style={messageText as any}>"{approvalMessage}"</Text>
        </Section>
      )}

      <Section style={statsBox}>
        <div style={statItem}>
          <div style={statNumber}>{votesCount}</div>
          <div style={statLabel}>👍 Votos recebidos</div>
        </div>
      </Section>
    </Section>

    <Section style={buttonSection}>
      <Button href={suggestionUrl} style={button}>
        🚀 Ver Sugestão Aprovada
      </Button>
    </Section>

    <Text style={helpText}>
      Sua ideia está fazendo a diferença! Continue contribuindo. ✨
    </Text>
  </MasterTemplate>
)

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

const approvalCard = {
  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  border: '3px solid #10b981',
  borderRadius: '16px',
  padding: '40px 32px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const approvalIcon = {
  fontSize: '64px',
  marginBottom: '16px',
}

const suggestionTitle = {
  color: '#065f46',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '12px 0',
}

const messageBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '10px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'left' as const,
}

const messageLabel = {
  color: '#047857',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '8px',
}

const messageText = {
  color: '#065f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic',
}

const statsBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '24px',
}

const statItem = {
  textAlign: 'center' as const,
}

const statNumber = {
  color: '#047857',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 6px',
}

const statLabel = {
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '500',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontStyle: 'italic',
}

export default SuggestionApprovedEmail
