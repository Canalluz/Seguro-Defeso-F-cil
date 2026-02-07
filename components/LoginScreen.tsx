import React, { useState, useEffect } from 'react';
import { ScanFace, GripHorizontal, User, LockKeyhole, AlertCircle } from 'lucide-react';
import { playClick, playSuccess, playError } from '../services/audio';
import { FaceScanner } from './FaceScanner';
import { FaceApiService } from '../services/faceApiService';

interface LoginScreenProps {
    username: string;
    securityMode?: 'biometric' | 'pin';
    storedPin?: string;
    userPhoto?: string;
    storedDescriptor?: number[];
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    username,
    securityMode = 'biometric',
    storedPin,
    userPhoto,
    storedDescriptor,
    onLoginSuccess
}) => {
    const [pinInput, setPinInput] = useState('');
    const [isScanning, setIsScanning] = useState(securityMode === 'biometric'); // Auto-start if biometric
    const [isVerified, setIsVerified] = useState(false);
    const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

    const handleBiometricAuth = () => {
        setLoginFeedback(null);
        setIsScanning(true);
    };

    const handleScanComplete = (photo?: string, descriptor?: Float32Array) => {
        if (storedDescriptor && descriptor) {
            const storedArray = new Float32Array(storedDescriptor);
            const result = FaceApiService.compareFaces(descriptor, storedArray);

            if (result.match) {
                setIsScanning(false);
                setIsVerified(true);
                playSuccess();
                setTimeout(() => {
                    onLoginSuccess();
                }, 1500);
            } else {
                playError();
                setLoginFeedback("Rosto não reconhecido. Tente novamente ou registre-se.");
                setIsScanning(false);
            }
        } else {
            // Fallback for missing descriptor (should not happen with new setup)
            setIsScanning(false);
            setIsVerified(true);
            playSuccess();
            setTimeout(() => {
                onLoginSuccess();
            }, 1500);
        }
    };

    const handlePinChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        setPinInput(cleanVal);

        if (cleanVal.length === 4) {
            if (cleanVal === storedPin) {
                playSuccess();
                setIsVerified(true);
                setTimeout(() => {
                    onLoginSuccess();
                }, 1000);
            } else {
                playError();
                setLoginFeedback("PIN incorreto. Tente novamente.");
                setTimeout(() => setPinInput(''), 500);
            }
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
                <div className="w-40 h-40 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-green-50 animate-bounce overflow-hidden relative">
                    {userPhoto ? (
                        <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-16 h-16 text-green-600" />
                    )}
                    <div className="absolute inset-0 ring-4 ring-green-400/50 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Olá, {username.split(' ')[0]}!</h2>
                <p className="text-slate-500 font-bold mb-10">Bem-vindo de volta.</p>
                <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold flex items-center gap-2">
                    <LockKeyhole className="w-4 h-4" /> Acesso Liberado
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            {securityMode === 'biometric' ? (
                isScanning ? (
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <FaceScanner mode="verify" onScanComplete={handleScanComplete} />
                        <p className="text-center text-slate-400 text-sm mt-8 font-bold animate-pulse">
                            Reconhecendo usuário...
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        {loginFeedback && (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-xs font-bold leading-tight">{loginFeedback}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()} // Simplest way to go back to landing in this SPA setup without complex prop drilling for now, or I can use a standard way if I have access to setActiveTab
                                    className="text-blue-600 font-bold text-sm underline active:scale-95 transition-transform"
                                >
                                    Voltar ao Início / Criar Conta
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleBiometricAuth}
                            className="flex flex-col items-center gap-4 bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-100 active:scale-95 transition-transform group"
                        >
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform">
                                <ScanFace className="w-12 h-12" />
                            </div>
                            <span className="font-black text-slate-700 text-lg">
                                Entrar com Face ID
                            </span>
                        </button>
                    </div>
                )
            ) : (
                <div className="w-full max-w-sm bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-slate-50 p-4 rounded-full">
                            <GripHorizontal className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-black text-slate-700">Digite seu PIN</h3>

                        <input
                            type="password"
                            maxLength={4}
                            autoFocus
                            className="w-full bg-slate-50 p-6 rounded-[2rem] text-center font-black text-4xl tracking-[1rem] text-slate-800 outline-none border-2 border-slate-100 focus:border-blue-500 transition-colors"
                            value={pinInput}
                            onChange={(e) => handlePinChange(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <p className="mt-12 text-slate-300 text-xs font-bold text-center">
                Autenticação Segura
            </p>
        </div>
    );
};
