import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { destinations } from '../data/destinations';
import { translations } from '../data/translations';

const GEMINI_KEY = "AIzaSyDnk8hppYIUf-REqRfHATFDf2c9wLkKP2o";

// ─── Extrai o retryDelay (em ms) sugerido pelo erro 429, ou null ──────────────
function parseRetryDelayMs(err: any): number | null {
  try {
    const msg: string = err?.message ?? '';
    const match = msg.match(/retry in ([\d.]+)s/i);
    if (match) return Math.ceil(parseFloat(match[1])) * 1000;
  } catch {}
  return null;
}

// ─── Retorna true se o erro indica cota diária/total esgotada (sem retry útil) ─
function isDailyQuotaExhausted(err: any): boolean {
  const msg: string = err?.message ?? '';
  return (
    msg.includes('generate_content_free_tier_requests') &&
    msg.includes('PerDayPerProjectPerModel')
  );
}

export interface ParadaGerada {
  destinationId: string;
  dia: number;
  periodo: string;
  dica: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRoteiroPronto: (paradas: ParadaGerada[]) => void;
  language: 'pt' | 'en' | 'es';
}

// ─── Normaliza string removendo acentos para comparação ───────────────────────
function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ─── Mapeamento de palavras-chave de interesse → categoria do destino ─────────
const INTEREST_CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['praia', 'beach', 'playa', 'praias', 'beaches', 'playas'], category: 'PRAIA' },
  { keywords: ['gastronom', 'food', 'comida', 'culinaria', 'culinária'], category: 'GASTRONOMIA' },
  { keywords: ['cultur', 'arte', 'art'], category: 'CULTURA' },
  { keywords: ['histor', 'history', 'historia', 'patrimoni'], category: 'HISTÓRIA' },
  { keywords: ['nature', 'naturez', 'natural', 'eco'], category: 'NATUREZA' },
  { keywords: ['pet', 'animal', 'bicho'], category: 'PET FRIENDLY' },
];

