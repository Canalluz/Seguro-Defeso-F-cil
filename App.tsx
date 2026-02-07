
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
  Github
} from 'lucide-react';
import { BiometricAuth } from './components/BiometricAuth';
import { speakExplanation } from './services/gemini';
import { FisherData, DefesoInfo } from './types';

type View = 'landing' | 'registrationForm' | 'registrationBiometrics' | 'loginBiometrics' | 'home' | 'calendar' | 'profile';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<View>('landing');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rgp: '',
    region: 'Norte - Bacia Amazônica',
  });

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
      handleAudio("Para colocar o ícone na sua tela inicial, procure a opção 'Instalar' ou 'Adicionar à tela inicial' no menu do seu navegador.");
      return;
    }
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
    setIsLoggedIn(false);
    setActiveTab('landing');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const fisherPhoto = "https://images.unsplash.com/photo-1516715668466-93ad73070493?auto=format&fit=crop&q=80&w=600&h=600";

  const fisher: FisherData = {
    name: formData.name || 'Seu Manoel da Silva',
    hasRight: true,
    rgp: formData.rgp || '998.776.554-A',
    region: formData.region
  };

  const defeso: DefesoInfo = {
    species: "Tambaqui",
    startDate: "01 de Dezembro",
    daysRemaining: 12
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      switch (activeTab) {
        case 'registrationForm':
          return (
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-6 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Novo Cadastro</h2>
              <p className="text-slate-500 font-bold mb-8">Preencha seus dados para começar.</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">👤 Nome Completo</label>
                  <input type="text" placeholder="Seu nome" className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-black text-xl outline-none focus:border-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">🆔 CPF</label>
                  <input type="text" placeholder="000.000.000-00" className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-black text-xl outline-none focus:border-blue-500" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <button onClick={() => setActiveTab('registrationBiometrics')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl mt-4 shadow-xl active:scale-95 transition-all">Próximo Passo</button>
                <button onClick={() => setActiveTab('landing')} className="w-full text-slate-400 font-bold py-4">Voltar</button>
              </div>
            </div>
          );
        case 'registrationBiometrics':
        case 'loginBiometrics':
          return <BiometricAuth onSuccess={handleLoginSuccess} />;
        case 'landing':
        default:
          return (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 animate-in fade-in duration-700">
              <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 border-4 border-blue-50/20">
                <Fish className="w-20 h-20 text-white" />
              </div>
              <div className="text-center px-4">
                <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                  Seu Seguro-Defeso <br/> <span className="text-blue-600">Fácil e Seguro</span>
                </h2>
                <p className="mt-2 text-lg text-slate-500 font-bold px-6 leading-tight">Ajuda gratuita para o pescador artesanal.</p>
              </div>
              
              <div className="w-full space-y-3 px-4">
                <button onClick={() => setActiveTab('loginBiometrics')} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  <LogIn className="w-7 h-7" /> Já sou cadastrado
                </button>
                <button onClick={() => setActiveTab('registrationForm')} className="w-full bg-white text-blue-700 py-5 rounded-[2rem] font-black text-2xl border-4 border-blue-50 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  <UserPlus className="w-7 h-7" /> Começar Agora
                </button>
              </div>

              <button onClick={() => handleAudio("Bem-vindo! Toque no botão azul se já tem conta, ou no branco para criar uma nova.")} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full font-black text-base active:scale-95">
                <Volume2 className="w-6 h-6" /> Ouvir Ajuda
              </button>
            </div>
          );
      }
    }

    switch (activeTab) {
      case 'calendar':
        return (
          <div className="py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-3xl font-black text-slate-800 mb-6">Próximos Defesos</h3>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <p className="text-blue-700 font-black text-2xl">{defeso.species}</p>
                <p className="text-slate-600 font-bold mt-2">Período: 01 de Dezembro a 30 de Março</p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 font-black"><MapPin className="w-5 h-5" /> Bacia Amazônica</div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center">
              <img src={fisherPhoto} className="w-32 h-32 rounded-[2rem] mx-auto border-4 border-blue-100 shadow-xl object-cover mb-6" />
              <h2 className="text-3xl font-black text-slate-800">{fisher.name}</h2>
              <p className="text-slate-500 font-black mt-2">RGP: {fisher.rgp}</p>
              <button onClick={handleLogout} className="mt-10 w-full bg-red-50 text-red-600 py-5 rounded-2xl font-black text-xl border-2 border-red-100 active:bg-red-100 flex items-center justify-center gap-3">
                <LogOut className="w-6 h-6" /> Sair da Conta
              </button>
            </section>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <section className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-4 shadow-lg border border-white flex items-center gap-5 mt-4">
              <div className="relative">
                <img src={fisherPhoto} alt="Foto do Pescador" className="w-20 h-20 rounded-3xl object-cover border-4 border-blue-100 shadow-md" />
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
                    <span className="text-blue-700 font-black text-[10px] uppercase tracking-widest">Próximo Defeso</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 leading-tight">{defeso.species}</h3>
                  <p className="text-slate-500 font-bold">📅 Inicia 01 Dezembro</p>
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

              <button onClick={() => setActiveTab('calendar')} className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                Ver Detalhes <ChevronRight className="w-6 h-6" />
              </button>
            </section>

            <div className="grid grid-cols-1 gap-4">
              <button className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all">
                <div className="bg-blue-100 p-4 rounded-2xl"><FileText className="w-10 h-10 text-blue-700" /></div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-slate-800">Pedir Seguro</h4>
                  <p className="text-slate-500 font-bold">Novo requerimento</p>
                </div>
                <ChevronRight className="ml-auto w-8 h-8 text-slate-300" />
              </button>

              <button className="bg-white p-6 rounded-[2rem] flex items-center gap-5 shadow-md border border-slate-100 active:bg-slate-50 transition-all">
                <div className="bg-green-100 p-4 rounded-2xl"><FileSearch className="w-10 h-10 text-green-700" /></div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-slate-800">Meus Documentos</h4>
                  <p className="text-slate-500 font-bold">Organize seus arquivos</p>
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
    <div className={`min-h-screen flex flex-col pb-44 ${isLoggedIn && activeTab === 'home' ? 'bg-gradient-to-br from-blue-100 to-green-100' : 'bg-slate-50'}`}>
      {activeTab !== 'loginBiometrics' && activeTab !== 'registrationBiometrics' && (
        <header className={`${isLoggedIn && activeTab === 'home' ? 'bg-white/95 backdrop-blur-xl' : 'bg-blue-700 text-white'} p-6 rounded-b-[3rem] shadow-xl sticky top-0 z-50 transition-all duration-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${isLoggedIn && activeTab === 'home' ? 'bg-blue-600' : 'bg-white/20'} p-3 rounded-2xl`}>
                <Fish className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-2xl font-black tracking-tight leading-none mb-1 ${isLoggedIn && activeTab === 'home' ? 'text-slate-800' : 'text-white'}`}>Seguro-Defeso Fácil</h1>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isLoggedIn && activeTab === 'home' ? 'text-blue-600' : 'text-blue-100'}`}>Seu direito, explicado simples</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href="https://github.com/seu-usuario/seguro-defeso-facil" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 rounded-2xl shadow-lg active:scale-90 transition-all bg-slate-800 text-white border-2 border-slate-700"
                title="Ver código no GitHub"
              >
                <Github className="w-6 h-6" />
              </a>

              <button 
                onClick={handleInstallClick}
                className="flex items-center justify-center p-3 rounded-2xl shadow-lg active:scale-90 transition-all bg-yellow-400 text-blue-900 border-2 border-yellow-500"
                title="Instalar App"
              >
                <Download className="w-6 h-6" />
              </button>

              {isLoggedIn && (
                <button onClick={() => setActiveTab('profile')} className="p-0.5 rounded-full border-2 border-blue-100 shadow-sm overflow-hidden active:scale-90 transition-transform">
                  <img src={fisherPhoto} className="w-12 h-12 rounded-full object-cover" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`px-5 flex-grow z-20 overflow-y-auto ${activeTab === 'home' ? 'mt-4' : 'mt-2'}`}>
        {renderContent()}
      </main>

      {isLoggedIn && (['home', 'calendar', 'profile'].includes(activeTab)) && (
        <nav className="fixed bottom-14 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-2xl flex items-center justify-around p-4 z-40 rounded-t-[3rem]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <HomeIcon className="w-8 h-8" /><span className="text-[10px] font-black">Início</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <Calendar className="w-8 h-8" /><span className="text-[10px] font-black">Defesos</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <User className="w-8 h-8" /><span className="text-[10px] font-black">Perfil</span>
          </button>
        </nav>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-4 border-t-2 border-yellow-500 flex items-center justify-center gap-3 z-50 h-14 shadow-inner">
        <ShieldCheck className="w-6 h-6 text-blue-900" />
        <p className="text-blue-900 font-black text-xs text-center">
          O Seguro-Defeso é gratuito. <strong>Não pague taxas ao INSS.</strong>
        </p>
      </footer>
    </div>
  );
};

export default App;
