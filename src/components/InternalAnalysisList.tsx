import React, { useState } from 'react';
import { Search, Download, Store, MoreVertical } from 'lucide-react';
import { InternalAnalysisRecord, LOJAS_GRUPO } from '../types';

interface InternalAnalysisListProps {
  analises: InternalAnalysisRecord[];
  onSelectAnalise: (analise: InternalAnalysisRecord) => void;
}

const formatCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const InternalAnalysisList: React.FC<InternalAnalysisListProps> = ({ analises, onSelectAnalise }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoja, setFilterLoja] = useState('Todas');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterParecer, setFilterParecer] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // KPI computations
  const total = analises.length;
  const suspeitos = analises.filter((a) => a.parecer === 'Suspeito' || a.parecer === 'Pendente').length;
  const procIncorretos = analises.filter((a) => a.procedimentoIncorreto && a.procedimentoIncorreto.trim() !== '').length;
  const valorAnalisado = analises.reduce((acc, a) => acc + (Number(a.valor) || 0), 0);
  const valorEmRisco = analises
    .filter((a) => a.status !== 'Concluido')
    .reduce((acc, a) => acc + (Number(a.valor) || 0), 0);

  // Filtering
  const filtered = analises.filter((a) => {
    const matchLoja = filterLoja === 'Todas' || a.loja === filterLoja;
    const matchTipo = filterTipo === 'Todos' || a.tipo === filterTipo;
    const matchParecer = filterParecer === 'Todos' || a.parecer === filterParecer;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (a.loja || '').toLowerCase().includes(term) ||
      (a.tipo || '').toLowerCase().includes(term) ||
      (a.operador || '').toLowerCase().includes(term) ||
      (a.supervisor || '').toLowerCase().includes(term) ||
      (a.parecer || '').toLowerCase().includes(term);
    return matchLoja && matchTipo && matchParecer && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage);

  const tipos = Array.from(new Set(analises.map((a) => a.tipo))).filter(Boolean);
  const pareceres = Array.from(new Set(analises.map((a) => a.parecer))).filter(Boolean);

  const statusDotColor = (status: string) => {
    if (status === 'Concluido') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const statusTextColor = (status: string) => {
    if (status === 'Concluido') return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800">{total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Suspeitos</p>
          <p className="text-2xl font-bold text-orange-600">{suspeitos}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Proc. Incorretos</p>
          <p className="text-2xl font-bold text-red-600">{procIncorretos}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Valor Analisado</p>
          <p className="text-base font-bold text-slate-800">{formatCurrency(valorAnalisado)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Valor em Risco</p>
          <p className="text-base font-bold text-red-600">{formatCurrency(valorEmRisco)}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            value={filterLoja}
            onChange={(e) => { setFilterLoja(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todas">Loja</option>
            {LOJAS_GRUPO.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={filterTipo}
            onChange={(e) => { setFilterTipo(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Tipo</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterParecer}
            onChange={(e) => { setFilterParecer(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="Todos">Parecer</option>
            {pareceres.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="ml-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 border border-slate-300 rounded px-2.5 py-1.5 bg-white hover:bg-slate-100 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Data Operação</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loja</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auditoria</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">PDV / Código</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operador</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parecer</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Nenhuma análise interna encontrada.</p>
                    <p className="text-xs text-slate-400 mt-1">Registre uma nova análise pelo formulário ao lado.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} onClick={() => onSelectAnalise(item)} className="cursor-pointer hover:bg-slate-50 transition" title="Abrir detalhes da análise">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{item.dataOperacao}</span>
                      <span className="text-[10px] text-slate-400 block">{item.horario}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                        <span className="font-semibold text-slate-800">{item.loja || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Analisado em</span>
                      <span className="text-slate-700 font-medium block">{item.dataAnalise}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{item.pdv || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-medium text-slate-800">{item.operador || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-600">{item.supervisor || '—'}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        {item.tipo || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-mono font-semibold text-slate-800">
                      {formatCurrency(Number(item.valor) || 0)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {item.parecer || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`text-xs font-bold flex items-center gap-1 ${statusTextColor(item.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(item.status)}`} />
                        {item.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onSelectAnalise(item); }}
                        className="p-1.5 text-slate-400 hover:text-[#003366] hover:bg-slate-100 rounded transition cursor-pointer"
                        title="Opções"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>Exibindo {paginated.length} de {filtered.length} registros</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={effectivePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">{effectivePage} / {totalPages}</span>
            <button
              type="button"
              disabled={effectivePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


