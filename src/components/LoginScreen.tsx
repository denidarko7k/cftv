import React, { useState } from 'react';
import { Operador } from '../types';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

interface LoginScreenProps {
  operadores: Operador[];
  activeOperador: Operador | null;
  onLoginSuccess: (operador: Operador) => void;
  onRegisterOperador: (operador: Omit<Operador, 'id'>) => void;
  onUpdatePassword: (operadorId: string, newSenha: string, currentSenha?: string) => Promise<boolean>;
}

const DEFAULT_PASSWORD = 'jb@jbti123';

const normalizeText = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const LoginScreen: React.FC<LoginScreenProps> = ({
  operadores,
  onLoginSuccess,
  onUpdatePassword,
}) => {
  const [usuario, setUsuario] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Mode: 'login' | 'first_access_reset'
  const [mode, setMode] = useState<'login' | 'first_access_reset'>('login');
  const [pendingOperator, setPendingOperator] = useState<Operador | null>(null);

  // First-access password reset fields
  const [newSenha, setNewSenha] = useState('');
  const [confirmNewSenha, setConfirmNewSenha] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = usuario.trim();
    const trimmedPass = senha.trim();

    if (!trimmedUser) {
      setError('Por favor, digite o nome do usuário/operador.');
      return;
    }

    if (!trimmedPass) {
      setError('Por favor, digite a senha de acesso.');
      return;
    }

    const normInput = normalizeText(trimmedUser);
    // Try backend authentication first
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;
    fetch(`${apiBase}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: trimmedUser, senha: trimmedPass }),
    })
      .then(async (r) => {
        if (r.ok) {
          const op = await r.json();
          const operador: Operador = {
            id: op.id,
            nome: op.nome,
            senha: op.mustChangePassword ? trimmedPass : '',
            mustChangePassword: op.mustChangePassword || false,
          };

          if (operador.mustChangePassword) {
            setPendingOperator(operador);
            setMode('first_access_reset');
            setNewSenha('');
            setConfirmNewSenha('');
            return;
          }

          onLoginSuccess(operador);
          return;
        }
        // fallback to local validation when backend rejects
        // continue to local validation below
        throw new Error('backend-auth-failed');
      })
      .catch(() => {
        // local fallback (offline or backend not reachable)
        const matchedOperator = operadores.find(
          (op) => normalizeText(op.nome) === normInput
        );

        if (!matchedOperator) {
          setError('Usuário ou senha incorretos.');
          return;
        }

        const isMatch = trimmedPass === matchedOperator.senha;
        const isDefault = trimmedPass === DEFAULT_PASSWORD;

        if (!isMatch && !isDefault) {
          setError('Usuário ou senha incorretos.');
          return;
        }

        // Check if operator needs first-access password setup
        const isFirstAccess =
          matchedOperator.mustChangePassword === true ||
          matchedOperator.senha === DEFAULT_PASSWORD ||
          isDefault;

        if (isFirstAccess) {
          setPendingOperator(matchedOperator);
          setMode('first_access_reset');
          setNewSenha('');
          setConfirmNewSenha('');
          setError('');
          return;
        }

        // Direct successful login with existing personal password
        onLoginSuccess(matchedOperator);
      });
  };

  const handleSaveFirstAccessPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingOperator) return;

    const trimmedNew = newSenha.trim();

    if (!trimmedNew || trimmedNew.length < 4) {
      setError('A nova senha pessoal deve ter no mínimo 4 caracteres.');
      return;
    }

    if (trimmedNew === DEFAULT_PASSWORD) {
      setError('A nova senha deve ser diferente da senha padrão provisória.');
      return;
    }

    if (trimmedNew !== confirmNewSenha.trim()) {
      setError('A confirmação da nova senha não coincide com a digitada.');
      return;
    }

    // Update password
    const saved = await onUpdatePassword(pendingOperator.id, trimmedNew, pendingOperator.senha);
    if (!saved) {
      setError('Não foi possível salvar a senha no servidor. Tente novamente.');
      return;
    }

    const updatedOperator: Operador = {
      ...pendingOperator,
      senha: '',
      mustChangePassword: false,
    };

    setResetSuccessNotice('Senha pessoal cadastrada com sucesso! Acessando...');
    setTimeout(() => {
      onLoginSuccess(updatedOperator);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Brand Header */}
        <div className="bg-[#003366] text-white p-6 border-b-4 border-[#cc0000] relative">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 bg-white rounded-lg p-1 shadow-md shrink-0 flex items-center justify-center overflow-hidden border border-white/20">
              <img
                src="/assets/aistudio/logo-grupo-jb.png"
                alt="Grupo JB"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">
                Central de Monitoramento CFTV
              </span>
              <h2 className="text-base font-bold tracking-tight text-white">
                SISTEMA GRUPO JB
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-blue-100 mt-0.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-blue-300" />
                <span>Autenticação de Acesso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* STANDARD LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Usuário Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    placeholder="Digite seu nome de usuário"
                    value={usuario}
                    onChange={(e) => {
                      setUsuario(e.target.value);
                      setError('');
                    }}
                    className="w-full text-sm pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                  />
                </div>
              </div>

              {/* Senha Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Digite sua senha de acesso"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setError('');
                    }}
                    className="w-full text-sm pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#003366] hover:bg-[#002244] text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Primeiro acesso? Utilize a senha temporária padrão <code className="font-mono font-bold bg-slate-100 text-[#003366] px-1.5 py-0.5 rounded border border-slate-200">{DEFAULT_PASSWORD}</code>
                </p>
              </div>
            </form>
          )}

          {/* MANDATORY PASSWORD DEFINITION ON FIRST ACCESS */}
          {mode === 'first_access_reset' && pendingOperator && (
            <form onSubmit={handleSaveFirstAccessPassword} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <LockKeyhole className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Primeiro Acesso: Cadastro de Senha Pessoal</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Operador <strong>{pendingOperator.nome}</strong> identificado.
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Por medidas de segurança institucional, defina agora a sua senha pessoal definitiva para acessar o terminal.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Nova Senha Pessoal <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Mínimo 4 caracteres</span>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua nova senha pessoal"
                    value={newSenha}
                    onChange={(e) => {
                      setNewSenha(e.target.value);
                      setError('');
                    }}
                    autoFocus
                    className="w-full text-sm px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Confirmar Nova Senha <span className="text-red-600">*</span>
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita a nova senha pessoal"
                  value={confirmNewSenha}
                  onChange={(e) => {
                    setConfirmNewSenha(e.target.value);
                    setError('');
                  }}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] font-medium"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {resetSuccessNotice && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{resetSuccessNotice}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setPendingOperator(null);
                    setError('');
                    setSenha('');
                  }}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={Boolean(resetSuccessNotice)}
                  className="flex-1 py-2.5 px-4 bg-[#003366] hover:bg-[#002244] text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Salvar Senha e Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="bg-slate-100 px-6 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Central CFTV • Grupo JB
          </span>
          <span className="font-mono text-slate-400 text-[10px]">TERMINAL SEGURO</span>
        </div>
      </div>
    </div>
  );
};
