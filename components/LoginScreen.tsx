import React, { useState, useEffect } from 'react';
import { ScanFace, GripHorizontal, User, LockKeyhole } from 'lucide-react';
import { playClick, playSuccess, playError } from '../services/audio';
import { FaceScanner } from './FaceScanner';

interface LoginScreenProps {
    username: string;
    securityMode?: 'biometric' | 'pin';
    storedPin?: string;
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ username, securityMode = 'biometric', storedPin, onLoginSuccess }) => {
    const [pinInput, setPinInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Auto-trigger biometric on mount verification removed to prevent logout loop
    // User must explicitly click to authenticate
    /*
    useEffect(() => {
        if (securityMode === 'biometric') {
            handleBiometricAuth();
        }
    }, []);
    */

    const handleBiometricAuth = () => {
        setIsScanning(true);
    };

    const handleScanComplete = () => {
        setIsScanning(false);
        playSuccess();
        onLoginSuccess();
    };

    const handlePinChange = (val: string) => {
        // Only allow numbers
        const cleanVal = val.replace(/[^0-9]/g, '');
        setPinInput(cleanVal);

        if (cleanVal.length === 4) {
            if (cleanVal === storedPin) {
                playSuccess();
                onLoginSuccess();
            } else {
                playError();
                // Shake effect logic could go here
                setTimeout(() => setPinInput(''), 500);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border-4 border-white">
                <User className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">Olá, {username.split(' ')[0]}!</h2>
            <p className="text-slate-400 font-bold mb-10">Bem-vindo de volta.</p>

            {securityMode === 'biometric' ? (
                isScanning ? (
                    <div className="w-full max-w-sm">
                        <FaceScanner mode="verify" onScanComplete={handleScanComplete} />
                        <p className="text-center text-slate-400 text-sm mt-4 font-bold">Mantenha o rosto na moldura</p>
                    </div>
                ) : (
                    <button
                        onClick={handleBiometricAuth}
                        className="flex flex-col items-center gap-4 bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 active:scale-95 transition-transform"
                    >
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                            <ScanFace className="w-12 h-12" />
                        </div>
                        <span className="font-bold text-slate-600 text-lg">
                            Entrar com Face ID
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
        </div>
    );
};
