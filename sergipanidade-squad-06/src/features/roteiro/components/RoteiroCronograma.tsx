import {
  Calendar,
  FileText,
  Share2,
  RefreshCcw,
  ChevronDown,
  GripVertical,
  Clock,
  Navigation2,
  Eye,
  Trash2,
  Car,
  Plus,
  MapPin,
  Star,
} from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { getDestinationById } from "@/constants/destinations";
import type { Destination } from "@/constants/destinations";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ParadaGerada, WizardData, RoteiroItem } from "@/types";
import { travelLabel } from "@/utils/geo";
import { PERIODO_TIME, PERIODO_DUR } from "@/constants/periods";
import { FundoVisual } from "./FundoVisual";
import { RoteiroMapa } from "./RoteiroMapa";
import { getWhoOptions } from "../constants/opcoesAssistente";

interface RoteiroCronogramaProps {
  t: any;
  language: "pt" | "en" | "es";
  roteiro: RoteiroItem[];
  wizardData: WizardData;
  generatedParadas: ParadaGerada[];
  onNavigate: (tela: string, idDestino?: string) => void;
  onToast: (mensagem: string) => void;
  onRemoveFromRoteiro: (idDestino: string) => void;
  onOpenGPS: (idDestino?: string) => void;
  onRegenerate: () => void;
  openDays: string[];
  setOpenDays: (dias: string[]) => void;
}

/* ─────────────── Funções Utilitárias ─────────────── */

/**
 * Formata a data de um dia específico do roteiro com base na data de início e offset de dias.
 */
