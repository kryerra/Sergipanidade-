/**
 * Toast / Snackbar de feedback
 * Sergipanidade Design System v2
 * Variantes: success (verde), error (vermelho), default (preto)
 */
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'error';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  /** Detectado automaticamente pelo prefixo do emoji / palavras-chave */
  variant?: ToastVariant;
  /** Duração em ms (padrão 3000) */
  duration?: number;
}

function detectVariant(message: string): ToastVariant {
  if (!message) return 'default';
  const lower = message.toLowerCase();
  const successTokens = ['adicionado', 'publicad', 'cadastro', 'salvo', 'enviado', 'sucesso', 'welcome', 'login'];
  const errorTokens = ['erro', 'error', 'inválid', 'falhou', 'não encontrado'];

  if (successTokens.some((t) => lower.includes(t))) return 'success';
  if (errorTokens.some((t) => lower.includes(t))) return 'error';
  return 'default';
}

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  default: {
    bg: '#111111',
    border: 'rgba(0,0,128,0.45)',
    icon: <Info size={15} strokeWidth={2.5} />,
  },
  success: {
    bg: '#1B5E20',
    border: 'rgba(46,125,50,0.55)',
    icon: <CheckCircle size={15} strokeWidth={2.5} />,
  },
  error: {
    bg: '#B71C1C',
    border: 'rgba(211,47,47,0.55)',
    icon: <XCircle size={15} strokeWidth={2.5} />,
  },
};

export function Toast({
  message,
  isVisible,
  onHide,
  variant,
  duration = 3000,
}: ToastProps) {
  const resolvedVariant = variant ?? detectVariant(message);
  const vstyle = VARIANT_STYLES[resolvedVariant];

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[2000]
                 pointer-events-none transition-all duration-300"
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '80px'})`,
        opacity: isVisible ? 1 : 0,
        bottom: 'calc(1.75rem + env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3 rounded-full
                   text-white text-[13px] font-medium whitespace-nowrap
                   shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{
          backgroundColor: vstyle.bg,
          border: `1px solid ${vstyle.border}`,
        }}
      >
        <span className="flex-shrink-0 opacity-85">{vstyle.icon}</span>
        {message}
      </div>
    </div>
  );
}
