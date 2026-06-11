import { useState, useRef, useEffect } from 'react';
import { translations } from "@/constants/translations";
import type { UserProfile } from '@/types';
import { useToast } from "@/context/AppContext";
import loginBg1 from '@/assets/images/lambesujo.jpg';
import loginBgTeste from '@/assets/images/login_teste.png';
import loginBg3 from '@/assets/images/samba-de-coco-laranjeiras.jpg';
import loginBg4 from '@/assets/images/amendoim.jpg';
import googleLogo from "@/imports/Google_Logo.png";
import logoSergipanidade from "@/imports/Logo_Sergipanidade.png";
import logoSaoJoao from '@/assets/images/logo-sao-joao.png';
import avatarJoao from '@/assets/images/AVATAR JOAO.jpg';
import avatarMiauteria from '@/assets/images/miauteriapf.jpeg';
import { DocumentosModal } from '@/components/shared/DocumentosModal';

const LOGIN_BACKGROUNDS = [loginBg1, loginBgTeste, loginBg3, loginBg4];

// Configuração de posicionamento e escala do logo da página de login (logo-sao-joao.png)
const LOGIN_LOGO_SCALE = 3; // Ajuste este valor para alterar a escala do logo na página de login
const LOGIN_LOGO_STYLE = {
  position: 'relative' as const,
  top: '0px',      // Ajuste vertical (ex: '-10px' para subir, '10px' para descer)
  left: '-30px',     // Ajuste horizontal (ex: '-20px' para esquerda, '20px' para direita)
  transform: `scale(${LOGIN_LOGO_SCALE})`,
  transformOrigin: 'center center', // Origem da transformação
  width: '290px',  // Largura (equivalente ao original w-72.5)
  height: '128px', // Altura (equivalente ao original h-32)
  objectFit: 'contain' as const,
};

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
  language: 'pt' | 'en' | 'es' | 'sp';
  onChangeLanguage: (lang: 'pt' | 'en' | 'es' | 'sp') => void;
  onLogin: (profile: UserProfile) => void;
}

interface SavedAccount {
  email: string;
  password?: string;
  profile: UserProfile;
  createdAt: string;
}

