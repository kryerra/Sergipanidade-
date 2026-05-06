import { useState, useRef, useEffect } from 'react';
import {
  Shield,
  HeartPulse,
  Flame,
  ShieldCheck,
  TriangleAlert,
  Building2,
  Info,
  MapPin,
  Navigation,
  MessageCircle,
  Send,
  HelpCircle,
  X,
  Route,
  Star,
  Phone,
} from 'lucide-react';
import { translations } from '../data/translations';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface SOSScreenProps {
  onToast: (message: string) => void;
  language: 'pt' | 'en' | 'es';
}

interface Message {
  text: string;
  isBot: boolean;
}

export function SOSScreen({ onToast, language }: SOSScreenProps) {
  const t = translations[language] as typeof translations['pt'] & {
    healthServicesTitle: string;
    nearbyHealthUnits: string;
    getDirections: string;
    helpCenterTitle: string;
    faqRoteiro: string;
    faqParceiro: string;
    faqAvaliar: string;
    seeAnswer: string;
    talkToSerginho: string;
    serginhoModalHeader: string;
  };

  const [serginhoOpen, setSerginhoOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { text: t.chatBotWelcome, isBot: true },
    { text: t.chatBotSuggestion, isBot: true },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages([
      { text: t.chatBotWelcome, isBot: true },
      { text: t.chatBotSuggestion, isBot: true },
    ]);
  }, [language, t.chatBotWelcome, t.chatBotSuggestion]);

  useEffect(() => {
    if (serginhoOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, serginhoOpen]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { text: chatInput, isBot: false };
    setChatMessages((prev) => [...prev, userMsg]);
    const kw = chatInput.toLowerCase();
    setChatInput('');
    const keyword =
      Object.keys(t.chatResponses).find((k) => kw.includes(k)) || 'default';
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          text: t.chatResponses[keyword as keyof typeof t.chatResponses],
          isBot: true,
        },
      ]);
    }, 600);
  };

  const emergencies = [
    {
      Icon: Shield,
      name: t.policeName,
      desc: t.policeDesc,
      num: '190',
      teal: true,
    },
    {
      Icon: HeartPulse,
      name: t.samuName,
      desc: t.samuDesc,
      num: '192',
      teal: false,
    },
    {
      Icon: Flame,
      name: t.firefightersName,
      desc: t.firefightersDesc,
      num: '193',
      teal: true,
    },
    {
      Icon: ShieldCheck,
      name: t.touristPoliceName,
      desc: t.touristPoliceDesc,
      num: '(79) 3179-9100',
      teal: false,
    },
    {
      Icon: TriangleAlert,
      name: t.civilDefenseName,
      desc: t.civilDefenseDesc,
      num: '199',
      teal: true,
    },
    {
      Icon: Building2,
      name: t.hospitalName,
      desc: t.hospitalDesc,
      num: '(79) 3198-1000',
      teal: false,
    },
  ];

  const healthUnits = [
    {
      name: 'Hospital de Urgência de Sergipe (HUSE)',
      distance: '2.3 km',
      phone: '(79) 3198-1000',
      pinColor: '#E53E3E',
      label: 'Hospital',
      top: '45%',
      left: '36%',
    },
    {
      name: 'UPA 24h — Zona Sul',
      distance: '3.8 km',
      phone: '(79) 3179-9000',
      pinColor: '#3182CE',
      label: 'UPA',
      top: '62%',
      left: '58%',
    },
    {
      name: 'Farmácia Sergipana — Atalaia',
      distance: '0.9 km',
      phone: '(79) 3243-1234',
      pinColor: '#38A169',
      label: 'Farmácia',
      top: '30%',
      left: '65%',
    },
  ];

  const faqs = [
    { Icon: Route, question: t.faqRoteiro },
    { Icon: HelpCircle, question: t.faqParceiro },
    { Icon: Star, question: t.faqAvaliar },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* ── HEADER ── */}
      <div
        className="px-4 sm:px-12 text-center"
        style={{
          backgroundColor: '#FFFFFF',
          padding: '48px 32px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <Shield size={28} strokeWidth={2} />
          </div>
          <h1
            className="font-['Fjalla_One'] tracking-wide"
            style={{ fontSize: '40px', lineHeight: 1.1, color: '#1E293B' }}
          >
            EMERGÊNCIAS &amp; SOS
          </h1>
        </div>
        <p className="max-w-[560px] mx-auto leading-relaxed" style={{ fontSize: '15px', color: '#64748B' }}>
          {t.emergenciesSubtitle}
        </p>
      </div>

      {/* ── GRID DE EMERGÊNCIAS ── */}
      <div className="px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencies.map(({ Icon, name, desc, num }, i) => {
            // Cores para ícones e números
            const accentColors = [
              { bg: '#DBEAFE', color: '#1E40AF' }, // Police - blue
              { bg: '#FEE2E2', color: '#DC2626' }, // SAMU - red
              { bg: '#FED7AA', color: '#C2410C' }, // Bombeiros - orange
              { bg: '#E0E7FF', color: '#4338CA' }, // Tourist Police - indigo
              { bg: '#FEF3C7', color: '#CA8A04' }, // Civil Defense - yellow
              { bg: '#D1FAE5', color: '#059669' }, // Hospital - green
            ];
            const accent = accentColors[i];

            return (
              <a
                key={i}
                href={`tel:${num.replace(/\D/g, '')}`}
                onClick={() => onToast(`${t.calling}: ${name} — ${num}`)}
                className="bg-white rounded-xl p-6 flex flex-col items-center text-center
                           cursor-pointer no-underline
                           transition-all duration-200 hover:shadow-xl
                           active:scale-[0.98]"
                style={{
                  minHeight: '220px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 6px 0 rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: accent.bg, color: accent.color }}
                >
                  <Icon size={32} strokeWidth={1.8} />
                </div>
                <h3
                  className="font-['Fjalla_One'] tracking-wide mb-2"
                  style={{ fontSize: '18px', color: '#1E293B' }}
                >
                  {name}
                </h3>
                <p className="leading-relaxed mb-4 flex-1" style={{ fontSize: '13px', color: '#64748B' }}>
                  {desc}
                </p>
                <div
                  className="font-['Fjalla_One'] tracking-wider mt-auto"
                  style={{ fontSize: '32px', lineHeight: 1, color: accent.color, fontWeight: 700 }}
                >
                  {num}
                </div>
              </a>
            );
          })}
        </div>

        {/* ── DICA DE SEGURANÇA ── */}
        <div
          className="mt-6 bg-white rounded-xl px-5 py-4 flex gap-3 items-start"
          style={{
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <Info size={20} color="#64748B" className="flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed" style={{ fontSize: '14px', color: '#475569' }}>
            <strong style={{ color: '#1E293B' }}>Em caso de emergência,</strong> ligue para o número nacional correspondente (190, 192
            ou 193). Para registrar boletim relacionado ao turismo, procure a{' '}
            <strong style={{ color: '#1E293B' }}>Delegacia do Turista,</strong> localizada na Orla de Atalaia.
          </p>
        </div>
      </div>

      {/* ── MAPA DE SERVIÇOS DE SAÚDE ── */}
      <section className="px-4 sm:px-8 py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <h2
          className="font-['Fjalla_One'] mb-6"
          style={{ fontSize: '24px', color: '#1E293B' }}
        >
          {t.healthServicesTitle}
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mock Map */}
          <div
            className="lg:flex-1 relative rounded-xl overflow-hidden"
            style={{
              height: '350px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1561592390-15138c22896a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjaXR5JTIwbWFwJTIwYnJhemlsfGVufDF8fHx8MTc3Nzk0NzIyOXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Mapa de Aracaju — Serviços de Saúde"
              className="w-full h-full object-cover"
            />
            {/* Tint overlay */}
            <div className="absolute inset-0 bg-[#0A2540]/30" />

            {/* Map pins */}
            {healthUnits.map((unit, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{ top: unit.top, left: unit.left, transform: 'translate(-50%, -100%)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  style={{ backgroundColor: unit.pinColor }}
                >
                  <MapPin size={16} color="white" strokeWidth={2} />
                </div>
                <div
                  className="px-2 py-0.5 rounded-full text-white mt-1 whitespace-nowrap shadow"
                  style={{ backgroundColor: unit.pinColor, fontSize: '10px', fontWeight: 600 }}
                >
                  {unit.label}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div
              className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex gap-3"
              style={{ fontSize: '11px' }}
            >
              {healthUnits.map((u, i) => (
                <div key={i} className="flex items-center gap-1 font-medium text-[#2D3748]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: u.pinColor }} />
                  {u.label}
                </div>
              ))}
            </div>

            {/* "Mapa Simulado" badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg" style={{ fontSize: '10px' }}>
              Mapa ilustrativo
            </div>
          </div>

          {/* Nearby list */}
          <div className="lg:w-[340px] flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--preto)]" style={{ fontSize: '15px' }}>
              {t.nearbyHealthUnits}
            </h3>
            {healthUnits.map((unit, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 flex flex-col gap-3"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: unit.pinColor + '1A', color: unit.pinColor }}
                  >
                    <MapPin size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-[var(--preto)] leading-tight"
                      style={{ fontSize: '14px' }}
                    >
                      {unit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: unit.pinColor, fontSize: '10px' }}
                      >
                        {unit.distance}
                      </span>
                      <span className="text-[var(--cinza-txt)] flex items-center gap-1" style={{ fontSize: '12px' }}>
                        <Phone size={11} />
                        {unit.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onToast(`Abrindo rota para ${unit.name}`)}
                  className="w-full py-2.5 px-3 rounded-lg cursor-pointer font-semibold
                             transition-colors
                             flex items-center justify-center gap-1.5 min-h-[44px]"
                  style={{
                    fontSize: '13px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                  }}
                >
                  <Navigation size={14} />
                  {t.getDirections}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CENTRAL DE AJUDA ── */}
      <section className="px-4 sm:px-8 py-12" style={{ backgroundColor: '#F8FAFC' }}>
        <h2
          className="font-['Fjalla_One'] mb-8"
          style={{ fontSize: '28px', color: '#1E293B' }}
        >
          {t.helpCenterTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {faqs.map(({ Icon, question }, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 flex flex-col gap-3
                         cursor-pointer hover:shadow-md transition-all duration-200 group"
              style={{
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <p
                className="font-semibold leading-snug flex-1"
                style={{ fontSize: '15px', color: '#1E293B' }}
              >
                {question}
              </p>
              <span
                className="font-medium group-hover:underline"
                style={{ fontSize: '13px', color: '#64748B' }}
              >
                {t.seeAnswer}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setSerginhoOpen(true)}
            className="min-h-[52px] px-8 rounded-xl text-white
                       font-['Fjalla_One'] tracking-wider cursor-pointer border-none
                       transition-all
                       flex items-center justify-center gap-2.5"
            style={{
              fontSize: '16px',
              backgroundColor: '#3B82F6',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <MessageCircle size={20} strokeWidth={2} />
            {t.talkToSerginho}
          </button>
        </div>
      </section>

      {/* ── CHATBOT SERGINHO MODAL ── */}
      {serginhoOpen && (
        <div className="fixed inset-0 z-[950] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setSerginhoOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative w-full sm:w-[440px] bg-white rounded-t-[24px] sm:rounded-[var(--radius)]
                       shadow-[0_32px_80px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div
              className="px-4 py-4 flex items-center gap-3"
              style={{
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#DBEAFE', color: '#3B82F6' }}
              >
                <MessageCircle size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-['Fjalla_One'] tracking-wide truncate"
                  style={{ fontSize: '15px', color: '#1E293B' }}
                >
                  SERGINHO — Assistente Virtual
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSerginhoOpen(false)}
                aria-label="Fechar Serginho"
                className="bg-transparent border-none cursor-pointer
                           p-1 rounded-full min-w-[36px] min-h-[36px]
                           flex items-center justify-center transition-colors"
                style={{ color: '#64748B' }}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Welcome balloon */}
            <div
              className="px-4 py-3"
              style={{
                backgroundColor: '#EFF6FF',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <p className="leading-relaxed" style={{ fontSize: '13px', color: '#475569' }}>
                Olá! Sou o Serginho. Posso te ajudar a explorar o melhor de Sergipe!
                Tente: <strong style={{ color: '#1E293B' }}>praias, gastronomia, museus</strong> ou <strong style={{ color: '#1E293B' }}>eventos.</strong>
              </p>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              style={{ maxHeight: '280px', backgroundColor: '#F8FAFC' }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-4 py-3 leading-relaxed ${
                    msg.isBot
                      ? 'self-start rounded-2xl rounded-bl-sm'
                      : 'self-end rounded-2xl rounded-br-sm'
                  }`}
                  style={{
                    fontSize: '14px',
                    backgroundColor: msg.isBot ? '#FFFFFF' : '#3B82F6',
                    color: msg.isBot ? '#1E293B' : '#FFFFFF',
                    border: msg.isBot ? '1px solid #E5E7EB' : 'none',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="flex gap-2 px-4 py-3 bg-white"
              style={{ borderTop: '1px solid #E5E7EB' }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Pergunte algo..."
                className="flex-1 px-3 py-2.5 rounded-lg outline-none transition-colors"
                style={{
                  fontSize: '14px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F8FAFC',
                  color: '#1E293B',
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                aria-label="Enviar"
                className="w-11 h-11 flex items-center justify-center text-white border-none
                           rounded-lg cursor-pointer transition-colors flex-shrink-0"
                style={{
                  backgroundColor: !chatInput.trim() ? '#CBD5E1' : '#3B82F6',
                  cursor: !chatInput.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}