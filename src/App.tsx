import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OccurrenceForm } from './components/OccurrenceForm';
import { OccurrenceList } from './components/OccurrenceList';
import { OccurrenceDetailModal } from './components/OccurrenceDetailModal';
import { OperatorModal } from './components/OperatorModal';
import { LoginScreen } from './components/LoginScreen';
import { Ocorrencia, Operador } from './types';
import { INITIAL_OCORRENCIAS } from './data/mockOcorrencias';
import { Shield, RotateCcw, Lock, LogOut } from 'lucide-react';

const STORAGE_KEY = 'cftv_ocorrencias_v2';
const OPERATORS_KEY = 'cftv_operadores_v2';
const ACTIVE_OPERATOR_KEY = 'cftv_active_operador_v2';
const AUTH_SESSION_KEY = 'cftv_auth_session_v2';

const DEFAULT_OPERADORES: Operador[] = [
  { id: '1', nome: 'Denisson', senha: 'jb@jbti123', mustChangePassword: true },
  { id: '2', nome: 'Cássio', senha: 'jb@jbti123', mustChangePassword: true },
  { id: '3', nome: 'Jhonata', senha: 'jb@jbti123', mustChangePassword: true },
  { id: '4', nome: 'Jhony', senha: 'jb@jbti123', mustChangePassword: true },
  { id: '5', nome: 'Lucas', senha: 'jb@jbti123', mustChangePassword: true },
];