export function LoginScreen({ onNavigate, language, onChangeLanguage, onLogin }: LoginScreenProps): JSX.Element {
  const { toast: onToast } = useToast();
  const t = translations[language];
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [showGoogleAccountSelector, setShowGoogleAccountSelector] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Ajuste o valor de x e y diretamente no código para mover o texto do login.
  // x positivo move para a direita; x negativo move para a esquerda.
  // y positivo move para baixo; y negativo move para cima.
  const heroOffset = { x: 620, y: 60 };
  const [activeLoginBg, setActiveLoginBg] = useState(0);
  const isLargoBg = false;

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'turista' as 'turista' | 'estabelecimento',
    acceptTerms: false,
  });

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docsTab, setDocsTab] = useState<'termos' | 'privacidade'>('termos');

  // Função para salvar conta no localStorage
  const saveAccount = (email: string, password: string, profile: UserProfile): void => {
    try {
      const accounts = JSON.parse(localStorage.getItem('sergipanidade_accounts') || '[]');
      accounts.push({
        email,
        password,
        profile,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('sergipanidade_accounts', JSON.stringify(accounts));
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    }
  };

  // Função para verificar credenciais
  const validateCredentials = (email: string, password: string): UserProfile | null => {
    try {
      const accounts: SavedAccount[] = JSON.parse(localStorage.getItem('sergipanidade_accounts') || '[]');
      const account = accounts.find(
        (acc: SavedAccount) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );
      return account ? account.profile : null;
    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLoginBg((prev) => (prev + 1) % LOGIN_BACKGROUNDS.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleRecoverPassword = (): void => {
    if (!recoverEmail.trim()) {
      onToast(t.enterEmail);
      return;
    }
    setShowRecoverModal(false);
    setRecoverEmail('');
    onToast(t.linkSent);
  };

  const handleRegister = (): void => {
    if (!registerData.name.trim()) {
      onToast(t.enterName);
      return;
    }
    if (!registerData.email.trim()) {
      onToast(t.enterEmail);
      return;
    }
    if (!registerData.password.trim()) {
      onToast(t.enterPassword);
      return;
    }
    if (registerData.password.length < 6) {
      onToast(t.passwordTooShort);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      onToast(t.passwordsDontMatch);
      return;
    }
    if (!registerData.acceptTerms) {
      onToast(t.mustAcceptTerms);
      return;
    }

    // Criar perfil do usuário
    const profile: UserProfile = {
      name: registerData.name,
      email: registerData.email,
      userType: registerData.userType,
      notifications: {
        nearby: true,
        promotions: true,
        reminders: false,
        events: false,
      },
    };

    setShowRegisterModal(false);
    const userTypeMessage =
      registerData.userType === 'turista'
        ? t.touristAccountCreated
        : t.establishmentAccountCreated;

    setRegisterData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'turista',
      acceptTerms: false,
    });

    // Salvar conta no localStorage
    saveAccount(registerData.email, registerData.password, profile);

    // Fazer login automático após cadastro
    onLogin(profile);
    onNavigate('home');
    onToast(userTypeMessage);
  };

  const handleGoogleLogin = (): void => {
    // Primeiro mostra o seletor de contas
    setShowGoogleAccountSelector(true);
  };

  const handleAccountSelect = (
    accountName: string,
    accountEmail: string,
    accountType: 'turista' | 'estabelecimento',
    accountPhoto?: string,
  ): void => {
    setShowGoogleAccountSelector(false);
    setShowGoogleAuth(true);

    setTimeout(() => {
      setShowGoogleAuth(false);
      const profile: UserProfile = {
        name: accountName,
        email: accountEmail,
        userType: accountType,
        photo: accountPhoto,
        notifications: {
          nearby: true,
          promotions: true,
          reminders: false,
          events: false,
        },
      };
      onLogin(profile);
      onNavigate('home');
      onToast(t.googleLoginSuccess);
    }, 2500);
  };

  const handleTraditionalLogin = (): void => {
    if (!loginData.email.trim()) {
      onToast(t.enterEmail);
      return;
    }
    if (!loginData.password.trim()) {
      onToast(t.enterPassword);
      return;
    }

    // Validar credenciais
    const profile = validateCredentials(loginData.email, loginData.password);
    if (!profile) {
      onToast(t.invalidCredentials);
      return;
    }

    onLogin(profile);
    onNavigate('home');
    onToast(t.loginSuccess);
  };

  const handleBackToLoginOptions = (): void => {
    setShowLoginForm(false);
    setLoginData({ email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2 relative">
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-50" ref={languageMenuRef}>
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-2.5 px-4 py-2.5
                     bg-transparent hover:bg-black/5
                     rounded-lg text-[#0D7377]
                     font-medium text-sm cursor-pointer transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{language === 'pt' ? 'Sergipanês pt-BR' : language === 'sp' ? 'Sergipanês pt-BR' : language === 'en' ? 'EN' : 'ES'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showLanguageMenu && (
          <div className="absolute top-[calc(100%+12px)] right-0
                          bg-white rounded-xl
                          shadow-2xl overflow-hidden
                          min-w-45 border border-[#E0E0E0]">
            <button
              onClick={() => {
                onChangeLanguage('pt');
                setShowLanguageMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium
                          transition-all border-none cursor-pointer ${language === 'pt'
                  ? 'bg-[#0D7377]/10 text-[#0D7377]'
                  : 'bg-white text-[#555] hover:bg-[#F7F6F3]'
                }`}
            >
              <span>Sergipanês pt-BR</span>
              {language === 'pt' && <span className="ml-auto text-[#0D7377]">✓</span>}
            </button>
            <button
              onClick={() => {
                onChangeLanguage('en');
                setShowLanguageMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium
                          transition-all border-none cursor-pointer ${language === 'en'
                  ? 'bg-[#0D7377]/10 text-[#0D7377]'
                  : 'bg-white text-[#555] hover:bg-[#F7F6F3]'
                }`}
            >
              <span>{t.languages.english}</span>
              {language === 'en' && <span className="ml-auto text-[#0D7377]">✓</span>}
            </button>
            <button
              onClick={() => {
                onChangeLanguage('es');
                setShowLanguageMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium
                          transition-all border-none cursor-pointer ${language === 'es'
                  ? 'bg-[#0D7377]/10 text-[#0D7377]'
                  : 'bg-white text-[#555] hover:bg-[#F7F6F3]'
                }`}
            >
              <span>{t.languages.spanish}</span>
              {language === 'es' && <span className="ml-auto text-[#0D7377]">✓</span>}
            </button>
          </div>
        )}
      </div>

      {/* Left Panel */}
      <div className="hidden md:flex bg-[#0D7377] px-8 sm:px-12 md:px-16 py-16 md:py-24 flex-col justify-center relative overflow-hidden">
        {LOGIN_BACKGROUNDS.map((bg, index) => (
          <div
            key={bg}
            className="absolute inset-0 bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundPosition: 'left center',
              opacity: activeLoginBg === index ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
            }}
          />
        ))}

        <div className="relative z-10 max-w-130">
          {/* Hero text removed per request */}
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-white px-6 sm:px-12 md:px-16 py-12 md:py-20 flex flex-col justify-center w-full">
        <div className="max-w-110 mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img
              src={logoSaoJoao}
              alt="Logo São João"
              style={LOGIN_LOGO_STYLE}
            />
          </div>

          {!showLoginForm ? (
            <>
              {/* Tela de Opções */}
              <h2 className="font-['Fjalla_One'] text-[36px] text-(--preto) mb-3 tracking-wide text-center">
                {t.welcomeBack}
              </h2>
              <p className="text-sm text-[#777] mb-10 text-center leading-relaxed">
                {t.accessAccount}
              </p>

              <div className="space-y-4">
                {/* Botão Fazer Login */}
                <button
                  type="button"
                  onClick={() => setShowLoginForm(true)}
                  className="w-full px-6 py-4 bg-[#0D7377] text-white font-semibold text-base
                             rounded-xl shadow-[0_2px_8px_rgba(13,115,119,0.25)]
                             hover:bg-[#0a5d61] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(13,115,119,0.3)]"
                >
                  {t.login}
                </button>

                {/* Botão Cadastrar-se */}
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full px-6 py-4 bg-white text-[#0D7377] font-semibold text-base
                             rounded-xl border-2 border-[#0D7377]
                             hover:bg-[#0D7377] hover:text-white transition-all duration-200"
                >
                  {t.createAccount}
                </button>

                {/* Botão Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full px-6 py-4 bg-white text-[#333] font-semibold text-base
                             rounded-xl border border-[#E0E0E0] shadow-[0_1px_3px_rgba(0,0,0,0.015)]
                             hover:border-[#999] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-all duration-200
                             flex items-center justify-center gap-3"
                >
                  <img src={googleLogo} alt="Google logo" className="w-5 h-5 object-contain" />
                  {t.loginWithGoogle}
                </button>

              </div>

              {/* Termos e Política */}
              <p className="text-sm text-black text-center mt-8 leading-relaxed px-4">
                Ao continuar, você aceita os{' '}
                <button
                  onClick={() => { setDocsTab('termos'); setIsDocsOpen(true); }}
                  className="text-[#0D7377] hover:underline bg-transparent border-none p-0 cursor-pointer font-sm inline"
                >
                  Termos de Uso
                </button>
                {' '}e a{' '}
                <button
                  onClick={() => { setDocsTab('privacidade'); setIsDocsOpen(true); }}
                  className="text-[#0D7377] hover:underline bg-transparent border-none p-0 cursor-pointer font-sm inline"
                >
                  Política de Privacidade
                </button>
                {' '}do Sergipanidade.
              </p>
            </>
          ) : (
            <>
              {/* Tela de Login */}
              <h2 className="font-['Fjalla_One'] text-[32px] text-(--preto) mb-2 tracking-wide">
                {t.welcomeBack}
              </h2>
              <p className="text-sm text-[#777] mb-8">{t.accessAccount}</p>

              <div className="space-y-5">
                {/* Campo Email/Telefone */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                    E-mail ou Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                               text-[15px] text-[#1A1A1A] bg-white outline-none
                               focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
                  />
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                               text-[15px] text-[#1A1A1A] bg-white outline-none
                               focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
                  />
                </div>

                {/* Botão Entrar */}
                <button
                  onClick={handleTraditionalLogin}
                  className="w-full px-6 py-4 bg-[#0D7377] text-white font-semibold text-base
                             rounded-xl shadow-[0_2px_8px_rgba(13,115,119,0.25)]
                             hover:bg-[#0a5d61] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(13,115,119,0.3)]
                             mt-2"
                >
                  {t.login}
                </button>

                {/* Esqueci a senha */}
                <button
                  onClick={() => setShowRecoverModal(true)}
                  className="block text-center w-full text-sm font-medium text-[#0D7377] hover:underline"
                >
                  {t.forgotPassword}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLoginOptions}
                  className="block text-center w-full text-sm font-medium text-[#0D7377] hover:underline mt-4"
                >
                  Voltar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showRecoverModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-['Fjalla_One'] text-3xl text-[#1A1A1A] mb-3 tracking-wide">
              {t.recoverPassword}
            </h3>
            <p className="text-sm text-[#777] mb-8 leading-relaxed">
              {t.recoverMessage}
            </p>

            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                {t.email}
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRecoverPassword()}
                className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                           text-[15px] text-[#1A1A1A] bg-white outline-none
                           focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
                autoFocus
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRecoverPassword}
                className="flex-1 px-6 py-3.5 bg-[#0D7377] text-white font-semibold text-base
                           rounded-xl shadow-[0_2px_8px_rgba(13,115,119,0.25)]
                           hover:bg-[#0a5d61] transition-all duration-200"
              >
                {t.sendLink}
              </button>
              <button
                onClick={() => {
                  setShowRecoverModal(false);
                  setRecoverEmail('');
                }}
                className="flex-1 px-6 py-3.5 bg-white text-[#555] font-semibold text-base
                           border-2 border-[#E0E0E0] rounded-xl
                           hover:border-[#999] transition-all duration-200"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-2xl w-full mx-4 my-8 shadow-2xl">
            <h3 className="font-['Fjalla_One'] text-3xl text-[#1A1A1A] mb-3 tracking-wide">
              {t.createNewAccount}
            </h3>
            <p className="text-sm text-[#777] mb-8 leading-relaxed">
              {t.fillData}
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                {t.fullName}
              </label>
              <input
                type="text"
                placeholder={t.fullName}
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                           text-[15px] text-[#1A1A1A] bg-white outline-none
                           focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
                autoFocus
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-3 tracking-wide">
                {t.accountType}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 rounded-xl
                              cursor-pointer transition-all ${registerData.userType === 'turista'
                      ? 'border-[#0D7377] bg-[#0D7377]/5 shadow-sm'
                      : 'border-[#E0E0E0] bg-white hover:border-[#0D7377]'
                    }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="turista"
                    checked={registerData.userType === 'turista'}
                    onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value as any })}
                    className="hidden"
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0D7377]">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{t.tourist}</span>
                </label>

                <label
                  className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 rounded-xl
                              cursor-pointer transition-all ${registerData.userType === 'estabelecimento'
                      ? 'border-[#0D7377] bg-[#0D7377]/5 shadow-sm'
                      : 'border-[#E0E0E0] bg-white hover:border-[#0D7377]'
                    }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="estabelecimento"
                    checked={registerData.userType === 'estabelecimento'}
                    onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value as any })}
                    className="hidden"
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0D7377]">
                    <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{t.establishment}</span>
                </label>
              </div>
              <p className="text-xs text-[#999] mt-3 leading-relaxed">
                {registerData.userType === 'turista' && t.touristDesc}
                {registerData.userType === 'estabelecimento' && t.establishmentDesc}
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                {t.email}
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                           text-[15px] text-[#1A1A1A] bg-white outline-none
                           focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                {t.password}
              </label>
              <input
                type="password"
                placeholder={t.minChars}
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                           text-[15px] text-[#1A1A1A] bg-white outline-none
                           focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-[#555] mb-2 tracking-wide">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                placeholder={t.reenterPassword}
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full px-4 py-3.5 border border-[#D0D0D0] rounded-lg
                           text-[15px] text-[#1A1A1A] bg-white outline-none
                           focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/10 transition-all"
              />
            </div>

            <div className="flex items-start gap-3 px-4 py-4 mb-8
                            bg-[#F7F6F3] border border-[#E0E0E0] rounded-xl">
              <input
                type="checkbox"
                id="register-lgpd"
                checked={registerData.acceptTerms}
                onChange={(e) => setRegisterData({ ...registerData, acceptTerms: e.target.checked })}
                className="w-4 h-4 accent-[#0D7377] shrink-0 mt-0.5 cursor-pointer"
              />
              <label htmlFor="register-lgpd" className="text-xs text-[#555] leading-relaxed cursor-pointer">
                {t.acceptTerms}{' '}
                <button
                  type="button"
                  onClick={() => { setDocsTab('termos'); setIsDocsOpen(true); }}
                  className="text-[#0D7377] font-semibold bg-transparent border-none p-0 cursor-pointer hover:underline inline text-left"
                >
                  {t.termsOfUse}
                </button>{' '}
                {t.and}{' '}
                <button
                  type="button"
                  onClick={() => { setDocsTab('privacidade'); setIsDocsOpen(true); }}
                  className="text-[#0D7377] font-semibold bg-transparent border-none p-0 cursor-pointer hover:underline inline text-left"
                >
                  {t.privacyPolicy}
                </button>.
                {t.lgpdConsent}{' '}
                <span className="text-[#0D7377] font-semibold">{t.lgpdLaw}</span>.
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRegister}
                className="flex-1 px-6 py-3.5 bg-[#0D7377] text-white font-semibold text-base
                           rounded-xl shadow-[0_2px_8px_rgba(13,115,119,0.25)]
                           hover:bg-[#0a5d61] transition-all duration-200"
              >
                {t.createAccountButton}
              </button>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    userType: 'turista',
                    acceptTerms: false,
                  });
                }}
                className="flex-1 px-6 py-3.5 bg-white text-[#555] font-semibold text-base
                           border-2 border-[#E0E0E0] rounded-xl
                           hover:border-[#999] transition-all duration-200"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoogleAuth && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-12 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="mb-8">
              <img src={googleLogo} alt="Google logo" className="mx-auto mb-5 w-14 h-14 object-contain" />
              <h3 className="font-['Fjalla_One'] text-3xl text-[#1A1A1A] mb-2 tracking-wide">
                {t.connectingGoogle}
              </h3>
              <p className="text-sm text-[#777]">
                {t.authenticating}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 bg-[#0D7377] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-[#0D7377] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-[#0D7377] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            <p className="text-xs text-[#999]">
              {t.redirecting}
            </p>
          </div>
        </div>
      )}

      {showGoogleAccountSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="text-center px-10 pt-10 pb-8 border-b border-[#E0E0E0]">
              <img src={googleLogo} alt="Google logo" className="mx-auto mb-5 w-14 h-14 object-contain" />
              <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-2">
                {t.selectGoogleAccount}
              </h3>
              <p className="text-sm text-[#777] leading-relaxed">
                {t.selectGoogleAccountDesc}
              </p>
            </div>

            {/* Account List */}
            <div className="py-3">
              <button
                onClick={() => handleAccountSelect('João Silva', 'joao.silva@gmail.com', 'turista', avatarJoao)}
                className="w-full px-8 py-4 flex items-center gap-4 hover:bg-[#F7F6F3] transition-all border-none bg-transparent cursor-pointer text-left"
              >
                {avatarJoao ? (
                  <img src={avatarJoao} alt="João Silva" className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#0D7377] flex items-center justify-center text-white font-semibold text-base shrink-0">JS</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1A1A1A] truncate">João Silva</div>
                  <div className="text-xs text-[#777] truncate">joao.silva@gmail.com</div>
                  <div className="text-xs text-[#0D7377] font-medium mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    {t.tourist}
                  </div>
                </div>
              </button>



              <button
                onClick={() => handleAccountSelect('Miauteria', 'contato@miauteriacafe.com.br', 'estabelecimento', avatarMiauteria)}
                className="w-full px-8 py-4 flex items-center gap-4 hover:bg-[#F7F6F3] transition-all border-none bg-transparent cursor-pointer text-left"
              >
                {avatarMiauteria ? (
                  <img src={avatarMiauteria} alt="Miauteria" className="w-11 h-11 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#0D7377] flex items-center justify-center text-white font-semibold text-base shrink-0">M</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1A1A1A] truncate">Miauteria Cat Café</div>
                  <div className="text-xs text-[#777] truncate">contato@miauteriacafe.com.br</div>
                  <div className="text-xs text-[#0D7377] font-medium mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                    </svg>
                    {t.establishment}
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E0E0E0] px-8 py-5">
              <button
                onClick={() => setShowGoogleAccountSelector(false)}
                className="w-full px-5 py-3 border-2 border-[#E0E0E0] rounded-xl bg-white text-[#0D7377]
                           text-sm font-semibold cursor-pointer hover:border-[#0D7377] hover:bg-[#0D7377]/5
                           transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                {t.useAnotherAccount}
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentosModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} defaultTab={docsTab} />
    </div>
  );
}