
import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, UserCheck, ShieldCheck } from 'lucide-react';

interface BiometricAuthProps {
  onSuccess: () => void;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (status === 'scanning') {
      const timer = setTimeout(() => {
        setStatus('success');
        setTimeout(onSuccess, 1000);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, onSuccess]);

  const startScanning = async () => {
    setStatus('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900 flex flex-col items-center justify-center p-6 z-50">
      <div className="text-white text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Entrar no App</h1>
        <p className="text-blue-100 opacity-80">Seguro-Defeso Fácil</p>
      </div>

      <div className="relative w-64 h-64 mb-12">
        <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-spin-slow transition-colors duration-500 ${status === 'success' ? 'border-green-400' : 'border-blue-300 opacity-30'}`} />
        
        <div className="absolute inset-4 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border-2 border-white/20">
          {status === 'idle' && (
            <UserCheck className="w-24 h-24 text-blue-100 opacity-50" />
          )}
          {status === 'scanning' && (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover grayscale opacity-80"
            />
          )}
          {status === 'success' && (
            <ShieldCheck className="w-24 h-24 text-green-400 animate-bounce" />
          )}
        </div>

        {status === 'scanning' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 animate-scan shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
        )}
      </div>

      {status === 'idle' ? (
        <button
          onClick={startScanning}
          className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold text-xl shadow-xl active:scale-95 transition-transform flex items-center gap-3"
        >
          <Fingerprint className="w-8 h-8" />
          Acessar com Biometria
        </button>
      ) : (
        <p className="text-white text-xl font-semibold animate-pulse">
          {status === 'scanning' ? 'Reconhecendo seu rosto...' : 'Acesso Liberado!'}
        </p>
      )}

      <p className="mt-auto text-blue-200 text-sm text-center">
        Suas informações estão protegidas. <br /> Não guardamos fotos no servidor.
      </p>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
