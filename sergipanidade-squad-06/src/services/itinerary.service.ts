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
export function gerarRoteiroLocal(
  dados: {
    who: string;
    days: number;
    startDate: string;
    interests: string[];
    budget: string;
  },
  idioma: "pt" | "en" | "es",
): ParadaGerada[] {
  const totalParadas = dados.days * 3; // 3 paradas por dia
  const categoriasCompativeis = getMatchedCategories(dados.interests);

  // Embaralha primeiro para que desempates de pontuação sejam aleatórios
  const embaralhado = embaralharArray(destinations);

  // Calcula pontuação estática (não leva em conta uso ainda)
  const pontuados = embaralhado.map((d) => ({
    destination: d,
    score:
      categoriasCompativeis.size > 0 &&
      [...categoriasCompativeis].some((cat) =>
        d.category.toUpperCase().includes(cat),
      )
        ? 2
        : 1,
  }));

  // Ordena por pontuação decrescente – o embaralhar já introduz variação
  pontuados.sort((a, b) => b.score - a.score);

  const periodos = getPeriodLabels(idioma);
  const resultado: ParadaGerada[] = [];
  const contagemUso = new Map<string, number>(); // quantas vezes cada destino foi usado

  // Inicializa contagem de uso em zero para todos os destinos pontuados
  for (const item of pontuados) {
    contagemUso.set(item.destination.id, 0);
  }

  for (let i = 0; i < totalParadas; i++) {
    const dia = Math.floor(i / 3) + 1;
    const periodo = periodos[i % 3];

    // Paradas já atribuídas no mesmo dia – evitamos duplicação diária
    const paradasDoDia = resultado.filter((stop) => stop.dia === dia);
    const usadosNoDia = new Set(paradasDoDia.map((stop) => stop.destinationId));

    // ID da parada anterior (mesmo dia ou dia anterior) – evita consecutividade
    const idDestinoAnterior = i > 0 ? resultado[i - 1].destinationId : null;

    // 1️⃣ Primeiro, filtramos candidatos que não violem nenhuma restrição
    let candidatos = pontuados.filter((item) => {
      const id = item.destination.id;
      if (usadosNoDia.has(id)) return false; // mesma dia
      if (id === idDestinoAnterior) return false; // consecutivo
      return true;
    });

    // 2️⃣ Se não houver candidatos, relaxamos a restrição “mesmo dia”
    if (candidatos.length === 0) {
      candidatos = pontuados.filter(
        (item) => item.destination.id !== idDestinoAnterior,
      );
    }

    // 3️⃣ Se ainda assim vazio, aceitamos qualquer destino
    if (candidatos.length === 0) {
      candidatos = pontuados;
    }

    // 4️⃣ Priorizamos destinos **não usados ainda** (contagemUso 0). Se houver,
    //    restringimos a esse subconjunto; caso contrário, usamos todos.
    const aindaNaoUsados = candidatos.filter(
      (item) => (contagemUso.get(item.destination.id) ?? 0) === 0,
    );
    const pool = aindaNaoUsados.length > 0 ? aindaNaoUsados : candidatos;

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

    // Atualiza contagem de uso
    contagemUso.set(
      destinoSelecionado.id,
      (contagemUso.get(destinoSelecionado.id) ?? 0) + 1,
    );

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
 * - Envia um prompt estruturado à API do Gemini.
 * - Valida rigorosamente cada objeto retornado usando `isParadaValida`.
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
  },
  idioma: "pt" | "en" | "es",
): Promise<{ paradas: ParadaGerada[]; isAI: boolean }> {
  try {
    const destinosDisponiveis = destinations.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      bairro: d.bairro,
      description:
        idioma === "en"
          ? d.shortDesc_en || d.shortDesc
          : idioma === "es"
            ? d.shortDesc_es || d.shortDesc
            : d.shortDesc,
    }));

    const periodos = getPeriodLabels(idioma);
    const totalParadas = dados.days * 3;
    const maxDestinosUnicos = destinations.length;

    const prompt = `\nYou are the AI assistant of "Sergipanidade", a tourism portal for Aracaju, Sergipe, Brazil.\nYour ONLY task is to return a valid JSON array representing a travel itinerary. Do not write anything else.\n\nUSER PREFERENCES:\n- Companion profile: ${dados.who} (solo, casal/couple, familia/family, grupo/group)\n- Trip duration: ${dados.days} day(s)\n- Interests: ${dados.interests.join(", ")}\n- Budget: ${dados.budget} (economico=budget-friendly, moderado=mid-range, premium=luxury)\n- Language for the "dica" field: ${idioma === "pt" ? "Brazilian Portuguese" : idioma === "es" ? "Spanish" : "English"}\n\nAVAILABLE DESTINATIONS (use ONLY these exact IDs — do NOT invent new ones):\n${JSON.stringify(destinosDisponiveis, null, 2)}\n\nALLOWED PERIOD VALUES (use EXACTLY one of these per stop, in this cyclic order within each day):\n${JSON.stringify(periodos)}\n\nRULES:\n1. Generate exactly ${totalParadas} stops total (${dados.days} day(s) × 3 stops/day).\n2. Within each day, assign periods in order: ${periodos
      .map((p, i) => `stop ${i + 1} → "${p}"`)
      .join(
        ", ",
      )}.\n3. Prioritize destinations that match the user's interests and budget level.\n4. Never repeat the same destination within the same day.\n5. There are only ${maxDestinosUnicos} unique destinations available. If ${totalParadas} > ${maxDestinosUnicos}, reuse destinations minimally and NEVER place the same destination on consecutive days.\n6. The "dica" field must be written in the requested language, personalized for the companion profile (${dados.who}) and budget (${dados.budget}). Make it specific and practical.\n7. Return ONLY the JSON array. No markdown fences, no explanation text. Start with [ and end with ].\n\nEXPECTED FORMAT:\n[\n  { "destinationId": "exact-id-string", "dia": 1, "periodo": "${periodos[0]}", "dica": "personalized tip in the correct language" },\n  { "destinationId": "exact-id-string", "dia": 1, "periodo": "${periodos[1]}", "dica": "personalized tip in the correct language" },\n  { "destinationId": "exact-id-string", "dia": 1, "periodo": "${periodos[2]}", "dica": "personalized tip in the correct language" }\n]\n`;

    const textoRespostaIA = await gerarRoteiroComIA(prompt);

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

    if (parseado.length !== totalParadas) {
      throw new Error(
        `O tamanho da resposta da IA (${parseado.length}) não corresponde ao número esperado de paradas (${totalParadas})`,
      );
    }

    // Validação e correção de IDs inexistentes
    const paradasValidas: ParadaGerada[] = parseado.map((item) => {
      if (!isParadaValida(item)) {
        throw new Error(
          `A IA retornou um objeto com campos ausentes ou inválidos: ${JSON.stringify(item)}`,
        );
      }

      const destinoExiste = destinations.some(
        (d) => d.id === item.destinationId,
      );

      if (!destinoExiste) {
        // Substitui por um ID válido aleatório
        const idFallback =
          destinations[Math.floor(Math.random() * destinations.length)].id;
        return { ...item, destinationId: idFallback };
      }

      return item;
    });

    return { paradas: paradasValidas, isAI: true };
  } catch (erro) {
    if (import.meta.env.DEV) {
      console.warn(
        "[DEV] Falha na geração de roteiro por IA do Gemini — usando fallback local:",
        erro,
      );
    }
    return { paradas: gerarRoteiroLocal(dados, idioma), isAI: false };
  }
}
