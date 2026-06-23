import { Check } from "lucide-react";
import { getWhoOptions } from "../constants/opcoesAssistente";

interface EtapaCompanhiaProps {
  t: any;
  selectedWho: string;
  onChange: (who: string) => void;
}

export function EtapaCompanhia({ t, selectedWho, onChange }: EtapaCompanhiaProps) {
  const whoOptions = getWhoOptions(t);

  return (
    <div>
      <h2 className="font-semibold font-display tracking-tight text-2xl text-[var(--preto)] mb-1">
        {t.wizardWhoRegional}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-6">
        {t.questions.who}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {whoOptions.map((opt) => {
          const sel = selectedWho === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-[var(--radius)] border-2 transition-all duration-300 min-h-[120px] cursor-pointer hover:scale-[1.01] ${
                sel
                  ? "border-[var(--primary)] bg-[var(--teal-leve)] shadow-[0_4px_20px_rgba(13,115,119,0.06)]"
                  : "border-[var(--cinza-med)] bg-white hover:border-[var(--primary)]/50 hover:bg-[#F9FBFC]"
              }`}
            >
              <span className="text-4xl">{opt.icon}</span>
              <span
                className={`text-sm font-bold transition-colors ${
                  sel ? "text-[var(--primary)]" : "text-[var(--preto)]"
                }`}
              >
                {opt.label}
              </span>
              {sel && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
