import React, { useState } from 'react';
import { Operador } from '../types';
import {
  X,
  BadgeCheck,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Lock,
  UserCheck
} from 'lucide-react';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operadores: Operador[];
  activeOperador: Operador;
  onSelectOperador: (operador: Operador) => void;
  onAddOperador: (operador: Omit<Operador, 'id'>) => void;
  onDeleteOperador: (id: string) => void;
  onUpdatePassword: (operadorId: string, newSenha: string) => void;
  onLockTerminal: () => void;
}

const DEFAULT_PASSWORD = 'jb@jbti123';

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  onClose,
  activeOperador,
  onUpdatePassword,
  onLockTerminal,
}) => {
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedCurrent = currentPassInput.trim();
    const trimmedNew = newPassInput.trim();
    const trimmedConfirm = confirmNewPassInput.trim();

    // Verify current password
    if (trimmedCurrent !== activeOperador.senha && trimmedCurrent !== DEFAULT_PASSWORD) {
      setError('A senha atual digitada está incorreta.');
      return;
    }

    // Verify new password
    if (!trimmedNew || trimmedNew.length < 4) {
      setError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (trimmedNew === DEFAULT_PASSWORD) {
      setError('A nova senha deve ser diferente da senha padrão temporária (jb@jbti123).');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setError('A confirmação da nova senha não confere com a digitada.');
      return;
    }

    setIsSubmitting(true);
    onUpdatePassword(activeOperador.id, trimmedNew);

    setSuccessMsg('Senha alterada com sucesso!');
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmNewPassInput('');
    setIsSubmitting(false);

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleLogout = () => {
    onClose();
    onLockTerminal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#cc0000]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <UserCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">
                Operador Autenticado
              </h2>
              <p className="text-[11px] text-blue-200">
                Grupo JB • Central de Monitoramento CFTV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Active Operator Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {activeOperador.nome.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operador Conectado
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  {activeOperador.nome}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sessão Ativa
                </span>
              </div>
            </div>

            {/* Sair Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              title="Encerrar sessão e retornar ao login"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>

          {/* Redefinir Senha Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-[#003366]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Redefinir Senha
              </h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Senha Atual <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha atual"
                    value={currentPassInput}
                    onChange={(e) => {
                      setCurrentPassInput(e.target.value);
                      setError('');
                    }}
                    className="w-full text-xs px-3 py-2 pr-9 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">
                    Nova Senha <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Mínimo 4 caracteres</span>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Digite a nova senha pessoal"
                    value={newPassInput}
                    onChange={(e) => {
                      setNewPassInput(e.target.value);
                      setError('');
                    }}
                    className="w-full text-xs px-3 py-2 pr-9 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Confirmar Nova Senha <span className="text-red-600">*</span>
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Confirme a nova senha pessoal"
                  value={confirmNewPassInput}
                  onChange={(e) => {
                    setConfirmNewPassInput(e.target.value);
                    setError('');
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Salvar Nova Senha</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <button
            type="button"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Terminal</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
