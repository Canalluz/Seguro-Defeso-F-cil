import React, { useState } from 'react';
import { ArrowLeft, Calculator, DollarSign, Calendar, Printer, CreditCard, RefreshCw } from 'lucide-react';
import { FisherData, InssContribution } from '../types';
import { saveInssContribution, createNewInssId } from '../services/inssService';
import { playClick, playSuccess } from '../services/audio';

interface InssCalculatorProps {
    onBack: () => void;
    fisher?: FisherData;
}

export const InssCalculator: React.FC<InssCalculatorProps> = ({ onBack, fisher }) => {
    const [income, setIncome] = useState<string>('');
    const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [result, setResult] = useState<InssContribution | null>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        playClick();

        const incomeValue = parseFloat(income.replace('R$', '').replace('.', '').replace(',', '.'));
        if (isNaN(incomeValue) || incomeValue <= 0) {
            alert("Por favor, informe uma renda válida.");
            return;
        }

        // Artisanal fisherman contribution rule (simplified for demo: 1.3% of income or minimum wage base)
        // Adjust logic as per actual legislation if needed. For now using 1.3% roughly.
        const contributionValue = incomeValue * 0.013;

        const contribution: InssContribution = {
            id: createNewInssId(),
            month: month, // "YYYY-MM"
            year: parseInt(month.split('-')[0]),
            income: incomeValue,
            contributionValue: Math.max(contributionValue, 10), // Min 10 reais for demo
            status: 'generated',
            createdAt: Date.now()
        };

        setResult(contribution);
        playSuccess();
    };

    const handleSave = () => {
        if (result) {
            saveInssContribution(result);
            playSuccess();
            onBack();
        }
    };

    return (
        <div className="pb-24 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800">Calcular INSS</h2>
                </div>
                <p className="text-slate-500 font-medium text-sm">Informe sua renda para simular a contribuição.</p>
            </div>

            {!result ? (
                <form onSubmit={handleCalculate} className="space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Nome</label>
                            <input
                                type="text"
                                value={fisher?.name || 'Pescador'}
                                disabled
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">RGP</label>
                            <input
                                type="text"
                                value={fisher?.rgp || '---'}
                                disabled
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-500"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Mês de Competência</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-blue-500" />
                                <input
                                    type="month"
                                    required
                                    value={month}
                                    onChange={e => setMonth(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">Renda Mensal (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={income}
                                    onChange={e => setIncome(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-3">
                        <Calculator className="w-6 h-6" /> Calcular Valor
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 text-center animate-in zoom-in-95 duration-500">
                        <p className="text-blue-200 font-bold text-sm mb-2">Valor da Contribuição</p>
                        <h3 className="text-5xl font-black mb-1">R$ {result.contributionValue.toFixed(2).replace('.', ',')}</h3>
                        <p className="text-blue-200 font-medium text-sm">Competência: {new Date(result.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>

                        <div className="mt-6 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <div className="flex items-center justify-center gap-2 text-sm font-bold">
                                <CheckCircleIcon /> Pronto para gerar boleto
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleSave} className="bg-emerald-500 text-white p-4 rounded-[2rem] font-black shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex flex-col items-center gap-2">
                            <CreditCard className="w-8 h-8" />
                            <span>Gerar Boleto</span>
                        </button>
                        <button onClick={() => alert("Função de impressão simulada.")} className="bg-white text-slate-700 p-4 rounded-[2rem] font-black border border-slate-200 active:scale-95 transition-transform flex flex-col items-center gap-2">
                            <Printer className="w-8 h-8 text-slate-400" />
                            <span>Imprimir</span>
                        </button>
                    </div>

                    <button onClick={() => setResult(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-[2rem] font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Recalcular
                    </button>
                </div>
            )}
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);
