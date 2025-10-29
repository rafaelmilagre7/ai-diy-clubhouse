import { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastModern } from '@/hooks/useToastModern';
import { supabase } from '@/lib/supabase';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscription, disabled = false }: VoiceInputProps) {
  const { showSuccess, showError, showWarning } = useToastModern();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setRecordingTime(0);
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      showSuccess('Gravando áudio', 'Fale claramente no microfone');

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      showError('Erro ao acessar microfone', 'Verifique as permissões do navegador');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Erro ao transcrever:', error);
        throw error;
      }

      if (!data?.success || !data?.text) {
        throw new Error('Transcrição falhou');
      }

      const transcription = data.text.trim();

      if (transcription.length < 30) {
        showWarning('Transcrição muito curta', 'Por favor, grave uma descrição mais detalhada');
        return;
      }

      showSuccess('Transcrição concluída!', 'Áudio transcrito com sucesso');
      onTranscription(transcription);

    } catch (error) {
      console.error('Erro na transcrição:', error);
      showError('Erro ao transcrever', 'Tente novamente ou digite sua ideia');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isTranscribing) return "Transcrevendo...";
    if (isRecording) return "Ouvindo...";
    return "Clique para gravar";
  };

  return (
    <div className="w-full py-1">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-base relative",
            isRecording
              ? "bg-primary/10 ring-2 ring-primary/30"
              : "bg-surface-elevated/50 hover:bg-surface-elevated border border-border hover:border-primary/50",
            isTranscribing && "bg-surface-elevated/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isTranscribing}
          title={getStatusText()}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
          )}
          {isRecording ? (
            <div className="w-5 h-5 rounded-sm bg-primary relative z-10" />
          ) : isTranscribing ? (
            <div
              className="w-5 h-5 rounded-sm animate-spin bg-primary/50"
              style={{ animationDuration: "1s" }}
            />
          ) : (
            <Mic className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
          )}
        </button>

        {isRecording && (
          <>
            <span className="font-mono text-xs text-primary font-semibold">
              {formatTime(recordingTime)}
            </span>

            <div className="h-12 w-64 flex items-center justify-center gap-[2px] bg-surface-elevated/30 rounded-lg px-2 border border-primary/20">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="w-[4px] rounded-full bg-gradient-to-t from-primary to-primary/40"
                  style={{
                    animation: 'wave 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.03}s`,
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-primary font-medium">
              {getStatusText()}
            </p>
          </>
        )}

        {isTranscribing && (
          <p className="text-xs text-muted-foreground animate-pulse">
            {getStatusText()}
          </p>
        )}
      </div>
    </div>
  );
}
