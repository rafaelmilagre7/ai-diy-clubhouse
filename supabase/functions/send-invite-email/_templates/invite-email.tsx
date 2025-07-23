import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
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
  inviteUrl,
  invitedByName,
  recipientEmail,
  roleName,
  companyName = "Viver de IA",
  expiresAt,
  notes,
}: InviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Você foi convidado para acessar a plataforma {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🚀 Bem-vindo ao {companyName}!</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={text}>
            Olá! <strong>{invitedByName}</strong> convidou você para acessar nossa plataforma de IA.
          </Text>
          
          <Text style={text}>
            <strong>Detalhes do seu convite:</strong>
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              📧 <strong>Email:</strong> {recipientEmail}<br/>
              👤 <strong>Nível de acesso:</strong> {roleName}<br/>
              ⏰ <strong>Válido até:</strong> {new Date(expiresAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Section>

          {notes && (
            <Section style={notesBox}>
              <Text style={notesText}>
                💬 <strong>Mensagem:</strong> {notes}
              </Text>
            </Section>
          )}
          
          <Section style={buttonContainer}>
            <Button href={inviteUrl} style={button}>
              🎯 Aceitar Convite
            </Button>
          </Section>
          
          <Text style={linkText}>
            Ou copie e cole este link no seu navegador:<br/>
            <Link href={inviteUrl} style={link}>
              {inviteUrl}
            </Link>
          </Text>
          
          <Text style={warning}>
            ⚠️ Este convite é válido por tempo limitado. Clique no botão acima ou use o link para completar seu cadastro.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Esta mensagem foi enviada automaticamente pela plataforma {companyName}.<br/>
            Se você não esperava este convite, pode ignorar este email com segurança.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  lineHeight: '42px',
}

const content = {
  padding: '0 30px',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const infoText = {
  color: '#495057',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const notesBox = {
  backgroundColor: '#e3f2fd',
  border: '1px solid #bbdefb',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
}

const notesText = {
  color: '#1565c0',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5850ec',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px',
}

const linkText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#5850ec',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const warning = {
  backgroundColor: '#fef3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '6px',
  color: '#8a6d3b',
  fontSize: '14px',
  lineHeight: '20px',
  padding: '12px',
  margin: '24px 0',
}

const footer = {
  borderTop: '1px solid #e9ecef',
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}