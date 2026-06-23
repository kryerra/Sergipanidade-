import type { Result } from '@/types/api';

// NOTE: This service centralizes ChatBot request handling, but the current
// architecture still exposes the API key to the browser bundle. For a secure
// production deployment, move this request behind a backend proxy or API route.

interface GroqChatCompletionMessage {
  role?: string;
  content?: string;
}

interface GroqChatCompletionChoice {
  message?: GroqChatCompletionMessage;
}

interface GroqChatCompletionResponse {
  choices?: GroqChatCompletionChoice[];
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

const GROQ_CHAT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

let testChatBotApiKey: string | null = null;

const CHATBOT_SYSTEM_PROMPT = `Você é o assistente oficial do Hub Sergipanidade.
Sua função é responder EXCLUSIVAMENTE sobre temas
relacionados ao Hub Sergipanidade, incluindo:
- Cultura, história e identidade sergipana
- Produtos, artesanato, natureza, passeios e gastronomia de Sergipe
- Empreendedores e projetos do Hub
- Eventos, programações e parceiros do Hub

Regras obrigatórias:
1. NUNCA responda perguntas fora desses temas.
2. Se a pergunta for fora do escopo, responda:
  "Só posso ajudar com temas do Hub Sergipanidade."
3. Use tom acolhedor, cultural e sergipano.
4. Cite exemplos reais de Sergipe sempre que possível.`;

function normalizeApiKey(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function parseJsonOrNull<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null);
}

export function setChatBotApiKeyForTest(apiKey: string | null): void {
  testChatBotApiKey = apiKey;
}

export function getChatBotApiKey(): string | null {
  return normalizeApiKey(testChatBotApiKey ?? import.meta.env.VITE_GROQ_API_KEY);
}

export async function fetchChatBotReply(
  userText: string,
  signal?: AbortSignal,
): Promise<Result<string>> {
  const apiKey = getChatBotApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: {
        code: "NO_API_KEY",
        message:
          "ChatBot API key is not configured. Add VITE_GROQ_API_KEY to your environment.",
      },
    };
  }

  try {
    const response = await fetch(GROQ_CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 512,
        messages: [
          { role: "system", content: CHATBOT_SYSTEM_PROMPT },
          { role: "user", content: userText },
        ],
      }),
    });

    if (!response.ok) {
      let detail = response.statusText;
      const errorJson = await parseJsonOrNull<GroqChatCompletionResponse>(response);
      if (errorJson?.error?.message) {
        detail = errorJson.error.message;
      }

      return {
        ok: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `ChatBot service returned ${response.status}: ${detail}`,
        },
      };
    }

    const data = await parseJsonOrNull<GroqChatCompletionResponse>(response);
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        ok: false,
        error: {
          code: "NO_RESPONSE_CONTENT",
          message: "ChatBot returned an empty or invalid response.",
        },
      };
    }

    return {
      ok: true,
      data: content,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        error: {
          code: error.name || "FETCH_ERROR",
          message: error.message || "Unknown ChatBot request error.",
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Unknown ChatBot request failure.",
      },
    };
  }
}
