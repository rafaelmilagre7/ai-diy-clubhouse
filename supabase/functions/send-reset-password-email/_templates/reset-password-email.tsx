import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ResetPasswordEmailProps {
  resetUrl: string;
  recipientEmail: string;
  companyName: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
  recipientEmail,
  companyName,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir sua senha da plataforma {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔐 Redefinir Senha</Heading>
        
        <Text style={text}>
          Olá! Recebemos uma solicitação para redefinir a senha da sua conta associada ao e-mail <strong>{recipientEmail}</strong>.
        </Text>
        
        <Text style={text}>
          Para criar uma nova senha, clique no botão abaixo:
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={resetUrl}>
            Redefinir Minha Senha
          </Button>
        </Section>
        
        <Text style={text}>
          Ou copie e cole este link no seu navegador:
        </Text>
        
        <Text style={linkText}>
          {resetUrl}
        </Text>
        
        <Hr style={hr} />
        
        <Text style={disclaimer}>
          <strong>Importante:</strong> Este link expira em 60 minutos por segurança.
        </Text>
        
        <Text style={disclaimer}>
          Se você não solicitou esta redefinição de senha, pode ignorar este e-mail com segurança.
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Atenciosamente,<br />
          Equipe {companyName}<br />
          <Link href="https://viverdeia.ai" style={footerLink}>viverdeia.ai</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4338ca',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const linkText = {
  color: '#4338ca',
  fontSize: '14px',
  fontFamily: 'monospace',
  backgroundColor: '#f4f4f5',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #e4e4e7',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '20px 0',
};

const disclaimer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#4338ca',
  textDecoration: 'underline',
};