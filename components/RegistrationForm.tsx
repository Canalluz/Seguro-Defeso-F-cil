import React, { useState } from 'react';
import { User, FileText, MapPin, ChevronRight, UserPlus, CreditCard } from 'lucide-react';
import { playClick } from '../services/audio';

interface RegistrationFormProps {
    onNext: (data: { name: string; cpf: string; rgp: string; region: string }) => void;
    onBack: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNext, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        rgp: '',
        region: 'Norte - Bacia Amazônica',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        playClick();
        if (formData.name && formData.cpf && formData.rgp) {
            onNext(formData);
        } else {
            // Basic validation feedback (visual shake or simple alert)
            // For now, we rely on the disabled state of the button or just verify basics
            alert("Por favor, preencha todos os campos obrigatórios.");
        }
    };

    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-6 animate-in slide-in-from-right duration-500 pb-32">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
                    <UserPlus className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 leading-tight">Novo Cadastro</h2>
                <p className="text-slate-500 font-bold mt-2">Preencha seus dados oficiais.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Nome Completo
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Manoel da Silva"
                        className="w-full bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100 font-bold text-lg text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> CPF
                    </label>
                    <input
                        type="text"
                        placeholder="000.000.000-00"
                        className="w-full bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100 font-bold text-lg text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        value={formData.cpf}
                        onChange={(e) => handleChange('cpf', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Número do RGP
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: AM-987654"
                        className="w-full bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100 font-bold text-lg text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                        value={formData.rgp}
                        onChange={(e) => handleChange('rgp', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Sua Região
                    </label>
                    <div className="relative">
                        <select
                            className="w-full bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100 font-bold text-lg text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner appearance-none"
                            value={formData.region}
                            onChange={(e) => handleChange('region', e.target.value)}
                        >
                            <option value="Norte - Bacia Amazônica">Norte - Bacia Amazônica</option>
                            <option value="Nordeste - Bacia do Parnaíba">Nordeste - Bacia do Parnaíba</option>
                            <option value="Centro-Oeste - Bacia do Paraguai">Centro-Oeste - Bacia do Paraguai</option>
                            <option value="Sudeste - Bacia do Paraná">Sudeste - Bacia do Paraná</option>
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 rotate-90" />
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={handleNext}
                        className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        Continuar <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => { playClick(); onBack(); }}
                        className="w-full text-slate-400 font-bold py-4 active:text-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
