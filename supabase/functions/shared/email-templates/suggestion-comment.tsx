import {
  Button,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface SuggestionCommentEmailProps {
  userName: string
  suggestionTitle: string
  commenterName: string
  commentText: string
  suggestionUrl: string
  unsubscribeUrl?: string
}

export const SuggestionCommentEmail = ({
  userName = 'Usuário',
  suggestionTitle = 'Sua Sugestão',
  commenterName = 'Usuário',
  commentText = 'Comentário...',
  suggestionUrl = 'https://viverdeia.ai',
  unsubscribeUrl,
}: SuggestionCommentEmailProps) => (
  <MasterTemplate
    preview={`💬 ${commenterName} comentou na sua sugestão`}
    heading="💬 Novo Comentário"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}!</Text>
    
    <Text style={text}>
      <strong>{commenterName}</strong> comentou na sua sugestão:
    </Text>

    <Section style={suggestionBox}>
      <div style={suggestionIcon}>💡</div>
      <Text style={suggestionTitle as any}>{suggestionTitle}</Text>
    </Section>

    <Section style={commentCard}>
      <div style={commentHeader}>
        <strong>{commenterName}</strong> disse:
      </div>
      <Text style={commentText as any}>"{commentText}"</Text>
    </Section>

    <Section style={buttonSection}>
      <Button href={suggestionUrl} style={button}>
        💬 Responder Comentário
      </Button>
    </Section>

    <Text style={helpText}>
      Continue a conversa e enriqueça a discussão! 🚀
    </Text>
  </MasterTemplate>
)

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

const suggestionBox = {
  backgroundColor: '#f3f4f6',
  borderLeft: '4px solid #6366f1',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const suggestionIcon = {
  fontSize: '24px',
}

const suggestionTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const commentCard = {
  backgroundColor: '#dbeafe',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}

const commentHeader = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '12px',
}

const commentText = {
  color: '#1e3a8a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontStyle: 'italic',
}

export default SuggestionCommentEmail
