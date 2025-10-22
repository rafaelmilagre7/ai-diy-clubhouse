import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MasterTemplateProps {
  preview: string
  heading: string
  children: React.ReactNode
  unsubscribeUrl?: string
}

export const MasterTemplate = ({
  preview,
  heading,
  children,
  unsubscribeUrl,
}: MasterTemplateProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header com Logo */}
        <Section style={header}>
          <Img
            src="https://viverdeia.ai/logo.png"
            width="180"
            height="48"
            alt="Viver de IA"
            style={logo}
          />
        </Section>

        {/* Banner Aurora */}
        <Section style={bannerSection}>
          <div style={auroraGradient}>
            <Heading style={h1}>{heading}</Heading>
          </div>
        </Section>

        {/* Content */}
        <Section style={content}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Esta é uma notificação automática da plataforma <strong>Viver de IA</strong>
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} Viver de IA - Transformando negócios com IA
          </Text>
          {unsubscribeUrl && (
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              🔕 Gerenciar preferências de notificação
            </Link>
          )}
          <div style={socialLinks}>
            <Link href="https://linkedin.com/company/viverdeia" style={socialLink}>
              LinkedIn
            </Link>
            {' • '}
            <Link href="https://viverdeia.ai" style={socialLink}>
              Site
            </Link>
            {' • '}
            <Link href="mailto:suporte@viverdeia.ai" style={socialLink}>
              Suporte
            </Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
)

// ===== STYLES =====

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  borderRadius: '12px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}

const header = {
  backgroundColor: '#ffffff',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
}

const logo = {
  margin: '0 auto',
}

const bannerSection = {
  padding: '0',
}

const auroraGradient = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
  padding: '48px 32px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.2',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const content = {
  padding: '40px 32px',
}

const footer = {
  padding: '32px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '8px 0',
}

const unsubscribeLink = {
  color: '#6366f1',
  fontSize: '12px',
  textDecoration: 'underline',
  display: 'block',
  marginTop: '16px',
}

const socialLinks = {
  marginTop: '16px',
  fontSize: '12px',
}

const socialLink = {
  color: '#6366f1',
  textDecoration: 'none',
}

export default MasterTemplate
