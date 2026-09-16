import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { Operador } from '../types';
import ultimateImage from '../assets/images/Ultimate_black.png';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

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
      const month = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const year = String(now.getFullYear()).slice(-2);
      setDateStr(`${day} ${month} ${year}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-40 h-16 border-b-2 border-[#24fbff] bg-white flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm text-black">
      <div className="flex items-center gap-3">
        <img src={ultimateImage} alt="Ultimate" className="h-10 w-10 object-contain" />
        <span className="text-sm font-bold text-black">Central CFTV</span>
      </div>

      <div className="flex items-center gap-3 text-black text-xs sm:text-sm">
        <div className="text-right font-mono">
          <p className="font-semibold text-black text-xs sm:text-sm">{dateStr || 'CARREGANDO'}</p>
          <p className="text-[11px] sm:text-xs text-slate-600">{timeStr || '--:--:--'}</p>
        </div>

        <div className="w-px h-8 bg-black hidden sm:block"></div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#003366] transition hover:bg-slate-100 ${profileOpen ? 'border-0' : 'border border-[#003366]'}`}
            title="Abrir opções do perfil"
          >
            <User className="h-4 w-4" />
          </button>
          {profileOpen && <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-slate-300 bg-white p-3 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#003366]"><User className="h-4 w-4" /></div>
              <p className="min-w-0 truncate text-left text-xs font-bold text-black">{activeOperador?.nome || 'Operador'}</p>
            </div>
            <div className="mt-2 space-y-1">
              <button type="button" onClick={() => { setProfileOpen(false); onOpenOperatorModal?.(); }} className="block w-full rounded px-2 py-2 text-left text-[11px] text-slate-700 transition hover:bg-slate-100 hover:text-black">Trocar senha</button>
              <button type="button" onClick={() => { setProfileOpen(false); onLockTerminal?.(); }} className="block w-full rounded px-2 py-2 text-left text-[11px] text-red-600 transition hover:bg-red-50 hover:text-red-700">Sair</button>
            </div>
          </div>}
        </div>
      </div>
    </header>
  );
};

