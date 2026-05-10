import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { GoogleGenerativeAI } from "@google/generative-ai';
import { destinations } from '../data/destinations';
import { translations } from '../data/translations';

const GEMINI_KEY = 'AIzaSyCRxHwLzoCurcsN85w8BFie9TZOIYe4bPYE_AQUI';

const steps = [
  {
    id: 'grupo',
    pergunta: 'Quem vai viajar?',
    opcoes: ['Sozinho', 'Casal', 'Família com crianças', 'Grupo de amigos'],
    multiplo: false,
  },
  {
    id: 'dias',
    pergunta: 'Quantos dias de viagem?',
    opcoes: ['1 dia', '2 a 3 dias', '4 a 7 dias', 'Mais de 1 semana'],
    multiplo: false,
  },
  {
    id: 'interesses',
    pergunta: 'O que você mais curte? (pode escolher vários)',
    opcoes: ['Praias', 'Gastronomia', 'Cultura', 'História', 'Natureza', 'Pet Friendly'],
    multiplo: true,
  },
  {
    id: 'ritmo',
    pergunta: 'Qual seu estilo de viagem?',
    opcoes: ['Tranquilo, poucas paradas', 'Moderado, equilibrado', 'Intenso, quero ver tudo'],
    multiplo: false,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRoteiroPronto: (paradas: ParadaGerada[]) => void;
  language: 'pt' | 'en' | 'es';
}

export interface ParadaGerada {
  destinationId: string;
  dia: number;
  periodo: string;
  dica: string;
}

export function RoteiroPerguntasModal({ isOpen, onClose, onRoteiroPronto, language }: Props) {
  const [stepAtual, setStepAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const step = steps[stepAtual];

  const selecionar = (opcao: string) => {
    if (step.multiplo) {
      const atual = (respostas[step.id] as string[]) || [];
      const nova = atual.includes(opcao)
        ? atual.filter((o) => o !== opcao)
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

  const gerarRoteiro = async () => {
    setLoading(true);
    setErro('');
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const listaDestinos = destinations.map((d) => ({
        id: d.id,
        nome: d.name,
        categoria: d.category,
        descricao: d.shortDesc,
        regiao: d.region,
      }));

      const prompt = `
Você é um especialista em turismo em Sergipe, Brasil.
Com base nas preferências abaixo, gere um roteiro personalizado usando APENAS os destinos da lista fornecida.

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
      "dica": "dica curta e personalizada de até 2 frases"
    }
  ]
}

Regras:
- Use entre 3 e 8 paradas no total dependendo da duração
- periodo deve ser: manhã, tarde ou noite
- Priorize destinos que combinam com os interesses informados
- Se família com crianças, evite destinos inadequados para crianças
- A dica deve ser personalizada para o perfil do viajante
- Use apenas ids que existem na lista de destinos fornecida
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      onRoteiroPronto(parsed.paradas);
      onClose();
    } catch (e) {
      setErro('Não foi possível gerar o roteiro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetar = () => {
    setStepAtual(0);
    setRespostas({});
    setErro('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetar(); onClose(); } }}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-[var(--radius)]">

        {/* Header */}
        <div className="bg-[var(--preto)] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-['Fjalla_One'] text-[var(--branco)] text-[18px] tracking-wide">
              Gerar Roteiro com IA
            </span>
            <span className="text-[var(--cinza-med)] text-sm">
              {stepAtual + 1}/{steps.length}
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full">
            <div
              className="h-1 bg-[var(--laranja)] rounded-full transition-all duration-300"
              style={{ width: `${((stepAtual + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 bg-[var(--branco)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-[var(--laranja)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--preto)] font-medium text-sm">Gerando seu roteiro personalizado...</p>
              <p className="text-[#888] text-xs text-center">A IA está analisando seus interesses<br />e selecionando os melhores destinos</p>
            </div>
          ) : erro ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-[var(--vermelho)] text-sm text-center">{erro}</p>
              <button
                onClick={() => { setErro(''); gerarRoteiro(); }}
                className="px-6 py-2.5 bg-[var(--laranja)] text-[var(--branco)] rounded-[var(--radius-sm)] font-bold text-sm"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-['Fjalla_One'] text-[20px] text-[var(--preto)] mb-5 tracking-wide leading-snug">
                {step.pergunta}
              </h2>
              <div className="flex flex-col gap-2.5">
                {step.opcoes.map((opcao) => (
                  <button
                    key={opcao}
                    onClick={() => selecionar(opcao)}
                    className={`w-full text-left px-4 py-3 rounded-[var(--radius-sm)] border-[1.5px]
                      font-medium text-[14px] transition-all duration-150
                      ${isSelecionado(opcao)
                        ? 'bg-[var(--laranja)] text-[var(--branco)] border-[var(--laranja)]'
                        : 'bg-[var(--branco)] text-[var(--preto)] border-[var(--cinza-med)] hover:border-[var(--preto)]'
                      }`}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !erro && (
          <div className="px-6 py-4 bg-[var(--branco)] border-t border-[var(--cinza-med)] flex gap-3">
            {stepAtual > 0 && (
              <button
                onClick={() => setStepAtual(stepAtual - 1)}
                className="flex-1 px-4 py-3 border-2 border-[var(--cinza-med)] text-[var(--preto)]
                           rounded-[var(--radius-sm)] font-bold text-sm hover:border-[var(--preto)] transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              onClick={avancar}
              disabled={!podeAvancar()}
              className={`flex-1 px-4 py-3 rounded-[var(--radius-sm)] font-bold text-sm transition-all
                ${podeAvancar()
                  ? 'bg-[var(--laranja)] text-[var(--branco)] hover:bg-[var(--vermelho)]'
                  : 'bg-[var(--cinza-med)] text-[#aaa] cursor-not-allowed'
                }`}
            >
              {stepAtual < steps.length - 1 ? 'Continuar' : 'Gerar Roteiro'}
            </button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}