import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Camera, Upload, Trash2, Calendar, MapPin, Anchor, Fish } from 'lucide-react';
import { ReapReport } from '../types';
import { saveReapReport, createNewReapId } from '../services/reapService';
import { playClick, playSuccess, playError } from '../services/audio';

interface ReapFormProps {
    onBack: () => void;
    initialData?: ReapReport;
}

export const ReapForm: React.FC<ReapFormProps> = ({ onBack, initialData }) => {
    const [formData, setFormData] = useState<Partial<ReapReport>>(initialData || {
        type: 'mar',
        mode: 'embarcado',
        status: 'pending'
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photoUrl || null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate || !formData.type || !formData.mode) {
            playError();
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const report: ReapReport = {
            id: initialData?.id || createNewReapId(),
            startDate: formData.startDate,
            endDate: formData.endDate,
            type: formData.type!,
            mode: formData.mode!,
            quantity: formData.quantity || '',
            status: formData.status || 'analysis',
            photoUrl: previewUrl || undefined,
            createdAt: initialData?.createdAt || Date.now()
        };

        saveReapReport(report);
        playSuccess();
        onBack();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            playSuccess();
        }
    };

    const startCamera = () => {
        playClick();
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

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const url = canvas.toDataURL('image/jpeg');
            setPreviewUrl(url);
            playSuccess();
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    return (
        <div className="pb-24 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800">Novo REAP</h2>
                </div>
                <p className="text-slate-500 font-medium text-sm">Preencha os dados da sua atividade pesqueira.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Period */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-blue-500" /> Período da Atividade
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Início</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate || ''}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Fim</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate || ''}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Type/Mode */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-4">
                        <Anchor className="w-5 h-5 text-blue-500" /> Tipo de Pesca
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Local</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mar">Mar</option>
                                <option value="rio">Rio</option>
                                <option value="lagoa">Lagoa</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Modalidade</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mode: 'embarcado' })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.mode === 'embarcado' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    Embarcado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mode: 'terra' })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.mode === 'terra' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    Em Terra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quantity */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-4">
                        <Fish className="w-5 h-5 text-blue-500" /> Captura (Opcional)
                    </h3>
                    <input
                        type="text"
                        placeholder="Ex: 50kg de Camarão"
                        value={formData.quantity || ''}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Photo Evidence */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-2">
                        <Camera className="w-5 h-5 text-blue-500" /> Comprovação
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 font-medium">Envie uma foto da atividade, nota fiscal ou registro de venda.</p>

                    {previewUrl ? (
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-4 border border-slate-200">
                            <img src={previewUrl} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setPreviewUrl(null)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={startCamera} className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                                <Camera className="w-4 h-4" /> Tirar Foto
                            </button>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" /> Galeria
                            </button>
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black text-xl shadow-xl shadow-green-200 active:scale-95 transition-transform">
                    Salvar REAP
                </button>

            </form>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

            {/* Camera Overlay */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-[70] flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="bg-black/80 p-8 flex justify-center gap-8 items-center pb-12">
                        <button type="button" onClick={stopCamera} className="text-white font-bold">Cancelar</button>
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-xl"
                        />
                        <div className="w-16"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
