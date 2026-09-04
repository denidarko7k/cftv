import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Shield,
  FileText,
  DollarSign,
  Package,
  ExternalLink,
  Trash2,
  Printer,
  Copy,
  Check,
  Store,
  ShieldCheck
} from 'lucide-react';
import { Ocorrencia } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface OccurrenceDetailModalProps {
  ocorrencia: Ocorrencia | null;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

export const OccurrenceDetailModal: React.FC<OccurrenceDetailModalProps> = ({
  ocorrencia,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!ocorrencia) return null;

  const handleCopy = () => {
    const text = `OCORRÊNCIA CFTV #${String(ocorrencia.id).padStart(2, '0')}
Tipo: ${ocorrencia.tipo}
Loja: ${ocorrencia.loja || 'Não informada'}
Data/Hora: ${formatDateTime(ocorrencia.dataHora)}
Solicitante: ${ocorrencia.solicitante_nome} (${ocorrencia.solicitante_tipo})
Situação: ${ocorrencia.situacao}
${ocorrencia.produto ? `Produto: ${ocorrencia.produto}\n` : ''}Valor: ${formatCurrency(ocorrencia.valor)}
Responsável: ${ocorrencia.finalizador}
Mídia: ${ocorrencia.midia || 'Não anexada'}
Descrição: ${ocorrencia.descricao}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isUrl =
    ocorrencia.midia &&
    (ocorrencia.midia.startsWith('http://') ||
      ocorrencia.midia.startsWith('https://'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#003366] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#cc0000]">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#cc0000] text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded shadow-2xs tracking-wider">
              #OC-{String(ocorrencia.id).padStart(2, '0')}
            </span>
            <h3 id="modal-title" className="text-base font-bold text-white uppercase tracking-wider">
              Detalhes da Ocorrência
            </h3>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="text-slate-300 hover:text-white rounded p-1 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Key status bar with Loja, Tipo, Situação, Valor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3 h-3 text-[#003366]" />
                Loja / Unidade
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block truncate" title={ocorrencia.loja || '-'}>
                {ocorrencia.loja || '-'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tipo de Evento
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block">
                {ocorrencia.tipo}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Situação
              </span>
              <span
                className={`inline-flex items-center gap-1 mt-0.5 text-xs font-bold ${
                  ocorrencia.situacao === 'Roubo Confirmado'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ocorrencia.situacao === 'Roubo Confirmado'
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                />
                {ocorrencia.situacao}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {ocorrencia.situacao === 'Roubo Confirmado'
                  ? 'Prejuízo'
                  : 'Recuperado'}
              </span>
              <span
                className={`text-xs sm:text-sm font-bold font-mono mt-0.5 block ${
                  ocorrencia.situacao === 'Roubo Confirmado'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {formatCurrency(ocorrencia.valor)}
              </span>
            </div>
          </div>

          {/* Stolen / Recovered Product */}
          {ocorrencia.produto && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#003366]" />
                {ocorrencia.situacao === 'Roubo Confirmado'
                  ? 'Produto(s) Furtado(s) / Mercadoria'
                  : 'Produto(s) Recuperado(s) / Mercadoria'}
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {ocorrencia.produto}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#003366]" />
              Descrição dos Acontecimentos
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ocorrencia.descricao}
            </div>
          </div>

          {/* Solicitante & Finalizador Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#003366]" />
                Solicitante
              </div>
              <p className="text-sm font-bold text-slate-800">
                {ocorrencia.solicitante_nome}
              </p>
              <span className="inline-block text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Origem: {ocorrencia.solicitante_tipo}
              </span>
            </div>

            <div className="p-3 border border-slate-200 rounded bg-white space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Responsável
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                  Fixo
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {ocorrencia.finalizador}
              </p>
              <span className="inline-block text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                Operador Registrado
              </span>
            </div>
          </div>

          {/* Media link */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Registro de Vídeo / Mídia CFTV
            </span>
            {ocorrencia.midia ? (
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <span className="text-xs font-mono text-slate-700 break-all select-all">
                  {ocorrencia.midia}
                </span>
                {isUrl ? (
                  <a
                    href={ocorrencia.midia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-[#003366] text-white px-2.5 py-1 rounded hover:bg-[#002244] transition"
                  >
                    <span>Abrir Mídia</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    Arquivo Local
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Nenhum link ou arquivo de mídia anexado a esta ocorrência.
              </p>
            )}
          </div>

          {/* Date & Time with Store info */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#003366]" />
              <span className="font-medium">Data e Horário:</span>
              <span className="font-mono font-semibold text-slate-800">{formatDateTime(ocorrencia.dataHora)}</span>
            </div>
            {ocorrencia.loja && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>{ocorrencia.loja}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Dados</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    `Tem certeza de que deseja remover a ocorrência #${String(
                      ocorrencia.id
                    ).padStart(2, '0')}?`
                  )
                ) {
                  if (onDelete) onDelete(ocorrencia.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Excluir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#003366] hover:bg-[#002244] rounded transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
