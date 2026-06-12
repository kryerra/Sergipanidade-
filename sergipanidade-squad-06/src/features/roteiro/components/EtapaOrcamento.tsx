import { Check, Sparkles } from "lucide-react";
import { getBudgetOptions } from "../constants/opcoesAssistente";

interface EtapaOrcamentoProps {
  t: any;
  selectedBudget: string;
  onChange: (budget: string) => void;
  onGenerate: () => void;
  canGenerate: boolean;
}

export function EtapaOrcamento({
  t,
  selectedBudget,
  onChange,
  onGenerate,
  canGenerate,
}: EtapaOrcamentoProps) {
  const budgetOptions = getBudgetOptions(t);

  return (
    <div>
      <h2 className="font-semibold font-display tracking-tight text-2xl text-[var(--preto)] mb-1">
        {t.wizardBudgetTitle}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-6">{t.budget}</p>
      <div className="space-y-3 mb-8">
        {budgetOptions.map((opt) => {
          const sel = selectedBudget === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-4 p-5 rounded-[var(--radius)] border-2 transition-all min-h-[72px] text-left ${
                sel
                  ? "border-[var(--primary)] bg-[var(--secondary)]"
                  : "border-[var(--cinza-med)] bg-white hover:border-[var(--primary)]/40"
              }`}
            >
              <span className="text-3xl shrink-0">{opt.icon}</span>
              <div className="flex-1">
                <p
                  className={`font-bold text-base ${
                    sel ? "text-[var(--primary)]" : "text-[var(--preto)]"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-[var(--cinza-txt)]">
                  {opt.desc}
                </p>
              </div>
              {sel && (
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Botão de gerar roteiro */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-[var(--radius-sm)] font-bold text-base tracking-wide min-h-[56px] transition-all ${
          canGenerate
            ? "bg-[var(--primary)] text-white hover:bg-[#0A5D61] shadow-lg"
            : "bg-[var(--cinza-med)] text-[var(--cinza-txt)] cursor-not-allowed"
        }`}
      >
        <Sparkles size={20} />
        {t.wizardGenerateBtn}
      </button>
    </div>
  );
}
