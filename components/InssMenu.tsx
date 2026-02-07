import React, { useState } from 'react';
import { ArrowLeft, Calculator, History, Landmark, Volume2, AlertTriangle } from 'lucide-react';
import { playClick } from '../services/audio';
import { speakExplanation } from '../services/gemini';
import { InssCalculator } from './InssCalculator';
import { InssHistory } from './InssHistory';
import { FisherData } from '../types';

interface InssMenuProps {
    onBack: () => void;
    fisher?: FisherData;
}

export const InssMenu: React.FC<InssMenuProps> = ({ onBack, fisher }) => {
    const [view, setView] = useState<'menu' | 'calculator' | 'history'>('menu');

    const handleExplain = () => {
        playClick();
        speakExplanation("Aqui você calcula e gera o boleto para contribuir com o INSS como pescador artesanal. Informe sua renda mensal para calcular o valor correto.");
    };

    if (view === 'calculator') {
        return <InssCalculator onBack={() => setView('menu')} fisher={fisher} />;
    }

    if (view === 'history') {
        return <InssHistory onBack={() => setView('menu')} />;
    }

    return (
        <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center relative mb-6">
                <button
                    onClick={onBack}
                    className="absolute left-6 top-8 py-2 px-4 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 shadow-inner">
                    <Landmark className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 leading-tight">INSS</h2>
                <p className="text-slate-500 font-bold mt-2 leading-relaxed">Contribuição <br /> Previdenciária</p>
            </div>

            <div className="px-4 text-center mb-8">
                <p className="text-slate-600 font-medium mb-6">Organize e gere seu pagamento de forma fácil e segura.</p>
                <button onClick={handleExplain} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold text-xs active:scale-95 transition-transform">
                    <Volume2 className="w-4 h-4" /> Ouvir Explicação
                </button>
            </div>

            <div className="space-y-4 px-2">
                <button
                    onClick={() => { playClick(); setView('calculator'); }}
                    className="w-full bg-orange-500 text-white p-6 rounded-[2.5rem] shadow-lg shadow-orange-200 active:scale-95 transition-all text-left group relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black mb-1">Calcular</h3>
                            <p className="text-orange-100 font-medium text-sm">Simular novo pagamento</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center group-hover:bg-orange-300 transition-colors">
                            <Calculator className="w-6 h-6" />
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => { playClick(); setView('history'); }}
                    className="w-full bg-white text-slate-700 p-6 rounded-[2.5rem] border-2 border-slate-100 active:scale-95 transition-all text-left flex items-center justify-between hover:border-orange-200"
                >
                    <div>
                        <h3 className="text-xl font-black mb-1">Histórico</h3>
                        <p className="text-slate-400 font-medium text-sm">Meus pagamentos</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                        <History className="w-6 h-6 text-slate-400" />
                    </div>
                </button>
            </div>

            <div className="mt-8 mx-4 bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3 items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
                <p className="text-yellow-700 text-xs font-bold leading-relaxed">
                    O pagamento é seu direito como pescador artesanal. O app facilita o cálculo, mas não substitui o pagamento oficial ao INSS.
                </p>
            </div>
        </div>
    );
};
