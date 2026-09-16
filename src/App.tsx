import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OccurrenceForm } from './components/OccurrenceForm';
import { InternalAnalysisForm } from './components/InternalAnalysisForm';
import { OccurrenceList } from './components/OccurrenceList';
import { InternalAnalysisList } from './components/InternalAnalysisList';
import { InternalAnalysisDetailModal } from './components/InternalAnalysisDetailModal';
import { OccurrenceDetailModal } from './components/OccurrenceDetailModal';
import { OperatorModal } from './components/OperatorModal';
import { LoginScreen } from './components/LoginScreen';
import { InternalAnalysisRecord, Ocorrencia, Operador } from './types';
import { INITIAL_OCORRENCIAS } from './data/mockOcorrencias';
import { ClipboardList, FileSearch, RotateCcw, X } from 'lucide-react';

const STORAGE_KEY = 'cftv_ocorrencias_v2';
const OPERATORS_KEY = 'cftv_operadores_v2';
const ACTIVE_OPERATOR_KEY = 'cftv_active_operador_v2';
const AUTH_SESSION_KEY = 'cftv_auth_session_v2';
const INTERNAL_ANALYSES_KEY = 'cftv_analises_internas_v1';

const getApiBase = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = window.location.hostname || '127.0.0.1';
  return `http://${host}:4000`;
};

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

  useEffect(() => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/session`, {
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true);
          try {
            sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
          } catch {
            // Ignore
          }
          return;
        }

        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem(AUTH_SESSION_KEY);
        } catch {
          // Ignore
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem(AUTH_SESSION_KEY);
        } catch {
          // Ignore
        }
      });
  }, []);

  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [selectedInternalAnalysis, setSelectedInternalAnalysis] = useState<InternalAnalysisRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [leftPanelMode, setLeftPanelMode] = useState<'occurrence' | 'analysis'>(() => (
    window.location.pathname === '/analise-interna' ? 'analysis' : 'occurrence'
  ));
  const navigateTo = (mode: 'occurrence' | 'analysis') => {
    const path = mode === 'analysis' ? '/analise-interna' : '/ocorrencias';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setLeftPanelMode(mode);
  };

  useEffect(() => {
    const syncRoute = () => {
      const currentPath = window.location.pathname;

      if (!isAuthenticated) {
        if (currentPath !== '/login') {
          window.history.replaceState({}, '', '/login');
        }
        return;
      }

      if (currentPath === '/login') {
        window.history.replaceState({}, '', '/ocorrencias');
      }

      const nextMode = currentPath === '/analise-interna' ? 'analysis' : 'occurrence';
      setLeftPanelMode(nextMode);
    };

    syncRoute();

    const handlePopState = () => syncRoute();
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);
  const [internalAnalyses, setInternalAnalyses] = useState<InternalAnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(INTERNAL_ANALYSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            ...item,
            status: item.status === 'Concluído' || item.status === 'Aprovado' ? 'Concluido' : 'Em analise',
          }));
        }
      }
    } catch {
      // Fallback to the sample record.
    }
    return [{
      id: 1,
      dataOperacao: '09/09/2026',
      dataAnalise: '09/09/2026',
      horario: '08:26',
      loja: 'Loja 01',
      tipo: 'Furto',
      pdv: '01',
      operador: 'Nome do operador',
      supervisor: 'Nome do supervisor',
      valor: 0,
      parecer: 'Pendente',
      status: 'Em analise',
      motivoOperador: 'Motivo declarado pelo operador...',
      procedimentoIncorreto: 'Descreva o que foi feito incorretamente...',
      observacoesAnalista: 'Observações técnicas do analista...',
      evidencia: ['Devolução processada de forma incorreta'],
      onedriveLink: '',
    }];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ocorrencias));
    } catch {
      // Storage quota or disabled
    }
  }, [ocorrencias]);

  useEffect(() => {
    try {
      localStorage.setItem(INTERNAL_ANALYSES_KEY, JSON.stringify(internalAnalyses));
    } catch {
      // Storage quota or disabled.
    }
  }, [internalAnalyses]);

  // Fetch ocorrencias from API on mount and subscribe to server-sent events
  useEffect(() => {
    let es: EventSource | null = null;
    const apiBase = getApiBase();

    fetch(`${apiBase}/api/ocorrencias`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOcorrencias(data);
      })
      .catch(() => {
        // ignore
      });

    fetch(`${apiBase}/api/analises-internas`)
      .then((r) => r.json())
      .then(async (data) => {
        if (!Array.isArray(data)) return;
        if (data.length > 0) {
          setInternalAnalyses(data);
          return;
        }

        // Migrate analyses created before shared server storage was added.
        const saved = localStorage.getItem(INTERNAL_ANALYSES_KEY);
        if (!saved) return;
        const localAnalyses = JSON.parse(saved);
        if (!Array.isArray(localAnalyses) || localAnalyses.length === 0) return;
        const migrated = await Promise.all(localAnalyses.map((item) =>
          fetch(`${apiBase}/api/analises-internas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, id: undefined }),
          }).then((response) => response.ok ? response.json() : null).catch(() => null)
        ));
        const validMigrated = migrated.filter(Boolean);
        if (validMigrated.length > 0) setInternalAnalyses(validMigrated.reverse());
      })
      .catch(() => {
        // Keep local analyses available when the API is offline.
      });

    try {
      es = new EventSource(`${apiBase}/api/stream`, { withCredentials: true });
      es.addEventListener('ocorrencias', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data);
          if (Array.isArray(data)) setOcorrencias(data);
        } catch {
          // ignore parse
        }
      });
      es.addEventListener('analises-internas', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data);
          if (Array.isArray(data)) setInternalAnalyses(data);
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
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/operadores`, {
      credentials: 'include',
    })
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

    if (window.location.pathname !== '/ocorrencias') {
      window.history.pushState({}, '', '/ocorrencias');
    }
    setLeftPanelMode('occurrence');
  };

  const handleLockTerminal = async () => {
    setIsAuthenticated(false);
    setIsOperatorModalOpen(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }

    const apiBase = getApiBase();
    try {
      await fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }

    window.history.replaceState({}, '', '/login');
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

  const handleUpdatePassword = async (operadorId: string, newSenha: string, currentSenha = ''): Promise<boolean> => {
    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/operadores/${operadorId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ senha: newSenha, senhaAtual: currentSenha }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOperadores((prev) =>
          prev.map((op) => (op.id === operadorId ? { ...op, senha: updated.senha, mustChangePassword: false } : op))
        );
        if (activeOperador.id === operadorId) {
          setActiveOperador((prev) => ({ ...prev, senha: '', mustChangePassword: false }));
        }
        return true;
      }
    } catch (e) {
      // Keep the password change pending until the backend is reachable.
    }
    return false;
  };

  const handleAddOcorrencia = (
    data: Omit<Ocorrencia, 'id'>
  ) => {
    // send to server; server will broadcast update via SSE
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/ocorrencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/ocorrencias/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then(() => {
        setOcorrencias((prev) => prev.filter((o) => o.id !== id));
        if (selectedOcorrencia?.id === id) setSelectedOcorrencia(null);
      })
      .catch(() => {
        // ignore
      });
  };

  const handleUpdateOcorrencia = (id: number, data: Omit<Ocorrencia, 'id'>) => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/ocorrencias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((updated) => {
        setOcorrencias((prev) => prev.map((item) => item.id === id ? updated : item));
        setSelectedOcorrencia(updated);
      });
  };

  const handleAddInternalAnalysis = (item: Omit<InternalAnalysisRecord, 'id'>) => {
    navigateTo('analysis');
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/analises-internas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(item),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível salvar a análise');
        return response.json();
      })
      .then((saved) => setInternalAnalyses((prev) => [saved, ...prev.filter((entry) => entry.id !== saved.id)]))
      .catch(() => setInternalAnalyses((prev) => [{ ...item, id: Date.now() }, ...prev]));
  };

  const handleDeleteInternalAnalysis = (id: number) => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/analises-internas/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível excluir a análise');
        setInternalAnalyses((prev) => prev.filter((item) => item.id !== id));
      })
      .catch(() => setInternalAnalyses((prev) => prev.filter((item) => item.id !== id)));
  };

  const handleUpdateInternalAnalysis = (id: number, data: Omit<InternalAnalysisRecord, 'id'>) => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/analises-internas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((updated) => {
        setInternalAnalyses((prev) => prev.map((item) => item.id === id ? updated : item));
        setSelectedInternalAnalysis(updated);
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

  const handleCreateOccurrence = (data: Omit<Ocorrencia, 'id'>) => {
    handleAddOcorrencia(data);
    setIsCreateModalOpen(false);
  };

  const handleCreateAnalysis = (data: Omit<InternalAnalysisRecord, 'id'>) => {
    handleAddInternalAnalysis(data);
    setIsCreateModalOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        operadores={operadores}
        activeOperador={activeOperador}
        onLoginSuccess={handleLoginSuccess}
        onRegisterOperador={handleAddOperador}
        onUpdatePassword={handleUpdatePassword}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Brand Bar */}
      <Navbar
        totalCount={ocorrencias.length}
        activeOperador={activeOperador}
        onOpenOperatorModal={() => setIsOperatorModalOpen(true)}
        onLockTerminal={handleLockTerminal}
      />

      <main className="flex flex-1 w-full min-h-0">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Setores</p>
          <div className="space-y-1">
            <button type="button" onClick={() => navigateTo('occurrence')} className={`flex w-full items-center gap-2 rounded px-3 py-2.5 text-left text-sm font-bold ${leftPanelMode === 'occurrence' ? 'bg-slate-100 text-[#003366]' : 'text-slate-600 hover:bg-slate-50'}`}><ClipboardList className="h-4 w-4" /> Ocorrências</button>
            <button type="button" onClick={() => navigateTo('analysis')} className={`flex w-full items-center gap-2 rounded px-3 py-2.5 text-left text-sm font-bold ${leftPanelMode === 'analysis' ? 'bg-slate-100 text-[#003366]' : 'text-slate-600 hover:bg-slate-50'}`}><FileSearch className="h-4 w-4" /> Análise interna</button>
          </div>
        </aside>
        <section className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{leftPanelMode === 'occurrence' ? 'Ocorrências' : 'Análises internas'}</h2>
              <p className="text-xs text-slate-500">Registros organizados por data</p>
            </div>
            <button type="button" onClick={() => setIsCreateModalOpen(true)} className="rounded bg-slate-200 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-300">{leftPanelMode === 'occurrence' ? 'Nova Ocorrência' : 'Nova Análise'}</button>
          </div>
          <div className="h-[calc(100vh-9rem)] overflow-y-auto">
            {leftPanelMode === 'analysis' ? <InternalAnalysisList analises={internalAnalyses} onSelectAnalise={setSelectedInternalAnalysis} /> : <OccurrenceList ocorrencias={ocorrencias} onSelectOcorrencia={setSelectedOcorrencia} onDeleteOcorrencia={handleDeleteOcorrencia} />}
          </div>
        </section>
      </main>

      {isCreateModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
        <div className="scrollbar-hidden relative h-[90vh] w-[60vw] min-w-[min(92vw,36rem)] max-w-5xl overflow-y-auto rounded-lg shadow-2xl">
          <button type="button" onClick={() => setIsCreateModalOpen(false)} aria-label="Fechar formulário" className="absolute right-3 top-3 z-10 rounded bg-white/90 p-1 text-slate-500 shadow hover:text-slate-900"><X className="h-4 w-4" /></button>
          {leftPanelMode === 'occurrence' ? <OccurrenceForm onSubmit={handleCreateOccurrence} activeOperador={activeOperador} onClose={() => setIsCreateModalOpen(false)} /> : <InternalAnalysisForm activeOperador={activeOperador?.nome || 'Operador'} onSubmit={handleCreateAnalysis} onClose={() => setIsCreateModalOpen(false)} />}
        </div>
      </div>}

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
          onUpdate={handleUpdateOcorrencia}
        />
      )}

      {selectedInternalAnalysis && (
        <InternalAnalysisDetailModal
          analise={selectedInternalAnalysis}
          onClose={() => setSelectedInternalAnalysis(null)}
          onDelete={handleDeleteInternalAnalysis}
          onUpdate={handleUpdateInternalAnalysis}
        />
      )}
    </div>
  );
}
