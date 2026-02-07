import React, { useState, useRef } from 'react';
import {
    User,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    FileText,
    Bell,
    Volume2,
    LogOut,
    Trash2,
    ChevronRight,
    Lock,
    Edit2,
    Save,
    CheckCircle2,
    AlertCircle,
    Camera,
    Upload,
    X,
    ArrowLeft
} from 'lucide-react';
import { FisherData } from '../types';
import { playClick, playSuccess, playError } from '../services/audio';
import { AnimatedAvatar } from './AnimatedAvatar';

interface AccountDataProps {
    fisher: FisherData;
    onLogout: () => void;
}

export const AccountData: React.FC<AccountDataProps> = ({ fisher, onLogout }) => {
    const [editing, setEditing] = useState(false);
    const [userData, setUserData] = useState({
        phone: '(92) 99123-4567',
        email: 'manoel.pescador@email.com',
        address: 'Rua do Porto, 123 - Manaus, AM',
        faceId: true,
        notifications: true,
        audio: true
    });

    // Photo State
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        playClick();
        setEditing(false);
        playSuccess();
        // Simulate API save
    };

    const handleToggle = (field: keyof typeof userData) => {
        playClick();
        setUserData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Camera Logic
    const startCamera = async () => {
        playClick();
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            playError();
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoData = canvas.toDataURL('image/jpeg', 0.8);
                setProfilePhoto(photoData);
                playSuccess();
                stopCamera();
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result as string);
                playSuccess();
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            {/* Camera Overlay */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 items-center px-8 pb-8">
                        <button
                            onClick={stopCamera}
                            className="bg-white/20 text-white p-4 rounded-full backdrop-blur-md active:scale-95 transition-transform"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={capturePhoto}
                            className="bg-white w-20 h-20 rounded-full border-4 border-slate-200 shadow-xl active:scale-95 transition-transform flex items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center mb-6 relative overflow-hidden">
                <div className="relative w-32 h-32 mx-auto mb-4 group">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-100 shadow-lg bg-blue-50 flex items-center justify-center">
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            <AnimatedAvatar />
                        )}
                    </div>

                    {/* Photo Actions */}
                    <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                        <button
                            onClick={startCamera}
                            className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white active:scale-90 transition-transform"
                            title="Tirar Foto"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-700 text-white p-2 rounded-full shadow-lg border-2 border-white active:scale-90 transition-transform"
                            title="Enviar Arquivo"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-800">Meus Dados</h2>
                <div className="flex items-center justify-center gap-2 mt-2 text-green-600 font-bold bg-green-50 py-1 px-3 rounded-full inline-flex mx-auto">
                    <ShieldCheck className="w-4 h-4" /> Suas informações estão protegidas
                </div>
            </div>

            {/* 1. Personal Data (Read Only) */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 mb-4">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-500" /> Dados Pessoais
                </h3>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400">Nome Completo</p>
                        <p className="text-lg font-bold text-slate-700">{fisher.name}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400">RGP</p>
                            <p className="text-lg font-bold text-slate-700">{fisher.rgp}</p>
                        </div>
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400">Região</p>
                            <p className="text-sm font-bold text-slate-700">{fisher.region.split(' - ')[0]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-orange-500 font-bold px-2">
                        <AlertCircle className="w-4 h-4" />
                        Esses dados não podem ser alterados aqui.
                    </div>
                </div>
            </section>

            {/* 2. Editable Data */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Edit2 className="w-6 h-6 text-blue-500" /> Contato
                    </h3>
                    <button
                        onClick={() => { playClick(); editing ? handleSave() : setEditing(true); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all ${editing ? 'bg-green-500 text-white shadow-lg' : 'bg-blue-50 text-blue-600'}`}
                    >
                        {editing ? <><Save className="w-4 h-4" /> Salvar</> : <><Edit2 className="w-4 h-4" /> Editar</>}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border transition-all ${editing ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <p className="text-[10px] font-black uppercase text-slate-400">Telefone</p>
                        </div>
                        {editing ? (
                            <input
                                type="text"
                                value={userData.phone}
                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                className="w-full font-bold text-lg text-slate-800 outline-none bg-transparent"
                            />
                        ) : (
                            <p className="text-lg font-bold text-slate-700">{userData.phone}</p>
                        )}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${editing ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <p className="text-[10px] font-black uppercase text-slate-400">E-mail</p>
                        </div>
                        {editing ? (
                            <input
                                type="email"
                                value={userData.email}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                className="w-full font-bold text-lg text-slate-800 outline-none bg-transparent"
                            />
                        ) : (
                            <p className="text-lg font-bold text-slate-700">{userData.email}</p>
                        )}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${editing ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <p className="text-[10px] font-black uppercase text-slate-400">Endereço</p>
                        </div>
                        {editing ? (
                            <textarea
                                value={userData.address}
                                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                className="w-full font-bold text-lg text-slate-800 outline-none bg-transparent resize-none h-20"
                            />
                        ) : (
                            <p className="text-lg font-bold text-slate-700">{userData.address}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* 3. Security */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 mb-4">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-blue-500" /> Segurança
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm"><User className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <h4 className="font-bold text-slate-800">Face ID</h4>
                            <p className="text-xs text-slate-500 font-bold">Entrar com o rosto</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleToggle('faceId')}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${userData.faceId ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${userData.faceId ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                <p className="text-xs text-center text-slate-400 font-bold">Sua conta só abre com seu rosto.</p>
            </section>

            {/* 4. Documents */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 mb-4">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" /> Documentos
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-600">Carteira RGP</span>
                        <span className="text-green-600 text-xs font-black bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enviado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-600">CPF / RG</span>
                        <span className="text-green-600 text-xs font-black bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enviado</span>
                    </div>
                    <div className="flex items-center justify-between p-3">
                        <span className="font-bold text-slate-600">Comprovante</span>
                        <span className="text-orange-500 text-xs font-black bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pendente</span>
                    </div>
                </div>
            </section>

            {/* 5. Preferences */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 mb-4">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-500" /> Preferências
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Alertas do Defeso</span>
                        <button
                            onClick={() => handleToggle('notifications')}
                            className={`w-12 h-7 rounded-full p-1 transition-colors ${userData.notifications ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${userData.notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Áudio Automático</span>
                        <button
                            onClick={() => handleToggle('audio')}
                            className={`w-12 h-7 rounded-full p-1 transition-colors ${userData.audio ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${userData.audio ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. Legal */}
            <section className="text-center space-y-4 mb-8">
                <div className="flex justify-center gap-4 text-xs font-bold text-blue-600">
                    <button onClick={playClick}>Termos de Uso</button>
                    <span>•</span>
                    <button onClick={playClick}>Política de Privacidade</button>
                </div>
                <p className="text-[10px] text-slate-400 px-6">
                    O aplicativo Seguro-Defeso Fácil não cobra taxas do INSS e apenas facilita o acesso ao seu benefício de forma gratuita.
                </p>
            </section>

            {/* 7. Actions */}
            <section className="space-y-4 px-4">
                <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-[2rem] font-black text-xl border-2 border-red-100 active:bg-red-100 flex items-center justify-center gap-3 transition-colors">
                    <LogOut className="w-6 h-6" /> Sair da Conta
                </button>

                <button onClick={playClick} className="w-full text-slate-400 font-bold py-2 text-sm flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Excluir minha conta
                </button>
            </section>

        </div>
    );
};
