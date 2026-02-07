import { useState, useRef, useCallback } from 'react';

interface VoiceControlResult {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: (lang?: string) => void;
  stopListening: () => void;
  clearTranscript: () => void;
  isSupported: boolean;
}

export function useVoiceControl(): VoiceControlResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  const startListening = useCallback(
    (lang: string = 'ar-EG') => {
      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in this browser. Use Chrome or Edge.');
        return;
      }

      // Stop any existing session
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Try again.');
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition.');
        setIsListening(false);
      }
    },
    [SpeechRecognition]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    isSupported,
  };
}
