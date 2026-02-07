import React, { useState } from 'react';
import {
    Calendar,
    MapPin,
    Info,
    Volume2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Clock,
    ShieldCheck,
    History
} from 'lucide-react';
import { DefesoInfo, DefesoRecord } from '../types';
import { playClick } from '../services/audio';
import { speakExplanation } from '../services/gemini';

interface DefesoCalendarProps {
    defeso: DefesoInfo;
}

export const DefesoCalendar: React.FC<DefesoCalendarProps> = ({ defeso }) => {
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    // Mock History Data
    // Use history from the service or empty array if undefined
    const history: DefesoRecord[] = defeso.history || [];

    const handleAudioExplain = () => {
        playClick();
        const text = `Atenção pescador. O defeso do ${defeso.species} começa em primeiro de dezembro. Durante esse período é proibido pescar essa espécie. Como seu RGP está em dia, você tem direito ao Seguro-Defeso. Faltam ${defeso.daysRemaining} dias para iniciar.`;
        speakExplanation(text);
    };

    const renderStatusCard = () => {
        if (defeso.hasRight) {
            return (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                        <h4 className="text-lg font-black text-green-800">Você tem direito ao Seguro</h4>
                        <p className="text-sm text-green-700 font-bold leading-tight mt-1">Seu RGP está ativo e compatível com este defeso.</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                        <h4 className="text-lg font-black text-red-800">Não elegível neste momento</h4>
                        <p className="text-sm text-red-700 font-bold leading-tight mt-1">Verifique seu cadastro ou entre em contato para mais informações.</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-full mb-6 mx-4">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${activeTab === 'current' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-400'}`}
                >
                    Próximo Defeso
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-full text-sm font-black transition-all ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-400'}`}
                >
                    Histórico
                </button>
            </div>

            {activeTab === 'current' ? (
                <div className="space-y-6 px-2">
                    {/* Main Card */}
                    <section className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Calendar className="w-48 h-48 text-blue-900" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {defeso.region.split(' - ')[0]}
                                </span>
                                {defeso.status === 'upcoming' && (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Em Breve
                                    </span>
                                )}
                            </div>

                            <h2 className="text-4xl font-black text-slate-800 leading-none mb-1">{defeso.species}</h2>
                            <p className="text-slate-500 font-bold text-sm mb-6">Período de Proteção à Reprodução</p>

                            {/* Countdown */}
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-orange-200 mb-6 border-2 border-orange-400 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-90 mb-1">Faltam apenas</p>
                                    <div className="text-6xl font-black mb-1">{defeso.daysRemaining}</div>
                                    <p className="text-lg font-black uppercase tracking-widest">Dias para iniciar</p>
                                    <div className="mt-4 pt-4 border-t border-white/20 flex justify-between px-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase opacity-75">Início</p>
                                            <p className="font-black text-lg">{defeso.startDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase opacity-75">Fim</p>
                                            <p className="font-black text-lg">{defeso.endDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility */}
                            <div className="mb-6">
                                {renderStatusCard()}
                            </div>

                            {/* Audio Button */}
                            <button
                                onClick={handleAudioExplain}
                                className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all border border-indigo-100"
                            >
                                <Volume2 className="w-6 h-6" /> Ouvir Explicação
                            </button>
                        </div>
                    </section>

                    {/* Timeline / Alerts */}
                    <section className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-500" /> Linha do Tempo
                        </h3>
                        <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">

                            {/* Timeline items */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 bg-blue-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
                                <p className="text-xs font-black text-blue-500 uppercase mb-1">Hoje</p>
                                <p className="text-slate-700 font-bold">Prepare sua documentação. O período está chegando.</p>
                            </div>

                            <div className="relative opacity-50">
                                <div className="absolute -left-[21px] top-0 bg-slate-200 w-4 h-4 rounded-full border-4 border-white"></div>
                                <p className="text-xs font-black text-slate-400 uppercase mb-1">01 Dezembro</p>
                                <p className="text-slate-500 font-bold">Início do Defeso. Proibida a pesca.</p>
                            </div>

                            <div className="relative opacity-50">
                                <div className="absolute -left-[21px] top-0 bg-slate-200 w-4 h-4 rounded-full border-4 border-white"></div>
                                <p className="text-xs font-black text-slate-400 uppercase mb-1">15 Dezembro</p>
                                <p className="text-slate-500 font-bold">Liberação do requerimento do Seguro.</p>
                            </div>

                        </div>
                    </section>
                </div>
            ) : (
                <div className="space-y-4 px-2">
                    {/* History List */}
                    {history.map(record => (
                        <div key={record.id} className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{record.region.split(' - ')[0]}</p>
                                    <h4 className="text-xl font-black text-slate-800">{record.species}</h4>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                                    {record.paymentStatus === 'paid' ? 'Pago' : 'Em Análise'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold">{record.startDate} a {record.endDate}</span>
                            </div>

                            {record.paymentDate && (
                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs px-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Pagamento recebido em {record.paymentDate}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="p-6 text-center text-slate-400">
                        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">Dados históricos de anos anteriores.</p>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="mt-8 px-6 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-wide">
                    <Info className="w-3 h-3" /> Datas oficiais conforme portaria
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                    As datas podem sofrer alterações por decisão dos órgãos governamentais.
                    O Seguro-Defeso é um direito gratuito do pescador artesanal.
                </p>
            </div>

        </div>
    );
};
