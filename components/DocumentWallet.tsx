import React, { useState, useEffect, useRef } from 'react';
import { FileText, Camera, Upload, Trash2, CheckCircle2, AlertCircle, Eye, Wallet } from 'lucide-react';
import { playClick, playSuccess, playError } from '../services/audio';
import { saveDocument, getDocument, deleteDocument } from '../services/documentStorage';

export const DocumentWallet: React.FC = () => {
    const [documents, setDocuments] = useState<{
        rgp: string | null;
        cpf: string | null;
        address: string | null;
    }>({ rgp: null, cpf: null, address: null });

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [activeDocType, setActiveDocType] = useState<'rgp' | 'cpf' | 'address' | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        const rgpBlob = await getDocument('rgp');
        const cpfBlob = await getDocument('cpf');
        const addressBlob = await getDocument('address');

        setDocuments({
            rgp: rgpBlob ? URL.createObjectURL(rgpBlob) : null,
            cpf: cpfBlob ? URL.createObjectURL(cpfBlob) : null,
            address: addressBlob ? URL.createObjectURL(addressBlob) : null,
        });
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'rgp' | 'cpf' | 'address') => {
        const file = event.target.files?.[0];
        if (file) {
            await saveDocument(type, file);
            playSuccess();
            loadDocuments();
        }
    };

    const startCamera = (type: 'rgp' | 'cpf' | 'address') => {
        playClick();
        setActiveDocType(type);
        setIsCameraOpen(true);
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => {
                console.error(err);
                playError();
                setIsCameraOpen(false);
            });
    };

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current && activeDocType) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await saveDocument(activeDocType, blob);
                    playSuccess();
                    stopCamera();
                    loadDocuments();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
        setActiveDocType(null);
    };

    const handleDelete = async (type: 'rgp' | 'cpf' | 'address') => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            playClick();
            await deleteDocument(type);
            loadDocuments();
        }
    };

    const renderDocCard = (type: 'rgp' | 'cpf' | 'address', label: string) => {
        const hasDoc = !!documents[type];
        return (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${hasDoc ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800">{label}</h3>
                            <p className={`text-xs font-bold ${hasDoc ? 'text-green-600' : 'text-orange-500'}`}>
                                {hasDoc ? 'Documento salvo (Seguro)' : 'Pendente'}
                            </p>
                        </div>
                    </div>
                    {hasDoc && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>

                {hasDoc ? (
                    <div className="relative h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                        <img src={documents[type]!} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(type)} className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <AlertCircle className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold">Nenhum documento</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => startCamera(type)}
                        className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Camera className="w-4 h-4" /> Câmera
                    </button>
                    <button
                        onClick={() => {
                            setActiveDocType(type);
                            if (fileInputRef.current) {
                                fileInputRef.current.click();
                            }
                        }}
                        className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
            {/* Simple Header */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4 text-indigo-600 shadow-inner">
                    <Wallet className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800">Carteira Digital</h2>
                <p className="text-slate-500 font-bold mt-2">Documentos salvos no seu aparelho.</p>
            </div>

            <div className="space-y-4">
                {renderDocCard('rgp', 'Carteira RGP')}
                {renderDocCard('cpf', 'CPF / RG')}
                {renderDocCard('address', 'Comprovante de Residência')}
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => activeDocType && handleFileSelect(e, activeDocType)}
            />

            {/* Camera Overlay */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-[60] flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="bg-black/80 p-8 flex justify-center gap-8 items-center pb-12">
                        <button onClick={stopCamera} className="text-white font-bold">Cancelar</button>
                        <button
                            onClick={capturePhoto}
                            className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-xl"
                        />
                        <div className="w-16"></div> {/* Spacer */}
                    </div>
                </div>
            )}
        </div>
    );
};
