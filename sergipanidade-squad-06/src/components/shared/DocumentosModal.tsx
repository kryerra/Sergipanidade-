import { useState } from 'react';
import { X, Download, ShieldCheck, FileText } from 'lucide-react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet as PDFStyleSheet,
  PDFDownloadLink
} from '@react-pdf/renderer';

// PDF Styles
const pdfStyles = PDFStyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.6,
    color: '#1E1E1E',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0D7377',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8,
    color: '#737373',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0D7377',
    marginBottom: 6,
    marginTop: 8,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#D9D9D9',
    paddingTop: 10,
    fontSize: 7,
    color: '#737373',
    textAlign: 'center',
  }
});

// PDF Document for Terms of Use
const TermosPDF = () => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>TERMOS DE USO - SERGIPANIDADE</Text>
        <Text style={pdfStyles.subtitle}>Última atualização: Junho de 2026 | Em Conformidade com a ANPD e LGPD</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>1. ACEITAÇÃO DOS TERMOS E PROPÓSITO</Text>
        <Text style={pdfStyles.paragraph}>
          Ao acessar e utilizar a plataforma Sergipanidade (aplicativo/site), o usuário declara estar ciente e concordar integralmente com as condições dispostas nestes Termos de Uso. Esta plataforma destina-se a promover a cultura, culinária e turismo no estado de Sergipe, agindo com transparência e respeito à privacidade dos usuários.
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>2. DESCRIÇÃO DO SERVIÇO E RECURSOS DE INTELIGÊNCIA ARTIFICIAL</Text>
        <Text style={pdfStyles.paragraph}>
          O Sergipanidade oferece um guia turístico digital inteligente e colaborativo focado no estado de Sergipe. Nossos serviços incluem:
        </Text>
        <Text style={pdfStyles.listItem}>• Recomendação de roteiros personalizados gerados por inteligência artificial (com base nas preferências do usuário);</Text>
        <Text style={pdfStyles.listItem}>• Guia detalhado de pontos turísticos, eventos, praias, cultura e gastronomia;</Text>
        <Text style={pdfStyles.listItem}>• Portal de parceiros para estabelecimentos gerenciarem seu perfil e interagirem com usuários;</Text>
        <Text style={pdfStyles.listItem}>• Canal direto para solicitações relativas à proteção de dados e transparência.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>3. CADASTRO DE CONTAS E SEGURANÇA</Text>
        <Text style={pdfStyles.paragraph}>
          Para utilizar determinadas funcionalidades, como salvar roteiros e avaliações, é necessário criar uma conta. O usuário se compromete a fornecer informações verdadeiras e atualizadas. A segurança de sua senha é de sua exclusiva responsabilidade.
        </Text>
        <Text style={pdfStyles.paragraph}>
          Classificações de contas disponíveis:
        </Text>
        <Text style={pdfStyles.listItem}>• Turista: Perfil para viajantes explorarem, salvarem favoritos e avaliarem locais.</Text>
        <Text style={pdfStyles.listItem}>• Estabelecimento/Parceiro: Perfil para empresas gerenciarem fotos, informações e responderem avaliações.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>4. CONDUTA DO USUÁRIO E AVALIAÇÕES</Text>
        <Text style={pdfStyles.paragraph}>
          Ao publicar avaliações ou qualquer conteúdo na plataforma, você garante que as informações são baseadas em experiências reais e não contêm linguagem ofensiva, abusiva, caluniosa ou difamatória. Reservamo-nos o direito de remover qualquer conteúdo que viole estas diretrizes.
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>5. PROPRIEDADE INTELECTUAL</Text>
        <Text style={pdfStyles.paragraph}>
          Todo o design, código fonte, logotipos, textos, ilustrações e layouts da plataforma Sergipanidade são propriedade intelectual exclusiva da plataforma ou de seus licenciadores, protegidos pelas leis de direitos autorais nacionais e internacionais.
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>6. LIMITAÇÃO DE RESPONSABILIDADE</Text>
        <Text style={pdfStyles.paragraph}>
          A plataforma Sergipanidade não se responsabiliza por serviços prestados por terceiros parceiros (como hotéis e restaurantes) listados na plataforma, nem por imprecisões nos horários ou disponibilidade de destinos. O usuário assume o risco total do uso das informações coletadas.
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>7. FORO E LEGISLAÇÃO APLICÁVEL</Text>
        <Text style={pdfStyles.paragraph}>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de Aracaju, Estado de Sergipe, para dirimir quaisquer dúvidas ou litígios decorrentes do uso da plataforma.
        </Text>
      </View>

      <Text style={pdfStyles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} — Sergipanidade`} />
    </Page>
  </Document>
);

// PDF Document for Privacy Policy
const PrivacidadePDF = () => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>POLÍTICA DE PRIVACIDADE - SERGIPANIDADE</Text>
        <Text style={pdfStyles.subtitle}>Última atualização: Junho de 2026 | Em Conformidade com a LGPD e Diretrizes da ANPD</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>1. INTRODUÇÃO E COMPROMISSO LGPD</Text>
        <Text style={pdfStyles.paragraph}>
          A plataforma Sergipanidade tem o compromisso de proteger a privacidade e a segurança dos dados pessoais de seus usuários. Esta Política descreve como coletamos, usamos, armazenamos e protegemos seus dados, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e as orientações da Autoridade Nacional de Proteção de Dados (ANPD).
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>2. BASES LEGAIS PARA TRATAMENTO DE DADOS (Art. 7º, LGPD)</Text>
        <Text style={pdfStyles.paragraph}>
          Tratamos seus dados sob as seguintes justificativas legais:
        </Text>
        <Text style={pdfStyles.listItem}>• Consentimento (Art. 7º, I): Para ativação de geolocalização e envio de comunicações de marketing.</Text>
        <Text style={pdfStyles.listItem}>• Execução de Contrato (Art. 7º, V): Para gerenciar o cadastro do usuário, viabilizar o roteiro personalizado e fornecer os serviços principais.</Text>
        <Text style={pdfStyles.listItem}>• Legítimo Interesse (Art. 7º, IX): Para melhoria de usabilidade e prevenção de fraudes.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>3. DADOS COLETADOS E FINALIDADES</Text>
        <Text style={pdfStyles.paragraph}>
          Coletamos informações necessárias para a prestação e melhoria dos nossos serviços turísticos:
        </Text>
        <Text style={pdfStyles.listItem}>• Dados de Cadastro: Nome completo, endereço de e-mail, telefone de contato e credenciais de login para autenticação segura.</Text>
        <Text style={pdfStyles.listItem}>• Dados de Geolocalização: Se expressamente autorizado por você, coletamos dados de localização geográfica para sugerir pontos turísticos e serviços próximos a você através da funcionalidade GPS.</Text>
        <Text style={pdfStyles.listItem}>• Dados de Uso: Preferências de viagem, destinos favoritados, avaliações enviadas e roteiros planejados.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>4. COOKIES E TECNOLOGIAS DE RASTREAMENTO</Text>
        <Text style={pdfStyles.paragraph}>
          Utilizamos cookies para personalizar sua experiência. Você pode gerenciar suas preferências a qualquer momento:
        </Text>
        <Text style={pdfStyles.listItem}>• Cookies Obrigatórios: Essenciais para segurança e autenticação do login.</Text>
        <Text style={pdfStyles.listItem}>• Cookies de Desempenho: Otimizam o cache e velocidade do site.</Text>
        <Text style={pdfStyles.listItem}>• Cookies Analíticos: Permitem entender como os usuários navegam e melhorar os fluxos.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>5. SEUS DIREITOS SOB A LGPD (Art. 18)</Text>
        <Text style={pdfStyles.paragraph}>
          Como titular dos dados pessoais, a LGPD lhe garante os seguintes direitos, que podem ser exercidos diretamente em sua Central de Privacidade (Perfil):
        </Text>
        <Text style={pdfStyles.listItem}>• Confirmação da existência de tratamento e Acesso aos dados;</Text>
        <Text style={pdfStyles.listItem}>• Retificação: Corrigir dados incompletos ou inexatos;</Text>
        <Text style={pdfStyles.listItem}>• Eliminação, bloqueio ou anonimização de dados desnecessários;</Text>
        <Text style={pdfStyles.listItem}>• Portabilidade: Solicitar cópia dos seus dados de cadastro em formato estruturado;</Text>
        <Text style={pdfStyles.listItem}>• Revogação do consentimento concedido e informação sobre compartilhamento.</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>6. SEGURANÇA DA INFORMAÇÃO E RETENÇÃO DE DADOS</Text>
        <Text style={pdfStyles.paragraph}>
          Implementamos medidas técnicas e administrativas aptas a proteger seus dados contra acessos não autorizados, perdas ou qualquer forma de tratamento inadequado ou ilícito. Todos os dados trafegam criptografados utilizando certificados SSL/TLS.
        </Text>
        <Text style={pdfStyles.paragraph}>
          Mantemos os seus dados cadastrais ativos apenas pelo período em que mantiver sua conta ativa na plataforma. Dados relativos a logins são mantidos por 6 meses conforme exigência do Marco Civil da Internet (Lei nº 12.965/14).
        </Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>7. CONTATO E ENCARREGADO DE DADOS (DPO)</Text>
        <Text style={pdfStyles.paragraph}>
          Para qualquer esclarecimento sobre esta Política ou para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: dpo@sergipanidade.gov.br.
        </Text>
      </View>

      <Text style={pdfStyles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} — Sergipanidade`} />
    </Page>
  </Document>
);

