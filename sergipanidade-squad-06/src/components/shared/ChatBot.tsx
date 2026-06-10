import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { translations } from "@/constants/translations";

interface ChatBotProps {
  isVisible: boolean;
  language: 'pt' | 'en' | 'es' | 'sp';
}

interface Message {
  text: string;
  isBot: boolean;
}

export function ChatBot({ isVisible, language }: ChatBotProps) {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: t.chatBotWelcome, isBot: true },
    { text: t.chatBotSuggestion, isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => {
    setMessages([
      { text: t.chatBotWelcome, isBot: true },
      { text: t.chatBotSuggestion, isBot: true },
    ]);
  }, [language, t.chatBotWelcome, t.chatBotSuggestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isVisible) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const userMessage: Message = { text: userText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Chave da API não configurada. Verifique o arquivo .env.',
          isBot: true,
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
          max_tokens: 512,
          messages: [
            {
              role: 'system',
              content: `Você é o assistente oficial do Hub Sergipanidade.
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
4. Cite exemplos reais de Sergipe sempre que possível.`,
            },
            { role: 'user', content: userText },
          ],
        }),
      });

      const data = await response.json();
      const botReply = response.ok && data?.choices?.length
        ? data.choices[0]?.message?.content
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
        : null;

      setMessages((prev) => [
        ...prev,
        {
          text: botReply ??
            t.chatResponses[
              (Object.keys(t.chatResponses).find((key) => userText.toLowerCase().includes(key)) || 'default') as keyof typeof t.chatResponses
            ],
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error('ChatBot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'Desculpe, não consegui conectar ao serviço de IA no momento.',
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB — Chatbot Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat de ajuda'}
        className="fixed right-6 z-[800] w-[56px] h-[56px] rounded-full border-none cursor-pointer
                  bg-[var(--primary)] flex items-center justify-center
                  shadow-[0_4px_20px_rgba(0,0,128,0.50)]
                  transition-all duration-200 hover:scale-110
                  hover:shadow-[0_8px_32px_rgba(0,0,128,0.65)]"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      >
        {isOpen ? (
          <X size={22} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <MessageCircle size={22} color="#FFFFFF" strokeWidth={2} fill="rgba(255,255,255,0.15)" />
        )}

        {/* Pulse indicator when closed */}
        {!isOpen && (
          <span
            className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[var(--amarelo)]
                      border-2 border-[var(--branco)]"
          />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed right-6 z-[801] w-[320px] bg-[var(--branco)] rounded-[var(--radius)]
                    shadow-[var(--sombra-lg)] flex flex-col overflow-hidden
                    border border-[var(--cinza-med)]"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)' }}
          >
            {/* Avatar com ícone de chat */}
            <div
              className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0"
            >
              <MessageCircle size={18} color="#FFFFFF" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Fjalla_One'] text-[15px] tracking-wide text-white truncate">
                {t.chatBotName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--verde)]" />
                <span className="text-[11px] text-white/50">{t.chatBotStatus}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-none text-white/60 cursor-pointer
                        hover:text-white transition-colors p-1 rounded-full
                        hover:bg-white/10 min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Fechar chat"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-[240px] overflow-y-auto px-3.5 py-3.5 flex flex-col gap-2.5 bg-[var(--cinza-leve)]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.isBot
                    ? 'bg-white text-[var(--preto)] self-start rounded-2xl rounded-bl-sm shadow-[var(--sombra-sm)]'
                    : 'bg-[var(--primary)] text-white self-end rounded-2xl rounded-br-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 px-3.5 py-3 border-t border-[var(--cinza-med)] bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chatInputPlaceholder}
              className="flex-1 px-3 py-2 border-[1.5px] border-[var(--cinza-med)] rounded-[var(--radius-sm)]
                        text-[13px] outline-none text-[var(--preto)] bg-[var(--cinza-leve)]
                        focus:border-[var(--azul)] focus:bg-white transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center
                        bg-[var(--primary)] text-white border-none rounded-[var(--radius-sm)]
                        cursor-pointer hover:bg-[#000060] transition-colors
                        disabled:bg-[var(--cinza-med)] disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar mensagem"
            >
              {isLoading ? <span className="text-[12px]">...</span> : <Send size={16} strokeWidth={2} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
