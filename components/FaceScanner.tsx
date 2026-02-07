import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, Camera, AlertCircle } from 'lucide-react';

interface FaceScannerProps {
    mode: 'setup' | 'verify';
    onScanComplete: (photo?: string) => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({ mode, onScanComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Iniciando câmera...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Use front camera
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStatus('Posicione seu rosto');
            startScanning();
        } catch (err) {
            console.error("Camera error:", err);
            setError("Não foi possível acessar a câmera. Verifique as permissões.");
            // Fallback to simulation if camera fails
            fallbackSimulation();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureFrame = (): string | undefined => {
        if (!videoRef.current) return undefined;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Mirror the context to match the mirrored video
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg', 0.8);
            }
        } catch (e) {
            console.error("Capture failed", e);
        }
        return undefined;
    };

    const startScanning = () => {
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);

            if (p > 20 && p < 50) setStatus('Identificando rosto...');
            if (p >= 50 && p < 80) setStatus('Analisando biometria...');
            if (p >= 80) setStatus('Confirmando identidade...');

            if (p >= 100) {
                clearInterval(interval);
                const photo = captureFrame();
                onScanComplete(photo);
            }
        }, 60); // Total ~3 seconds
    };

    const fallbackSimulation = () => {
        setStatus('Simulando Face ID...');
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                onScanComplete();
            }
        }, 50);
    };

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-900 ring-4 ring-slate-100">
            {/* Camera Feed */}
            {stream && !error ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                    {error ? (
                        <>
                            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                            <p className="text-center px-4 text-sm">{error}</p>
                        </>
                    ) : (
                        <Camera className="w-16 h-16 animate-pulse" />
                    )}
                </div>
            )}

            {/* Scanning Overlay */}
            <div className="absolute inset-0 z-10">
                {/* Corners */}
                <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/50 rounded-tl-3xl"></div>
                <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/50 rounded-tr-3xl"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/50 rounded-bl-3xl"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/50 rounded-br-3xl"></div>

                {/* Scanning Laser */}
                {!error && (
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] absolute animate-scan"></div>
                    </div>
                )}

                {/* Status & Progress */}
                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center">
                    <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full mb-4 border border-white/10">
                        <p className="text-white font-mono font-bold tracking-wider text-sm flex items-center gap-2">
                            {progress < 100 ? (
                                <ScanFace className="w-4 h-4 animate-pulse text-green-400" />
                            ) : (
                                <span className="text-green-500">✔</span>
                            )}
                            {status}
                        </p>
                    </div>
                </div>
            </div>

            {/* CSS Animation for Scan Line */}
            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};
