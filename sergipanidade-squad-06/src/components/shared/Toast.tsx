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
    bg: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
    border: 'rgba(255, 255, 255, 0.15)',
    icon: <Info size={15} className="text-[#38BDF8]" strokeWidth={2.5} />,
  },
  success: {
    bg: 'linear-gradient(135deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%)',
    border: 'rgba(22, 163, 74, 0.35)',
    icon: <CheckCircle size={15} className="text-[#4ADE80]" strokeWidth={2.5} />,
  },
  error: {
    bg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
    border: 'rgba(220, 38, 38, 0.35)',
    icon: <XCircle size={15} className="text-[#F87171]" strokeWidth={2.5} />,
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
    <>
      <style>{`
        .toast-responsive-container {
          bottom: calc(8.5rem + env(safe-area-inset-bottom, 0px));
        }
        @media (min-width: 768px) {
          .toast-responsive-container {
            bottom: 2rem;
          }
        }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        className="toast-responsive-container fixed left-1/2 z-[2000]
                   pointer-events-none transition-all duration-300
                   w-[calc(100vw-32px)] max-w-[420px]"
        style={{
          transform: `translateX(-50%) translateY(${isVisible ? '0' : '80px'})`,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div
          className="flex items-start gap-2.5 px-5 py-3 rounded-2xl
                     text-white text-[13px] font-medium leading-relaxed
                     shadow-[0_8px_32px_rgba(0,0,0,0.30)] text-left"
          style={{
            background: vstyle.bg,
            border: `1px solid ${vstyle.border}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="flex-shrink-0 opacity-90 mt-0.5">{vstyle.icon}</span>
          <div className="flex-1">{message}</div>
        </div>
      </div>
    </>
  );
}

