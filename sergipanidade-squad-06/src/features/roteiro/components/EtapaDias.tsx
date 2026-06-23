
import * as SliderPrimitive from "@radix-ui/react-slider";

const obterDataLocalHoje = (): string => {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

interface EtapaDiasProps {
  t: any;
  days: number;
  startDate: string;
  stopsPerDay: number;
  onChangeDays: (days: number) => void;
  onChangeStartDate: (date: string) => void;
  onChangeStopsPerDay: (stops: number) => void;
}

export function EtapaDias({
  t,
  days,
  startDate,
  stopsPerDay,
  onChangeDays,
  onChangeStartDate,
  onChangeStopsPerDay,
}: EtapaDiasProps) {
  const getEndDate = () => {
    if (!startDate) return "";
    const d = new Date(startDate + "T12:00:00");
    d.setDate(d.getDate() + days - 1);
    return d.toISOString().slice(0, 10);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h2 className="font-semibold font-display tracking-tight text-xl text-[var(--preto)]">
          {t.wizardDaysTitle}
        </h2>
        <div className="flex items-baseline gap-1 bg-[var(--teal-leve)] px-3 py-1 rounded-full border border-[var(--primary)]/20 shrink-0">
          <span className="font-semibold font-display text-xl text-[var(--primary)] leading-none">
            {days}
          </span>
          <span className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
            {t.wizardDaysLabel || "dias"}
          </span>
        </div>
      </div>
      <p className="text-[var(--cinza-txt)] text-xs mb-3">
        {t.questions.days}
      </p>

      {/* Controle deslizante (Slider) compacto */}
      <SliderPrimitive.Root
        value={[days]}
        onValueChange={([v]) => onChangeDays(v)}
        min={1}
        max={7}
        step={1}
        className="relative flex items-center select-none touch-none w-full h-4 my-2.5 cursor-pointer"
      >
        <SliderPrimitive.Track className="relative bg-[var(--cinza-med)] rounded-full h-1 flex-1">
          <SliderPrimitive.Range className="absolute bg-[var(--primary)] rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-[18px] h-[18px] bg-[var(--primary)] border-2 border-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>

      {/* Marcadores de dias individuais */}
      <div className="flex justify-between mb-5 px-1">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <button
            key={d}
            onClick={() => onChangeDays(d)}
            className={`w-7 h-7 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
              days === d
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--cinza-leve)] text-[var(--cinza-txt)] hover:bg-[var(--cinza-med)]/40"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Seletor de paradas por dia */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs font-bold text-[var(--cinza-txt)] block">
            {t.wizardStopsPerDayLabel || "Paradas por dia"}
          </label>
          {stopsPerDay === 3 && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--teal-leve)] text-[var(--primary)]"
            >
              ✨ {t.wizardStopsRecommended || "Recomendado"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => onChangeStopsPerDay(n)}
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-[var(--radius-sm)] text-[10px] font-bold transition-all cursor-pointer"
              style={{
                background:
                  stopsPerDay === n
                    ? "linear-gradient(135deg, #0D7377, #14544A)"
                    : "var(--cinza-leve)",
                color: stopsPerDay === n ? "#fff" : "var(--cinza-txt)",
                boxShadow:
                  stopsPerDay === n
                    ? "0 4px 12px rgba(13,115,119,0.15)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {n}
              </span>
              <span style={{ fontSize: "9px", opacity: 0.8 }}>
                {n === 1
                  ? t.wizardStopsRelaxed || "relaxado"
                  : n === 2
                  ? t.wizardStopsModerate || "moderado"
                  : n === 3
                  ? t.wizardStopsIdeal || "ideal"
                  : t.wizardStopsIntense || "intenso"}
              </span>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-[var(--cinza-txt)] mt-2 text-center italic">
          {stopsPerDay === 1 &&
            (t.wizardStopsHint1 || "Ritmo tranquilo — tempo de sobra em cada local")}
          {stopsPerDay === 2 &&
            (t.wizardStopsHint2 || "Bom equilíbrio entre exploração e descanso")}
          {stopsPerDay === 3 &&
            (t.wizardStopsHint3 || "Recomendado para aproveitar o dia completo")}
          {stopsPerDay === 4 &&
            (t.wizardStopsHint4 || "Roteiro intenso — ótimo para quem quer ver tudo")}
        </p>
      </div>

      {/* Seletores de datas (início e fim) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-[var(--cinza-txt)] mb-1 block uppercase tracking-wide">
            {t.wizardStartDateLabel}
          </label>
          <input
            type="date"
            value={startDate}
            min={obterDataLocalHoje()}
            onChange={(e) => onChangeStartDate(e.target.value)}
            onBlur={(e) => {
              if (!e.target.value) {
                onChangeStartDate(obterDataLocalHoje());
              }
            }}
            className="w-full px-3 py-2 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-xs bg-white focus:border-[var(--primary)] outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--cinza-txt)] mb-1 block uppercase tracking-wide">
            {t.wizardEndDateLabel}
          </label>
          <input
            type="date"
            disabled
            value={getEndDate()}
            className="w-full px-3 py-2 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-xs bg-[var(--cinza-leve)] text-[var(--cinza-txt)] cursor-not-allowed opacity-75"
          />
          <p className="text-[9px] text-[var(--cinza-txt)] mt-1 opacity-70">
            {t.wizardEndDateAuto ||
              (t.wizardStartDateLabel === "Start date"
                ? "Auto-calculated"
                : t.wizardStartDateLabel === "Fecha de inicio"
                  ? "Calculada automáticamente"
                  : "Calculada automaticamente")}
          </p>
        </div>
      </div>
    </div>
  );
}
