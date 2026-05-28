/**
 * Serviço de IA do Google Gemini — Sergipanidade
 * Utiliza a API oficial do Google AI Studio diretamente para maior velocidade (1-2s) e gratuidade.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODELO_IA = "gemini-2.5-flash"; // Modelo padrão rápido e gratuito do Gemini

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
async function chamarGoogleAIStudio(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'Chave de API do Gemini não definida. Crie um arquivo .env com VITE_GEMINI_API_KEY.'
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_IA}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json", // Força o Gemini a retornar JSON estruturado puro
        },
      }),
    }
  );

  if (!response.ok) {
    let detalheErro = "";
    try {
      const errorJson = await response.json();
      detalheErro = errorJson.error?.message || JSON.stringify(errorJson);
    } catch {
      detalheErro = response.statusText;
    }
    throw new Error(`Erro na chamada da API Google AI Studio (Status ${response.status}): ${detalheErro}`);
  }

  const data = await response.json();
  const respostaTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!respostaTexto) {
    throw new Error('Resposta vazia da API do Google AI Studio');
  }

  return respostaTexto;
}

/**
 * Interface pública para geração de conteúdo com a IA.
 * Trata tentativas automáticas (retries) em caso de limite de requisições (erros 429).
 */
export async function gerarRoteiroComIA(prompt: string): Promise<string> {
  try {
    return await chamarGoogleAIStudio(prompt);
  } catch (erroApi: unknown) {
    const mensagem = (erroApi as { message?: string })?.message ?? '';
    const is429 = mensagem.includes('429') || mensagem.includes('Too Many Requests');

    if (is429 && !isCotaDiariaEsgotada(erroApi)) {
      const tempoEsperaMs = extrairTempoEsperaMs(erroApi) ?? 15000;

      if (tempoEsperaMs <= 30000) {
        console.info(`Limite de requisições atingido (429) — tentando novamente em ${tempoEsperaMs / 1000}s…`);
        await new Promise(r => setTimeout(r, tempoEsperaMs));

        try {
          return await chamarGoogleAIStudio(prompt);
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