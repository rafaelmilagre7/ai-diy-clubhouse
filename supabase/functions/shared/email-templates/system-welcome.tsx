import {
  Button,
  Hr,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface SystemWelcomeEmailProps {
  userName: string
  userEmail: string
  dashboardUrl: string
  profileUrl: string
  supportEmail: string
  unsubscribeUrl?: string
}

export const SystemWelcomeEmail = ({
  userName = 'Novo Usuário',
  userEmail = 'usuario@email.com',
  dashboardUrl = 'https://viverdeia.ai/dashboard',
  profileUrl = 'https://viverdeia.ai/profile',
  supportEmail = 'suporte@viverdeia.ai',
  unsubscribeUrl,
}: SystemWelcomeEmailProps) => (
  <MasterTemplate
    preview={`Bem-vindo à Viver de IA, ${userName}!`}
    heading="🚀 Bem-vindo à Viver de IA!"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}! 👋</Text>
    
    <Text style={text}>
      É um prazer tê-lo(a) conosco na <strong>Viver de IA</strong>, a plataforma que está transformando
      negócios através da Inteligência Artificial.
    </Text>

    <Section style={welcomeCard}>
      <div style={welcomeIcon}>🎉</div>
      <Text style={welcomeTitle}>Sua jornada começa agora!</Text>
      <Text style={welcomeDesc}>
        Você faz parte de uma comunidade inovadora que usa IA para criar soluções reais e impactar
        negócios.
      </Text>
    </Section>

    <Hr style={divider} />

    <Text style={sectionTitle}>🎯 Primeiros Passos</Text>

    <Section style={stepsList}>
      <div style={stepItem}>
        <div style={stepNumber}>1</div>
        <div style={stepContent}>
          <Text style={stepTitle as any}>Complete seu perfil</Text>
          <Text style={stepDesc}>
            Adicione informações sobre você e sua empresa para conectar com pessoas relevantes.
          </Text>
        </div>
      </div>

      <div style={stepItem}>
        <div style={stepNumber}>2</div>
        <div style={stepContent}>
          <Text style={stepTitle as any}>Explore sugestões</Text>
          <Text style={stepDesc}>
            Descubra ideias inovadoras e vote nas melhores soluções da comunidade.
          </Text>
        </div>
      </div>

      <div style={stepItem}>
        <div style={stepNumber}>3</div>
        <div style={stepContent}>
          <Text style={stepTitle as any}>Conecte-se</Text>
          <Text style={stepDesc}>
            Faça networking com outros profissionais e expanda suas oportunidades.
          </Text>
        </div>
      </div>

      <div style={stepItem}>
        <div style={stepNumber}>4</div>
        <div style={stepContent}>
          <Text style={stepTitle as any}>Aprenda com experts</Text>
          <Text style={stepDesc}>
            Acesse cursos, lições e conteúdos exclusivos sobre IA aplicada a negócios.
          </Text>
        </div>
      </div>
    </Section>

    <Hr style={divider} />

    <Section style={buttonSection}>
      <Button href={dashboardUrl} style={buttonPrimary}>
        🎯 Acessar Dashboard
      </Button>
      <Button href={profileUrl} style={buttonSecondary}>
        👤 Completar Perfil
      </Button>
    </Section>

    <Hr style={divider} />

    <Section style={supportBox}>
      <Text style={supportTitle}>💬 Precisa de ajuda?</Text>
      <Text style={supportText}>
        Nossa equipe está pronta para te ajudar! Entre em contato:{' '}
        <a href={`mailto:${supportEmail}`} style={supportLink}>
          {supportEmail}
        </a>
      </Text>
    </Section>

    <Text style={motivationalText}>
      🌟 Estamos empolgados para ver suas contribuições e crescimento na plataforma!
    </Text>
  </MasterTemplate>
)

const greeting = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '16px 0',
}

const welcomeCard = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
  border: '2px solid #a5b4fc',
  borderRadius: '16px',
  padding: '40px 32px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const welcomeIcon = {
  fontSize: '64px',
  marginBottom: '16px',
}

const welcomeTitle = {
  color: '#3730a3',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '12px 0 16px',
}

const welcomeDesc = {
  color: '#4c1d95',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const sectionTitle = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 20px',
}

const stepsList = {
  margin: '20px 0',
}

const stepItem = {
  display: 'flex',
  gap: '16px',
  marginBottom: '20px',
  alignItems: 'flex-start',
}

const stepNumber = {
  backgroundColor: '#0ABAB5',
  color: '#ffffff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  flexShrink: '0',
}

const stepContent = {
  flex: '1',
}

const stepTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 6px',
}

const stepDesc = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const buttonPrimary = {
  backgroundColor: '#0ABAB5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 8px 8px',
  boxShadow: '0 4px 6px -1px rgba(10, 186, 181, 0.4)',
}

const buttonSecondary = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#0ABAB5',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 8px 8px',
  border: '2px solid #0ABAB5',
}

const supportBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '10px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const supportTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const supportText = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
}

const supportLink = {
  color: '#0ABAB5',
  textDecoration: 'underline',
}

const motivationalText = {
  color: '#059669',
  fontSize: '15px',
  textAlign: 'center' as const,
  margin: '24px 0 0',
  fontWeight: '500',
  padding: '16px',
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
}

export default SystemWelcomeEmail
