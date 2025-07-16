
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
  Img,
  Hr,
  Button,
  Font,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface InviteEmailProps {
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  recipientEmail: string;
}

export const InviteEmail = ({
  inviteUrl,
  roleName,
  expiresAt,
  senderName = "Equipe Viver de IA",
  notes,
  recipientEmail,
}: InviteEmailProps) => {
  const formattedDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="system-ui"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Você foi convidado para se juntar à comunidade Viver de IA! 🚀
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com Logo */}
          <Section style={header}>
            <div style={logoContainer}>
              <Text style={logoText}>Viver de IA</Text>
              <Text style={logoSubtext}>Transforme seu negócio com IA</Text>
            </div>
          </Section>

          {/* Conteúdo Principal */}
          <Section style={content}>
            <Heading style={h1}>
              🎉 Você foi convidado!
            </Heading>
            
            <Text style={greeting}>
              Olá! 👋
            </Text>
            
            <Text style={paragraph}>
              <strong>{senderName}</strong> convidou você para se juntar à <strong>comunidade Viver de IA</strong>, 
              a principal plataforma para empresários que querem implementar soluções de IA em seus negócios.
            </Text>

            {/* Role Badge */}
            <Section style={roleBadgeContainer}>
              <div style={roleBadge}>
                <Text style={roleBadgeText}>
                  🎯 Seu papel: <strong>{roleName}</strong>
                </Text>
              </div>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                href={inviteUrl}
                style={button}
              >
                🚀 Aceitar Convite
              </Button>
            </Section>

            {/* 🎯 CORREÇÃO: URL alternativo sem tracking */}
            <Section style={urlFallbackSection}>
              <Text style={urlFallbackTitle}>
                💡 Link alternativo (copie e cole):
              </Text>
              <Text style={urlFallbackText}>
                {inviteUrl}
              </Text>
              <Text style={urlFallbackInstructions}>
                ⚠️ <strong>Importante:</strong> Se o botão acima não funcionar, 
                copie e cole o link acima diretamente no seu navegador.
              </Text>
            </Section>

            {/* Notas do Convite */}
            {notes && (
              <Section style={notesSection}>
                <Text style={notesTitle}>📝 Mensagem do remetente:</Text>
                <Text style={notesContent}>"{notes}"</Text>
              </Section>
            )}

            {/* Informações do Convite */}
            <Section style={infoSection}>
              <Text style={infoTitle}>ℹ️ Informações do Convite:</Text>
              <Text style={infoItem}>📧 <strong>Email:</strong> {recipientEmail}</Text>
              <Text style={infoItem}>👤 <strong>Papel:</strong> {roleName}</Text>
              <Text style={infoItem}>⏰ <strong>Expira em:</strong> {formattedDate}</Text>
            </Section>

            {/* O que você terá acesso */}
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>🎁 O que você terá acesso:</Text>
              <Text style={benefitItem}>✅ Trilhas de implementação personalizadas</Text>
              <Text style={benefitItem}>✅ Comunidade exclusiva de empresários</Text>
              <Text style={benefitItem}>✅ Ferramentas e recursos de IA</Text>
              <Text style={benefitItem}>✅ Suporte especializado</Text>
              <Text style={benefitItem}>✅ Networking com outros membros</Text>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footer}>
              Este convite foi enviado por <strong>{senderName}</strong> para <strong>{recipientEmail}</strong>.
              <br />
              Se você não esperava este convite, pode ignorar este email com segurança.
            </Text>

            <Text style={footerLinks}>
              <Link href="https://viverdeia.ai" style={footerLink}>
                🌐 viverdeia.ai
              </Link>
              {" | "}
              <Link href="https://viverdeia.ai/suporte" style={footerLink}>
                💬 Suporte
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos seguindo o design system da Viver de IA
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const header = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logoContainer = {
  color: '#ffffff',
};

const logoText = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 4px 0',
  color: '#ffffff',
};

const logoSubtext = {
  fontSize: '14px',
  fontWeight: '400',
  margin: '0',
  color: '#e2e8f0',
};

const content = {
  padding: '40px',
};

const h1 = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#475569',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const roleBadgeContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const roleBadge = {
  display: 'inline-block',
  backgroundColor: '#f1f5f9',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '12px 20px',
};

const roleBadgeText = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '16px 32px',
  display: 'inline-block',
  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
};

const urlFallback = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0 24px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontWeight: '500',
};

const notesSection = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '6px',
};

const notesTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const notesContent = {
  color: '#92400e',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
};

const infoSection = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const infoItem = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 6px 0',
};

const benefitsSection = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const benefitsTitle = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const benefitItem = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 6px 0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const footerLinks = {
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};

const footerLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'none',
  fontWeight: '500',
};

// 🎯 Novos estilos para URL fallback melhorada
const urlFallbackSection = {
  backgroundColor: '#f8fafc',
  border: '2px dashed #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const urlFallbackTitle = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const urlFallbackText = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  color: '#3b82f6',
  fontSize: '12px',
  fontFamily: 'Monaco, Menlo, monospace',
  padding: '8px 12px',
  margin: '0 0 12px 0',
  wordBreak: 'break-all' as const,
  display: 'block',
};

const urlFallbackInstructions = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0',
};

export default InviteEmail;
