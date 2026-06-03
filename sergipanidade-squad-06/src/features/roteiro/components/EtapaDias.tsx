import * as SliderPrimitive from "@radix-ui/react-slider";

interface EtapaDiasProps {
  t: any;
  days: number;
  startDate: string;
  onChangeDays: (days: number) => void;
  onChangeStartDate: (date: string) => void;
}

export function EtapaDias({
  t,
  days,
  startDate,
  onChangeDays,
  onChangeStartDate,
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
            className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-white focus:border-[var(--primary)] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--cinza-txt)] mb-1.5 block">
            {t.wizardEndDateLabel}
          </label>
          <input
            type="date"
            readOnly
            value={getEndDate()}
            className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-[var(--cinza-leve)] text-[var(--cinza-txt)] cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
