/**
 * Serviço de IA do Google Gemini — Sergipanidade
 * Utiliza a API oficial do Google AI Studio diretamente para maior velocidade (1-2s) e gratuidade.
 */

let testGeminiApiKey: string | null = null;
const MODELO_IA = "gemini-2.5-flash"; // Modelo padrão rápido e gratuito do Gemini

function getGeminiApiKey(): string | null {
  const apiKey = testGeminiApiKey ?? import.meta.env.VITE_GEMINI_API_KEY;
  return apiKey && apiKey.length > 0 ? apiKey : null;
}

export function setGeminiApiKeyForTest(apiKey: string | null): void {
  testGeminiApiKey = apiKey;
}

interface GeminiApiResponsePart {
  text?: string;
}

interface GeminiApiResponseContent {
  parts?: GeminiApiResponsePart[];
}

interface GeminiApiResponseCandidate {
  content?: GeminiApiResponseContent;
}

interface GeminiApiResponse {
  candidates?: GeminiApiResponseCandidate[];
}

interface GeminiApiErrorBody {
  error?: {
    message?: string;
    code?: string;
  };
}

/**
 * Extrai o tempo de espera sugerido (em milissegundos) a partir de um erro de limite de requisições (429).
 */
export function extrairTempoEsperaMs(erro: unknown): number | null {
  try {
    const mensagem = (erro as { message?: string })?.message ?? '';
    const correspondencia = mensagem.match(/retry in ([\d.]+)s/i);
    if (correspondencia) {
      return Math.ceil(parseFloat(correspondencia[1])) * 1000;
    }
  } catch {}
  return null;
}

/**
 * Verifica se o erro indica esgotamento da cota de requisições.
 */
export function isCotaDiariaEsgotada(erro: unknown): boolean {
  const mensagem = (erro as { message?: string })?.message ?? '';
  return (
    mensagem.includes('quota') ||
    mensagem.includes('limit') ||
    mensagem.includes('Exceeded')
  );
}

/**
 * Faz a chamada HTTP para a API oficial do Google AI Studio (Gemini).
 * Retorna em 1-2 segundos e é 100% gratuito (15 requisições por minuto).
 */
async function chamarGoogleAIStudio(prompt: string, signal?: AbortSignal, schema?: any): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Chave de API do Gemini não definida. Crie um arquivo .env com VITE_GEMINI_API_KEY.'
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_IA}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json", // Força o Gemini a retornar JSON estruturado puro
          ...(schema ? { responseSchema: schema } : {}),
        },
      }),
    }
  );

  if (!response.ok) {
    let detalheErro = response.statusText;
    const errorJson = (await response.json().catch(() => null)) as GeminiApiErrorBody | null;
    if (errorJson?.error?.message) {
      detalheErro = errorJson.error.message;
    }
    throw new Error(`Erro na chamada da API Google AI Studio (Status ${response.status}): ${detalheErro}`);
  }

  const data = (await response.json().catch(() => null)) as GeminiApiResponse | null;
  const respostaTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!respostaTexto) {
    throw new Error('Resposta inválida ou vazia da API do Google AI Studio');
  }

  return respostaTexto;
}

/**
 * Interface pública para geração de conteúdo com a IA.
 * Trata tentativas automáticas (retries) em caso de limite de requisições (erros 429).
 */
export async function gerarRoteiroComIA(prompt: string, signal?: AbortSignal, schema?: any): Promise<string> {
  const maxTentativas = 3;
  let ultimaMapeamentoErro: unknown;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      return await chamarGoogleAIStudio(prompt, signal, schema);
    } catch (erroApi: unknown) {
      ultimaMapeamentoErro = erroApi;

      if (signal?.aborted || (erroApi instanceof Error && erroApi.name === 'AbortError')) {
        throw erroApi;
      }

      const mensagem = (erroApi as { message?: string })?.message ?? '';
      const is429 = mensagem.includes('429') || mensagem.includes('Too Many Requests');
      const is503 = mensagem.includes('503') || mensagem.includes('high demand') || mensagem.includes('Service Unavailable');
      const isPermanent = isCotaDiariaEsgotada(erroApi) || mensagem.includes('400') || mensagem.includes('403') || mensagem.includes('401');

      if (isPermanent || tentativa === maxTentativas) {
        if (import.meta.env.DEV) {
          console.warn(`Erro permanente ou limite de tentativas atingido na chamada da API: ${mensagem}`);
        }
        throw erroApi;
      }

      // Determina o tempo de espera para nova tentativa
      let tempoEsperaMs = 800; // Padrão curto para 503 / instabilidades temporárias
      if (is429) {
        tempoEsperaMs = extrairTempoEsperaMs(erroApi) ?? 5000;
        if (tempoEsperaMs > 3000) {
          if (import.meta.env.DEV) {
            console.warn('Tempo de espera para cota/429 muito longo. Falhando para acionar fallback.');
          }
          throw erroApi;
        }
      }

      if (import.meta.env.DEV) {
        console.info(`[Tentativa ${tentativa}/${maxTentativas}] Erro temporário na API (${mensagem}). Tentando novamente em ${tempoEsperaMs}ms…`);
      }

      // Aguarda o tempo de espera respeitando o sinal de aborto
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, tempoEsperaMs);
        if (signal) {
          const onAbort = () => {
            clearTimeout(timeout);
            reject(new DOMException("Aborted", "AbortError"));
          };
          signal.addEventListener('abort', onAbort);
        }
      });
    }
  }

  throw ultimaMapeamentoErro;
}