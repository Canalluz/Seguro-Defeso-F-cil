
import React, { useState, useEffect } from 'react';
import {
  Home as HomeIcon,
  Calendar,
  FileText,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  User,
  // Added UserPlus to the import list to fix "Cannot find name 'UserPlus'" error
  UserPlus,
  LogIn,
  LogOut,
  MapPin,
  FileSearch,
  Fish,
  Headphones,
  Download,
  Github,
  ClipboardList,
  Landmark,
  ArrowLeft
} from 'lucide-react';
import { BiometricAuth } from './components/BiometricAuth';
import { speakExplanation } from './services/gemini';
import { InsuranceRequest } from './components/InsuranceRequest';
import { AccountData } from './components/AccountData';
import { DefesoCalendar } from './components/DefesoCalendar';
import { RegistrationForm } from './components/RegistrationForm';
import { BiometricSetup } from './components/BiometricSetup';
import { LoginScreen } from './components/LoginScreen';
import { DocumentWallet } from './components/DocumentWallet';
import { FisherData, DefesoInfo } from './types';
import { playClick, playSuccess, playError } from './services/audio';
import { fetchDefesoData } from './services/defesoService'; // Import service
import { AnimatedAvatar } from './components/AnimatedAvatar';
import { TermsOfUse } from './components/TermsOfUse';
import { ReapMenu } from './components/ReapMenu';
import { InssMenu } from './components/InssMenu';

