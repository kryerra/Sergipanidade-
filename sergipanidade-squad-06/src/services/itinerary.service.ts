/**
 * Serviço de Roteiro (Itinerary Service)
 * Centraliza a lógica de negócios para gerar roteiros de viagem com base nas preferências do usuário.
 *
 * Funções exportadas:
 *  - gerarRoteiroLocal             → geração offline/local (sem IA).
 *  - gerarRoteiroComIAComFallback  → geração via Gemini com fallback local robusto.
 */

import { destinations } from "@/constants/destinations";
import { getMatchedCategories } from "@/constants/interests";
import { getPeriodLabels } from "@/constants/periods";
import { ParadaGerada } from "@/types";
import { gerarRoteiroComIA } from "./gemini/gemini.service";

/* ──────────────────────────────────────
   Constantes
   ────────────────────────────────────── */

/** Timeout rígido para chamadas de IA (em milissegundos). */
export const TIMEOUT_IA_MS = 12000;

/* ──────────────────────────────────────
   Utilitários Privados
   ────────────────────────────────────── */

/**
 * Embaralha um array usando o algoritmo Fisher‑Yates.
 * Retorna um **novo** array, nunca modifica o original.
 * Complexidade: O(n) – ideal para garantir variação aleatória sem viés.
 */
function embaralharArray<T>(array: T[]): T[] {
  const embaralhado = [...array];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
}

/**
 * Type guard que valida se um objeto desconhecido possui todos os campos
 * obrigatórios de `ParadaGerada`. Isso protege contra respostas incompletas
 * da IA que poderiam causar falhas inesperadas.
 */
function isParadaValida(p: unknown): p is ParadaGerada {
  if (typeof p !== "object" || p === null) return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.destinationId === "string" &&
    typeof obj.dia === "number" &&
    typeof obj.periodo === "string" &&
    typeof obj.dica === "string"
  );
}

/**
 * Gera uma chave de cache estável para o sessionStorage,
 * baseada nos dados do wizard e no idioma selecionado.
 */
function gerarChaveCache(
  dados: { who: string; days: number; startDate: string; interests: string[]; budget: string },
  idioma: string,
): string {
  const payload = JSON.stringify({ ...dados, idioma });
  // Hash simples baseado em string para chave compacta
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const chr = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Converte para inteiro de 32 bits
  }
  return `sergipanidade_roteiro_${hash}`;
}

/**
 * Remove paradas com `destinationId` duplicado no MESMO DIA, mantendo sempre a primeira ocorrência.
 * Retorna um novo array sem duplicatas diárias.
 */
function removerParadasDuplicadas(paradas: ParadaGerada[]): ParadaGerada[] {
  const chavesVistas = new Set<string>();
  return paradas.filter((p) => {
    const chave = `${p.dia}-${p.destinationId}`;
    if (chavesVistas.has(chave)) return false;
    chavesVistas.add(chave);
    return true;
  });
}

/**
 * Preenche vagas restantes com destinos compatíveis da base local.
 * Usada quando a deduplicação reduz o número de paradas abaixo do esperado.
 */
function preencherVagas(
  paradasExistentes: ParadaGerada[],
  totalEsperado: number,
  dados: { interests: string[]; stopsPerDay?: number },
  idioma: "pt" | "en" | "es",
): ParadaGerada[] {
  if (paradasExistentes.length >= totalEsperado) return paradasExistentes;

  const idsUsados = new Set(paradasExistentes.map((p) => p.destinationId));
  const categoriasCompativeis = getMatchedCategories(dados.interests);
  const periodos = getPeriodLabels(idioma);
  const paradasPorDia = dados.stopsPerDay ?? 3;

  // Ordena destinos disponíveis priorizando os compatíveis com interesses
  let candidatosFiltrados = destinations.filter((d) => !idsUsados.has(d.id));
  if (candidatosFiltrados.length === 0) {
    // Se todos os destinos já foram usados, relaxa a restrição e permite reuso
    candidatosFiltrados = destinations;
  }

  const candidatos = embaralharArray(candidatosFiltrados).sort((a, b) => {
    const scoreA =
      categoriasCompativeis.size > 0 &&
      [...categoriasCompativeis].some((cat) => a.category.toUpperCase().includes(cat))
        ? 2
        : 1;
    const scoreB =
      categoriasCompativeis.size > 0 &&
      [...categoriasCompativeis].some((cat) => b.category.toUpperCase().includes(cat))
        ? 2
        : 1;
    return scoreB - scoreA;
  });

  const resultado = [...paradasExistentes];
  let indiceCandidato = 0;

  while (resultado.length < totalEsperado && candidatos.length > 0) {
    const dest = candidatos[indiceCandidato % candidatos.length];
    const index = resultado.length;
    const dia = Math.floor(index / paradasPorDia) + 1;
    const periodo = periodos[index % paradasPorDia] ?? periodos[index % periodos.length];

    const dicaBruta =
      idioma === "en"
        ? dest.tip_en || dest.tip
        : idioma === "es"
          ? dest.tip_es || dest.tip
          : dest.tip;
    const dica = (dicaBruta.split(/(?<=[.!?])\s/)[0] || dicaBruta).trim();

    resultado.push({
      destinationId: dest.id,
      dia,
      periodo,
      dica,
    });
    indiceCandidato++;
  }

  return resultado;
}

