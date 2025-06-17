
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
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface InviteEmailProps {
  inviteUrl: string
  email: string
  roleName: string
  expiresAt: string
  senderName?: string
  notes?: string
}

export const InviteEmail = ({
  inviteUrl,
  email,
  roleName,
  expiresAt,
  senderName = 'Equipe Viver de IA',
  notes,
}: InviteEmailProps) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Html>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Você foi convidado para a plataforma Viver de IA</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <Heading style={headerTitle}>Viver de IA</Heading>
            <Text style={headerSubtitle}>Plataforma de Inteligência Artificial</Text>
          </Section>

          {/* Corpo principal */}
          <Section style={mainContent}>
            <Heading style={title}>
              Você foi convidado! 🚀
            </Heading>
            
            <Text style={welcomeText}>
              Olá! Você recebeu um convite especial para fazer parte da nossa plataforma de IA.
            </Text>

            {/* Card de informações */}
            <Section style={infoCard}>
              <Text style={infoLabel}>E-mail convidado:</Text>
              <Text style={infoValue}>{email}</Text>
              
              <Text style={infoLabel}>Função na plataforma:</Text>
              <Text style={roleBadge}>{roleName}</Text>
              
              <Text style={infoLabel}>Válido até:</Text>
              <Text style={infoValue}>{expirationDate}</Text>
              
              {senderName && (
                <>
                  <Text style={infoLabel}>Convidado por:</Text>
                  <Text style={infoValue}>{senderName}</Text>
                </>
              )}
            </Section>

            {/* Notas personalizadas */}
            {notes && (
              <Section style={notesCard}>
                <Text style={notesLabel}>Mensagem personalizada:</Text>
                <Text style={notesText}>{notes}</Text>
              </Section>
            )}

            {/* Botão principal com glow effect */}
            <Section style={buttonContainer}>
              <Button href={inviteUrl} style={ctaButton}>
                Aceitar Convite
              </Button>
            </Section>

            <Text style={instructionText}>
              Clique no botão acima ou copie e cole o link abaixo no seu navegador:
            </Text>
            
            <Text style={linkText}>
              {inviteUrl}
            </Text>

            <Hr style={divider} />
            
            <Text style={securityNote}>
              🔒 <strong>Segurança:</strong> Este convite é único e pessoal. Não compartilhe este link com terceiros.
            </Text>
            
            <Text style={expirationWarning}>
              ⏰ <strong>Importante:</strong> Este convite expira em {expirationDate}. Complete seu cadastro antes desta data.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este e-mail foi enviado pela plataforma <strong>Viver de IA</strong>
            </Text>
            <Text style={footerNote}>
              Se você não esperava este convite, pode ignorar este e-mail com segurança.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail

// Estilos baseados no Design System Viveria
const main = {
  backgroundColor: '#0A101B',
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  backgroundColor: '#0A101B',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
}

const header = {
  background: 'linear-gradient(135deg, #00EAD9 0%, #4A90E2 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
  borderRadius: '16px 16px 0 0',
}

const headerTitle = {
  color: '#0A101B',
  fontSize: '32px',
  fontWeight: '800',
  fontFamily: 'Raleway, sans-serif',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const headerSubtitle = {
  color: '#0A101B',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  opacity: '0.8',
}

const mainContent = {
  backgroundColor: '#0F1521',
  padding: '40px 32px',
  borderLeft: '1px solid rgba(0, 234, 217, 0.2)',
  borderRight: '1px solid rgba(0, 234, 217, 0.2)',
}

const title = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  fontFamily: 'Raleway, sans-serif',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const welcomeText = {
  color: '#93A3B8',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px 0',
  textAlign: 'center' as const,
}

const infoCard = {
  backgroundColor: 'rgba(15, 21, 33, 0.6)',
  border: '1px solid rgba(0, 234, 217, 0.2)',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  backdropFilter: 'blur(20px)',
}

const infoLabel = {
  color: '#93A3B8',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
}

const infoValue = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const roleBadge = {
  background: 'linear-gradient(135deg, #00EAD9, #5AE6FF)',
  color: '#0A101B',
  fontSize: '14px',
  fontWeight: '700',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0 0 16px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const notesCard = {
  backgroundColor: 'rgba(74, 144, 226, 0.1)',
  border: '1px solid rgba(74, 144, 226, 0.3)',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}

const notesLabel = {
  color: '#4A90E2',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const notesText = {
  color: '#ffffff',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0',
  fontStyle: 'italic',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const ctaButton = {
  backgroundColor: '#00EAD9',
  color: '#0A101B',
  fontSize: '16px',
  fontWeight: '700',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 8px 32px rgba(0, 234, 217, 0.4)',
  border: 'none',
  fontFamily: 'Poppins, sans-serif',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  transition: 'all 0.3s ease',
}

const instructionText = {
  color: '#93A3B8',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 16px 0',
}

const linkText = {
  color: '#00EAD9',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
  padding: '12px',
  backgroundColor: 'rgba(0, 234, 217, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(0, 234, 217, 0.2)',
}

const divider = {
  border: 'none',
  borderTop: '1px solid rgba(0, 234, 217, 0.2)',
  margin: '32px 0',
}

const securityNote = {
  color: '#93A3B8',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0',
  padding: '16px',
  backgroundColor: 'rgba(0, 234, 217, 0.05)',
  borderRadius: '8px',
  borderLeft: '4px solid #00EAD9',
}

const expirationWarning = {
  color: '#93A3B8',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0',
  padding: '16px',
  backgroundColor: 'rgba(255, 193, 7, 0.1)',
  borderRadius: '8px',
  borderLeft: '4px solid #FFC107',
}

const footer = {
  backgroundColor: '#070B14',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderRadius: '0 0 16px 16px',
  borderLeft: '1px solid rgba(0, 234, 217, 0.2)',
  borderRight: '1px solid rgba(0, 234, 217, 0.2)',
  borderBottom: '1px solid rgba(0, 234, 217, 0.2)',
}

const footerText = {
  color: '#93A3B8',
  fontSize: '14px',
  margin: '0 0 8px 0',
}

const footerNote = {
  color: '#93A3B8',
  fontSize: '12px',
  margin: '0',
  opacity: '0.7',
}
