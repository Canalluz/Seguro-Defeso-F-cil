import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, FileText } from 'lucide-react';
import { InssContribution } from '../types';
import { getInssContributions } from '../services/inssService';

interface InssHistoryProps {
    onBack: () => void;
}

export const InssHistory: React.FC<InssHistoryProps> = ({ onBack }) => {
    const [history, setHistory] = useState<InssContribution[]>([]);

    useEffect(() => {
        setHistory(getInssContributions().sort((a, b) => b.createdAt - a.createdAt));
    }, []);

    return (
        <div className="pb-24 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800">Histórico</h2>
                </div>
                <p className="text-slate-500 font-medium text-sm">Seus pagamentos e boletos gerados.</p>
            </div>

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="font-bold text-slate-400">Nenhum pagamento registrado.</p>
                    </div>
                ) : (
                    history.map(item => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                                    {new Date(item.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </p>
                                <h3 className="text-xl font-black text-slate-800">
                                    R$ {item.contributionValue.toFixed(2).replace('.', ',')}
                                </h3>
                                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${item.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                                    {item.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {item.status === 'paid' ? 'Pago' : 'Pendente / Gerado'}
                                </div>
                            </div>

                            <button className="bg-blue-50 text-blue-600 p-3 rounded-2xl active:scale-95 transition-transform">
                                <FileText className="w-6 h-6" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
