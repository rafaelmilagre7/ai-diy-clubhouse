import {
  Button,
  Link,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface SuggestionNewEmailProps {
  userName: string
  suggestionTitle: string
  suggestionDescription: string
  suggestionAuthor: string
  suggestionUrl: string
  categoryName: string
  unsubscribeUrl?: string
}

export const SuggestionNewEmail = ({
  userName = 'Usuário',
  suggestionTitle = 'Nova Sugestão',
  suggestionDescription = 'Descrição da sugestão...',
  suggestionAuthor = 'Autor',
  suggestionUrl = 'https://viverdeia.ai',
  categoryName = 'Geral',
  unsubscribeUrl,
}: SuggestionNewEmailProps) => (
  <MasterTemplate
    preview={`💡 Nova sugestão: ${suggestionTitle}`}
    heading="💡 Nova Sugestão"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}!</Text>
    
    <Text style={text}>
      Uma nova sugestão foi publicada e pode ser do seu interesse:
    </Text>

    <Section style={suggestionCard}>
      <div style={categoryBadge}>
        📂 {categoryName}
      </div>
      <Text style={suggestionTitle as any}>{suggestionTitle}</Text>
      <Text style={suggestionDesc}>{suggestionDescription}</Text>
      <Text style={authorInfo}>
        <strong>Por:</strong> {suggestionAuthor}
      </Text>
    </Section>

    <Section style={buttonSection}>
      <Button href={suggestionUrl} style={button}>
        🚀 Ver Sugestão Completa
      </Button>
    </Section>

    <Text style={helpText}>
      💬 Compartilhe sua opinião e ajude a comunidade a evoluir!
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

const suggestionCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const categoryBadge = {
  display: 'inline-block',
  backgroundColor: '#d1fae5',
  color: '#065f46',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
  marginBottom: '12px',
}

const suggestionTitle = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '12px 0',
  lineHeight: '1.4',
}

const suggestionDesc = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
}

const authorInfo = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '12px 0 0',
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

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontStyle: 'italic',
}

export default SuggestionNewEmail
