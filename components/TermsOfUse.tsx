import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

interface TermsOfUseProps {
    onClose: () => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onClose }) => {
    return (
        <div className="bg-white min-h-screen p-6 animate-in slide-in-from-bottom duration-500 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 sticky top-0 bg-white/95 backdrop-blur-sm py-4 z-10 border-b border-slate-100">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Termos de Uso
                </h2>
            </div>

            <div className="space-y-8 text-slate-700">

                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                    <h3 className="text-lg font-black text-blue-800 mb-2">Aplicativo Seguro-Defeso Fácil</h3>
                    <p className="text-sm font-bold text-blue-600">
                        Ao usar este aplicativo, você concorda com estes Termos de Uso. Se não concordar, não utilize o aplicativo.
                    </p>
                </div>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        Finalidade do aplicativo
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 font-medium text-sm text-slate-600">
                        <li>Orientar o pescador artesanal.</li>
                        <li>Organizar informações e documentos.</li>
                        <li>Ajudar no acesso ao Seguro-Defeso.</li>
                    </ul>
                    <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200 flex gap-3 text-xs font-bold text-yellow-800">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>O aplicativo não é do INSS e não garante a concessão do benefício.</p>
                    </div>
                </section>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        Gratuidade
                    </h4>
                    <p className="font-medium text-sm text-slate-600 mb-2">O Seguro-Defeso é gratuito. O INSS não cobra taxas.</p>
                    <p className="font-bold text-sm text-slate-800">O aplicativo não emite boletos do INSS.</p>
                </section>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                        Responsabilidade
                    </h4>
                    <p className="font-medium text-sm text-slate-600">O usuário é responsável por informar dados verdadeiros e manter documentos atualizados. O app não se responsabiliza por dados incorretos.</p>
                </section>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                        Uso Correto
                    </h4>
                    <p className="font-medium text-sm text-slate-600 mb-2">É proibido usar dados de terceiros ou fraudar o sistema.</p>
                    <p className="font-bold text-red-500 text-sm">O uso indevido pode resultar no bloqueio da conta.</p>
                </section>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                        Segurança
                    </h4>
                    <p className="font-medium text-sm text-slate-600">Acesso protegido por biometria ou PIN. Não armazenamos fotos do rosto remotamente.</p>
                </section>

                <section>
                    <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
                        Limitação
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 font-medium text-sm text-slate-600">
                        <li>Não substitui o INSS.</li>
                        <li>Não decide sobre concessão.</li>
                        <li>Não interfere nas análises.</li>
                    </ul>
                </section>

                <section className="bg-slate-50 p-6 rounded-[2rem] text-center">
                    <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aviso Final</p>
                    <p className="text-sm font-medium text-slate-600 mt-2">
                        Este aplicativo foi criado para ajudar, orientar e facilitar o acesso à informação.
                    </p>
                </section>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform"
                >
                    Entendi e Concordo
                </button>

            </div>
        </div>
    );
};
