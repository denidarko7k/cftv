import React, { useState } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  ListFilter,
  Package,
  Store
} from 'lucide-react';
import { Ocorrencia, LOJAS_GRUPO } from '../types';
import { exportOcorrenciasToCSV, formatCurrency } from '../utils/formatters';
import OccurrenceStats from './OccurrenceStats';

interface OccurrenceListProps {
  ocorrencias: Ocorrencia[];
  onSelectOcorrencia: (ocorrencia: Ocorrencia) => void;
  onDeleteOcorrencia: (id: number) => void;
}

export const OccurrenceList: React.FC<OccurrenceListProps> = ({
  ocorrencias,
  onSelectOcorrencia,
  onDeleteOcorrencia,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituacao, setFilterSituacao] = useState<'Todas' | 'Roubo Confirmado' | 'Produto Recuperado'>('Todas');
  const [filterLoja, setFilterLoja] = useState<string>('Todas');

  // Stats calculation
  const totalCount = ocorrencias.length;
  const roubosCount = ocorrencias.filter((o) => o.situacao === 'Roubo Confirmado').length;
  const recuperadosCount = ocorrencias.filter((o) => o.situacao === 'Produto Recuperado').length;
  const totalRecuperado = ocorrencias
    .filter((o) => o.situacao === 'Produto Recuperado')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalPrejuizo = ocorrencias
    .filter((o) => o.situacao === 'Roubo Confirmado')
    .reduce((acc, curr) => acc + (curr.valor || 0), 0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter logic
  const filtered = ocorrencias.filter((occ) => {
    const matchesSituacao =
      filterSituacao === 'Todas' ? true : occ.situacao === filterSituacao;
    const matchesLoja =
      filterLoja === 'Todas' ? true : occ.loja === filterLoja;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesSituacao && matchesLoja;

    const idStr = `#${String(occ.id).padStart(2, '0')}`.toLowerCase();
    const idStrAlt = `#oc-${String(occ.id).padStart(2, '0')}`.toLowerCase();
    const matchesSearch =
      idStr.includes(term) ||
      idStrAlt.includes(term) ||
      (occ.tipo && occ.tipo.toLowerCase().includes(term)) ||
      (occ.loja && occ.loja.toLowerCase().includes(term)) ||
      (occ.produto && occ.produto.toLowerCase().includes(term)) ||
      (occ.solicitante_nome && occ.solicitante_nome.toLowerCase().includes(term)) ||
      (occ.solicitante_tipo && occ.solicitante_tipo.toLowerCase().includes(term)) ||
      (occ.finalizador && occ.finalizador.toLowerCase().includes(term)) ||
      (occ.descricao && occ.descricao.toLowerCase().includes(term));

    return matchesSituacao && matchesLoja && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * itemsPerPage;
  const paginatedList = filtered.slice(startIndex, startIndex + itemsPerPage);

  const formatHorario = (isoStr?: string) => {
    if (!isoStr) return '--:--';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDataCurta = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick KPI stats bar matching Design HTML */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-4 rounded shadow-xs border-l-4 border-blue-500">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Ocorrências Totais
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow-xs border-l-4 border-green-500">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Recuperado / Evitado
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">
            {formatCurrency(totalRecuperado || recuperadosCount * 120)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow-xs border-l-4 border-red-500">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Roubo Confirmado
          </p>
          <div className="flex items-baseline justify-between mt-0.5">
            <p className="text-2xl font-bold text-slate-800">
              {String(roubosCount).padStart(2, '0')}
            </p>
            {totalPrejuizo > 0 && (
              <span className="text-xs font-semibold text-red-600">
                Prejuízo: {formatCurrency(totalPrejuizo)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Container Card matching Design HTML */}
      <div className="bg-white rounded shadow-xs border border-slate-200 flex flex-col overflow-hidden">
        {/* Card Header matching Design HTML: bg-slate-800 px-4 py-3 flex justify-between items-center */}
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2">
            <span>Registros Recentes</span>
            <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
              {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportOcorrenciasToCSV(ocorrencias)}
              className="text-slate-300 hover:text-white uppercase font-bold text-[10px] tracking-wider flex items-center gap-1.5 transition cursor-pointer px-2 py-1 rounded hover:bg-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <div className="ml-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-2 py-1 text-[11px] font-bold rounded ${activeTab === 'table' ? 'bg-white text-slate-800' : 'text-white bg-transparent border border-white/10'}`}>
                Tabela
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`px-2 py-1 text-[11px] font-bold rounded ${activeTab === 'stats' ? 'bg-white text-slate-800' : 'text-white bg-transparent border border-white/10'}`}>
                Estatísticas
              </button>
            </div>
          </div>
        </div>

        {/* Search / Filter Toolbar matching Design HTML */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Buscar por ID (#01), produto furtado, solicitante ou tipo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Store filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2 py-1">
              <Store className="w-3.5 h-3.5 text-[#003366]" />
              <select
                value={filterLoja}
                onChange={(e) => {
                  setFilterLoja(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-[11px] bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas as Lojas</option>
                {LOJAS_GRUPO.map((loja) => (
                  <option key={loja} value={loja}>
                    {loja}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
              <button
                type="button"
                onClick={() => {
                  setFilterSituacao('Todas');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  filterSituacao === 'Todas'
                    ? 'bg-[#003366] text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSituacao('Roubo Confirmado');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  filterSituacao === 'Roubo Confirmado'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Roubos
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSituacao('Produto Recuperado');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  filterSituacao === 'Produto Recuperado'
                    ? 'bg-green-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Recuperados
              </button>
            </div>
          </div>
        </div>

        {/* Body: either table or stats */}
        {activeTab === 'table' ? (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  Data / Hora
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  Loja
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  Tipo de Evento
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  Solicitante
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">
                  Situação
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Nenhum registro encontrado.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || filterSituacao !== 'Todas'
                        ? 'Tente ajustar os filtros ou o termo de busca.'
                        : 'Utilize o formulário para registrar uma nova ocorrência.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((occ) => {
                  const isRoubo = occ.situacao === 'Roubo Confirmado';
                  const formattedId = `#OC-${String(occ.id).padStart(2, '0')}`;

                  return (
                    <tr
                      key={occ.id}
                      className={`hover:bg-slate-50 transition group cursor-pointer ${
                        !isRoubo ? 'bg-green-50/20' : ''
                      }`}
                      onClick={() => onSelectOcorrencia(occ)}
                    >
                      {/* ID with custom badge matching Design HTML */}
                      <td className="px-4 py-3 font-mono">
                        <span className="bg-[#cc0000] text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold tracking-wider">
                          {formattedId}
                        </span>
                      </td>

                      {/* Data / Horário */}
                      <td className="px-4 py-3 font-mono text-slate-600 text-xs whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{formatHorario(occ.dataHora)}</span>
                        {occ.dataHora ? (
                          <span className="text-[10px] text-slate-400 font-sans block">
                            {formatDataCurta(occ.dataHora)}
                          </span>
                        ) : null}
                      </td>

                      {/* Loja */}
                      <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#003366] shrink-0" />
                          <span className="font-semibold text-slate-800" title={occ.loja || '-'}>
                            {occ.loja || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Tipo de Evento */}
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{occ.tipo}</span>
                          {occ.produto && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                              title={`Produto: ${occ.produto}`}
                            >
                              <Package className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{occ.produto}</span>
                            </span>
                          )}
                        </div>
                        {occ.descricao && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-xs font-normal mt-0.5">
                            {occ.descricao}
                          </p>
                        )}
                      </td>

                      {/* Solicitante */}
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-800">{occ.solicitante_nome}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {occ.solicitante_tipo}
                        </span>
                      </td>

                      {/* Situação matching text-red-600 / text-green-600 font-bold */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isRoubo ? (
                          <div>
                            <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              Confirmado
                            </span>
                            {occ.valor ? (
                              <span className="text-[11px] text-slate-500 font-mono block">
                                Prejuízo: {formatCurrency(occ.valor)}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              Recuperado
                            </span>
                            {occ.valor ? (
                              <span className="text-[11px] text-slate-500 font-mono block">
                                {formatCurrency(occ.valor)}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Ver detalhes"
                            onClick={() => onSelectOcorrencia(occ)}
                            className="p-1.5 text-slate-400 hover:text-[#003366] hover:bg-slate-100 rounded transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Excluir ocorrência"
                            onClick={() => {
                              if (
                                confirm(
                                  `Deseja realmente excluir a ocorrência ${formattedId}?`
                                )
                              ) {
                                onDeleteOcorrencia(occ.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-4">
            <OccurrenceStats ocorrencias={ocorrencias} />
          </div>
        )}

        {/* Footer / Pagination matching Design HTML */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>
            Exibindo {paginatedList.length} de {filtered.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={effectivePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">
              {effectivePage} / {totalPages}
            </span>
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
