import React, { useState, useEffect } from 'react';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { Operador } from '../types';

interface NavbarProps {
  totalCount: number;
  activeOperador?: Operador;
  onOpenOperatorModal?: () => void;
  onLockTerminal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount: _totalCount,
  activeOperador,
  onOpenOperatorModal,
  onLockTerminal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      const day = now.toLocaleDateString('pt-BR', { day: '2-digit' });
      const month = now
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase();
      const year = now.getFullYear();
      setDateStr(`${day} ${month} ${year}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#003366] border-b-4 border-[#cc0000] flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        {/* Logo Grupo JB */}
          <div className="h-11 w-11 bg-white rounded flex items-center justify-center p-0.5 shrink-0 shadow-xs border border-white/20 overflow-hidden">
            <img
              src="/assets/aistudio/logo-grupo-jb.png"
              alt="Grupo JB"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        <div>
          <h1 className="text-white text-sm sm:text-lg font-bold tracking-tight flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span>SISTEMA DE CONTROLE DE OCORRÊNCIAS GRUPO JB</span>
            <span className="text-slate-300 font-light uppercase text-xs sm:text-sm tracking-wider">
              Central de CFTV
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
        {/* Operador em Serviço */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenOperatorModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer text-left group"
            title="Clique para ver perfil do operador e redefinir senha"
          >
            <div className="w-7 h-7 rounded-full bg-white text-[#003366] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {activeOperador ? activeOperador.nome.substring(0, 2).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="flex items-center gap-1 font-semibold text-slate-100 text-xs">
                <span className="truncate max-w-[130px]">{activeOperador?.nome || 'Operador'}</span>
                <ChevronDown className="w-3 h-3 text-slate-300 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-blue-200 truncate max-w-[140px]">
                Operador CFTV
              </p>
            </div>
            <span className="sm:hidden text-[11px] font-bold text-blue-100">
              Conta
            </span>
          </button>

          {onLockTerminal && (
            <button
              type="button"
              onClick={onLockTerminal}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-600/90 hover:border-red-400 border border-white/20 text-blue-100 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title="Sair do terminal e bloquear sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden md:inline">Sair</span>
            </button>
          )}
        </div>

        <div className="w-px h-8 bg-slate-400/30 hidden sm:block"></div>
        <div className="text-right font-mono">
          <p className="font-semibold text-slate-100 text-xs sm:text-sm">{dateStr || 'CARREGANDO'}</p>
          <p className="text-[11px] sm:text-xs text-slate-300">{timeStr || '--:--:--'}</p>
        </div>
      </div>
    </header>
  );
};

