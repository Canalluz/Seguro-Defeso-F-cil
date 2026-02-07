import React, { useState } from 'react';
import { ShieldCheck, ScanFace, GripHorizontal, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { playClick, playSuccess, playError } from '../services/audio';
import { FaceScanner } from './FaceScanner';

interface BiometricSetupProps {
    onComplete: (mode: 'biometric' | 'pin', pin?: string, photo?: string, descriptor?: number[]) => void;
}

export const BiometricSetup: React.FC<BiometricSetupProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'selection' | 'face-scan' | 'pin-create'>('selection');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handleBiometricSetup = () => {
        playClick();
        setStep('face-scan');
    };

    const handleScanComplete = (photo?: string, descriptor?: Float32Array) => {
        playSuccess();
        // Convert Float32Array to number array for persistence
        const descriptorArray = descriptor ? Array.from(descriptor) : undefined;
        onComplete('biometric', undefined, photo, descriptorArray);
    };

    const handlePinSubmit = () => {
        playClick();
        if (pin.length === 4 && pin === confirmPin) {
            playSuccess();
            onComplete('pin', pin);
        } else {
            playError();
            alert("Os PINs não conferem ou são inválidos.");
            setPin('');
            setConfirmPin('');
        }
    };

    if (step === 'face-scan') {
        return (
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-6 animate-in slide-in-from-right duration-500 text-center">
                <h2 className="text-2xl font-black text-slate-800 mb-4">Cadastrando Face ID</h2>
                <p className="text-slate-500 font-bold mb-6">Olhe para a câmera para registrar.</p>

                <FaceScanner mode="setup" onScanComplete={handleScanComplete} />

                <button onClick={() => setStep('selection')} className="mt-6 text-slate-400 font-bold py-2 flex items-center justify-center gap-2 w-full">
                    <ArrowLeft className="w-4 h-4" /> Cancelar
                </button>
            </div>
        );
    }

    if (step === 'pin-create') {
        return (
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-6 animate-in slide-in-from-right duration-500 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                    <GripHorizontal className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Crie seu PIN</h2>
                <p className="text-slate-500 font-bold mb-8">Digite uma senha de 4 números.</p>

                <div className="space-y-6">
                    <input
                        type="password"
                        maxLength={4}
                        placeholder="Digitar PIN"
                        className="w-full bg-slate-50 p-6 rounded-[2rem] text-center font-black text-4xl tracking-[1rem] text-slate-800 outline-none border-2 border-slate-100 focus:border-indigo-500"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    {pin.length === 4 && (
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="Confirmar"
                            className="w-full bg-slate-50 p-6 rounded-[2rem] text-center font-black text-4xl tracking-[1rem] text-slate-800 outline-none border-2 border-slate-100 focus:border-indigo-500 animate-in fade-in"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                    )}
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={handlePinSubmit}
                        disabled={pin.length !== 4 || confirmPin.length !== 4}
                        className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
                    >
                        Confirmar PIN
                    </button>
                    <button onClick={() => setStep('selection')} className="text-slate-400 font-bold py-2">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-6 animate-in slide-in-from-right duration-500 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 leading-tight mb-2">Proteja sua Conta</h2>
            <p className="text-slate-500 font-bold mb-8">Escolha como quer entrar no aplicativo.</p>

            <div className="space-y-4">
                <button
                    onClick={handleBiometricSetup}
                    className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-200 active:scale-95 transition-all text-left group relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <ScanFace className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Usar Face ID</h3>
                            <p className="text-blue-100 font-bold text-sm">Mais rápido e seguro</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { playClick(); setStep('pin-create'); }}
                    className="w-full bg-white text-slate-700 p-6 rounded-[2.5rem] shadow-lg border-2 border-slate-100 active:bg-slate-50 active:scale-95 transition-all text-left flex items-center gap-4"
                >
                    <div className="bg-slate-100 p-3 rounded-2xl">
                        <GripHorizontal className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">Criar um PIN</h3>
                        <p className="text-slate-400 font-bold text-sm">Senha de 4 números</p>
                    </div>
                </button>
            </div>

            <p className="mt-8 text-xs text-slate-400 px-8">
                Não armazenamos fotos do seu rosto. Usamos apenas a segurança nativa do seu celular.
            </p>
        </div>
    );
};
