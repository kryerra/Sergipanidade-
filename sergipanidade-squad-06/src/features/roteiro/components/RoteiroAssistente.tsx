import { Bot } from "lucide-react";
import { WizardData } from "@/types";
import { FundoVisual } from "./FundoVisual";
import { AssistenteProgresso } from "./AssistenteProgresso";
import { EtapaCompanhia } from "./EtapaCompanhia";
import { EtapaDias } from "./EtapaDias";
import { EtapaInteresses } from "./EtapaInteresses";
import { EtapaOrcamento } from "./EtapaOrcamento";
import { Button } from "@/components/ui/button";

interface RoteiroAssistenteProps {
  t: any;
  language: "pt" | "en" | "es";
  wizardStep: number;
  setWizardStep: (step: number | ((prev: number) => number)) => void;
  wizardData: WizardData;
  setWizardData: (data: WizardData | ((prev: WizardData) => WizardData)) => void;
  onCancel: () => void;
  onGenerate: () => void;
}

export function RoteiroAssistente({
  t,
  language,
  wizardStep,
  setWizardStep,
  wizardData,
  setWizardData,
  onCancel,
  onGenerate,
}: RoteiroAssistenteProps) {
  const TOTAL_STEPS = 4;

  const canAdvance = () => {
    if (wizardStep === 0) return !!wizardData.who;
    if (wizardStep === 1) return wizardData.days >= 1;
    if (wizardStep === 2) return wizardData.interests.length > 0;
    if (wizardStep === 3) return !!wizardData.budget;
    return false;
  };

  const handleNext = () => {
    if (canAdvance()) {
      setWizardStep((s: number) => (typeof s === "number" ? s + 1 : s));
    }
  };

  const handlePrev = () => {
    setWizardStep((s: number) => (typeof s === "number" ? s - 1 : s));
  };

  return (
    <FundoVisual className="pt-[62px] pb-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Card contêiner — glassmorphism sutil para destacar o conteúdo do fundo ilustrado */}
        <div
          className="bg-white/90 backdrop-blur-2xl rounded-[var(--radius)] border border-[var(--cinza-borda)]/60 p-6 sm:p-8 transition-all duration-300"
          style={{ boxShadow: "var(--sombra-lg), 0 0 0 1px rgba(255,255,255,.8) inset" }}
        >
          {/* Cabeçalho */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--primary)] to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary)]/20">
              <Bot size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] leading-tight tracking-wide">
                {t.aiItineraryTitle}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center bg-[var(--teal-leve)] text-[var(--primary)] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {t.wizardStep} {wizardStep + 1} / {TOTAL_STEPS}
                </span>
              </div>
            </div>
          </div>

          <AssistenteProgresso step={wizardStep} total={TOTAL_STEPS} language={language} />

          {/* Etapas do Wizard */}
          <div className="min-h-[280px]">
            {wizardStep === 0 && (
              <EtapaCompanhia
                t={t}
                selectedWho={wizardData.who}
                onChange={(who) =>
                  setWizardData((d: WizardData) => ({ ...d, who }))
                }
              />
            )}

            {wizardStep === 1 && (
              <EtapaDias
                t={t}
                days={wizardData.days}
                startDate={wizardData.startDate}
                stopsPerDay={wizardData.stopsPerDay ?? 3}
                onChangeDays={(days) =>
                  setWizardData((d: WizardData) => ({ ...d, days }))
                }
                onChangeStartDate={(startDate) =>
                  setWizardData((d: WizardData) => ({ ...d, startDate }))
                }
                onChangeStopsPerDay={(stopsPerDay) =>
                  setWizardData((d: WizardData) => ({ ...d, stopsPerDay }))
                }
              />
            )}

            {wizardStep === 2 && (
              <EtapaInteresses
                t={t}
                language={language}
                selectedInterests={wizardData.interests}
                onChange={(interests) =>
                  setWizardData((d: WizardData) => ({ ...d, interests }))
                }
              />
            )}

            {wizardStep === 3 && (
              <EtapaOrcamento
                t={t}
                selectedBudget={wizardData.budget}
                onChange={(budget) =>
                  setWizardData((d: WizardData) => ({ ...d, budget }))
                }
                onGenerate={onGenerate}
                canGenerate={canAdvance()}
              />
            )}
          </div>

          {/* Separador sutil antes dos botões */}
          <div className="border-t border-[var(--cinza-borda)]/40 mt-8 pt-6">
            {/* Botões de navegação */}
            {wizardStep < 3 && (
              <div className="flex gap-4">
                {wizardStep > 0 ? (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 py-3 text-[var(--preto)] font-bold text-sm min-h-[46px] border border-[var(--cinza-med)] rounded-[var(--radius-sm)] hover:bg-[var(--cinza-leve)] transition-all cursor-pointer"
                  >
                    ← {t.wizardPrev}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 py-3 text-[var(--preto)] font-bold text-sm min-h-[46px] border border-[var(--cinza-med)] rounded-[var(--radius-sm)] hover:bg-[var(--cinza-leve)] transition-all cursor-pointer"
                  >
                    ← {t.wizardCancel}
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  variant={canAdvance() ? "default" : "secondary"}
                  className={`flex-1 py-3 font-bold text-sm min-h-[46px] rounded-[var(--radius-sm)] transition-all border-none cursor-pointer ${
                    canAdvance()
                      ? "bg-gradient-to-r from-[#0D7377] to-[#14544A] text-white hover:opacity-95 shadow-lg shadow-[var(--primary)]/15 hover:scale-[1.01]"
                      : "bg-[var(--cinza-med)] text-[var(--cinza-txt)] cursor-not-allowed opacity-50 shadow-none"
                  }`}
                >
                  {t.wizardNext}
                </Button>
              </div>
            )}

            {wizardStep === 3 && (
              <Button
                variant="outline"
                onClick={() => setWizardStep(2)}
                className="w-full py-3 text-[var(--preto)] font-bold text-sm min-h-[46px] border border-[var(--cinza-med)] rounded-[var(--radius-sm)] hover:bg-[var(--cinza-leve)] transition-all cursor-pointer"
              >
                ← {t.wizardPrev}
              </Button>
            )}
          </div>
        </div>
      </div>
    </FundoVisual>
  );
}