interface DocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'termos' | 'privacidade';
}

export function DocumentosModal({ isOpen, onClose, defaultTab = 'termos' }: DocumentosModalProps) {
  const [activeTab, setActiveTab] = useState<'termos' | 'privacidade'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#D9D9D9] relative animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F7F6F3] border-b border-[#D9D9D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTab === 'termos' ? (
              <FileText className="text-[#0D7377] w-6 h-6" />
            ) : (
              <ShieldCheck className="text-[#0D7377] w-6 h-6" />
            )}
            <div>
              <h2 className="font-['Fjalla_One'] text-xl text-[#1E1E1E] uppercase tracking-wide">
                Documentos Legais
              </h2>
              <p className="text-xs text-[#737373]">
                Sergipanidade · Transparência & Segurança (ANPD/LGPD)
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-[#1E1E1E] hover:bg-black/5 rounded-full transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#D9D9D9] px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('termos')}
            className={`px-5 py-3.5 border-none bg-transparent cursor-pointer font-semibold text-sm transition-all relative ${
              activeTab === 'termos' ? 'text-[#0D7377]' : 'text-[#737373] hover:text-[#1E1E1E]'
            }`}
          >
            Termos de Uso
            {activeTab === 'termos' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0D7377] rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('privacidade')}
            className={`px-5 py-3.5 border-none bg-transparent cursor-pointer font-semibold text-sm transition-all relative ${
              activeTab === 'privacidade' ? 'text-[#0D7377]' : 'text-[#737373] hover:text-[#1E1E1E]'
            }`}
          >
            Política de Privacidade
            {activeTab === 'privacidade' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0D7377] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
          {activeTab === 'termos' ? (
            <div className="space-y-6 text-[#1E1E1E] leading-relaxed text-sm">
              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">1. Aceitação dos Termos e Propósito</h3>
                <p>
                  Ao acessar e utilizar a plataforma Sergipanidade (aplicativo/site), o usuário declara estar ciente e concordar integralmente com as condições dispostas nestes Termos de Uso. Esta plataforma destina-se a promover a cultura, culinária e turismo no estado de Sergipe, agindo com transparência e respeito à privacidade dos usuários.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">2. Descrição do Serviço e Recursos de Inteligência Artificial</h3>
                <p className="mb-2">
                  O Sergipanidade oferece um guia turístico digital inteligente e colaborativo focado no estado de Sergipe. Nossos serviços incluem:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Recomendação de roteiros personalizados gerados por inteligência artificial (com base nas preferências do usuário);</li>
                  <li>Guia detalhado de pontos turísticos, eventos, praias, cultura e gastronomia;</li>
                  <li>Portal de parceiros para estabelecimentos gerenciarem seu perfil e interagirem com usuários;</li>
                  <li>Canal direto para solicitações relativas à proteção de dados e transparência.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">3. Cadastro de Contas e Segurança</h3>
                <p className="mb-2">
                  Para utilizar determinadas funcionalidades, como salvar roteiros e avaliações, é necessário criar uma conta. O usuário se compromete a fornecer informações verdadeiras e atualizadas. A segurança de sua senha é de sua exclusiva responsabilidade.
                </p>
                <p className="font-semibold text-xs text-[#737373]">
                  Classificações de contas disponíveis:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs text-[#737373]">
                  <li>Turista: Perfil para viajantes explorarem, salvarem favoritos e avaliarem locais.</li>
                  <li>Estabelecimento/Parceiro: Perfil para empresas gerenciarem fotos, informações e responderem avaliações.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">4. Conduta do Usuário e Avaliações</h3>
                <p>
                  Ao publicar avaliações ou qualquer conteúdo na plataforma, você garante que as informações são baseadas em experiências reais e não contêm linguagem ofensiva, abusiva, caluniosa ou difamatória. Reservamo-nos o direito de remover qualquer conteúdo que viole estas diretrizes.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">5. Propriedade Intelectual</h3>
                <p>
                  Todo o design, código fonte, logotipos, textos, ilustrações e layouts da plataforma Sergipanidade são propriedade intelectual exclusiva da plataforma ou de seus licenciadores, protegidos pelas leis de direitos autorais nacionais e internacionais.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">6. Limitação de Responsabilidade</h3>
                <p>
                  A plataforma Sergipanidade não se responsabiliza por serviços prestados por terceiros parceiros (como hotéis e restaurantes) listados na plataforma, nem por imprecisões nos horários ou disponibilidade de destinos. O usuário assume o risco total do uso das informações coletadas.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">7. Foro e Legislação Aplicável</h3>
                <p>
                  Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de Aracaju, Estado de Sergipe, para dirimir quaisquer dúvidas ou litígios decorrentes do uso da plataforma.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-[#1E1E1E] leading-relaxed text-sm">
              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">1. Introdução e Compromisso LGPD</h3>
                <p>
                  A plataforma Sergipanidade tem o compromisso de proteger a privacidade e a segurança dos dados pessoais de seus usuários. Esta Política descreve como coletamos, usamos, armazenamos e protegemos seus dados, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e as orientações da Autoridade Nacional de Proteção de Dados (ANPD).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">2. Bases Legais para Tratamento de Dados (Art. 7º, LGPD)</h3>
                <p className="mb-2">
                  Tratamos seus dados sob as seguintes justificativas legais:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Consentimento (Art. 7º, I):</strong> Para ativação de geolocalização e envio de comunicações de marketing.</li>
                  <li><strong>Execução de Contrato (Art. 7º, V):</strong> Para gerenciar o cadastro do usuário, viabilizar o roteiro personalizado e fornecer os serviços principais.</li>
                  <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para melhoria de usabilidade e prevenção de fraudes.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">3. Dados Coletados e Finalidades</h3>
                <p className="mb-2">
                  Coletamos informações necessárias para a prestação e melhoria dos nossos serviços turísticos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail, telefone de contato e credenciais de login para autenticação segura.</li>
                  <li><strong>Dados de Geolocalização:</strong> Se expressamente autorizado por você, coletamos dados de localização geográfica para sugerir pontos turísticos e serviços próximos a você através da funcionalidade GPS.</li>
                  <li><strong>Dados de Uso:</strong> Preferências de viagem, destinos favoritados, avaliações enviadas e roteiros planejados.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">4. Cookies e Tecnologias de Rastreamento</h3>
                <p className="mb-2">
                  Utilizamos cookies para personalizar sua experiência. Você pode gerenciar suas preferências a qualquer momento:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Cookies Obrigatórios:</strong> Essenciais para segurança e autenticação do login.</li>
                  <li><strong>Cookies de Desempenho:</strong> Otimizam o cache e velocidade do site.</li>
                  <li><strong>Cookies Analíticos:</strong> Permitem entender como os usuários navegam e melhorar os fluxos.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">5. Seus Direitos sob a LGPD (Art. 18)</h3>
                <p className="mb-2">
                  Como titular dos dados pessoais, a LGPD lhe garante os seguintes direitos, que podem ser exercidos diretamente em sua Central de Privacidade (Perfil):
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Confirmação da existência de tratamento e Acesso aos dados;</li>
                  <li><strong>Retificação:</strong> Corrigir dados incompletos ou inexatos;</li>
                  <li>Eliminação, bloqueio ou anonimização de dados desnecessários ou tratados em desconformidade;</li>
                  <li><strong>Portabilidade:</strong> Solicitar cópia dos seus dados de cadastro em formato estruturado;</li>
                  <li><strong>Revogação do consentimento:</strong> Solicitar a eliminação dos seus dados cadastrais ou cancelamento de comunicações, e informações sobre compartilhamento de dados.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">6. Segurança da Informação e Retenção de Dados</h3>
                <p className="mb-2">
                  Implementamos medidas técnicas e administrativas aptas a proteger seus dados contra acessos não autorizados, perdas ou qualquer forma de tratamento inadequado ou ilícito. Todos os dados trafegam criptografados utilizando certificados SSL/TLS.
                </p>
                <p>
                  Mantemos os seus dados cadastrais ativos apenas pelo período em que mantiver sua conta ativa na plataforma. Dados relativos a logs de acesso (IP e data/hora) são mantidos obrigatoriamente por 6 meses conforme exigência do Marco Civil da Internet (Lei nº 12.965/14).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0D7377] mb-2">7. Contato e Encarregado de Dados (DPO)</h3>
                <p>
                  Para qualquer esclarecimento sobre esta Política ou para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: <a href="mailto:dpo@sergipanidade.gov.br" className="text-[#0D7377] hover:underline">dpo@sergipanidade.gov.br</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with PDF Download options */}
        <div className="px-6 py-4 bg-[#F7F6F3] border-t border-[#D9D9D9] flex items-center justify-between shrink-0">
          <p className="text-xs text-[#737373]">
            Sergipanidade · Transparência em Conformidade com a ANPD
          </p>

          <div className="flex gap-3">
            {activeTab === 'termos' ? (
              <PDFDownloadLink
                document={<TermosPDF />}
                fileName="sergipanidade-termos-de-uso.pdf"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7377] hover:bg-[#0a5d61] text-white font-semibold text-xs rounded-lg shadow-md transition-all border-none cursor-pointer text-center no-underline"
              >
                {({ loading }) => (
                  <>
                    <Download size={14} />
                    <span>{loading ? 'Preparando PDF...' : 'Baixar Termos (PDF)'}</span>
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <PDFDownloadLink
                document={<PrivacidadePDF />}
                fileName="sergipanidade-politica-de-privacidade.pdf"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7377] hover:bg-[#0a5d61] text-white font-semibold text-xs rounded-lg shadow-md transition-all border-none cursor-pointer text-center no-underline"
              >
                {({ loading }) => (
                  <>
                    <Download size={14} />
                    <span>{loading ? 'Preparando PDF...' : 'Baixar Política (PDF)'}</span>
                  </>
                )}
              </PDFDownloadLink>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white text-[#1E1E1E] hover:bg-black/5 font-semibold text-xs rounded-lg border border-[#D9D9D9] transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
