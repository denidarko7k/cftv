import React from 'react';
import {
  Calendar,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Printer,
  Store,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { InternalAnalysisRecord } from '../types';

interface InternalAnalysisDetailModalProps {
  analise: InternalAnalysisRecord | null;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

const formatCurrency = (value: number) =>
  (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DetailBlock: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div className="rounded border border-slate-200 bg-slate-50 p-3">
    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
    <span className="mt-1 block whitespace-pre-wrap text-sm font-semibold text-slate-800">{value || 'Não informado'}</span>
  </div>
);

export const InternalAnalysisDetailModal: React.FC<InternalAnalysisDetailModalProps> = ({
  analise,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!analise) return null;

  const copyData = () => {
    const text = `ANÁLISE INTERNA #${String(analise.id).padStart(2, '0')}
Loja: ${analise.loja || 'Não informada'}
Tipo: ${analise.tipo || 'Não informado'}
Data da operação: ${analise.dataOperacao || 'Não informada'}
Parecer: ${analise.parecer || 'Não informado'}
Status: ${analise.status || 'Não informado'}
Valor: ${formatCurrency(analise.valor)}
Link OneDrive: ${analise.onedriveLink || 'Não informado'}
Observações: ${analise.observacoesAnalista || 'Não informado'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Tem certeza de que deseja remover a análise #${String(analise.id).padStart(2, '0')}?`)) {
      onDelete(analise.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="internal-analysis-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#cc0000] bg-[#003366] px-5 py-3.5 text-white">
          <div>
            <span className="rounded bg-[#cc0000] px-2 py-0.5 font-mono text-xs font-bold">#AI-{String(analise.id).padStart(2, '0')}</span>
            <h3 id="internal-analysis-title" className="mt-1 text-base font-bold uppercase tracking-wider">Detalhes da Análise Interna</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailBlock label="Loja" value={analise.loja} />
            <DetailBlock label="Tipo" value={analise.tipo} />
            <DetailBlock label="Parecer" value={analise.parecer} />
            <DetailBlock label="Status" value={analise.status} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DetailBlock label="Data da operação" value={analise.dataOperacao} />
            <DetailBlock label="Data da análise" value={analise.dataAnalise} />
            <DetailBlock label="Horário" value={analise.horario} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailBlock label="PDV" value={analise.pdv} />
            <DetailBlock label="Valor" value={formatCurrency(analise.valor)} />
            <DetailBlock label="Operador" value={analise.operador} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailBlock label="Motivo do operador" value={analise.motivoOperador} />
            <DetailBlock label="Procedimento incorreto" value={analise.procedimentoIncorreto} />
          </div>
          <DetailBlock label="Observações do analista" value={analise.observacoesAnalista} />

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <FileText className="h-3.5 w-3.5 text-[#003366]" /> Evidências
            </span>
            <p className="mt-1 text-sm text-slate-800">{analise.evidencia?.join(', ') || 'Nenhuma evidência informada.'}</p>
          </div>

          <div className="rounded border border-blue-200 bg-blue-50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">Link fixado do OneDrive</span>
            {analise.onedriveLink ? (
              <a href={analise.onedriveLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm font-semibold text-blue-800 underline">
                {analise.onedriveLink}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <p className="mt-1 text-sm italic text-slate-500">Nenhum link OneDrive informado.</p>
            )}
          </div>

          {(analise.imagens || []).length > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Imagens anexadas</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {analise.imagens?.map((image, index) => <a key={`${image.slice(0, 20)}-${index}`} href={image} target="_blank" rel="noopener noreferrer"><img src={image} alt={`Evidência ${index + 1}`} className="h-28 w-full rounded border border-slate-200 object-cover hover:opacity-80" /></a>)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#003366]" /> Analisado em {analise.dataAnalise || 'Não informado'}</span>
            <span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5 text-[#003366]" /> {analise.loja || 'Loja não informada'}</span>
            <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5 text-[#003366]" /> {analise.supervisor || 'Supervisor não informado'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-100 px-6 py-3.5">
          <div className="flex gap-2">
            <button type="button" onClick={copyData} className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              {copied ? 'Copiado!' : 'Copiar dados'}
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Printer className="h-3.5 w-3.5 text-slate-500" /> Imprimir
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
            <button type="button" onClick={onClose} className="rounded bg-[#003366] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#002244]">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};
