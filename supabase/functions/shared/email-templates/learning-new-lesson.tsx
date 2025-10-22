import {
  Button,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { MasterTemplate } from './master-template.tsx'

interface LearningNewLessonEmailProps {
  userName: string
  courseName: string
  lessonTitle: string
  lessonDescription: string
  lessonDuration: string
  lessonUrl: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  unsubscribeUrl?: string
}

export const LearningNewLessonEmail = ({
  userName = 'Usuário',
  courseName = 'Curso de IA',
  lessonTitle = 'Nova Lição',
  lessonDescription = 'Descrição da lição...',
  lessonDuration = '15 min',
  lessonUrl = 'https://viverdeia.ai',
  difficulty = 'intermediate',
  unsubscribeUrl,
}: LearningNewLessonEmailProps) => (
  <MasterTemplate
    preview={`📚 Nova lição disponível: ${lessonTitle}`}
    heading="📚 Nova Lição Disponível"
    unsubscribeUrl={unsubscribeUrl}
  >
    <Text style={greeting}>Olá, {userName}! 📖</Text>
    
    <Text style={text}>
      Uma nova lição foi adicionada ao curso <strong>{courseName}</strong>:
    </Text>

    <Section style={lessonCard}>
      <div style={lessonHeader}>
        <div style={difficultyBadge(difficulty)}>
          {getDifficultyEmoji(difficulty)} {getDifficultyLabel(difficulty)}
        </div>
        <div style={durationBadge}>⏱️ {lessonDuration}</div>
      </div>

      <Text style={lessonTitle as any}>{lessonTitle}</Text>
      <Text style={lessonDesc}>{lessonDescription}</Text>

      <Section style={progressInfo}>
        <div style={progressIcon}>📊</div>
        <Text style={progressText}>
          Continue sua jornada de aprendizado e evolua suas habilidades em IA!
        </Text>
      </Section>
    </Section>

    <Section style={buttonSection}>
      <Button href={lessonUrl} style={button}>
        🎓 Iniciar Lição
      </Button>
    </Section>

    <Text style={helpText}>
      💡 Invista no seu conhecimento e transforme seu futuro!
    </Text>
  </MasterTemplate>
)

const getDifficultyEmoji = (difficulty: string) => {
  const emojis: Record<string, string> = {
    beginner: '🌱',
    intermediate: '🚀',
    advanced: '🏆',
  }
  return emojis[difficulty] || '📘'
}

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  }
  return labels[difficulty] || 'Intermediário'
}

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

const lessonCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const lessonHeader = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'wrap' as const,
}

const difficultyBadge = (difficulty: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    beginner: { bg: '#d1fae5', text: '#065f46' },
    intermediate: { bg: '#dbeafe', text: '#1e40af' },
    advanced: { bg: '#fef3c7', text: '#78350f' },
  }
  const color = colors[difficulty] || colors.intermediate

  return {
    display: 'inline-block',
    backgroundColor: color.bg,
    color: color.text,
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  }
}

const durationBadge = {
  display: 'inline-block',
  backgroundColor: '#f3f4f6',
  color: '#4b5563',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '500',
}

const lessonTitle = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '12px 0',
  lineHeight: '1.4',
}

const lessonDesc = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0 20px',
}

const progressInfo = {
  backgroundColor: '#ede9fe',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const progressIcon = {
  fontSize: '24px',
}

const progressText = {
  color: '#5b21b6',
  fontSize: '13px',
  margin: '0',
  lineHeight: '20px',
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

export default LearningNewLessonEmail
