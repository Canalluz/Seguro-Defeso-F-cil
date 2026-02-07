import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { FaceApiService } from '../services/faceApiService';

interface FaceScannerProps {
    mode: 'setup' | 'verify';
    onScanComplete: (photo?: string, descriptor?: Float32Array) => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({ mode, onScanComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Ligando Câmera...');
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAiReady, setIsAiReady] = useState(FaceApiService.isInitialized);
    const detectionRef = useRef<any>(null);

    useEffect(() => {
        const init = async () => {
            // Start camera immediately - don't wait for models
            setStatus('Ligando Câmera...');
            startCamera();

            // Load AI models in parallel
            if (!FaceApiService.isInitialized) {
                setStatus('Carregando modelos de IA...');
                const timeout = setTimeout(() => {
                    if (!FaceApiService.isInitialized && !error) {
                        setError("O sistema de biometria está demorando para carregar os modelos de IA. Verifique sua conexão.");
                    }
                }, 20000); // 20 seconds for models on Vercel

                try {
                    await FaceApiService.init();
                    clearTimeout(timeout);
                    setIsAiReady(true);
                    setStatus('IA Carregada! Centralize o rosto.');
                } catch (err) {
                    console.error("AI Init error:", err);
                    clearTimeout(timeout);
                    setError("Erro ao carregar inteligência artificial. Tente recarregar a página.");
                }
            } else {
                setIsAiReady(true);
                setStatus('Biometria pronta! Centralize o rosto.');
            }
        };
        init();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setError(null);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                // Check if it's an SSL issue
                if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                    setError("Erro de Segurança: A câmera só funciona em conexões seguras (HTTPS). Verifique se o link começa com https://");
                } else {
                    setError("Seu navegador não suporta acesso à câmera ou bloqueou as permissões para este site.");
                }
                return;
            }

            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (firstErr) {
                console.warn("Retrying with simple constraints...", firstErr);
                // Fallback to minimal constraints if ideal fails
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            }

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(err => {
                        console.error("Video play error:", err);
                        setError("Erro ao iniciar vídeo. Tente tocar na tela para autorizar.");
                    });
                    startDetectionLoop();
                };
            }
        } catch (err: any) {
            console.error("Camera error details:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Acesso à câmera negado. Clique no cadeado na barra de endereços para liberar a câmera.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("Câmera não encontrada. Se estiver no PC, verifique se a webcam está conectada.");
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError("A câmera já está sendo usada por outro site ou aplicativo.");
            } else {
                setError("Erro ao acessar câmera: " + (err.message || "Permissão negada."));
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const startDetectionLoop = () => {
        let consecutiveSuccess = 0;
        const targetSuccess = 15; // Requires ~1.5s of stable valid detection

        const loop = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            try {
                const detection = await FaceApiService.detectFace(videoRef.current);
                detectionRef.current = detection;

                if (detection) {
                    // Update canvas landmarks
                    FaceApiService.drawLandmarks(canvasRef.current, detection);

                    // Anti-spoofing & Validation
                    const result = FaceApiService.checkAntiSpoofing(
                        detection,
                        videoRef.current.videoWidth,
                        videoRef.current.videoHeight
                    );

                    if (result.valid) {
                        consecutiveSuccess++;
                        setStatus('Rosto detectado - Mantenha a posição');
                        const p = Math.min(100, Math.round((consecutiveSuccess / targetSuccess) * 100));
                        setProgress(p);

                        if (consecutiveSuccess >= targetSuccess) {
                            setIsProcessing(true);
                            setStatus('Validando identidade...');

                            // Successful capture
                            const canvas = document.createElement('canvas');
                            canvas.width = videoRef.current.videoWidth;
                            canvas.height = videoRef.current.videoHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.drawImage(videoRef.current, 0, 0);
                                const photo = canvas.toDataURL('image/jpeg', 0.8);
                                onScanComplete(photo, detection.descriptor);
                            }
                            return; // Stop the loop
                        }
                    } else {
                        consecutiveSuccess = Math.max(0, consecutiveSuccess - 2);
                        setStatus(result.reason || 'Posicione seu rosto');
                        setProgress(Math.round((consecutiveSuccess / targetSuccess) * 100));
                    }
                } else {
                    consecutiveSuccess = 0;
                    setStatus('Posicione seu rosto no centro');
                    setProgress(0);
                    const ctx = canvasRef.current.getContext('2d');
                    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }

                if (!isProcessing) {
                    requestAnimationFrame(loop);
                }
            } catch (e) {
                console.error("Detection error", e);
                requestAnimationFrame(loop);
            }
        };

        requestAnimationFrame(loop);
    };

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-900 ring-4 ring-slate-100">
            {/* Camera Feed */}
            {stream && !error ? (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none transform scale-x-[-1]"
                    />
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                    {error ? (
                        <>
                            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                            <p className="text-center px-6 text-sm font-black text-red-400 leading-tight mb-6">{error}</p>
                            <div className="flex flex-col gap-3 w-full px-10">
                                <button
                                    onClick={startCamera}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase shadow-xl active:scale-95 transition-transform"
                                >
                                    Tentar Novamente
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-white/10 text-white px-6 py-2 rounded-full font-bold text-xs uppercase border border-white/20 active:scale-95 transition-transform"
                                >
                                    Recarregar Página
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Camera className="w-16 h-16 animate-pulse mb-4 text-blue-400" />
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Ligando IA...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Scanning Overlay */}
            {!error && !isProcessing && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Corners */}
                    <div className="absolute top-8 left-8 w-20 h-20 border-t-4 border-l-4 border-white/30 rounded-tl-[2rem]"></div>
                    <div className="absolute top-8 right-8 w-20 h-20 border-t-4 border-r-4 border-white/30 rounded-tr-[2rem]"></div>
                    <div className="absolute bottom-8 left-8 w-20 h-20 border-b-4 border-l-4 border-white/30 rounded-bl-[2rem]"></div>
                    <div className="absolute bottom-8 right-8 w-20 h-20 border-b-4 border-r-4 border-white/30 rounded-br-[2rem]"></div>

                    {/* Progress Ring or Bar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center">
                            <div className="w-full h-full rounded-full border-t-4 border-blue-500/50 animate-spin-slow"></div>
                        </div>
                    </div>

                    {/* Status & Progress UI */}
                    <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center px-6">
                        <div className={`w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4 backdrop-blur-sm border border-white/10`}>
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                            {progress < 100 ? (
                                <ScanFace className="w-5 h-5 animate-pulse text-blue-400" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            <p className="text-white font-bold tracking-tight text-xs uppercase">
                                {status}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-blue-600/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center">
                    <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-black mb-2">Biometria Facial</h3>
                    <p className="font-bold opacity-80 uppercase text-[10px] tracking-widest leading-relaxed">
                        Analisando 128 pontos de referência facial para sua segurança total.
                    </p>
                </div>
            )}

            <style>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