// ─── Gerador de roteiro local (sem API) ───────────────────────────────────────
function gerarRoteiroLocal(
  respostas: Record<string, string | string[]>,
  language: 'pt' | 'en' | 'es'
): ParadaGerada[] {
  // Determina número de paradas pela duração
  const diasStr = normalize(respostas.dias as string);
  let numParadas: number;
  if (diasStr.includes('1 dia') || diasStr.includes('1 day') || diasStr.includes('1 d')) {
    numParadas = 3;
  } else if (/2|3/.test(diasStr)) {
    numParadas = 5;
  } else if (/4|5|6|7/.test(diasStr)) {
    numParadas = 7;
  } else {
    numParadas = 8;
  }

  // Coleta os interesses selecionados
  const interesses = Array.isArray(respostas.interesses)
    ? (respostas.interesses as string[])
    : [respostas.interesses as string];

  // Descobre quais categorias foram selecionadas
  const matchedCategories = new Set<string>();
  interesses.forEach(interesse => {
    const norm = normalize(interesse);
    INTEREST_CATEGORY_MAP.forEach(({ keywords, category }) => {
      if (keywords.some(kw => norm.includes(kw))) {
        matchedCategories.add(category);
      }
    });
  });

  // Pontua os destinos: 2 para match de interesse, 1 para os demais
  const scored = destinations.map(d => ({
    d,
    score:
      matchedCategories.size > 0 &&
      [...matchedCategories].some(cat =>
        d.category.toUpperCase().includes(cat)
      )
        ? 2
        : 1,
  }));

  // Ordena por pontuação; dentro da mesma pontuação mantém ordem original
  scored.sort((a, b) => b.score - a.score);

  const selected = scored
    .slice(0, Math.min(numParadas, scored.length))
    .map(s => s.d);

  // Labels de período por idioma
  const periodos: Record<string, string[]> = {
    pt: ['manhã', 'tarde', 'noite'],
    en: ['morning', 'afternoon', 'evening'],
    es: ['mañana', 'tarde', 'noche'],
  };

  return selected.map((d, i) => {
    const dia = Math.floor(i / 3) + 1;
    const periodo = periodos[language][i % 3];
    const rawTip =
      language === 'en'
        ? d.tip_en || d.tip
        : language === 'es'
        ? d.tip_es || d.tip
        : d.tip;
    // Usa a primeira frase como dica
    const dica = (rawTip.split(/(?<=[.!?])\s/)[0] || rawTip).trim();

    return { destinationId: d.id, dia, periodo, dica };
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function RoteiroPerguntasModal({ isOpen, onClose, onRoteiroPronto, language }: Props) {
  const t = translations[language];

  const steps = [
    {
      id: 'grupo',
      pergunta: t.questions.who,
      opcoes: [
        t.options.who.alone,
        t.options.who.couple,
        t.options.who.family,
        t.options.who.friends,
      ],
      multiplo: false,
    },
    {
      id: 'dias',
      pergunta: t.questions.days,
      opcoes: [
        t.options.days.d1,
        t.options.days.d2to3,
        t.options.days.d4to7,
        t.options.days.more1w,
      ],
      multiplo: false,
    },
    {
      id: 'interesses',
      pergunta: t.questions.interests,
      opcoes: [
        t.options.interests.beaches,
        t.options.interests.gastronomy,
        t.options.interests.culture,
        t.options.interests.history,
        t.options.interests.nature,
        t.options.interests.pet,
      ],
      multiplo: true,
    },
    {
      id: 'ritmo',
      pergunta: t.questions.pace,
      opcoes: [
        t.options.pace.slow,
        t.options.pace.moderate,
        t.options.pace.fast,
      ],
      multiplo: false,
    },
  ];

  const [stepAtual, setStepAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const step = steps[stepAtual];

  const selecionar = (opcao: string) => {
    if (step.multiplo) {
      const atual = (respostas[step.id] as string[]) || [];
      const nova = atual.includes(opcao)
        ? atual.filter(o => o !== opcao)
        : [...atual, opcao];
      setRespostas({ ...respostas, [step.id]: nova });
    } else {
      setRespostas({ ...respostas, [step.id]: opcao });
    }
  };

  const isSelecionado = (opcao: string) => {
    const r = respostas[step.id];
    return Array.isArray(r) ? r.includes(opcao) : r === opcao;
  };

  const podeAvancar = () => {
    const r = respostas[step.id];
    return Array.isArray(r) ? r.length > 0 : !!r;
  };

  const avancar = () => {
    if (stepAtual < steps.length - 1) {
      setStepAtual(stepAtual + 1);
    } else {
      gerarRoteiro();
    }
  };

  const finalizarComParadas = (paradas: ParadaGerada[]) => {
    setLoading(false);
    onRoteiroPronto(paradas);
    onClose();
    resetar();
  };

  const gerarRoteiro = async () => {
    setLoading(true);
    setErro('');

    // ── Chamada à API do Gemini (extraída para permitir retry) ────────────────
    const chamarGemini = async (): Promise<ParadaGerada[]> => {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const listaDestinos = destinations.map(d => ({
        id: d.id,
        nome: d.name,
        categoria: d.category,
        descricao: d.shortDesc,
        regiao: d.region,
      }));

      const prompt = `
Você é um especialista em turismo em Sergipe, Brasil.
Com base nas preferências abaixo, gere um roteiro personalizado usando APENAS os destinos da lista fornecida.
O idioma da dica deve ser: ${language === 'pt' ? 'Português' : language === 'en' ? 'Inglês' : 'Espanhol'}.

PREFERÊNCIAS DO VIAJANTE:
- Grupo: ${respostas.grupo}
- Duração: ${respostas.dias}
- Interesses: ${Array.isArray(respostas.interesses) ? respostas.interesses.join(', ') : respostas.interesses}
- Ritmo: ${respostas.ritmo}

DESTINOS DISPONÍVEIS:
${JSON.stringify(listaDestinos, null, 2)}

Responda APENAS com um JSON válido, sem texto adicional, sem markdown, sem explicações.
O JSON deve ter exatamente este formato:
{
  "paradas": [
    {
      "destinationId": "id_exato_do_destino",
      "dia": 1,
      "periodo": "manhã",
      "dica": "dica curta e personalizada de até 2 frases no idioma solicitado"
    }
  ]
}

Regras:
- Use entre 3 e 8 paradas no total dependendo da duração
- periodo deve ser: manhã, tarde ou noite
- Priorize destinos que combinam com os interesses informados
- Se família com crianças, evite destinos inadequados para crianças
- A dica deve ser personalizada para o perfil do viajante, escrita no idioma solicitado.
- Use apenas ids que existem na lista de destinos fornecida
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      if (!response) throw new Error('Resposta vazia da API.');

      const text = response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Nenhum JSON encontrado na resposta.');

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.paradas || !Array.isArray(parsed.paradas) || parsed.paradas.length === 0) {
        throw new Error('Formato de resposta inválido.');
      }
      return parsed.paradas;
    };

    // ── Tenta a API do Gemini com um retry inteligente em caso de 429 ─────────
    try {
      const paradas = await chamarGemini();
      finalizarComParadas(paradas);
      return;
    } catch (apiErr: any) {
      const is429 = String(apiErr?.message ?? '').includes('429');

      if (is429 && !isDailyQuotaExhausted(apiErr)) {
        // Cota por minuto esgotada: aguarda o delay sugerido e tenta uma vez mais
        const delayMs = parseRetryDelayMs(apiErr) ?? 15000;
        if (delayMs <= 30000) {
          console.info(`Gemini rate-limit 429 — retry em ${delayMs / 1000}s…`);
          await new Promise(r => setTimeout(r, delayMs));
          try {
            const paradas = await chamarGemini();
            finalizarComParadas(paradas);
            return;
          } catch (retryErr: any) {
            console.info('Retry Gemini falhou, usando gerador local:', retryErr?.message ?? retryErr);
          }
        } else {
          console.info('Gemini rate-limit com delay longo, usando gerador local.');
        }
      } else {
        // Cota diária esgotada ou outro erro: fallback imediato
        console.info('API Gemini indisponível, usando gerador local:', apiErr?.message ?? apiErr);
      }
    }

    // ── Fallback: gerador local baseado nos interesses ────────────────────────
    try {
      const paradas = gerarRoteiroLocal(respostas, language);
      finalizarComParadas(paradas);
    } catch (localErr: any) {
      console.error('Falha no gerador local:', localErr);
      setErro(t.itineraryError);
      setLoading(false);
    }
  };

  const resetar = () => {
    setStepAtual(0);
    setRespostas({});
    setErro('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) { resetar(); onClose(); } }}>
      <DialogContent className="max-w-full sm:max-w-md w-full h-[100dvh] sm:h-auto p-0 gap-0 border-0 overflow-hidden rounded-none sm:rounded-[var(--radius)] flex flex-col [&>button]:hidden shadow-2xl bg-[var(--branco)]">
        {/* Header */}
        <div className="bg-[var(--preto)] px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 shrink-0 relative">
          <DialogTitle className="sr-only">{t.aiItineraryTitle}</DialogTitle>
          <div className="flex items-center justify-between mb-4">
            <span className="font-['Fjalla_One'] text-[var(--branco)] text-[18px] tracking-wide">
              {t.aiItineraryTitle}
            </span>
            <span className="text-[var(--cinza-med)] text-sm">
              {stepAtual + 1}/{steps.length}
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
              style={{ width: `${((stepAtual + 1) / steps.length) * 100}%` }}
            />
          </div>
          <button
            onClick={() => { resetar(); onClose(); }}
            className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 bg-[var(--branco)] flex-1 overflow-y-auto flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--preto)] font-medium text-sm text-center">{t.generatingItinerary}</p>
              <p className="text-[#888] text-xs text-center whitespace-pre-line">{t.generatingItineraryDesc}</p>
            </div>
          ) : erro ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-[var(--vermelho)] text-sm text-center">{erro}</p>
              <button
                onClick={() => { setErro(''); gerarRoteiro(); }}
                className="px-6 py-3 bg-[var(--primary)] text-[var(--branco)] rounded-[var(--radius-sm)] font-bold text-sm min-h-[44px] hover:bg-[var(--vermelho)] transition-colors"
              >
                {t.tryAgain}
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-start mt-4">
              <h2 className="font-['Fjalla_One'] text-[24px] text-[var(--preto)] mb-6 tracking-wide leading-snug">
                {step.pergunta}
              </h2>
              <div className="flex flex-col gap-3">
                {step.opcoes.map(opcao => (
                  <button
                    key={opcao}
                    onClick={() => selecionar(opcao)}
                    className={`w-full text-left px-5 py-4 rounded-[var(--radius-sm)] border-[1.5px]
                      font-medium text-[15px] transition-all duration-150 min-h-[44px]
                      ${isSelecionado(opcao)
                        ? 'bg-[rgba(0,0,128,0.05)] text-[var(--primary)] border-[var(--primary)]'
                        : 'bg-[var(--branco)] text-[var(--preto)] border-[var(--cinza-med)] hover:border-[var(--preto)]'
                      }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !erro && (
          <div className="px-6 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-[var(--branco)] border-t border-[var(--cinza-med)] flex gap-3 shrink-0">
            {stepAtual > 0 && (
              <button
                onClick={() => setStepAtual(stepAtual - 1)}
                className="flex-1 px-4 py-3.5 border-2 border-[var(--cinza-med)] text-[var(--preto)]
                           rounded-[var(--radius-sm)] font-bold text-sm hover:border-[var(--preto)] transition-colors min-h-[44px]"
              >
                {t.back}
              </button>
            )}
            <button
              onClick={avancar}
              disabled={!podeAvancar()}
              className={`flex-1 px-4 py-3.5 rounded-[var(--radius-sm)] font-bold text-sm transition-all min-h-[44px]
                ${podeAvancar()
                  ? 'bg-[var(--primary)] text-[var(--branco)] hover:bg-[var(--vermelho)] shadow-sm'
                  : 'bg-gray-100 text-[#aaa] cursor-not-allowed'
                }`}
            >
              {stepAtual < steps.length - 1 ? t.continue : t.generateItineraryBtn}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}