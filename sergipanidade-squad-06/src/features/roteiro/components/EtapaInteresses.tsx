import { getInterestOptions } from "../constants/opcoesAssistente";

interface EtapaInteressesProps {
  t: any;
  language: "pt" | "en" | "es";
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
}

export function EtapaInteresses({
  t,
  language,
  selectedInterests,
  onChange,
}: EtapaInteressesProps) {
  const interestOptions = getInterestOptions(t);

  const handleToggle = (value: string) => {
    const isSelected = selectedInterests.includes(value);
    if (isSelected) {
      onChange(selectedInterests.filter((item) => item !== value));
    } else {
      onChange([...selectedInterests, value]);
    }
  };

  return (
    <div>
      <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
        {t.wizardInterestsTitle}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-6">
        {t.wizardInterestsHint}
      </p>
      <div className="flex flex-wrap gap-3">
        {interestOptions.map((opt) => {
          const sel = selectedInterests.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleToggle(opt.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all min-h-[44px] ${
                sel
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--cinza-med)] bg-white text-[var(--preto)] hover:border-[var(--primary)]/60"
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selectedInterests.length > 0 && (
        <p className="mt-4 text-xs text-[var(--verde)] font-bold">
          ✓ {selectedInterests.length}{" "}
          {language === "pt"
            ? "selecionados"
            : language === "es"
              ? "seleccionados"
              : "selected"}
        </p>
      )}
    </div>
  );
}