type View = 'landing' | 'registrationForm' | 'biometricSetup' | 'login' | 'home' | 'calendar' | 'profile' | 'insuranceRequest' | 'wallet' | 'reap' | 'inss';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<View>('landing');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);

  const [formData, setFormData] = useState<FisherData>({
    name: '',
    cpf: '',
    rgp: '',
    region: 'Norte - Bacia Amazônica',
    hasRight: true,
    securityMode: 'biometric'
  });

  // Check for saved user on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fisherData');
      if (savedUser && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          // Merge with defaults to ensure all fields exist
          setFormData(prev => ({ ...prev, ...parsedUser }));
        }
      }
    } catch (e) {
      console.error("Local Storage Load Error:", e);
    }
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      playClick();
      handleAudio("Para colocar o ícone na sua tela inicial, procure a opção 'Instalar' ou 'Adicionar à tela inicial' no menu do seu navegador.");
      return;
    }
    playClick();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleAudio = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakExplanation(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleLogout = () => {
    playClick();
    setIsLoggedIn(false);
    setActiveTab('landing'); // Redirect to Landing page
  };

  const handleLoginSuccess = () => {
    playSuccess();
    handleAudio("Bem-vindo de volta!");
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleRegistrationNext = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    setActiveTab('biometricSetup');
  };

  const handleRegistrationComplete = (mode: 'biometric' | 'pin', pin?: string, photo?: string, descriptor?: number[]) => {
    const finalData = { ...formData, securityMode: mode, pin, photoUrl: photo, faceDescriptor: descriptor };
    setFormData(finalData);
    localStorage.setItem('fisherData', JSON.stringify(finalData));

    handleAudio("Cadastro realizado com sucesso! Seu acesso agora está protegido.");
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const fisherPhoto = "https://images.unsplash.com/photo-1516715668466-93ad73070493?auto=format&fit=crop&q=80&w=600&h=600";
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

  const fisher: FisherData = formData;

  const [defeso, setDefeso] = useState<DefesoInfo>({
    species: 'Carregando...',
    startDate: '--/--/----',
    endDate: '--/--/----',
    daysRemaining: 0,
    hasRight: false,
    region: 'Carregando...',
    description: 'Buscando informações oficiais...',
    status: 'upcoming'
  });
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Fetch Defeso Data
  useEffect(() => {
    const loadDefeso = async () => {
      const region = formData.region || 'Norte - Bacia Amazônica';
      try {
        const response = await fetchDefesoData(region);
        setDefeso(response.data);
        setLastUpdated(response.lastUpdated);
      } catch (error) {
        console.error("Failed to load defeso data", error);
      }
    };
    loadDefeso();
  }, [formData.region]); // Reload if region changes

  if (showTerms) {
    return <TermsOfUse onClose={() => setShowTerms(false)} />;
  }

  const renderContent = () => {
    if (!isLoggedIn) {
      switch (activeTab) {
        case 'registrationForm':
          return (
            <RegistrationForm
              onNext={handleRegistrationNext}
              onBack={() => setActiveTab('landing')}
            />
          );
        case 'biometricSetup':
          return (
            <BiometricSetup
              onComplete={handleRegistrationComplete}
            />
          );
        case 'login':
          return (
            <LoginScreen
              username={formData.name}
              securityMode={formData.securityMode}
              storedPin={formData.pin}
              userPhoto={formData.photoUrl}
              storedDescriptor={formData.faceDescriptor}
              onLoginSuccess={handleLoginSuccess}
            />
          );
        case 'landing':
        default:
          return (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 h-full lg:max-w-5xl lg:mx-auto animate-in fade-in duration-700 relative">
              {/* Hero Image Section */}
              <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4 lg:pt-0 lg:pb-0">
                <div className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white mb-6 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop"
                    alt="Pescador Artesanal"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
                </div>

                <div className="text-center px-6 lg:text-left lg:px-0">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight tracking-tight mb-2">
                    Seu Seguro-Defeso <br /> <span className="text-blue-600">Fácil e Seguro</span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-500 font-bold leading-tight">Ajuda gratuita para o pescador.</p>
                </div>
              </div>

              {/* Bottom Actions Section */}
              <div className="bg-white rounded-t-[3rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-2xl space-y-4 lg:w-[450px]">
                <button onClick={() => { playClick(); setActiveTab('login'); }} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  <LogIn className="w-7 h-7" /> Já sou cadastrado
                </button>
                <button onClick={() => { playClick(); setActiveTab('registrationForm'); }} className="w-full bg-slate-50 text-blue-700 py-5 rounded-[2rem] font-black text-2xl border-2 border-blue-50 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  <UserPlus className="w-7 h-7" /> Começar Agora
                </button>

                <div className="pt-4 flex flex-col items-center gap-4">
                  <button
                    onClick={() => { playClick(); setShowTerms(true); }}
                    className="text-slate-400 text-xs font-bold underline decoration-slate-300 hover:text-blue-600 transition-colors"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>

                  <button onClick={() => { playClick(); handleAudio("Bem-vindo! Toque no botão azul se já tem conta, ou no branco para criar uma nova."); }} className="flex items-center gap-2 text-indigo-500 font-black text-sm active:scale-95 bg-indigo-50 px-4 py-2 rounded-full">
                    <Volume2 className="w-4 h-4" /> Ouvir Ajuda
                  </button>
                </div>
              </div>
            </div>
          );
      }
    }

    switch (activeTab) {
      case 'insuranceRequest':
        return (
          <InsuranceRequest
            fisher={fisher}
            defeso={defeso}
            onBack={() => setActiveTab('home')}
            onSuccess={() => setActiveTab('home')}
          />
        );
      case 'calendar':
        return (
          <DefesoCalendar defeso={defeso} />
        );
      case 'profile':
        return (
          <AccountData fisher={fisher} onLogout={handleLogout} />
        );
      case 'wallet':
        return <DocumentWallet onBack={() => setActiveTab('home')} />;
      case 'reap':
        return <ReapMenu onBack={() => setActiveTab('home')} />;
      case 'inss':
        return <InssMenu onBack={() => setActiveTab('home')} fisher={fisher} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <section className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-4 shadow-lg border border-white flex items-center gap-5 mt-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-blue-100 shadow-md bg-blue-50">
                  {fisher.photoUrl ? (
                    <img src={fisher.photoUrl} alt={fisher.name} className="w-full h-full object-cover" />
                  ) : (
                    <AnimatedAvatar />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full border-2 border-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pescador(a)</p>
                <h2 className="text-2xl font-black text-slate-800 leading-none mb-1">{fisher.name}</h2>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {fisher.region}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-100 p-1.5 rounded-lg"><Fish className="w-5 h-5 text-blue-700" /></div>
                    <span className="text-blue-700 font-black text-[10px] uppercase tracking-widest">
                      {lastUpdated ? `Oficial (Atualizado: ${new Date(lastUpdated).toLocaleDateString()})` : 'Próximo Defeso'}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 leading-tight">{defeso.species}</h3>
                  <p className="text-slate-500 font-bold">📅 Inicia {defeso.startDate}</p>
                </div>
                <div className="bg-orange-500 text-white p-4 rounded-3xl text-center shadow-lg border-2 border-orange-400">
                  <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">Faltam</p>
                  <p className="text-3xl font-black leading-none">{defeso.daysRemaining}</p>
                  <p className="text-[10px] font-black uppercase tracking-tighter mt-1">Dias</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-5 rounded-3xl mb-6 shadow-inner ${fisher.hasRight ? 'bg-green-50 border border-green-200' : 'bg-red-50'}`}>
                {fisher.hasRight ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
                <div>
                  <p className={`text-xl font-black ${fisher.hasRight ? 'text-green-800' : 'text-red-800'}`}>Você tem direito</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Solicitação liberada em breve</p>
                </div>
              </div>

              <button onClick={() => { playClick(); setActiveTab('calendar'); }} className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                Ver Detalhes <ChevronRight className="w-6 h-6" />
              </button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => { playClick(); setActiveTab('insuranceRequest'); }} className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all md:col-span-2 group hover:border-blue-200">
                <div className="bg-blue-100 p-4 rounded-2xl group-hover:scale-105 transition-transform"><FileText className="w-10 h-10 text-blue-700" /></div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-slate-800">Pedir Seguro</h4>
                  <p className="text-slate-500 font-bold">Novo requerimento</p>
                </div>
                <ChevronRight className="ml-auto w-8 h-8 text-slate-300" />
              </button>

              <button onClick={() => { playClick(); setActiveTab('wallet'); }} className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all group hover:border-green-200">
                <div className="bg-green-100 p-4 rounded-2xl group-hover:scale-105 transition-transform"><FileSearch className="w-10 h-10 text-green-700" /></div>
                <div className="text-left">
                  <h3 className="font-black text-slate-800 text-lg">Meus Documentos</h3>
                  <p className="text-slate-400 font-bold text-xs">Organize seus arquivos</p>
                </div>
                <ChevronRight className="ml-auto w-8 h-8 text-slate-300" />
              </button>

              <button
                onClick={() => { playClick(); setActiveTab('reap'); }}
                className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all text-left group hover:border-emerald-200"
              >
                <div className="bg-emerald-100 p-4 rounded-2xl group-hover:scale-105 transition-transform"><ClipboardList className="w-10 h-10 text-emerald-600" /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">REAP</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Relatório de Atividade Pesqueira</p>
                </div>
                <ChevronRight className="ml-auto w-8 h-8 text-slate-300" />
              </button>

              <button
                onClick={() => { playClick(); setActiveTab('inss'); }}
                className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all text-left group hover:border-orange-200"
              >
                <div className="bg-orange-100 p-4 rounded-2xl group-hover:scale-105 transition-transform"><Landmark className="w-10 h-10 text-orange-600" /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">INSS</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Contribuição Previdenciária</p>
                </div>
                <ChevronRight className="ml-auto w-8 h-8 text-slate-300" />
              </button>
            </div>

            <section className="bg-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Headphones className="w-32 h-32" /></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-5 rounded-full mb-4 ${isSpeaking ? 'bg-white text-blue-900 animate-pulse' : 'bg-blue-800'}`}>
                  <Volume2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black mb-1">Dúvidas? Eu te explico!</h4>
                <p className="text-blue-200 font-bold mb-6 px-4">Toque abaixo para ouvir o que você precisa fazer agora.</p>
                <button
                  onClick={() => handleAudio(`Olá ${fisher.name}. Você tem direito ao seguro-defeso.`)}
                  disabled={isSpeaking}
                  className="w-full bg-white text-blue-900 py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
                >
                  {isSpeaking ? 'Ouvindo...' : 'Ouvir Explicação'}
                </button>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isLoggedIn && activeTab === 'home' ? 'bg-gradient-to-br from-blue-100 to-green-100' : 'bg-slate-50'}`}>

      {/* Persistent Top Header (Non-fixed, but stays at top of screen due to flex-col) */}
      {activeTab !== 'loginBiometrics' && activeTab !== 'registrationBiometrics' && (
        <header className={`${isLoggedIn && activeTab === 'home' ? 'bg-white shadow-md' : 'bg-blue-700 text-white shadow-xl'} flex-none p-6 rounded-b-[2.5rem] z-50 transition-all duration-500`}>
          <div className="flex items-center justify-between max-w-screen-lg mx-auto w-full gap-4">
            <div className="flex items-center gap-3">
              {isLoggedIn && activeTab !== 'home' && (
                <button
                  onClick={() => { playClick(); setActiveTab('home'); }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm active:scale-90 transition-all mr-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              <div className={`${isLoggedIn && activeTab === 'home' ? 'bg-blue-600' : 'bg-white/20'} p-3 rounded-2xl`}>
                <Fish className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-lg md:text-2xl font-black tracking-tight leading-none mb-1 ${isLoggedIn && activeTab === 'home' ? 'text-slate-800' : 'text-white'}`}>Seguro-Defeso Fácil</h1>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isLoggedIn && activeTab === 'home' ? 'text-blue-600' : 'text-blue-100'}`}>Seu direito, explicado simples</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isLoggedIn ? (
                <button onClick={handleInstallClick} className="flex items-center justify-center p-3 rounded-2xl shadow-lg active:scale-90 transition-all bg-yellow-400 text-blue-900 border-2 border-yellow-500" title="Instalar App">
                  <Download className="w-6 h-6" />
                </button>
              ) : (
                <button onClick={handleLogout} className="flex items-center justify-center p-3 rounded-2xl shadow-lg active:scale-90 transition-all bg-red-100 text-red-600 border-2 border-red-200" title="Sair">
                  <LogOut className="w-6 h-6" />
                </button>
              )}
              {isLoggedIn && (
                <button onClick={() => { playClick(); setActiveTab('profile'); }} className="p-0.5 rounded-full border-2 border-blue-100 shadow-sm overflow-hidden active:scale-90 transition-transform w-12 h-12">
                  {fisher.photoUrl ? <img src={fisher.photoUrl} alt={fisher.name} className="w-full h-full object-cover" /> : <AnimatedAvatar />}
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area (Scrollable) */}
      <main className="flex-grow overflow-y-auto px-5 pt-6 pb-40 z-20">
        <div className="max-w-screen-lg mx-auto w-full">
          {renderContent()}
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      {isLoggedIn && (['home', 'calendar', 'profile'].includes(activeTab)) && (
        <nav className="fixed bottom-14 left-0 right-0 z-40">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl flex items-center justify-around p-3 rounded-[3rem]">
              <button onClick={() => { playClick(); setActiveTab('home'); }} className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <HomeIcon className="w-7 h-7" /><span className="text-[10px] font-black">Início</span>
              </button>
              <button onClick={() => { playClick(); setActiveTab('calendar'); }} className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <Calendar className="w-7 h-7" /><span className="text-[10px] font-black">Defesos</span>
              </button>
              <button onClick={() => { playClick(); setActiveTab('profile'); }} className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <User className="w-7 h-7" /><span className="text-[10px] font-black">Perfil</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Safety Footer Message */}
      {activeTab !== 'insuranceRequest' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-yellow-400 border-t-2 border-yellow-500 z-50 h-14 shadow-inner">
          <div className="max-w-screen-lg mx-auto flex items-center justify-center gap-3 h-full">
            <ShieldCheck className="w-6 h-6 text-blue-900" />
            <p className="text-blue-900 font-black text-xs text-center">
              O Pedido Seguro-Defeso é gratuito. <strong>Não pague taxas.</strong>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