function formatarDataDia(dataInicio: string, offsetDia: number, idioma: string) {
  const base = dataInicio ? new Date(dataInicio + "T12:00:00") : new Date();
  base.setDate(base.getDate() + offsetDia);
  const locale = idioma === "pt" ? "pt-BR" : idioma === "es" ? "es-ES" : "en-US";
  return base.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Capitaliza a primeira letra de uma string.
 */
function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function RoteiroCronograma({
  t,
  language,
  roteiro,
  wizardData,
  generatedParadas,
  onNavigate,
  onToast,
  onRemoveFromRoteiro,
  onOpenGPS,
  onRegenerate,
  openDays,
  setOpenDays,
}: RoteiroCronogramaProps) {
  /* ── Dados derivados da Linha do Tempo ── */
  const paradasTimeline: (ParadaGerada & { destination: Destination })[] =
    (() => {
      if (
        generatedParadas.length > 0 &&
        generatedParadas.length === roteiro.length
      ) {
        return generatedParadas
          .map((p) => ({
            ...p,
            destination: getDestinationById(p.destinationId)!,
          }))
          .filter((p) => p.destination);
      }
      return roteiro
        .map((item, i) => {
          const dest = getDestinationById(item.destinationId);
          if (!dest) return null;
          const per = ["manhã", "tarde", "noite"][i % 3];
          return {
            destinationId: item.destinationId,
            dia: Math.floor(i / 3) + 1,
            periodo: per,
            dica: item.note || "",
            destination: dest,
          };
        })
        .filter(Boolean) as (ParadaGerada & { destination: Destination })[];
    })();

  const dias = Array.from(new Set(paradasTimeline.map((p) => p.dia))).sort(
    (a, b) => a - b,
  );
  const dataInicio =
    wizardData.startDate || new Date().toISOString().slice(0, 10);

  const todasParadasDoDia = (dia: number) =>
    paradasTimeline.filter((p) => p.dia === dia);

  const opcoesAcompanhante = getWhoOptions(t);
  const rotuloAcompanhante = opcoesAcompanhante.find((o) => o.value === wizardData.who)?.label || "";

  const subtituloCabecalho = wizardData.who
    ? `Aracaju · ${wizardData.days} ${
        language === "pt" ? "dias" : language === "es" ? "días" : "days"
      } · ${rotuloAcompanhante}`
    : `${roteiro.length} ${
        roteiro.length === 1 ? t.stopPlanned : t.stopsPlanned
      }`;

  return (
    <FundoVisual className="pb-16">
      {/* ── Cabeçalho premium ── */}
      <div
        className="px-4 sm:px-8 pt-[70px] pb-6"
        style={{
          background: "linear-gradient(135deg, #0D2B2E 0%, #0D7377 60%, #14544A 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    color: "#E9D8B4",
                    border: "1px solid rgba(233,216,180,0.3)",
                  }}
                >
                  <Calendar size={11} />
                  {t.myItinerary}
                </span>
              </div>
              <h1 className="font-['Fjalla_One'] text-white text-2xl sm:text-3xl leading-tight mb-1">
                {subtituloCabecalho}
              </h1>
              <p className="text-white/50 text-xs">
                {paradasTimeline.length}{" "}
                {language === "pt" ? "paradas planejadas" : language === "es" ? "paradas planeadas" : "planned stops"}
              </p>
            </div>

            {/* Ações do cabeçalho */}
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: <FileText size={14} />, label: t.timelineExportPDF, onClick: () => onToast("📄 " + t.timelineExportPDF) },
                { icon: <Share2 size={14} />, label: t.timelineShareBtn, onClick: () => onToast("🔗 " + t.timelineShareBtn) },
                { icon: <Calendar size={14} />, label: t.timelineCalendarBtn, onClick: () => onToast("📅 " + t.timelineCalendarBtn) },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  title={label}
                  className="flex items-center gap-1.5 px-3 py-2 text-white/80 rounded-[var(--radius-sm)] text-xs font-bold hover:text-white transition-all min-h-[36px]"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}

              {/* Botão Regenerar — destaque */}
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-[var(--radius-sm)] text-xs font-bold transition-all hover:scale-105 min-h-[36px]"
                style={{
                  background: "linear-gradient(135deg, #E9D8B4 0%, #d4c09a 100%)",
                  color: "#0D2B2E",
                  boxShadow: "0 2px 12px rgba(233,216,180,0.4)",
                }}
              >
                <RefreshCcw size={14} />
                <span className="hidden sm:inline">{t.timelineRegenerateBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo: Linha do Tempo + Mapa ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ESQUERDA: Acordeão de dias */}
          <div className="flex-1 min-w-0">
            <AccordionPrimitive.Root
              type="multiple"
              value={openDays}
              onValueChange={setOpenDays}
              className="space-y-4"
            >
              {dias.map((dia) => {
                const paradas = todasParadasDoDia(dia);
                const dataDia = formatarDataDia(dataInicio, dia - 1, language);
                const isOpen = openDays.includes(`day-${dia}`);

                return (
                  <AccordionPrimitive.Item
                    key={`day-${dia}`}
                    value={`day-${dia}`}
                    className="rounded-[var(--radius)] overflow-hidden transition-all"
                    style={{
                      background: "rgba(255,255,255,0.97)",
                      backdropFilter: "blur(12px)",
                      border: isOpen
                        ? "1px solid rgba(13,115,119,0.35)"
                        : "1px solid var(--cinza-med)",
                      boxShadow: isOpen
                        ? "0 8px 32px rgba(13,115,119,0.12), 0 2px 8px rgba(0,0,0,0.06)"
                        : "var(--sombra-sm)",
                    }}
                  >
                    <AccordionPrimitive.Header>
                      <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-5 py-4 group">
                        <div className="flex items-center gap-3">
                          {/* Badge do dia */}
                          <div
                            className="flex items-center justify-center px-3 py-1.5 rounded-[8px] text-xs font-bold tracking-wide transition-all"
                            style={{
                              background: isOpen
                                ? "linear-gradient(135deg, #0D7377, #14544A)"
                                : "var(--cinza-leve)",
                              color: isOpen ? "#fff" : "var(--cinza-txt)",
                              boxShadow: isOpen
                                ? "0 0 0 3px rgba(13,115,119,0.15)"
                                : "none",
                            }}
                          >
                            {t.timelineDayLabel} {dia}
                          </div>

                          <div className="text-left">
                            <p className="font-bold text-sm text-[var(--preto)]">
                              {capitalizar(dataDia)}
                            </p>
                            <p className="text-xs text-[var(--cinza-txt)]">
                              {paradas.length}{" "}
                              {language === "pt" ? "paradas" : language === "es" ? "paradas" : "stops"}
                            </p>
                          </div>
                        </div>

                        <ChevronDown
                          size={18}
                          className="text-[var(--cinza-txt)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>

                    <AccordionPrimitive.Content className="data-[state=open]:animate-none">
                      {/* Linha divisória teal quando aberto */}
                      <div
                        className="h-px mx-5"
                        style={{
                          background: "linear-gradient(90deg, var(--primary), transparent)",
                        }}
                      />

                      <div className="px-5 pb-5 pt-4">
                        {paradas.map((parada, si) => {
                          const dest = parada.destination;
                          const horario = PERIODO_TIME[parada.periodo] || "09:00";
                          const duracao = PERIODO_DUR[parada.periodo] || "2h";
                          const proximaParada = paradas[si + 1];
                          const trajeto = proximaParada
                            ? travelLabel(dest, proximaParada.destination)
                            : null;

                          return (
                            <div key={parada.destinationId + si}>
                              {/* Card da parada */}
                              <div className="flex items-stretch gap-4">
                                {/* Conector da linha do tempo */}
                                <div className="flex flex-col items-center w-10 shrink-0 py-1">
                                  {/* Bullet numerado */}
                                  <div
                                    className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                      background: "linear-gradient(135deg, #0D7377, #14544A)",
                                      boxShadow: "0 0 0 3px rgba(13,115,119,0.2), 0 2px 8px rgba(13,115,119,0.3)",
                                    }}
                                  >
                                    {si + 1}
                                  </div>
                                  {/* Conector vertical */}
                                  {(si < paradas.length - 1 || trajeto) && (
                                    <div
                                      className="flex-1 w-0.5 my-1 min-h-[24px]"
                                      style={{
                                        background: "linear-gradient(to bottom, var(--primary), rgba(13,115,119,0.15))",
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Conteúdo do card */}
                                <div
                                  className="flex-1 rounded-[var(--radius-sm)] p-4 mb-2 transition-all duration-200 hover:shadow-[var(--sombra-md)] cursor-default group/card"
                                  style={{
                                    background: "#fff",
                                    border: "1px solid var(--cinza-med)",
                                    boxShadow: "var(--sombra-sm)",
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(13,115,119,0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cinza-med)";
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Imagem maior do destino */}
                                    <div
                                      className="w-20 h-20 rounded-[10px] overflow-hidden shrink-0"
                                      style={{
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                                      }}
                                    >
                                      <ImageWithFallback
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      {/* Título e drag handle */}
                                      <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-base">{dest.icon}</span>
                                          <h4 className="font-bold text-sm text-[var(--preto)] leading-snug">
                                            {dest.name}
                                          </h4>
                                          <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                              color: "var(--primary)",
                                              background: "var(--secondary)",
                                            }}
                                          >
                                            {dest.category}
                                          </span>
                                        </div>
                                        <GripVertical
                                          size={15}
                                          className="text-[var(--cinza-med)] shrink-0 cursor-grab mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
                                        />
                                      </div>

                                      {/* Horário e duração */}
                                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                                        <span
                                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                                          style={{
                                            background: "rgba(13,115,119,0.08)",
                                            color: "var(--primary)",
                                          }}
                                        >
                                          <Clock size={10} />
                                          {horario}
                                        </span>
                                        <span className="text-xs text-[var(--cinza-txt)]">
                                          ⏱ {duracao} {t.timelineEstDuration}
                                        </span>
                                        {dest.rating && (
                                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                            <Star size={10} className="fill-amber-400 stroke-amber-400" />
                                            {dest.rating}
                                          </span>
                                        )}
                                      </div>

                                      {/* Dica da IA destacada */}
                                      {parada.dica && (
                                        <div
                                          className="text-xs leading-relaxed rounded-[6px] px-3 py-2 mb-0.5"
                                          style={{
                                            background: "rgba(233,216,180,0.35)",
                                            borderLeft: "3px solid var(--primary)",
                                            color: "var(--cinza-txt)",
                                          }}
                                        >
                                          💡 {parada.dica}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Linha de ações */}
                                  <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--cinza-leve)" }}>
                                    <button
                                      onClick={() => onOpenGPS(dest.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-[6px] text-xs font-bold transition-all hover:scale-105 min-h-[36px]"
                                      style={{
                                        background: "linear-gradient(135deg, #0D9488, #0D7377)",
                                        boxShadow: "0 2px 8px rgba(13,148,136,0.35)",
                                      }}
                                    >
                                      <Navigation2 size={12} />
                                      {t.navigate}
                                    </button>
                                    <button
                                      onClick={() => onNavigate("detalhe", dest.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all hover:scale-105 min-h-[36px]"
                                      style={{
                                        border: "1px solid var(--cinza-med)",
                                        background: "#fff",
                                        color: "var(--preto)",
                                      }}
                                      onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
                                      }}
                                      onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cinza-med)";
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--preto)";
                                      }}
                                    >
                                      <Eye size={12} />
                                      {t.viewDetails}
                                    </button>
                                    <button
                                      onClick={() => onRemoveFromRoteiro(dest.id)}
                                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs transition-all min-h-[36px]"
                                      style={{ color: "var(--cinza-txt)" }}
                                      onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--vermelho)";
                                        (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2";
                                      }}
                                      onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--cinza-txt)";
                                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Indicador de trânsito entre paradas */}
                              {trajeto && (
                                <div className="flex items-center gap-3 py-1 pl-14">
                                  <div
                                    className="h-px flex-1 max-w-[24px]"
                                    style={{ background: "var(--cinza-med)" }}
                                  />
                                  <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                                    style={{
                                      background: "rgba(13,115,119,0.06)",
                                      color: "var(--cinza-txt)",
                                      border: "1px solid rgba(13,115,119,0.12)",
                                    }}
                                  >
                                    <Car size={11} style={{ color: "var(--primary)" }} />
                                    <span>{trajeto} · {t.timelineTravelIndicator}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Botão de adicionar parada */}
                        <div className="flex items-stretch gap-4 mt-2">
                          <div className="w-10 flex justify-center">
                            <div className="w-px h-full opacity-20" style={{ background: "var(--primary)" }} />
                          </div>
                          <button
                            onClick={() => onNavigate("guia")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-sm)] text-sm font-bold transition-all hover:scale-[1.01] min-h-[44px]"
                            style={{
                              border: "2px dashed var(--cinza-med)",
                              color: "var(--cinza-txt)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                              (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(13,115,119,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cinza-med)";
                              (e.currentTarget as HTMLButtonElement).style.color = "var(--cinza-txt)";
                              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            }}
                          >
                            <Plus size={16} />
                            {t.timelineAddStop}
                          </button>
                        </div>
                      </div>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                );
              })}
            </AccordionPrimitive.Root>

            {/* Botão para explorar mais */}
            <button
              onClick={() => onNavigate("guia")}
              className="mt-4 w-full py-3.5 rounded-[var(--radius)] text-sm font-bold transition-all hover:scale-[1.01] min-h-[44px]"
              style={{
                border: "2px dashed var(--cinza-med)",
                color: "var(--cinza-txt)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--cinza-med)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--cinza-txt)";
              }}
            >
              {t.addNewStop}
            </button>
          </div>

          {/* DIREITA: Mapa Fixo (Sticky) */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-[82px] space-y-4">
              {/* Card do mapa */}
              <div
                className="rounded-[var(--radius)] overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--cinza-med)",
                  boxShadow: "var(--sombra-md)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3.5"
                  style={{
                    borderBottom: "1px solid var(--cinza-leve)",
                    background: "linear-gradient(90deg, rgba(13,115,119,0.04), transparent)",
                  }}
                >
                  <MapPin size={15} style={{ color: "var(--primary)" }} />
                  <h3 className="font-['Fjalla_One'] text-base text-[var(--preto)]">
                    {t.timelineMapTitle}
                  </h3>
                  <span
                    className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(13,115,119,0.1)",
                      color: "var(--primary)",
                    }}
                  >
                    {paradasTimeline.length}{" "}
                    {language === "pt" ? "paradas" : language === "es" ? "paradas" : "stops"}
                  </span>
                </div>
                <div className="p-3" style={{ height: "420px" }}>
                  <RoteiroMapa stops={paradasTimeline.map((p) => p.destination)} />
                </div>
              </div>

              {/* Legenda das paradas — mais rica */}
              <div
                className="rounded-[var(--radius)] p-4"
                style={{
                  background: "#fff",
                  border: "1px solid var(--cinza-med)",
                  boxShadow: "var(--sombra-sm)",
                }}
              >
                <h4 className="font-bold text-sm text-[var(--preto)] mb-3">
                  {language === "pt" ? "Legenda do Roteiro" : language === "es" ? "Leyenda del Itinerario" : "Route Legend"}
                </h4>
                <div className="space-y-1.5">
                  {paradasTimeline.map((p, i) => (
                    <div
                      key={p.destinationId + i}
                      className="flex items-center gap-3 px-2 py-1.5 rounded-[6px] transition-colors cursor-default"
                      style={{ borderRadius: "6px" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(13,115,119,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }}
                    >
                      {/* Thumbnail do destino */}
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: "rgba(13,115,119,0.2)" }}>
                        <ImageWithFallback
                          src={p.destination.image}
                          alt={p.destination.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Número */}
                      <div
                        className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: "var(--primary)" }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm text-[var(--preto)] truncate flex-1 font-medium">
                        {p.destination.name}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "rgba(13,115,119,0.08)",
                          color: "var(--primary)",
                        }}
                      >
                        Dia {p.dia}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FundoVisual>
  );
}
