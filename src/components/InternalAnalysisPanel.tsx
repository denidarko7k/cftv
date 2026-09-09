import React from 'react';
import {
  Calendar,
  Clock,
  Store,
  User,
  Shield,
  FileText,
  DollarSign,
  Upload,
  X,
  Check,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react';

export const InternalAnalysisPanel: React.FC = () => {
  return (
    <div className="bg-white rounded shadow-xs border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
        <h2 className="text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2">
          <span>Nova Análise Interna</span>
        </h2>
        <button
          type="button"
          className="text-slate-300 hover:text-white rounded p-1 hover:bg-slate-700 transition cursor-pointer"
          aria-label="Fechar análise interna"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Data Operação
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">09/09/2026</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Data Análise
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">09/09/2026</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Horário
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Hora</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Loja
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <Store className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Selecione</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Tipo
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Selecione o tipo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                PDV
              </label>
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                01
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Código
              </label>
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                Cupom
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Operador do Caixa
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Nome do operador</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Supervisor
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Nome do supervisor</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Valor (R$)
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">R$ 0,00</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Parecer
            </label>
            <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              Pendente
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Status
            </label>
            <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              Selecione
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Motivo do Operador
            </label>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <textarea className="w-full mt-1 min-h-[70px] border border-slate-300 rounded bg-white px-3 py-2 text-sm text-slate-700" placeholder="Motivo declarado pelo operador..." />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Procedimento Incorreto
            </label>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <textarea className="w-full mt-1 min-h-[70px] border border-slate-300 rounded bg-white px-3 py-2 text-sm text-slate-700" placeholder="Descreva o que foi feito incorretamente..." />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Observações do Analista
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <textarea className="w-full mt-1 min-h-[80px] border border-slate-300 rounded bg-white px-3 py-2 text-sm text-slate-700" placeholder="Observações técnicas do analista..." />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Evidência
            </span>
            <button className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100">
              <Upload className="w-3.5 h-3.5" />
              Anexar
            </button>
          </div>
          <div className="mt-2 border border-dashed border-slate-300 rounded bg-white p-3">
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">+ Devolução processada de forma incorreta</span>
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">+ Cancelamento usando cartão</span>
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">+ Colaborador sem autorização</span>
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">+ Novo</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="rounded border border-slate-300 px-4 py-2 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100">
            Cancelar
          </button>
          <button className="rounded bg-[#003366] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#002244]">
            Salvar Análise
          </button>
        </div>
      </div>
    </div>
  );
};
