import * as SliderPrimitive from "@radix-ui/react-slider";

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
      <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
        {t.wizardDaysTitle}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-8">
        {t.questions.days}
      </p>

      {/* Número grande em destaque */}
      <div className="text-center mb-6">
        <div className="font-['Fjalla_One'] text-[80px] leading-none text-[var(--primary)]">
          {days}
        </div>
        <p className="text-[var(--cinza-txt)] text-sm">
          {t.wizardDaysLabel}
        </p>
      </div>

      {/* Controle deslizante (Slider) */}
      <SliderPrimitive.Root
        value={[days]}
        onValueChange={([v]) => onChangeDays(v)}
        min={1}
        max={7}
        step={1}
        className="relative flex items-center select-none touch-none w-full h-5 mb-8"
      >
        <SliderPrimitive.Track className="relative bg-[var(--cinza-med)] rounded-full h-2.5 flex-1">
          <SliderPrimitive.Range className="absolute bg-[var(--primary)] rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-7 h-7 bg-[var(--primary)] border-2 border-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>

      {/* Marcadores de dias individuais */}
      <div className="flex justify-between mb-8 px-1">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <button
            key={d}
            onClick={() => onChangeDays(d)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
              days === d
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--cinza-leve)] text-[var(--cinza-txt)]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Seletor de paradas por dia */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-bold text-[var(--cinza-txt)] block">
            {t.wizardStopsPerDayLabel || "Paradas por dia"}
          </label>
          {stopsPerDay === 3 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(13,115,119,0.1)",
                color: "var(--primary)",
              }}
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
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-[var(--radius-sm)] text-xs font-bold transition-all"
              style={{
                background:
                  stopsPerDay === n
                    ? "linear-gradient(135deg, #0D7377, #14544A)"
                    : "var(--cinza-leve)",
                color: stopsPerDay === n ? "#fff" : "var(--cinza-txt)",
                border:
                  stopsPerDay === n
                    ? "2px solid transparent"
                    : "2px solid transparent",
                boxShadow:
                  stopsPerDay === n
                    ? "0 0 0 2px rgba(13,115,119,0.3)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontFamily: "var(--font-display, 'Fjalla One')",
                  lineHeight: 1,
                }}
              >
                {n}
              </span>
              <span style={{ fontSize: "10px", opacity: 0.8 }}>
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

        <p className="text-[11px] text-[var(--cinza-txt)] mt-2 text-center">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--cinza-txt)] mb-1.5 block">
            {t.wizardStartDateLabel}
          </label>
          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => onChangeStartDate(e.target.value)}
            onBlur={(e) => {
              // Fix iOS Safari: limpar o campo não dispara onChange
              if (!e.target.value) {
                onChangeStartDate(new Date().toISOString().slice(0, 10));
              }
            }}
            className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-white focus:border-[var(--primary)] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--cinza-txt)] mb-1.5 block">
            {t.wizardEndDateLabel}
          </label>
          <input
            type="date"
            disabled
            value={getEndDate()}
            className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-[var(--cinza-leve)] text-[var(--cinza-txt)] cursor-not-allowed opacity-75"
          />
          <p className="text-[10px] text-[var(--cinza-txt)] mt-1 opacity-70">
            {/* Calculada automaticamente com base nos dias */}
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
