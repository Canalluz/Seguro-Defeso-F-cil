import React, { useState, useEffect } from 'react';
import { ScanFace, GripHorizontal, User, LockKeyhole } from 'lucide-react';
import { playClick, playSuccess, playError } from '../services/audio';
import { FaceScanner } from './FaceScanner';

interface LoginScreenProps {
    username: string;
    securityMode?: 'biometric' | 'pin';
    storedPin?: string;
    userPhoto?: string;
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ username, securityMode = 'biometric', storedPin, userPhoto, onLoginSuccess }) => {
    const [pinInput, setPinInput] = useState('');
    const [isScanning, setIsScanning] = useState(securityMode === 'biometric'); // Auto-start if biometric
    const [isVerified, setIsVerified] = useState(false);

    const handleBiometricAuth = () => {
        setIsScanning(true);
    };

    const handleScanComplete = () => {
        setIsScanning(false);
        setIsVerified(true);
        playSuccess();
        // Short delay to show the welcome message with name
        setTimeout(() => {
            onLoginSuccess();
        }, 1500);
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
                    // Fallback if scanning was cancelled or failed (though currently face scanner mocks success)
                    <button
                        onClick={handleBiometricAuth}
                        className="flex flex-col items-center gap-4 bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 active:scale-95 transition-transform"
                    >
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                            <ScanFace className="w-12 h-12" />
                        </div>
                        <span className="font-bold text-slate-600 text-lg">
                            Tentar Novamente
                        </span>
                    </button>
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
