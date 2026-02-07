import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    MapPin,
    Fish,
    FileText,
    Camera,
    Upload,
    AlertCircle,
    ShieldCheck,
    Calendar
} from 'lucide-react';
import { FisherData, DefesoInfo } from '../types';
import { playClick, playSuccess, playError } from '../services/audio';
import { speakExplanation } from '../services/gemini';

interface InsuranceRequestProps {
    fisher: FisherData;
    defeso: DefesoInfo;
    onBack: () => void;
    onSuccess: () => void;
}

export const InsuranceRequest: React.FC<InsuranceRequestProps> = ({ fisher, defeso, onBack, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Camera State
    const [activeCapture, setActiveCapture] = useState<keyof typeof photos | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Form State
    const [fishingType, setFishingType] = useState<'artesanal' | 'industrial' | null>(null);
    const [photos, setPhotos] = useState({
        rgp: null as string | null,
        cpf: null as string | null,
        residence: null as string | null
    });

    const steps = [
        { title: "Dados Pessoais", audio: "Confira seus dados pessoais. Eles e do seu cadastro e não podem ser alterados aqui." },
        { title: "Tipo de Pesca", audio: "Selecione o seu tipo de pesca. Toque no barco para pesca artesanal." },
        { title: "Defeso", audio: "Confira as datas do defeso para o seu peixe. Veja se está tudo certo." },
        { title: "Documentos", audio: "Agora, tire uma foto bem clara da sua documentação. RG ou CPF, e comprovante de residência." },
        { title: "Revisão", audio: "Revise tudo com cuidado. Se estiver tudo certo, toque em Enviar Requerimento." },
    ];

    useEffect(() => {
        // Play audio instruction when step changes
        if (step <= 5 && !activeCapture) {
            speakExplanation(steps[step - 1].audio);
        }
    }, [step, activeCapture]);

    // Cleanup camera stream
    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [activeCapture]);

    const startCamera = async (field: keyof typeof photos) => {
        playClick();
        setActiveCapture(field);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            playError();
            speakExplanation("Não conseguimos acessar a câmera. Verifique se você permitiu o acesso.");
            setActiveCapture(null);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setActiveCapture(null);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && activeCapture) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoData = canvas.toDataURL('image/jpeg', 0.8);
                setPhotos(prev => ({ ...prev, [activeCapture]: photoData }));
                playSuccess();
                stopCamera();
            }
        }
    };

    const handleNext = () => {
        playClick();
        if (step === 2 && !fishingType) {
            playError();
            speakExplanation("Por favor, selecione o tipo de pesca antes de continuar.");
            return;
        }
        if (step === 4 && (!photos.rgp || !photos.cpf)) {
            playError();
            speakExplanation("Precisamos das fotos do seu RGP e CPF. Por favor, adicione as fotos.");
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        playClick();
        if (step === 1) {
            onBack();
        } else {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        playClick();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        playSuccess();
        speakExplanation("Parabéns! Seu requerimento foi enviado com sucesso. Vamos analisar e te avisar.");
        setStep(6);
    };

    const handleFileUpload = (field: keyof typeof photos) => {
        // Fallback for file upload simulation
        playClick();
        setPhotos(prev => ({ ...prev, [field]: "https://images.unsplash.com/photo-1626159648939-26d9c66c3c2e?auto=format&fit=crop&q=80&w=200" }));
        playSuccess();
    }

    // Camera Overlay
    if (activeCapture) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                <div className="relative w-full h-full max-w-lg bg-black flex flex-col">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="flex-1 object-cover w-full"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 border-[3rem] border-black/50 pointer-events-none flex items-center justify-center">
                        <div className="border-2 border-white/50 w-full h-64 rounded-2xl" />
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 flex justify-around items-center px-8 pb-8">
                        <button
                            onClick={stopCamera}
                            className="bg-white/20 text-white p-4 rounded-full backdrop-blur-md active:scale-90 transition-transform"
                        >
                            <AlertCircle className="w-8 h-8 rotate-45" /> {/* Use as X icon */}
                        </button>

                        <button
                            onClick={capturePhoto}
                            className="bg-white w-20 h-20 rounded-full border-4 border-slate-200 shadow-xl active:scale-90 transition-transform flex items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900" />
                        </button>

                        <div className="w-16" /> {/* Spacer */}
                    </div>

                    <div className="absolute top-10 left-0 right-0 text-center text-white font-black text-xl drop-shadow-md bg-black/30 py-2 backdrop-blur-sm">
                        {activeCapture === 'rgp' ? 'Fotografe o RGP' : activeCapture === 'cpf' ? 'Fotografe o CPF' : 'Comprovante de Residência'}
                    </div>
                </div>
            </div>
        );
    }

    // Step 1: Personal Data
    const renderStep1 = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-6 h-6" /> Seus Dados
                </h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase">Nome Completo</p>
                        <p className="text-lg font-bold text-slate-700">{fisher.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase">RGP</p>
                        <p className="text-lg font-bold text-slate-700">{fisher.rgp}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase">Região</p>
                        <p className="text-lg font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-500" /> {fisher.region}
                        </p>
                    </div>
                </div>
                <div className="mt-4 bg-white p-3 rounded-xl flex items-center gap-2 text-xs text-slate-500 font-bold border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Dados do seu cadastro oficial.
                </div>
            </div>
        </div>
    );

    // Step 2: Fishing Type
    const renderStep2 = () => (
        <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <h3 className="text-xl font-black text-slate-800 mb-2">Qual seu tipo de pesca?</h3>

            <button
                onClick={() => { playClick(); setFishingType('artesanal'); }}
                className={`w-full p-6 rounded-3xl border-4 transition-all flex items-center gap-4 ${fishingType === 'artesanal' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
            >
                <div className={`p-4 rounded-2xl ${fishingType === 'artesanal' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Fish className="w-8 h-8" />
                </div>
                <div className="text-left">
                    <h4 className={`text-xl font-black ${fishingType === 'artesanal' ? 'text-blue-900' : 'text-slate-700'}`}>Artesanal</h4>
                    <p className="text-xs font-bold text-slate-400 leading-tight">Pesca profissional com embarcação pequena ou sem.</p>
                </div>
                {fishingType === 'artesanal' && <CheckCircle2 className="w-8 h-8 text-blue-500 ml-auto" />}
            </button>

            <button
                onClick={() => { playClick(); setFishingType('industrial'); }}
                className={`w-full p-6 rounded-3xl border-4 transition-all flex items-center gap-4 ${fishingType === 'industrial' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
            >
                <div className={`p-4 rounded-2xl ${fishingType === 'industrial' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ShipIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                    <h4 className={`text-xl font-black ${fishingType === 'industrial' ? 'text-blue-900' : 'text-slate-700'}`}>Industrial</h4>
                    <p className="text-xs font-bold text-slate-400 leading-tight">Pesca em larga escala (Não elegível para seguro).</p>
                </div>
                {fishingType === 'industrial' && <CheckCircle2 className="w-8 h-8 text-blue-500 ml-auto" />}
            </button>
        </div>
    );

    // Step 3: Defeso Period
    const renderStep3 = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 text-center">
                <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                    <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1">{defeso.species}</h3>
                <p className="text-slate-500 font-bold mb-6">Período de Proteção</p>

                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Início</p>
                    <p className="text-xl font-black text-slate-800">01 de Dezembro</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fim / Pagamento</p>
                    <p className="text-xl font-black text-slate-800">30 de Março</p>
                </div>

                <div className="bg-orange-500 text-white p-4 rounded-3xl shadow-lg border-2 border-orange-400">
                    <p className="text-xs font-black uppercase">Contagem Regressiva</p>
                    <p className="text-4xl font-black">Faltam {defeso.daysRemaining} dias</p>
                </div>
            </div>
        </div>
    );

    // Step 4: Documents
    const renderStep4 = () => (
        <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <h3 className="text-xl font-black text-slate-800 mb-2">Fotos dos Documentos</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">Tire uma foto clara ou envie do celular.</p>

            {['rgp', 'cpf', 'residence'].map((doc) => (
                <div key={doc} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-slate-700 capitalize">
                            {doc === 'rgp' ? 'Carteira RGP' : doc === 'cpf' ? 'CPF / RG' : 'Comp. Residência'}
                        </span>
                        {photos[doc as keyof typeof photos] ? (
                            <span className="text-green-600 text-xs font-black flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> OK</span>
                        ) : (
                            <span className="text-orange-500 text-xs font-black flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Pendente</span>
                        )}
                    </div>

                    {photos[doc as keyof typeof photos] ? (
                        <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-100">
                            <img src={photos[doc as keyof typeof photos]!} className="w-full h-full object-cover opacity-80" />
                            <button onClick={() => setPhotos(prev => ({ ...prev, [doc]: null }))} className="absolute inset-0 m-auto bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg">X</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => startCamera(doc as any)} className="flex-1 bg-blue-50 text-blue-700 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                                <Camera className="w-5 h-5" /> Câmera
                            </button>
                            <button onClick={() => handleFileUpload(doc as any)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                                <Upload className="w-5 h-5" /> Arquivo
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // Step 5: Review
    const renderStep5 = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Resumo do Pedido</h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-bold">Solicitante</span>
                        <span className="text-slate-800 font-black">{fisher.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-bold">Tipo</span>
                        <span className="text-blue-600 font-black capitalize">{fishingType}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-bold">Espécie</span>
                        <span className="text-slate-800 font-black">{defeso.species}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                        <span className="text-slate-500 font-bold">Documentos</span>
                        <span className="text-green-600 font-black flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 3 Anexados</span>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex gap-3">
                    <ShieldCheck className="w-10 h-10 text-blue-700 flex-shrink-0" />
                    <p className="text-xs text-blue-800 font-bold leading-tight">
                        Seus dados estão protegidos e serão enviados diretamente para análise do benefício.
                    </p>
                </div>
            </div>
        </div>
    );

    // Step 6: Success
    if (step === 6) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-500">
                <div className="bg-green-100 p-8 rounded-full shadow-2xl shadow-green-200 mb-4 ring-8 ring-green-50">
                    <CheckCircle2 className="w-32 h-32 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 text-center">Pedido Enviado!</h2>
                <p className="text-center text-slate-500 font-bold px-8 leading-relaxed">
                    Recebemos sua solicitação de Seguro-Defeso. Você pode acompanhar o andamento pelo menu "Meus Documentos".
                </p>
                <div className="w-full pt-8 px-4">
                    <button onClick={onSuccess} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl active:scale-95 transition-all">
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={handleBack} className="bg-white py-2 px-4 rounded-full shadow-sm border border-slate-100 active:scale-90 transition-all flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-none">Pedir Seguro</h2>
                    <p className="text-xs font-bold text-slate-400">Passo {step} de 5</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 border-4 border-white shadow-sm">
                    {step}/5
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step / 5) * 100}%` }}></div>
            </div>

            {/* Content */}
            <div className="flex-grow pb-24">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-4xl mx-auto flex gap-4">
                    {step > 1 && (
                        <button onClick={handleBack} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-lg active:scale-95 transition-all">
                            Voltar
                        </button>
                    )}
                    <button
                        onClick={step === 5 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Enviando...' : step === 5 ? 'Enviar Pedido' : 'Continuar'}
                        {!loading && <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icons
const UserIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)

const ShipIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.38 8" /><path d="M12 10V4" /><path d="M8 8v2" /><path d="M16 8v2" /></svg>
)
