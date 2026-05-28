/**
 * Serviço de IA do OpenRouter — Sergipanidade
 * Substitui o serviço direto do Gemini para permitir o uso de chaves gratuitas do OpenRouter
 * que NÃO exigem pré-pagamento ou dados de cartão de crédito.
 */

const API_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_GEMINI_API_KEY) as string;
const MODELO_IA = (import.meta.env.VITE_OPENROUTER_MODEL || "openrouter/free") as string;


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
 * Faz a chamada HTTP para a API do OpenRouter.
 */
async function chamarOpenRouter(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'Chave de API não definida. Crie um arquivo .env com VITE_OPENROUTER_API_KEY ou VITE_GEMINI_API_KEY.'
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://sergipanidade.com.br", // Requerido pelo OpenRouter
      "X-Title": "Sergipanidade", // Requerido pelo OpenRouter
    },
    body: JSON.stringify({
      model: MODELO_IA,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    let detalheErro = "";
    try {
      const errorJson = await response.json();
      detalheErro = errorJson.error?.message || JSON.stringify(errorJson);
    } catch {
      detalheErro = response.statusText;
    }
    throw new Error(`Erro na chamada da API OpenRouter (Status ${response.status}): ${detalheErro}`);
  }

  const data = await response.json();
  const respostaTexto = data.choices?.[0]?.message?.content;

  if (!respostaTexto) {
    throw new Error('Resposta vazia da API do OpenRouter');
  }

  return respostaTexto;
}

/**
 * Interface pública para geração de conteúdo com a IA do OpenRouter.
 * Trata tentativas automáticas (retries) em caso de limite de requisições (erros 429).
 */
export async function gerarRoteiroComIA(prompt: string): Promise<string> {
  try {
    return await chamarOpenRouter(prompt);
  } catch (erroApi: unknown) {
    const mensagem = (erroApi as { message?: string })?.message ?? '';
    const is429 = mensagem.includes('429') || mensagem.includes('Too Many Requests');

    if (is429 && !isCotaDiariaEsgotada(erroApi)) {
      const tempoEsperaMs = extrairTempoEsperaMs(erroApi) ?? 15000;

      if (tempoEsperaMs <= 30000) {
        console.info(`Limite de requisições atingido (429) — tentando novamente em ${tempoEsperaMs / 1000}s…`);
        await new Promise(r => setTimeout(r, tempoEsperaMs));

        try {
          return await chamarOpenRouter(prompt);
        } catch (erroTentativa: unknown) {
          console.warn('Falha na nova tentativa:', (erroTentativa as { message?: string })?.message ?? erroTentativa);
          throw erroTentativa;
        }
      } else {
        console.warn('Tempo de espera muito longo. Falhando para acionar fallback.');
        throw erroApi;
      }
    } else {
      console.warn('API de IA indisponível:', mensagem);
      throw erroApi;
    }
  }
}