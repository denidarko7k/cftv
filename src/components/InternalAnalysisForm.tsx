import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, ImagePlus, Link as LinkIcon, Plus, Settings2, Store, User, X } from 'lucide-react';
import { InternalAnalysisRecord, LOJAS_GRUPO } from '../types';

interface InternalAnalysisFormProps {
  onSubmit: (item: Omit<InternalAnalysisRecord, 'id'>) => void;
  onClose: () => void;
  activeOperador: string;
}

type AnalysisFormData = Omit<InternalAnalysisRecord, 'id'>;
const currentDate = () => new Date().toISOString().slice(0, 10);
const inputClass = 'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelClass = 'mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500';
type SuggestionField = 'procedimentoIncorreto' | 'observacoesAnalista';
type Suggestions = Record<SuggestionField, string[]>;
const SUGGESTIONS_STORAGE_KEY = 'cftv_analise_predefinicoes_v1';
const defaultSuggestions: Suggestions = {
  procedimentoIncorreto: ['Itens não conferidos', 'Cancelamento usando cartão ou código do gerente sem sua presença', 'Devolução processada de forma incorreta, pois ultrapassou o prazo limite de 30 dias. Data: ', 'Devolução não realizada no SAC', 'Colaborador sem autorização'],
  observacoesAnalista: ['Devolução sem a presença física do produto', 'Cliente leva item devolvido', 'Devolução sem a presença de cliente'],
};