/**
 * Encontra um destino substituto inteligente para um ID inválido retornado pela IA.
 * Hierarquia de busca:
 *  1. Mesma categoria do destino esperado
 *  2. Mesmo bairro/região do destino esperado
 *  3. Qualquer destino aleatório (último recurso)
 */
function encontrarSubstitutoInteligente(
  idInvalido: string,
  idsJaUsados: Set<string>,
  categoriaEsperada?: string,
): string {
  const candidatosDisponiveis = destinations.filter((d) => !idsJaUsados.has(d.id));

  if (candidatosDisponiveis.length === 0) {
    // Último recurso: qualquer destino
    return destinations[Math.floor(Math.random() * destinations.length)].id;
  }

  // 1️⃣ Tenta encontrar por mesma categoria
  if (categoriaEsperada) {
    const porCategoria = candidatosDisponiveis.filter((d) =>
      d.category.toUpperCase().includes(categoriaEsperada.toUpperCase()),
    );
    if (porCategoria.length > 0) {
      return porCategoria[Math.floor(Math.random() * porCategoria.length)].id;
    }
  }

  // 2️⃣ Tenta encontrar por mesmo bairro (se puder inferir do ID inválido)
  // Algumas IDs inválidas podem conter o nome do bairro parcialmente
  const partesBairro = idInvalido.split("-");
  if (partesBairro.length > 1) {
    const porBairro = candidatosDisponiveis.filter((d) =>
      partesBairro.some(
        (parte) =>
          parte.length > 3 && d.bairro.toLowerCase().includes(parte.toLowerCase()),
      ),
    );
    if (porBairro.length > 0) {
      return porBairro[Math.floor(Math.random() * porBairro.length)].id;
    }
  }

  // 3️⃣ Último recurso: destino aleatório não usado
  return candidatosDisponiveis[Math.floor(Math.random() * candidatosDisponiveis.length)].id;
}

/* ──────────────────────────────────────
   API Pública
   ────────────────────────────────────── */

/**
 * Gerador de roteiro local (sem chamadas de API/IA).
 * Esta função cria um itinerário básico, totalmente offline, usando apenas
 * os dados estáticos de destinos e as preferências fornecidas pelo usuário.
 *
 * **Passos do algoritmo**
 * 1️⃣ **Embaralhamento** – Utilizamos o algoritmo Fisher‑Yates para
 *    randomizar a ordem dos destinos antes de pontuar. Isso garante
 *    variedade entre execuções, mesmo quando os destinos têm pontuação
 *    idêntica.
 * 2️⃣ **Compatibilidade** – Cada destino é comparado com as categorias
 *    de interesse escolhidas pelo usuário. Se houver correspondência, o
 *    destino recebe pontuação **2**, caso contrário **1**.
 * 3️⃣ **Ordenação** – Os destinos são ordenados por pontuação decrescente.
 *    O embaralhamento anterior serve como critério de desempate.
 * 4️⃣ **Distribuição** – Iteramos sobre o número total de paradas
 *    (dias × 3). Para cada parada escolhemos um candidato que respeita
 *    as regras de não‑repetição no mesmo dia e não permite destinos
 *    consecutivos.
 * 5️⃣ **Dicas** – Extraímos a primeira frase da dica do destino para
 *    manter o texto curto e direto nos cards da UI.
 *
 * O resultado final é um array de objetos `ParadaGerada` contendo
 * `destinationId`, `dia`, `periodo` e a `dica` resumida.
 */