export default function App() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(() => {
    // start empty, will fetch from server
    return [];
  });

  const [operadores, setOperadores] = useState<Operador[]>(() => {
    try {
      const saved = localStorage.getItem(OPERATORS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_OPERADORES;
  });

  const [activeOperador, setActiveOperador] = useState<Operador>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_OPERATOR_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nome) {
          const isKnown = DEFAULT_OPERADORES.some(
            (op) => op.nome.toLowerCase() === parsed.nome.toLowerCase()
          );
          if (isKnown) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_OPERADORES[0];
  });

  // Operator authentication session (login & password required)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = sessionStorage.getItem(AUTH_SESSION_KEY);
      return session === 'true';
    } catch {
      return false;
    }
  });

  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ocorrencias));
    } catch {
      // Storage quota or disabled
    }
  }, [ocorrencias]);

  // Fetch ocorrencias from API on mount and subscribe to server-sent events
  useEffect(() => {
    let es: EventSource | null = null;
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;

    fetch(`${apiBase}/api/ocorrencias`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOcorrencias(data);
      })
      .catch(() => {
        // ignore
      });

    try {
      es = new EventSource(`${apiBase}/api/stream`);
      es.addEventListener('ocorrencias', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data);
          if (Array.isArray(data)) setOcorrencias(data);
        } catch {
          // ignore parse
        }
      });
    } catch (e) {
      // ignore if EventSource not available
    }

    return () => {
      if (es) es.close();
    };
  }, []);

  // Fetch operadores from backend if available and keep in sync
  useEffect(() => {
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;
    fetch(`${apiBase}/api/operadores`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOperadores(data);
        }
      })
      .catch(() => {
        // ignore if backend not available
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(OPERATORS_KEY, JSON.stringify(operadores));
    } catch {
      // Storage quota or disabled
    }
  }, [operadores]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_OPERATOR_KEY, JSON.stringify(activeOperador));
    } catch {
      // Storage quota or disabled
    }
  }, [activeOperador]);

  const handleLoginSuccess = (op: Operador) => {
    setActiveOperador(op);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  const handleLockTerminal = () => {
    setIsAuthenticated(false);
    setIsOperatorModalOpen(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSelectOperador = (op: Operador) => {
    setActiveOperador(op);
  };

  const handleAddOperador = (newOp: Omit<Operador, 'id'>) => {
    const opWithId: Operador = {
      ...newOp,
      id: Date.now().toString(),
    };
    setOperadores((prev) => [opWithId, ...prev]);
    setActiveOperador(opWithId);
  };

  const handleDeleteOperador = (id: string) => {
    const remaining = operadores.filter((o) => o.id !== id);
    if (remaining.length === 0) return;
    setOperadores(remaining);
    if (activeOperador.id === id) {
      setActiveOperador(remaining[0]);
    }
  };

  const handleUpdatePassword = async (operadorId: string, newSenha: string) => {
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;
    try {
      const res = await fetch(`${apiBase}/api/operadores/${operadorId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: newSenha }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOperadores((prev) =>
          prev.map((op) => (op.id === operadorId ? { ...op, senha: updated.senha, mustChangePassword: false } : op))
        );
        if (activeOperador.id === operadorId) {
          setActiveOperador((prev) => ({ ...prev, senha: newSenha, mustChangePassword: false }));
        }
        return;
      }
    } catch (e) {
      // ignore and fallback to local update
    }

    // Fallback when backend not reachable: update locally
    setOperadores((prev) =>
      prev.map((op) => (op.id === operadorId ? { ...op, senha: newSenha, mustChangePassword: false } : op))
    );
    if (activeOperador.id === operadorId) {
      setActiveOperador((prev) => ({ ...prev, senha: newSenha, mustChangePassword: false }));
    }
  };

  const handleAddOcorrencia = (
    data: Omit<Ocorrencia, 'id'>
  ) => {
    // send to server; server will broadcast update via SSE
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;
    fetch(`${apiBase}/api/ocorrencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, finalizador: activeOperador?.nome || data.finalizador }),
    })
      .then((r) => r.json())
      .then((newOcc) => {
        // optimistic add (SSE will keep in sync)
        setOcorrencias((prev) => [newOcc, ...prev.filter((p) => p.id !== newOcc.id)]);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleDeleteOcorrencia = (id: number) => {
    const host = window.location.hostname || '127.0.0.1';
    const apiBase = `http://${host}:4000`;
    fetch(`${apiBase}/api/ocorrencias/${id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then(() => {
        setOcorrencias((prev) => prev.filter((o) => o.id !== id));
        if (selectedOcorrencia?.id === id) setSelectedOcorrencia(null);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleResetSampleData = () => {
    if (
      confirm(
        'Deseja restaurar os registros de demonstração iniciais? Registros atuais serão substituídos.'
      )
    ) {
      setOcorrencias(INITIAL_OCORRENCIAS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OCORRENCIAS));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Brand Bar */}
      <Navbar
        totalCount={ocorrencias.length}
        activeOperador={activeOperador}
        onOpenOperatorModal={() => setIsOperatorModalOpen(true)}
        onLockTerminal={handleLockTerminal}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Formulário (Esquerda) - aumentado para preencher espaço */}
        <div className="w-full lg:w-[440px] shrink-0">
          <OccurrenceForm
            onSubmit={handleAddOcorrencia}
            activeOperador={activeOperador}
          />
        </div>

        {/* Lista de Registros + KPIs (Direita) - maior área para registros recentes */}
        <div className="flex-1 w-full min-w-0 lg:pl-6">
          <div className="h-[72vh]">
          <OccurrenceList
            ocorrencias={ocorrencias}
            onSelectOcorrencia={setSelectedOcorrencia}
            onDeleteOcorrencia={handleDeleteOcorrencia}
          />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-9 bg-slate-200 flex items-center px-4 sm:px-6 justify-between text-[10px] text-slate-600 uppercase font-bold shrink-0 border-t border-slate-300">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">© 2026 GRUPO JB • SISTEMA CFTV V.2.4.0</span>
          <span className="sm:hidden">GRUPO JB CFTV V2.4</span>
          <button
            type="button"
            onClick={() => setIsOperatorModalOpen(true)}
            className="text-[#003366] hover:underline cursor-pointer font-semibold hidden md:inline"
          >
            [Operador Autenticado: {activeOperador.nome}]
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={handleLockTerminal}
            className="text-slate-600 hover:text-red-700 flex items-center gap-1 transition cursor-pointer text-[10px]"
            title="Sair do Terminal e exigir login novamente"
          >
            <LogOut className="w-3 h-3 text-red-600" />
            <span>Sair</span>
          </button>
          <button
            type="button"
            onClick={handleResetSampleData}
            className="hover:text-slate-900 flex items-center gap-1 transition cursor-pointer text-[10px]"
            title="Restaurar dados de demonstração"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar dados</span>
          </button>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            OPERADOR: {activeOperador.nome.toUpperCase()}
          </span>
        </div>
      </footer>

      {/* Login Screen / Lock Screen if not authenticated */}
      {!isAuthenticated && (
        <LoginScreen
          operadores={operadores}
          activeOperador={activeOperador}
          onLoginSuccess={handleLoginSuccess}
          onRegisterOperador={handleAddOperador}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      {/* Operator Switcher & Management Modal */}
      <OperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        operadores={operadores}
        activeOperador={activeOperador}
        onSelectOperador={handleSelectOperador}
        onAddOperador={handleAddOperador}
        onDeleteOperador={handleDeleteOperador}
        onUpdatePassword={handleUpdatePassword}
        onLockTerminal={handleLockTerminal}
      />

      {/* Detail Modal */}
      {selectedOcorrencia && (
        <OccurrenceDetailModal
          ocorrencia={selectedOcorrencia}
          onClose={() => setSelectedOcorrencia(null)}
          onDelete={handleDeleteOcorrencia}
        />
      )}
    </div>
  );
}
