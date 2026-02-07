import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ReapReport } from '../types';
import { getReapReports, deleteReapReport } from '../services/reapService';
import { playClick } from '../services/audio';

interface ReapListProps {
    onBack: () => void;
    onEdit: (report: ReapReport) => void;
}

export const ReapList: React.FC<ReapListProps> = ({ onBack, onEdit }) => {
    const [reports, setReports] = useState<ReapReport[]>([]);

    useEffect(() => {
        setReports(getReapReports());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("Deseja excluir este relatório?")) {
            deleteReapReport(id);
            setReports(getReapReports()); // Refresh
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'analysis':
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Aprovado';
            case 'pending': return 'Pendência';
            case 'analysis': return 'Em Análise';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            case 'analysis':
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="pb-24 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[3rem] p-6 shadow-lg border border-slate-100 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800">Meus REAPs</h2>
                </div>
                <p className="text-slate-500 font-medium text-sm">Histório de relatórios enviados.</p>
            </div>

            <div className="space-y-4">
                {reports.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <p className="font-bold text-slate-400">Nenhum relatório encontrado.</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <div key={report.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 uppercase tracking-wide ${getStatusColor(report.status)}`}>
                                    {getStatusIcon(report.status)} {getStatusLabel(report.status)}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(report)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(report.id)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-slate-800 capitalize mb-2">Pesca {report.mode} - {report.type}</h3>

                            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-50 p-3 rounded-xl">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {new Date(report.startDate).toLocaleDateString('pt-BR')} até {new Date(report.endDate).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