/**
 * Classifica um destino em termos de custo orçamentário.
 */
function obterCustoDestino(id: string): "economico" | "moderado" | "premium" {
  switch (id) {
    case "canion-xingo":
      return "premium";
    case "miauteria":
    case "memorial-sergipe":
    case "museu-gente":
      return "moderado";
    case "orla-atalaia":
    case "parque-sementeira":
    case "centro-historico":
    case "mercado-thales":
    default:
      return "economico";
  }
}

export function gerarRoteiroLocal(
  dados: {
    who: string;
    days: number;
    startDate: string;
    interests: string[];
    budget: string;
    stopsPerDay?: number;
  },
  idioma: "pt" | "en" | "es",
): ParadaGerada[] {
  const paradasPorDia = dados.stopsPerDay ?? 3;
  const totalParadas = dados.days * paradasPorDia;
  const categoriasCompativeis = getMatchedCategories(dados.interests);

  // Embaralha primeiro para que desempates de pontuação sejam aleatórios
  const embaralhado = embaralharArray(destinations);

  // Calcula pontuação estática considerando categorias e orçamento
  const pontuados = embaralhado.map((d) => {
    let score = 1;

    // Bônus se categoria bate com interesses
    const matchesInterests =
      categoriasCompativeis.size > 0 &&
      [...categoriasCompativeis].some((cat) =>
        d.category.toUpperCase().includes(cat),
      );
    if (matchesInterests) {
      score += 2;
    }

    // Bônus/penalidade baseados no orçamento (budget)
    const custoDestino = obterCustoDestino(d.id);
    if (custoDestino === dados.budget) {
      score += 1.0;
    } else if (
      (dados.budget === "economico" && custoDestino === "premium") ||
      (dados.budget === "premium" && custoDestino === "economico")
    ) {
      score -= 0.5;
    }

    return {
      destination: d,
      score,
    };
  });

  // Ordena por pontuação decrescente – o embaralhar já introduz variação
  pontuados.sort((a, b) => b.score - a.score);

  const periodos = getPeriodLabels(idioma);
  const resultado: ParadaGerada[] = [];
  const contagemUso = new Map<string, number>(); // quantas vezes cada destino foi usado
  const usadosGlobal = new Set<string>(); // Tarefa 5: Set global para deduplicação absoluta
  const usadosNoDiaMap = new Map<number, Set<string>>(); // Tarefa 8: rastreia IDs por dia

  // Inicializa contagem de uso em zero para todos os destinos pontuados
  for (const item of pontuados) {
    contagemUso.set(item.destination.id, 0);
  }

  for (let i = 0; i < totalParadas; i++) {
    const dia = Math.floor(i / paradasPorDia) + 1;
    const periodo = periodos[i % paradasPorDia] ?? periodos[i % periodos.length];

    // Tarefa 8: Mantém set de IDs usados no dia para evitar duplicatas
    if (!usadosNoDiaMap.has(dia)) {
      usadosNoDiaMap.set(dia, new Set());
    }
    const usadosNoDia = usadosNoDiaMap.get(dia)!;

    // ID da parada anterior (mesmo dia ou dia anterior) – evita consecutividade
    const idDestinoAnterior = i > 0 ? resultado[i - 1].destinationId : null;

    // 1️⃣ Primeiro, filtramos candidatos que não violem nenhuma restrição
    let candidatos = pontuados.filter((item) => {
      const id = item.destination.id;
      if (usadosNoDia.has(id)) return false; // mesma dia
      if (id === idDestinoAnterior) return false; // consecutivo
      return true;
    });

    // 2️⃣ Se não houver candidatos, relaxamos a restrição "mesmo dia"
    if (candidatos.length === 0) {
      candidatos = pontuados.filter(
        (item) => item.destination.id !== idDestinoAnterior,
      );
    }

    // 3️⃣ Se ainda assim vazio, aceitamos qualquer destino
    if (candidatos.length === 0) {
      candidatos = pontuados;
    }

    // 4️⃣ Priorizamos destinos nunca usados globalmente.
    //    Só permite repetição quando todos os destinos foram esgotados.
    const naoUsadosGlobal = candidatos.filter(
      (item) => !usadosGlobal.has(item.destination.id),
    );
    const pool = naoUsadosGlobal.length > 0 ? naoUsadosGlobal : candidatos;

    // 5️⃣ Calculamos pontuação dinâmica penalizando destinos já usados.
    const candidatosPontuados = pool.map((item) => {
      const uso = contagemUso.get(item.destination.id) ?? 0;
      // Penalidade de 1.5 ponto por uso – forte influência para evitar repetições
      const pontuacaoDinamica = item.score - uso * 1.5;
      return { item, pontuacaoDinamica };
    });

    // 6️⃣ Selecionamos o candidato com maior pontuação dinâmica
    candidatosPontuados.sort(
      (a, b) => b.pontuacaoDinamica - a.pontuacaoDinamica,
    );
    const destinoSelecionado = candidatosPontuados[0].item.destination;

    // Atualiza contagem de uso e set de dia
    contagemUso.set(
      destinoSelecionado.id,
      (contagemUso.get(destinoSelecionado.id) ?? 0) + 1,
    );
    usadosNoDia.add(destinoSelecionado.id);
    usadosGlobal.add(destinoSelecionado.id); // Tarefa 5: Registra uso global

    // Extrai dica no idioma solicitado, garantindo que haja sempre algum texto
    const dicaBruta =
      idioma === "en"
        ? destinoSelecionado.tip_en || destinoSelecionado.tip
        : idioma === "es"
          ? destinoSelecionado.tip_es || destinoSelecionado.tip
          : destinoSelecionado.tip;
    // Usa apenas a primeira frase para manter os cards curtos
    const dica = (dicaBruta.split(/(?<=[.!?])\s/)[0] || dicaBruta).trim();

    resultado.push({
      destinationId: destinoSelecionado.id,
      dia,
      periodo,
      dica,
    });
  }

  return resultado;
}

