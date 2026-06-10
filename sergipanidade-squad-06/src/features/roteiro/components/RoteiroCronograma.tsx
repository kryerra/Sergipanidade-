import {
  Calendar,
  Share2,
  RefreshCcw,
  ChevronDown,
  Clock,
  Navigation2,
  Eye,
  Trash2,
  Car,
  Plus,
  MapPin,
  Star,
  Check,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";
import { useMemo, useState, useEffect, useRef } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { getDestinationById } from "@/constants/destinations";
import type { Destination } from "@/constants/destinations";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ParadaGerada, WizardData, RoteiroItem } from "@/types";
import { travelLabel } from "@/utils/geo";
import { PERIODO_TIME, PERIODO_DUR, getPeriodLabels } from "@/constants/periods";
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

/**
 * Removes emojis from text strings.
 */
function removerEmojis(texto: string) {
  if (!texto) return "";
  return texto.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F300}-\u{1F5FF}]/gu, "").trim();
}

function truncarTexto(texto: string, limite = 120) {
  const limpo = removerEmojis(texto).replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  return `${limpo.slice(0, limite - 3).trim()}...`;
}

/**
 * Returns inline SVG for the period.
 */
function getPeriodIcon(periodo: string) {
  const p = periodo.toLowerCase();
  if (p === "manhã" || p === "morning" || p === "mañana") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <circle cx="12" cy="12" r="4" fill="#E9D8B4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    );
  }
  if (p === "tarde" || p === "afternoon") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33-2.91 1.65 1.65 0 0 0-3-1A4.36 4.36 0 0 0 8.5 13a4 4 0 0 0-2.5 7.5h11a3.5 3.5 0 0 0 2.4-5.5z" fill="#f59e0b" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#3b82f6" />
    </svg>
  );
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
  const paradasTimeline = useMemo(() => {
    const mapGerado = new Map<string, ParadaGerada>();
    generatedParadas.forEach((p) => mapGerado.set(p.destinationId, p));
    const paradasPorDia = wizardData.stopsPerDay ?? 3;
    const periodosFallback = getPeriodLabels(language);

    return roteiro
      .map((item, i) => {
        const dest = getDestinationById(item.destinationId);
        if (!dest) return null;

        const dadosIA = mapGerado.get(item.destinationId);
        if (dadosIA) {
          return {
            destinationId: item.destinationId,
            dia: dadosIA.dia,
            periodo: dadosIA.periodo,
            dica: item.note || dadosIA.dica || "",
            destination: dest,
          };
        }
        return {
          destinationId: item.destinationId,
          dia: Math.floor(i / paradasPorDia) + 1,
          periodo: periodosFallback[i % paradasPorDia] ?? periodosFallback[i % periodosFallback.length],
          dica: item.note || dest.tip || "",
          destination: dest,
        };
      })
      .filter(Boolean) as (ParadaGerada & { destination: Destination })[];
  }, [generatedParadas, roteiro, wizardData.stopsPerDay, language]);

  const mapStops = useMemo(() => paradasTimeline.map((p) => p.destination), [paradasTimeline]);

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

  /** Divide os dias em grupos de no máximo 3 para paginação das imagens */
  const paginasDias = useMemo(() => {
    const chunked: number[][] = [];
    const chunkSize = 2;
    for (let i = 0; i < dias.length; i += chunkSize) {
      chunked.push(dias.slice(i, i + chunkSize));
    }
    return chunked;
  }, [dias]);


  const compartilharRoteiro = async () => {
    const linhasResumo = dias.flatMap((dia) => {
      const dataDia = capitalizar(formatarDataDia(dataInicio, dia - 1, language));
      const paradas = todasParadasDoDia(dia).map((p) => {
        const horario = PERIODO_TIME[p.periodo] || "09:00";
        return `- ${p.destination.name} (${p.periodo}, ${horario})`;
      });

      return [`Dia ${dia} - ${dataDia}`, ...paradas];
    });

    const texto = [
      "Meu Roteiro em Aracaju - Sergipanidade",
      "",
      ...linhasResumo,
      "",
      "sergipanidade.com.br",
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Meu Roteiro em Aracaju",
          text: texto,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        onToast(
          language === "pt"
            ? "Roteiro copiado para compartilhar."
            : language === "es"
            ? "Itinerario copiado para compartir."
            : "Itinerary copied to share."
        );
        return;
      }

      const link = document.createElement("a");
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(texto)}`;
      link.download = "roteiro-aracaju.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast(
        language === "pt"
          ? "Arquivo do roteiro pronto para compartilhar."
          : language === "es"
          ? "Archivo del itinerario listo para compartir."
          : "Itinerary file ready to share."
      );
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      onToast(
        language === "pt"
          ? "Nao foi possivel compartilhar o roteiro."
          : language === "es"
          ? "No fue posible compartir el itinerario."
          : "Could not share the itinerary."
      );
    }
  };

  const compartilharComoImagem = async () => {
    if (paginasDias.length === 0) return;

    onToast(
      language === "pt"
        ? "🖼️ Gerando imagem..."
        : language === "es"
        ? "🖼️ Generando imagen..."
        : "🖼️ Generating image..."
    );

    try {
      const canvases: HTMLCanvasElement[] = [];

      for (let pagIndex = 0; pagIndex < paginasDias.length; pagIndex++) {
        const elemento = document.getElementById(`roteiro-captura-${pagIndex}`);
        if (!elemento) continue;
        const canvas = await html2canvas(elemento, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        canvases.push(canvas);
      }

      if (canvases.length === 0) {
        onToast(
          language === "pt"
            ? "Nao foi possivel gerar a imagem."
            : language === "es"
            ? "No fue posible generar la imagen."
            : "Could not generate the image."
        );
        return;
      }

      // Tenta compartilhar como arquivos via Web Share API
      const arquivos = await Promise.all(
        canvases.map((canvas, i) =>
          new Promise<File>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error("Blob vazio"));
              const nome = canvases.length === 1
                ? "roteiro-aracaju.png"
                : `roteiro-aracaju-parte${i + 1}.png`;
              resolve(new File([blob], nome, { type: "image/png" }));
            }, "image/png");
          })
        )
      );

      const podeCompartilharArquivos =
        navigator.canShare && navigator.canShare({ files: arquivos });

      if (navigator.share && podeCompartilharArquivos) {
        try {
          await navigator.share({
            title: "Meu Roteiro — Sergipanidade",
            files: arquivos,
          });
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
          baixarImagens(canvases);
        }
      } else {
        baixarImagens(canvases);
      }

      onToast(
        language === "pt"
          ? `✅ ${canvases.length > 1 ? `${canvases.length} imagens prontas!` : "Imagem do roteiro pronta!"}`
          : language === "es"
          ? `✅ ${canvases.length > 1 ? `¡${canvases.length} imágenes listas!` : "¡Imagen del itinerario lista!"}`
          : `✅ ${canvases.length > 1 ? `${canvases.length} images ready!` : "Itinerary image ready!"}`
      );
    } catch {
      onToast(
        language === "pt"
          ? "❌ Não foi possível gerar a imagem"
          : "❌ Could not generate image"
      );
    }
  };

  const baixarImagens = (canvases: HTMLCanvasElement[]) => {
    canvases.forEach((canvas, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = canvases.length === 1
          ? "roteiro-aracaju.png"
          : `roteiro-aracaju-parte${i + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 300);
    });
  };

  const exportarParaCalendario = () => {
    const formatarDataICS = (dataBase: string, offsetDia: number, hora: string): string => {
      const d = new Date(dataBase + "T12:00:00");
      d.setDate(d.getDate() + offsetDia);
      const [hh, mm] = hora.split(":").map(Number);
      d.setHours(hh, mm, 0, 0);
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const horaFim = (hora: string): string => {
      const [hh, mm] = hora.split(":").map(Number);
      const total = hh * 60 + mm + 120; // +2 horas de duração estimada
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const linhas: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sergipanidade//Roteiro//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    paradasTimeline.forEach((p, i) => {
      const hora = PERIODO_TIME[p.periodo] || "09:00";
      const dtStart = formatarDataICS(dataInicio, p.dia - 1, hora);
      const dtEnd = formatarDataICS(dataInicio, p.dia - 1, horaFim(hora));

      linhas.push(
        "BEGIN:VEVENT",
        `UID:sergipanidade-${p.destinationId}-${i}@app`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${p.destination.name}`,
        `DESCRIPTION:${p.dica.replace(/,/g, "\\,")}`,
        `LOCATION:${p.destination.address}`,
        "END:VEVENT"
      );
    });

    linhas.push("END:VCALENDAR");

    const blob = new Blob([linhas.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roteiro-aracaju.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast(
      language === "pt"
        ? "📅 Roteiro exportado! Abra o arquivo .ics para importar no seu calendário."
        : language === "es"
        ? "📅 ¡Itinerario exportado! Abra el archivo .ics para importar en su calendario."
        : "📅 Itinerary exported! Open the .ics file to import into your calendar."
    );
  };

  /* ── Estado de confirmação de remoção por parada ── */
  const exportarCalendarioICS = () => {
    if (paradasTimeline.length === 0) {
      onToast(
        language === "pt"
          ? "Nao ha paradas para salvar no calendario."
          : language === "es"
          ? "No hay paradas para guardar en el calendario."
          : "There are no stops to save to the calendar."
      );
      return;
    }

    const timezone = "America/Sao_Paulo";

    const normalizarTextoICS = (texto: string) =>
      removerEmojis(texto || "")
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");

    const dobrarLinhaICS = (linha: string) => {
      const limite = 73;
      const partes: string[] = [];
      let restante = linha;

      while (restante.length > limite) {
        partes.push(restante.slice(0, limite));
        restante = ` ${restante.slice(limite)}`;
      }

      partes.push(restante);
      return partes;
    };

    const adicionarLinha = (linhas: string[], linha: string) => {
      linhas.push(...dobrarLinhaICS(linha));
    };

    const formatarDataLocalICS = (dataBase: string, offsetDia: number, hora: string): string => {
      const [ano, mes, dia] = dataBase.split("-").map(Number);
      const [hh, mm] = hora.split(":").map(Number);
      const data = new Date(Date.UTC(ano, mes - 1, dia + offsetDia, hh, mm, 0));

      const y = String(data.getUTCFullYear());
      const m = String(data.getUTCMonth() + 1).padStart(2, "0");
      const d = String(data.getUTCDate()).padStart(2, "0");
      const h = String(data.getUTCHours()).padStart(2, "0");
      const min = String(data.getUTCMinutes()).padStart(2, "0");
      return `${y}${m}${d}T${h}${min}00`;
    };

    const formatarAgoraUTC = () =>
      new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    const minutosDuracao = (periodo: string) => {
      const duracao = PERIODO_DUR[periodo] || "2h";
      const horas = duracao.match(/(\d+)\s*h/);
      const minutos = duracao.match(/(\d+)\s*min/);
      return (horas ? Number(horas[1]) * 60 : 0) + (minutos ? Number(minutos[1]) : 0) || 120;
    };

    const horaFim = (hora: string, periodo: string): string => {
      const [hh, mm] = hora.split(":").map(Number);
      const total = hh * 60 + mm + minutosDuracao(periodo);
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    const agora = formatarAgoraUTC();
    const linhas: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sergipanidade//Roteiro Aracaju//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Roteiro Aracaju - Sergipanidade",
      `X-WR-TIMEZONE:${timezone}`,
      "BEGIN:VTIMEZONE",
      `TZID:${timezone}`,
      "X-LIC-LOCATION:America/Sao_Paulo",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0300",
      "TZOFFSETTO:-0300",
      "TZNAME:-03",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];

    paradasTimeline.forEach((p, i) => {
      const horaInicio = PERIODO_TIME[p.periodo] || "09:00";
      const dtStart = formatarDataLocalICS(dataInicio, p.dia - 1, horaInicio);
      const dtEnd = formatarDataLocalICS(dataInicio, p.dia - 1, horaFim(horaInicio, p.periodo));
      const descricao = [
        p.dica,
        "",
        `Periodo: ${p.periodo}`,
        `Endereco: ${p.destination.address}`,
      ].filter(Boolean).join("\n");

      linhas.push("BEGIN:VEVENT");
      adicionarLinha(linhas, `UID:sergipanidade-${dataInicio}-${p.destinationId}-${i}@sergipanidade.com.br`);
      adicionarLinha(linhas, `DTSTAMP:${agora}`);
      adicionarLinha(linhas, `CREATED:${agora}`);
      adicionarLinha(linhas, `LAST-MODIFIED:${agora}`);
      adicionarLinha(linhas, `DTSTART;TZID=${timezone}:${dtStart}`);
      adicionarLinha(linhas, `DTEND;TZID=${timezone}:${dtEnd}`);
      adicionarLinha(linhas, `SUMMARY:${normalizarTextoICS(p.destination.name)}`);
      adicionarLinha(linhas, `DESCRIPTION:${normalizarTextoICS(descricao)}`);
      adicionarLinha(linhas, `LOCATION:${normalizarTextoICS(p.destination.address)}`);
      adicionarLinha(linhas, "STATUS:CONFIRMED");
      adicionarLinha(linhas, "TRANSP:OPAQUE");
      linhas.push("END:VEVENT");
    });

    linhas.push("END:VCALENDAR");

    const conteudoICS = `\uFEFF${linhas.join("\r\n")}\r\n`;
    const blob = new Blob([conteudoICS], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roteiro-aracaju.ics";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    onToast(
      language === "pt"
        ? "Calendario .ics gerado. Abra o arquivo para importar seu roteiro."
        : language === "es"
        ? "Calendario .ics generado. Abra el archivo para importar su itinerario."
        : "Calendar .ics generated. Open the file to import your itinerary."
    );
  };

  const [confirmando, setConfirmando] = useState<string | null>(null);
  const timerConfirmRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const iniciarConfirmacao = (id: string) => {
    if (timerConfirmRef.current) clearTimeout(timerConfirmRef.current);
    setConfirmando(id);
    timerConfirmRef.current = setTimeout(() => setConfirmando(null), 3000);
  };

  const cancelarConfirmacao = () => {
    if (timerConfirmRef.current) clearTimeout(timerConfirmRef.current);
    setConfirmando(null);
  };

  const confirmarRemocao = (id: string) => {
    if (timerConfirmRef.current) clearTimeout(timerConfirmRef.current);
    setConfirmando(null);
    onRemoveFromRoteiro(id);
  };

  // Limpa o timer ao desmontar
  useEffect(() => () => { if (timerConfirmRef.current) clearTimeout(timerConfirmRef.current); }, []);

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
                { icon: <Share2 size={14} />, label: t.timelineShareBtn, onClick: compartilharComoImagem },
                { icon: <Calendar size={14} />, label: t.timelineCalendarBtn, onClick: exportarCalendarioICS },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  title={label}
                  className="flex items-center gap-1.5 px-3 py-2 text-white/80 rounded-[var(--radius-sm)] hover:text-white transition-all min-h-[44px]"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {icon}
                  <span className="text-[10px] sm:text-xs font-bold">{label}</span>
                </button>
              ))}

              {/* Botão Regenerar — destaque */}
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-[var(--radius-sm)] transition-all hover:scale-105 min-h-[44px]"
                style={{
                  background: "linear-gradient(135deg, #E9D8B4 0%, #d4c09a 100%)",
                  color: "#0D2B2E",
                  boxShadow: "0 2px 12px rgba(233,216,180,0.4)",
                }}
              >
                <RefreshCcw size={14} />
                <span className="text-[10px] sm:text-xs font-bold">{t.timelineRegenerateBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo: Linha do Tempo + Mapa ── */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-8 py-8"
        style={{ animation: "cronogramaFadeInUp 0.4s ease-out both" }}
      >
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ESQUERDA: Acordeão de dias */}
          <div className="flex-1 min-w-0">
            <AccordionPrimitive.Root
              type="multiple"
              value={openDays}
              onValueChange={setOpenDays}
              className="space-y-4"
            >
              {dias.map((dia, diaIndex) => {
                const paradas = todasParadasDoDia(dia);
                const dataDia = formatarDataDia(dataInicio, dia - 1, language);
                const isOpen = openDays.includes(`day-${dia}`);

                return (
                  <AccordionPrimitive.Item
                    key={`day-${dia}`}
                    value={`day-${dia}`}
                    className="rounded-[var(--radius)] overflow-hidden transition-all"
                    style={{
                      background: "var(--branco-puro)",
                      border: isOpen
                        ? "1px solid rgba(13,115,119,0.35)"
                        : "1px solid var(--cinza-med)",
                      boxShadow: isOpen
                        ? "0 8px 32px rgba(13,115,119,0.12), 0 2px 8px rgba(0,0,0,0.06)"
                        : "var(--sombra-sm)",
                      animation: `cronogramaFadeInUp 0.4s ease-out both`,
                      animationDelay: `${diaIndex * 60}ms`,
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
                                      {/* Título */}
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
                                    {confirmando === dest.id ? (
                                      /* Estado de confirmação — dois botões com animação de entrada */
                                      <div
                                        className="ml-auto flex items-center gap-1.5"
                                        style={{ animation: "confirmFadeIn 0.2s ease-out both" }}
                                      >
                                        <span className="text-[11px] font-semibold" style={{ color: "var(--vermelho, #EF4444)" }}>
                                          {language === "pt" ? "Remover?" : language === "es" ? "¿Quitar?" : "Remove?"}
                                        </span>
                                        <button
                                          onClick={() => confirmarRemocao(dest.id)}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-bold min-h-[32px] transition-all hover:scale-105"
                                          style={{
                                            background: "#EF4444",
                                            color: "#fff",
                                          }}
                                        >
                                          <Check size={11} />
                                          {language === "pt" ? "Sim" : language === "es" ? "Sí" : "Yes"}
                                        </button>
                                        <button
                                          onClick={cancelarConfirmacao}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-bold min-h-[32px] transition-all hover:scale-105"
                                          style={{
                                            border: "1px solid var(--cinza-med)",
                                            background: "#fff",
                                            color: "var(--cinza-txt)",
                                          }}
                                        >
                                          <X size={11} />
                                          {language === "pt" ? "Não" : language === "es" ? "No" : "No"}
                                        </button>
                                      </div>
                                    ) : (
                                      /* Estado normal — botão de lixeira */
                                      <button
                                        onClick={() => iniciarConfirmacao(dest.id)}
                                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs transition-all min-h-[36px]"
                                        style={{ color: "var(--cinza-txt)" }}
                                        onMouseEnter={(e) => {
                                          (e.currentTarget as HTMLButtonElement).style.color = "var(--vermelho, #EF4444)";
                                          (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2";
                                        }}
                                        onMouseLeave={(e) => {
                                          (e.currentTarget as HTMLButtonElement).style.color = "var(--cinza-txt)";
                                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                        }}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
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
                                      color: "var(--texto-secundario)",
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
            <div
              className="mt-6 rounded-[var(--radius)] p-4"
              style={{
                background: "#fff",
                border: "1px solid var(--cinza-med)",
                boxShadow: "var(--sombra-sm)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={compartilharRoteiro}
                  className="min-h-[48px] flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-3 text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{
                    background: "linear-gradient(135deg, #0D7377, #14544A)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(13,115,119,0.25)",
                  }}
                >
                  <Share2 size={17} />
                  Compartilhar roteiro
                </button>
                <button
                  onClick={compartilharComoImagem}
                  className="min-h-[48px] flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-3 text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{
                    background: "#fff",
                    color: "var(--primary)",
                    border: "1.5px solid rgba(13,115,119,0.35)",
                  }}
                >
                  <Share2 size={17} />
                  Compartilhar como imagem
                </button>
                <button
                  onClick={exportarCalendarioICS}
                  className="min-h-[48px] flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-3 text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{
                    background: "rgba(233,216,180,0.45)",
                    color: "#0D2B2E",
                    border: "1.5px solid rgba(13,115,119,0.16)",
                  }}
                >
                  <Calendar size={17} />
                  Salvar no calendário
                </button>
              </div>
            </div>

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
                  <RoteiroMapa stops={mapStops} />
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
                      className="flex items-center gap-3 px-2 py-1.5 rounded-[6px] transition-colors"
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

      {/* ── Cards de captura para html2canvas — um por grupo de dias (fora do fluxo visual) ── */}
      {paginasDias.map((grupoDias, pagIndex) => (
        <div
          key={`captura-pag-${pagIndex}`}
          id={`roteiro-captura-${pagIndex}`}
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "400px",
            background: "#ffffff",
            fontFamily: "'Inter', sans-serif",
            padding: "0",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          {/* Linha decorativa teal no topo */}
          <div style={{ height: "6px", background: "#0D7377" }}></div>

          {/* Cabeçalho do card de captura */}
          <div
            style={{
              background: "linear-gradient(135deg, #0D2B2E 0%, #0D7377 60%, #14544A 100%)",
              padding: "24px 24px 20px",
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={{
                fontFamily: "'Fjalla One', 'Inter', sans-serif",
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#E9D8B4",
                fontSize: "22px",
                lineHeight: 1.1,
                display: "block"
              }}>
                Sergipanidade
              </span>
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", margin: "6px 0 0", fontWeight: 500 }}>
              Meu Roteiro em Aracaju
              {paginasDias.length > 1 && (
                <span style={{
                  marginLeft: "8px",
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: "20px",
                  padding: "1px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}>
                  Parte {pagIndex + 1}/{paginasDias.length}
                </span>
              )}
            </p>
          </div>

          {/* Lista de paradas agrupadas pelos dias desta página */}
          <div style={{ padding: "20px 24px", background: "#fff" }}>
            {grupoDias.map((dia) => {
              const paradasDoDia = todasParadasDoDia(dia);
              return (
                <div key={`captura-dia-${pagIndex}-${dia}`} style={{ marginBottom: "16px" }}>
                  {/* Cabeçalho do dia */}
                  <div
                    style={{
                      display: "inline-block",
                      background: "#0D7377",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                      boxShadow: "0 2px 4px rgba(13,115,119,0.2)",
                    }}
                  >
                    Dia {dia} — {capitalizar(formatarDataDia(dataInicio, dia - 1, language))}
                  </div>
                  {paradasDoDia.map((p, i) => (
                    <div
                      key={`captura-parada-${pagIndex}-${p.destinationId}-${i}`}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: i % 2 === 0 ? "#f9fafb" : "#fff",
                        border: "1px solid rgba(13,115,119,0.10)",
                        marginBottom: "6px",
                      }}
                    >
                      {/* Número — inline-block com line-height para centralização confiável no html2canvas */}
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0D7377, #14544A)",
                          color: "#fff",
                          display: "inline-block",
                          textAlign: "center",
                          lineHeight: "26px",
                          fontSize: "11px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Nome do destino sem emojis */}
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "13px", color: "#111", lineHeight: 1.3 }}>
                          {removerEmojis(p.destination.name)}
                        </p>
                        {/* Período com ícone SVG */}
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#0D7377", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          {getPeriodIcon(p.periodo)}
                          <span>{p.periodo} · {PERIODO_TIME[p.periodo] || "09:00"}</span>
                        </p>
                        {p.dica && (
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "11px",
                              color: "#555",
                              lineHeight: 1.4,
                              borderLeft: "2px solid #0D7377",
                              paddingLeft: "6px",
                            }}
                          >
                            {truncarTexto(p.dica)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Rodapé */}
          <div
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #0D2B2E, #0D7377)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}>
              sergipanidade.com.br
            </p>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes cronogramaFadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmFadeIn {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </FundoVisual>
  );
}
