import { Check } from "lucide-react";

interface AssistenteProgressoProps {
  step: number;
  total: number;
  language?: "pt" | "en" | "es";
}

export function AssistenteProgresso({ step, total, language = "pt" }: AssistenteProgressoProps) {
  const stepLabels = {
    pt: ["Quem vai", "Duração", "Interesses", "Orçamento"],
    en: ["Who is going", "Duration", "Interests", "Budget"],
    es: ["Quién va", "Duración", "Intereses", "Presupuesto"]
  };

  const labels = stepLabels[language] || stepLabels.pt;

  return (
    <div className="mb-10 w-full pt-2">
      {/* Visual Stepper Layout */}
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Connecting Line */}
        <div className="absolute left-4 right-4 top-4.5 -translate-y-1/2 h-[3px] bg-[var(--cinza-med)] rounded-full -z-10 overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
            style={{
              width: `${(step / (total - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Circular Indicators */}
        {Array.from({ length: total }).map((_, i) => {
          const isCompleted = i < step;
          const isActive = i === step;
          
          return (
            <div key={i} className="flex flex-col items-center relative z-10 w-16 sm:w-20">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? "bg-[var(--primary)] text-white scale-100"
                    : isActive
                    ? "bg-[var(--primary)] text-white scale-110 ring-4 ring-[var(--teal-leve)] shadow-[0_0_12px_rgba(13,115,119,0.35)]"
                    : "bg-white text-[var(--cinza-txt)] border-2 border-[var(--cinza-med)] scale-90"
                }`}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3.5} className="text-white animate-in zoom-in duration-200" />
                ) : (
                  i + 1
                )}
              </div>
              
              {/* Step Label underneath */}
              <span
                className={`text-[9px] sm:text-[11px] font-bold mt-2.5 transition-all duration-300 text-center tracking-tight leading-none ${
                  isActive
                    ? "text-[var(--primary)] scale-105"
                    : isCompleted
                    ? "text-[var(--preto)] opacity-95"
                    : "text-[var(--texto-secundario)]"
                }`}
              >
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