/**
 * Gerador de roteiro com IA (Gemini) + fallback local robusto.
 *
 * - Implementa timeout rígido de 7 segundos (TIMEOUT_IA_MS).
 * - Usa cache de sessão (sessionStorage) para evitar chamadas repetidas.
 * - Envia um prompt estruturado à API do Gemini.
 * - Valida rigorosamente cada objeto retornado usando `isParadaValida`.
 * - Remove paradas duplicadas e preenche vagas com destinos compatíveis.
 * - Aplica merge inteligente de IDs inválidos (por categoria → bairro → aleatório).
 * - Caso a IA falhe por qualquer motivo (quota, rede, JSON inválido, IDs
 *   inexistentes), o fallback **local** (`gerarRoteiroLocal`) garante que o usuário
 *   sempre receba um resultado.
 *
 * @returns { paradas, isAI } – `isAI` indica se a resposta veio da IA.
 */
export async function gerarRoteiroComIAComFallback(
  dados: {
    who: string;
    days: number;
    startDate: string;
    interests: string[];
    budget: string;
    stopsPerDay?: number;
  },
  idioma: "pt" | "en" | "es",
  signal?: AbortSignal,
): Promise<{ paradas: ParadaGerada[]; isAI: boolean }> {
  // ── Cache de sessão ──
  const chaveCache = gerarChaveCache(dados, idioma);
  try {
    const cacheHit = sessionStorage.getItem(chaveCache);
    if (cacheHit) {
      const parsed = JSON.parse(cacheHit);
      if (parsed) {
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Formato antigo: apenas um array (tratar como isAI: true e migrar para o novo formato)
          const paradas = parsed;
          const isAI = true;
          // Migra o formato no cache
          try {
            sessionStorage.setItem(chaveCache, JSON.stringify({ paradas, isAI }));
          } catch {}
          return { paradas, isAI };
        } else if (typeof parsed === "object" && Array.isArray(parsed.paradas)) {
          // Novo formato: { paradas, isAI }
          return { paradas: parsed.paradas, isAI: !!parsed.isAI };
        }
      }
    }
  } catch {
    // Cache corrompido – ignora e segue com geração normal
  }

  try {
    const destinosDisponiveis = destinations.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      bairro: d.bairro,
    }));

    const periodos = getPeriodLabels(idioma);
    const paradasPorDia = dados.stopsPerDay ?? 3;
    const totalParadas = dados.days * paradasPorDia;
    const maxDestinosUnicos = destinations.length;

    const prompt = `\nYou are the AI assistant of "Sergipanidade", a tourism portal for Aracaju, Sergipe, Brazil.\nYour ONLY task is to return a valid JSON array representing a travel itinerary. Do not write anything else.\n\nUSER PREFERENCES:\n- Companion profile: ${dados.who} (solo, casal/couple, familia/family, grupo/group)\n- Trip duration: ${dados.days} day(s)\n- Interests: ${dados.interests.join(", ")}\n- Budget: ${dados.budget} (economico=budget-friendly, moderado=mid-range, premium=luxury)\n- Language for the "dica" field: ${idioma === "pt" ? "Brazilian Portuguese" : idioma === "es" ? "Spanish" : "English"}\n\nAVAILABLE DESTINATIONS (use ONLY these exact IDs — do NOT invent new ones):\n${JSON.stringify(destinosDisponiveis, null, 2)}\n\nALLOWED PERIOD VALUES (use EXACTLY one of these per stop, in this cyclic order within each day):\n${JSON.stringify(periodos)}\n\nRULES:\n1. Generate exactly ${totalParadas} stops total (${dados.days} day(s) × ${paradasPorDia} stops/day).\n2. Within each day, assign periods in order: ${periodos.slice(0, paradasPorDia).map((p, i) => `stop ${i + 1} → "${p}"`).join(", ")}.\n3. Prioritize destinations that match the user's interests and budget level.\n4. Never repeat the same destination within the same day.\n5. There are only ${maxDestinosUnicos} unique destinations available. If ${totalParadas} > ${maxDestinosUnicos}, reuse destinations minimally and NEVER place the same destination on consecutive days.\n6. The "dica" field must be written in the requested language, personalized for the companion profile (${dados.who}) and budget (${dados.budget}). Keep it very short, direct and practical (at most 1 sentence, maximum 15-20 words) to optimize response latency. Crucial: Do NOT include any emojis (e.g., no 🚗, no 🏖️, no ✨, etc.) in the "dica" field.\n7. Return ONLY the JSON array. No markdown fences, no explanation text. Start with [ and end with ].\n\nEXPECTED FORMAT:\n[\n  { "destinationId": "exact-id-string", "dia": 1, "periodo": "${periodos[0]}", "dica": "personalized tip in the correct language" }\n]\n`;

    // ── Tarefa 1: Timeout rígido de 5 segundos ──
    // Cria um AbortController interno para o timeout, combinado com o signal externo
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_IA_MS);

    // Se o signal externo for abortado, aborta o timeout controller também
    const onExternalAbort = () => timeoutController.abort();
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId);
        throw new DOMException("Aborted", "AbortError");
      }
      signal.addEventListener("abort", onExternalAbort);
    }

    const schemaRoteiro = {
      type: "ARRAY",
      description: "Lista de paradas que compõem o roteiro turístico",
      items: {
        type: "OBJECT",
        properties: {
          destinationId: {
            type: "STRING",
            description: "ID exato do destino selecionado a partir da lista AVAILABLE DESTINATIONS (ex: 'museu-gente', 'orla-atalaia'). Não use o nome do destino, use apenas seu ID exato."
          },
          dia: {
            type: "INTEGER",
            description: "O número do dia da parada, iniciando em 1."
          },
          periodo: {
            type: "STRING",
            description: "O período correspondente da parada de acordo com ALLOWED PERIOD VALUES."
          },
          dica: {
            type: "STRING",
            description: "Dica de viagem personalizada para a parada no idioma solicitado."
          }
        },
        required: ["destinationId", "dia", "periodo", "dica"]
      }
    };

    let textoRespostaIA: string;
    try {
      textoRespostaIA = await gerarRoteiroComIA(prompt, timeoutController.signal, schemaRoteiro);
    } finally {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener("abort", onExternalAbort);
      }
    }

    // Remove fences caso a IA os adicione
    let jsonLimpo = textoRespostaIA.trim();
    if (jsonLimpo.startsWith("```")) {
      jsonLimpo = jsonLimpo
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    const parseado: unknown = JSON.parse(jsonLimpo);

    if (!Array.isArray(parseado)) {
      throw new Error("A resposta da IA não é um array");
    }

    // Tarefa 2: Validação tolerante — aceita arrays entre totalParadas-1 e totalParadas+2.
    // Arrays menores são completados por preencherVagas(); arrays maiores são truncados.
    if (parseado.length < totalParadas - 1 || parseado.length > totalParadas + 2) {
      throw new Error(
        `Resposta da IA fora da faixa tolerada: ${parseado.length} paradas (esperado entre ${totalParadas - 1} e ${totalParadas + 2})`,
      );
    }
    // Trunca se vier com paradas extras
    if (parseado.length > totalParadas) {
      parseado.splice(totalParadas);
    }

    // ── Tarefa 7: Merge inteligente de IDs inválidos ──
    const idsJaUsados = new Set<string>();
    const paradasValidas: ParadaGerada[] = parseado.map((item) => {
      if (!isParadaValida(item)) {
        throw new Error(
          `A IA retornou um objeto com campos ausentes ou inválidos: ${JSON.stringify(item)}`,
        );
      }

      // Remove emojis do campo dica para manter o texto limpo e profissional
      const dicaLimpa = item.dica
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

      const destinoExiste = destinations.some(
        (d) => d.id === item.destinationId,
      );

      if (!destinoExiste) {
        // Tenta inferir a categoria do item inválido por similaridade parcial
        const idProximo = destinosDisponiveis.find(
          (d) =>
            item.destinationId.toLowerCase().includes(d.id.toLowerCase()) ||
            d.id.toLowerCase().includes(item.destinationId.toLowerCase()),
        );
        const categoriaInferida = idProximo?.category;

        const idSubstituto = encontrarSubstitutoInteligente(
          item.destinationId,
          idsJaUsados,
          categoriaInferida,
        );
        idsJaUsados.add(idSubstituto);
        return { ...item, destinationId: idSubstituto, dica: dicaLimpa };
      }

      idsJaUsados.add(item.destinationId);
      return { ...item, dica: dicaLimpa };
    });

    // ── Tarefa 8: Remover paradas duplicadas do fluxo IA ──
    let paradasFinais = removerParadasDuplicadas(paradasValidas);

    // Se a deduplicação reduziu o número, preenche com destinos compatíveis
    if (paradasFinais.length < totalParadas) {
      paradasFinais = preencherVagas(paradasFinais, totalParadas, dados, idioma);
    }

    // Normaliza dias e períodos para garantir a consistência absoluta do roteiro e respeitar a escolha do usuário
    const periodosCabecalho = getPeriodLabels(idioma);
    paradasFinais = paradasFinais.map((p, index) => {
      const diaCalculado = Math.floor(index / paradasPorDia) + 1;
      const periodoCalculado = periodosCabecalho[index % paradasPorDia] ?? periodosCabecalho[index % periodosCabecalho.length];
      return {
        ...p,
        dia: diaCalculado,
        periodo: periodoCalculado,
      };
    });

    // Salvar no cache de sessão (apenas resultados de IA)
    try {
      sessionStorage.setItem(chaveCache, JSON.stringify({ paradas: paradasFinais, isAI: true }));
    } catch {
      // sessionStorage cheio ou indisponível – segue sem cache
    }

    return { paradas: paradasFinais, isAI: true };
  } catch (erro) {
    if (signal?.aborted) {
      throw erro;
    }
    const isTimeout = (erro instanceof Error && erro.name === 'AbortError') || 
                      (erro && typeof erro === 'object' && (erro as any).name === 'AbortError');
    if (isTimeout) {
      if (import.meta.env.DEV) {
        console.warn("[DEV] Timeout atingido — ativando fallback local.");
      }
      try {
        return { paradas: gerarRoteiroLocal(dados, idioma), isAI: false };
      } catch (errLocal) {
        if (import.meta.env.DEV) {
          console.error("[DEV] Erro no fallback local:", errLocal);
        }
        throw erro;
      }
    }
    if (import.meta.env.DEV) {
      console.warn(
        "[DEV] Falha na geração de roteiro por IA do Gemini — usando fallback local:",
        erro,
      );
    }
    try {
      return { paradas: gerarRoteiroLocal(dados, idioma), isAI: false };
    } catch (errLocal) {
      if (import.meta.env.DEV) {
        console.error("[DEV] Erro no fallback local:", errLocal);
      }
      throw erro;
    }
  }
}