export const InternalAnalysisForm: React.FC<InternalAnalysisFormProps> = ({ onSubmit, onClose, activeOperador }) => {
  const [suggestions, setSuggestions] = useState<Suggestions>(() => {
    try {
      const saved = localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
      if (saved) return { ...defaultSuggestions, ...JSON.parse(saved) };
    } catch {
      // Use the built-in suggestions when storage is unavailable.
    }
    return defaultSuggestions;
  });
  const [isManagingSuggestions, setIsManagingSuggestions] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState<Record<SuggestionField, string>>({ procedimentoIncorreto: '', observacoesAnalista: '' });
  const [formData, setFormData] = useState<AnalysisFormData>({
    dataOperacao: currentDate(), dataAnalise: currentDate(), horario: new Date().toTimeString().slice(0, 5),
    loja: '', tipo: '', pdv: '', operador: '', supervisor: '', valor: 0,
    parecer: 'Pendente', status: 'Em analise', motivoOperador: '', procedimentoIncorreto: '',
    observacoesAnalista: '', evidencia: [], onedriveLink: '', imagens: [],
  });
  const [evidenceText, setEvidenceText] = useState('');
  const [imagesLoading, setImagesLoading] = useState(0);
  const [validationError, setValidationError] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
    } catch {
      // Storage quota or disabled.
    }
  }, [suggestions]);

  const update = <K extends keyof AnalysisFormData>(field: K, value: AnalysisFormData[K]) => setFormData((current) => ({ ...current, [field]: value }));

  const addSuggestion = (field: SuggestionField, suggestion: string) => {
    const current = formData[field].trim();
    update(field, current ? `${current}; ${suggestion}` : suggestion);
  };

  const createSuggestion = (field: SuggestionField) => {
    const value = newSuggestion[field].trim();
    if (!value || suggestions[field].includes(value)) return;
    setSuggestions((current) => ({ ...current, [field]: [...current[field], value] }));
    setNewSuggestion((current) => ({ ...current, [field]: '' }));
  };

  const deleteSuggestion = (field: SuggestionField, suggestion: string) => {
    setSuggestions((current) => ({ ...current, [field]: current[field].filter((item) => item !== suggestion) }));
  };

  const handleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    setImagesLoading((current) => current + imageFiles.length);
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setFormData((current) => ({ ...current, imagens: [...(current.imagens || []), String(reader.result)] }));
      reader.onloadend = () => setImagesLoading((current) => Math.max(0, current - 1));
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const removeImage = (index: number) => update('imagens', (formData.imagens || []).filter((_, imageIndex) => imageIndex !== index));

  const save = () => {
    const requiredFields = [
      ['Operador do caixa', formData.operador],
      ['Valor', formData.valor],
      ['Parecer', formData.parecer],
      ['Status', formData.status],
    ];
    const missingField = requiredFields.find(([, value]) => !String(value).trim());
    if (missingField) {
      setValidationError(`Preencha o campo obrigatório: ${missingField[0]}.`);
      return;
    }
    if (formData.valor <= 0) {
      setValidationError('Informe um valor maior que zero.');
      return;
    }
    if (imagesLoading > 0) {
      setValidationError('Aguarde o carregamento das imagens antes de salvar.');
      return;
    }
    setValidationError('');
    onSubmit({ ...formData, evidencia: evidenceText.trim() ? [evidenceText.trim()] : [], onedriveLink: formData.onedriveLink.trim() });
  };

  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white">Nova Análise Interna</h2>
        <button type="button" onClick={onClose} aria-label="Fechar análise interna" className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-4 bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className={labelClass}>Data da operação</label><div className="relative"><Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input type="date" className={`${inputClass} pl-9`} value={formData.dataOperacao} onChange={(e) => update('dataOperacao', e.target.value)} /></div></div>
          <div><label className={labelClass}>Data da análise</label><div className="relative"><Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input type="date" className={`${inputClass} pl-9`} value={formData.dataAnalise} onChange={(e) => update('dataAnalise', e.target.value)} /></div></div>
          <div><label className={labelClass}>Horário</label><div className="relative"><Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input type="time" className={`${inputClass} pl-9`} value={formData.horario} onChange={(e) => update('horario', e.target.value)} /></div></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className={labelClass}>Loja</label><div className="relative"><Store className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><select className={`${inputClass} pl-9`} value={formData.loja} onChange={(e) => update('loja', e.target.value)}><option value="">Selecione</option>{LOJAS_GRUPO.map((loja) => <option key={loja}>{loja}</option>)}</select></div></div>
          <div><label className={labelClass}>Tipo</label><select className={inputClass} value={formData.tipo} onChange={(e) => update('tipo', e.target.value)}><option value="">Selecione o tipo</option><option>Furto</option><option>Devolução</option><option>Cancelamento</option><option>Procedimento incorreto</option><option>Outro</option></select></div>
          <div><label className={labelClass}>PDV</label><input className={inputClass} value={formData.pdv} onChange={(e) => update('pdv', e.target.value)} placeholder="01" /></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label className={labelClass}>Operador do caixa</label><div className="relative"><User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input required className={`${inputClass} pl-9`} value={formData.operador} onChange={(e) => update('operador', e.target.value)} placeholder="Nome do operador" /></div></div>
          <div><label className={labelClass}>Supervisor</label><input className={inputClass} value={formData.supervisor} onChange={(e) => update('supervisor', e.target.value)} placeholder="Nome do supervisor" /></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className={labelClass}>Valor (R$)</label><div className="relative"><DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input required type="number" min="0" step="0.01" className={`${inputClass} pl-9`} value={formData.valor === 0 ? '' : formData.valor} onChange={(e) => update('valor', e.target.value === '' ? 0 : Number(e.target.value))} /></div></div>
          <div><label className={labelClass}>Parecer</label><select required className={inputClass} value={formData.parecer} onChange={(e) => update('parecer', e.target.value)}><option>Pendente</option><option>Suspeito</option><option>Procedimento incorreto</option></select></div>
          <div><label className={labelClass}>Status</label><select required className={inputClass} value={formData.status} onChange={(e) => update('status', e.target.value)}><option>Em analise</option><option>Concluido</option></select></div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Predefinições de preenchimento</span><button type="button" onClick={() => setIsManagingSuggestions((current) => !current)} className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"><Settings2 className="h-3 w-3" /> {isManagingSuggestions ? 'Fechar gerenciamento' : 'Gerenciar'}</button></div>
        {isManagingSuggestions && <div className="grid gap-2 rounded border border-blue-200 bg-blue-50 p-3 sm:grid-cols-2">{(['procedimentoIncorreto', 'observacoesAnalista'] as const).map((field) => { const labels = { procedimentoIncorreto: 'Procedimento incorreto', observacoesAnalista: 'Observações do analista' }; return <div key={field}><span className="mb-1 block text-[10px] font-bold uppercase text-blue-800">{labels[field]}</span><div className="flex gap-1"><input className="min-w-0 flex-1 rounded border border-blue-200 bg-white px-2 py-1 text-[11px]" placeholder="Nova predefinição" value={newSuggestion[field]} onChange={(event) => setNewSuggestion((current) => ({ ...current, [field]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); createSuggestion(field); } }} /><button type="button" onClick={() => createSuggestion(field)} className="rounded bg-[#003366] px-2 text-white" title="Adicionar predefinição"><Plus className="h-3.5 w-3.5" /></button></div></div>; })}</div>}
        <div><label className={labelClass}>Motivo do operador</label><textarea className={`${inputClass} min-h-[70px]`} value={formData.motivoOperador} onChange={(e) => update('motivoOperador', e.target.value)} placeholder="Motivo declarado pelo operador..." /></div>
        {(['procedimentoIncorreto', 'observacoesAnalista'] as const).map((field) => {
          const labels = { procedimentoIncorreto: 'Procedimento incorreto', observacoesAnalista: 'Observações do analista' };
          const placeholders = { procedimentoIncorreto: 'Descreva o que foi feito incorretamente...', observacoesAnalista: 'Observações técnicas do analista...' };
          return <div key={field}><label className={labelClass}>{labels[field]}</label><textarea className={`${inputClass} min-h-[70px]`} value={formData[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholders[field]} /><div className="mt-1 flex flex-wrap gap-1">{suggestions[field].map((suggestion) => <span key={suggestion} className="inline-flex items-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600"><button type="button" onClick={() => addSuggestion(field, suggestion)} className="px-2 py-1 hover:bg-blue-50">+ {suggestion}</button>{isManagingSuggestions && <button type="button" onClick={() => deleteSuggestion(field, suggestion)} aria-label={`Apagar predefinição ${suggestion}`} className="border-l border-slate-200 px-1.5 py-1 font-bold text-red-500 hover:bg-red-50">×</button>}</span>)}</div></div>;
        })}
        <div><label className={labelClass}>Evidência</label><div className="relative"><FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className={`${inputClass} pl-9`} value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} placeholder="Descreva a evidência encontrada" /></div></div>
        <div><label className={labelClass}>Link fixo do OneDrive</label><div className="relative"><LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input type="url" className={`${inputClass} pl-9`} value={formData.onedriveLink} onChange={(e) => update('onedriveLink', e.target.value)} placeholder="https://..." /></div><p className="mt-1 text-[11px] text-slate-500">Esse link ficará salvo e aparecerá nos detalhes da análise.</p></div>
        <div><label className={labelClass}>Imagens da análise</label><label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:bg-blue-50"><ImagePlus className="h-4 w-4" /> {imagesLoading > 0 ? 'Carregando imagens...' : 'Adicionar imagens'}<input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} disabled={imagesLoading > 0} /></label>{(formData.imagens || []).length > 0 && <div className="mt-2 grid grid-cols-3 gap-2">{formData.imagens?.map((image, index) => <div key={`${image.slice(0, 20)}-${index}`} className="relative"><img src={image} alt={`Evidência ${index + 1}`} className="h-20 w-full rounded border border-slate-200 object-cover" /><button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">X</button></div>)}</div>}</div>
        {validationError && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{validationError}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-2"><button type="button" onClick={onClose} className="rounded border border-slate-300 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100">Cancelar</button><button type="button" onClick={save} disabled={imagesLoading > 0} className="rounded bg-[#003366] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#002244] disabled:cursor-not-allowed disabled:opacity-50">{imagesLoading > 0 ? 'Aguarde...' : 'Salvar análise'}</button></div>
      </div>
    </div>
  );
};
