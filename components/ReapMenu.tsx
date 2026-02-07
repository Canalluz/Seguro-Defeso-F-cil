import React, { useState } from 'react';
import { ArrowLeft, ClipboardList, PenTool, LayoutDashboard, Volume2 } from 'lucide-react';
import { playClick } from '../services/audio';
import { speakExplanation } from '../services/gemini';
import { ReapForm } from './ReapForm';
import { ReapList } from './ReapList';
import { ReapReport } from '../types';

interface ReapMenuProps {
    onBack: () => void;
}

export const ReapMenu: React.FC<ReapMenuProps> = ({ onBack }) => {
    const [view, setView] = useState<'menu' | 'form' | 'list'>('menu');
    const [editingReport, setEditingReport] = useState<ReapReport | undefined>(undefined);

    const handleExplain = () => {
        playClick();
        speakExplanation("Aqui você registra sua atividade pesqueira. Anexe fotos ou documentos que comprovem seu trabalho para garantir seu Seguro-Defeso.");
    };

    if (view === 'form') {
        return <ReapForm onBack={() => { setView('menu'); setEditingReport(undefined); }} initialData={editingReport} />;
    }

    if (view === 'list') {
        return <ReapList onBack={() => setView('menu')} onEdit={(r) => { setEditingReport(r); setView('form'); }} />;
    }

    return (
        <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center relative mb-8">
                <button
                    onClick={onBack}
                    className="absolute left-6 top-8 py-2 px-4 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
                    <ClipboardList className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 leading-tight">REAP</h2>
                <p className="text-slate-500 font-bold mt-2 leading-relaxed">Relatório de Exercício da <br /> Atividade Pesqueira</p>
            </div>

            <div className="px-4 text-center mb-8">
                <p className="text-slate-600 font-medium mb-6">Registre sua pesca e comprove sua atividade artesanal para manter seu benefício.</p>
                <button onClick={handleExplain} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold text-xs active:scale-95 transition-transform">
                    <Volume2 className="w-4 h-4" /> Ouvir Explicação
                </button>
            </div>

            <div className="space-y-4 px-2">
                <button
                    onClick={() => { playClick(); setView('form'); }}
                    className="w-full bg-emerald-600 text-white p-6 rounded-[2.5rem] shadow-lg shadow-emerald-200 active:scale-95 transition-all text-left group relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black mb-1">Novo REAP</h3>
                            <p className="text-emerald-100 font-medium text-sm">Registrar nova atividade</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                            <PenTool className="w-6 h-6" />
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { playClick(); setView('list'); }}
                    className="w-full bg-white text-slate-700 p-6 rounded-[2.5rem] border-2 border-slate-100 active:scale-95 transition-all text-left flex items-center justify-between hover:border-emerald-200"
                >
                    <div>
                        <h3 className="text-xl font-black mb-1">Meus REAPs</h3>
                        <p className="text-slate-400 font-medium text-sm">Ver relatórios enviados</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-slate-400" />
                    </div>
                </button>
            </div>
        </div>
    );
};
