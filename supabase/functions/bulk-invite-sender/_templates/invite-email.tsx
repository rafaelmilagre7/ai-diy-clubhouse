import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface InviteEmailProps {
  inviteUrl: string
  invitedByName: string
  recipientEmail: string
  roleName: string
  companyName: string
  expiresAt: string
  notes?: string
}

export const InviteEmail = ({
  inviteUrl = "https://app.viverdeia.ai/convite/TOKEN",
  invitedByName = "Equipe Viver de IA",
  recipientEmail = "usuario@example.com",
  roleName = "membro",
  companyName = "Viver de IA",
  expiresAt = "2024-12-31",
  notes = ""
}: InviteEmailProps) => (
  <Html>
    <Head />
    <Preview>🚀 Você foi convidado para a plataforma {companyName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🚀 Você foi convidado!</Heading>
          <Text style={subtitle}>
            {invitedByName} convidou você para fazer parte da plataforma <strong>{companyName}</strong>
          </Text>
        </Section>

        <Section style={content}>
          <Text style={text}>
            Olá! Você recebeu um convite especial para acessar nossa plataforma como <strong>{roleName}</strong>.
          </Text>

          {notes && (
            <Section style={notesSection}>
              <Text style={notesTitle}>📝 Mensagem do convite:</Text>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          <Section style={buttonSection}>
            <Button style={button} href={inviteUrl}>
              ✨ Aceitar Convite
            </Button>
          </Section>

          <Text style={text}>
            Ou copie e cole este link no seu navegador:
          </Text>
          <Text style={linkText}>
            <Link href={inviteUrl} style={link}>
              {inviteUrl}
            </Link>
          </Text>

          <Text style={warningText}>
            ⚠️ Este convite expira em {new Date(expiresAt).toLocaleDateString('pt-BR')}.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Este email foi enviado automaticamente pela plataforma {companyName}.
          </Text>
          <Text style={footerText}>
            Se você não esperava este convite, pode ignorar este email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const subtitle = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 20px',
}

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const notesSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const notesTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const notesText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
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
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  border: 'none',
}

const linkText = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  padding: '12px',
  fontSize: '14px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
}

const link = {
  color: '#6366f1',
  textDecoration: 'none',
}

const warningText = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '500',
  margin: '24px 0 16px',
  textAlign: 'center' as const,
}

const footer = {
  borderTop: '1px solid #e9ecef',
  padding: '32px 0 0',
  margin: '32px 0 0',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
}