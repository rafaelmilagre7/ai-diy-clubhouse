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
            src="https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/certificates/logo/viver-de-ia-logo.png"
            alt="Viver de IA"
            width="200"
            height="auto"
            style={logo}
          />
        </Section>

        {/* Banner Aurora com Gradiente da Marca */}
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
  backgroundColor: '#0a1f1f',
  padding: '32px 32px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #0ABAB5',
}

const logo = {
  margin: '0 auto',
  display: 'block',
}

const bannerSection = {
  padding: '0',
}

const auroraGradient = {
  background: 'linear-gradient(135deg, #0ABAB5 0%, #0BC8D5 50%, #00FFFF 100%)',
  padding: '48px 32px',
  textAlign: 'center' as const,
  boxShadow: '0 4px 20px rgba(10, 186, 181, 0.3)',
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
  color: '#0ABAB5',
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
  color: '#0ABAB5',
  textDecoration: 'none',
}

export default MasterTemplate
