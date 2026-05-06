import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDnk8hppYIUf-REqRfHATFDf2c9wLkKP2o";

export async function generateItinerary(
  days: number,
  budget: string,
  interests: string[],
  language: "pt" | "en" | "es"
) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Você é um guia turístico especializado em Sergipe, Brasil.
    Crie um roteiro de viagem de ${days} dias para um turista com orçamento ${budget} e interesses em: ${interests.join(", ")}.
    O roteiro deve ser focado em Sergipe (Aracaju e arredores).
    Responda em ${language === "pt" ? "Português" : language === "en" ? "Inglês" : "Espanhol"}.
    Formate a resposta em Markdown, com títulos para cada dia e uma lista de atividades.
    Seja entusiasmado e dê dicas locais específicas.
    Não mencione que você é uma IA.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro ao gerar roteiro:", error);
    // Fallback com mock em caso de falha inesperada
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `
# Dia 1
- **Manhã**: Explorar o centro histórico
- **Tarde**: Visita ao mercado municipal
- **Noite**: Jantar com pratos típicos da região

# Dia 2
- **Manhã**: Passeio pelas praias locais
- **Tarde**: Atividades ao ar livre
- **Noite**: Descanso
    `;
  }
}