import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Package,
  Video,
  Info,
  User,
  Store,
  Calendar,
  Clock,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { FormStepData, Ocorrencia, SituacaoOcorrencia, SolicitanteTipo, TipoOcorrencia, Operador, LOJAS_GRUPO } from '../types';

interface OccurrenceFormProps {
  onSubmit: (ocorrencia: Omit<Ocorrencia, 'id'>) => void;
  activeOperador?: Operador;
}

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const INITIAL_FORM: FormStepData = {
  tipo: '',
  loja: '',
  data: getTodayDate(),
  horario: getCurrentTime(),
  descricao: '',
  solicitante_tipo: '',
  solicitante_nome: '',
  situacao: '',
  items: [],
  finalizador: '',
  midia: '',
};

export const OccurrenceForm: React.FC<OccurrenceFormProps> = ({ onSubmit, activeOperador }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormStepData>(() => ({
    ...INITIAL_FORM,
    finalizador: activeOperador?.nome || '',
  }));
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Keep finalizador strictly tied to activeOperator
  useEffect(() => {
    if (activeOperador?.nome) {
      setFormData((prev) => ({
        ...prev,
        finalizador: activeOperador.nome,
      }));
    }
  }, [activeOperador?.nome]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleSetCurrentDateTime = () => {
    setFormData((prev) => ({
      ...prev,
      data: getTodayDate(),
      horario: getCurrentTime(),
    }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.tipo) {
        setErrorMessage('Por favor, selecione o tipo de ocorrência.');
        return false;
      }
      if (!formData.loja.trim()) {
        setErrorMessage('Por favor, informe a loja da ocorrência.');
        return false;
      }
      if (!formData.data) {
        setErrorMessage('Por favor, informe a data da ocorrência.');
        return false;
      }
      if (!formData.horario) {
        setErrorMessage('Por favor, informe o horário da ocorrência.');
        return false;
      }
      if (!formData.descricao.trim()) {
        setErrorMessage('Por favor, forneça uma descrição breve do ocorrido.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.solicitante_tipo) {
        setErrorMessage('Por favor, selecione quem solicitou a verificação.');
        return false;
      }
      if (!formData.solicitante_nome.trim()) {
        setErrorMessage('Por favor, informe o nome do solicitante.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.situacao) {
        setErrorMessage('Por favor, escolha a situação da ocorrência.');
        return false;
      }
      if (formData.situacao === 'Roubo Confirmado') {
        const items = formData.items || [];
        if (items.length === 0) {
          setErrorMessage('Para roubo confirmado, adicione pelo menos um item furtado.');
          return false;
        }
        const total = items.reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0);
        if (total <= 0) {
          setErrorMessage('Para roubo confirmado, informe o valor aproximado do prejuízo para os itens.');
          return false;
        }
      }
    }
    setErrorMessage('');
    return true;
  };

  const nextStep = (targetStep: number) => {
    if (validateStep(currentStep)) {
      setCurrentStep(targetStep);
    }
  };

  const prevStep = (targetStep: number) => {
    setErrorMessage('');
    setCurrentStep(targetStep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Combine date and time
    let combinedDataHora = new Date().toISOString();
    if (formData.data && formData.horario) {
      try {
        const d = new Date(`${formData.data}T${formData.horario}:00`);
        if (!isNaN(d.getTime())) {
          combinedDataHora = d.toISOString();
        }
      } catch {
        combinedDataHora = new Date().toISOString();
      }
    }

    const fixedResponsible = activeOperador?.nome || formData.finalizador || 'Operador CFTV';

    onSubmit({
      tipo: formData.tipo as TipoOcorrencia,
      loja: formData.loja.trim(),
      descricao: formData.descricao.trim(),
      solicitante_tipo: formData.solicitante_tipo as SolicitanteTipo,
      solicitante_nome: formData.solicitante_nome.trim(),
      situacao: formData.situacao as SituacaoOcorrencia,
      produto: (formData.items && formData.items.length > 0) ? formData.items.map(i => i.produto).filter(Boolean).join('; ') : undefined,
      valor: (formData.items && formData.items.length > 0) ? formData.items.reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0) : 0,
      finalizador: fixedResponsible,
      midia: formData.midia.trim() || undefined,
      dataHora: combinedDataHora,
    });

    // Reset to step 1
    setFormData({
      ...INITIAL_FORM,
      data: getTodayDate(),
      horario: getCurrentTime(),
      finalizador: activeOperador?.nome || '',
    });
    setCurrentStep(1);
    setSuccessNotice('Ocorrência registrada com sucesso no sistema!');
    setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);
  };

  const stepTitles = [
    { num: 1, title: 'Ocorrência', icon: FileText },
    { num: 2, title: 'Solicitante', icon: UserCheck },
    { num: 3, title: 'Situação', icon: AlertTriangle },
    { num: 4, title: 'Finalização', icon: CheckCircle2 },
  ];

  const currentOperatorName = activeOperador?.nome || formData.finalizador || 'Operador CFTV';

  return (
    <div className="flex flex-col gap-4">
      {/* Form Card with Professional Polish styling */}
      <div className="bg-white rounded shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        {/* Card Header matching Design HTML: bg-slate-100 px-4 py-3 border-b border-slate-200 */}
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
            Nova Ocorrência
          </h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">
            ETAPA {currentStep} DE 4
          </span>
        </div>

        {/* Card Body matching Design HTML: p-5 space-y-4 */}
        <div className="p-5 space-y-4">
          {/* Step Progress Pill Bars */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((stepNum) => (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) {
                      prevStep(stepNum);
                    } else if (stepNum === currentStep + 1 && validateStep(currentStep)) {
                      nextStep(stepNum);
                    }
                  }}
                  className={`w-8 h-1.5 rounded-full transition-all cursor-pointer ${
                    currentStep >= stepNum ? 'bg-[#003366]' : 'bg-slate-200'
                  }`}
                  title={`Ir para etapa ${stepNum}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {stepTitles[currentStep - 1].title}
            </span>
          </div>

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded flex items-center gap-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="occForm" onSubmit={handleSubmit} className="space-y-4">
            {/* ETAPA 1: TIPO DE OCORRÊNCIA, LOJA, DATA E HORÁRIO */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Tipo de Evento */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Tipo de Evento <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o tipo...</option>
                    <option value="Furto">Furto</option>
                    <option value="Suspeita de furto">Suspeita de furto</option>
                    <option value="Tentativa de furto">Tentativa de furto</option>
                    <option value="Consumo em loja/furto">Consumo em loja / Furto</option>
                    <option value="Furto PDVs">Furto PDVs</option>
                    <option value="Tentativa de furto PDVs">Tentativa de furto PDVs</option>
                  </select>
                </div>

                {/* Loja da Ocorrência (Grupo possui do 01 ao 16) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#003366]" />
                      <span>Loja</span>
                      <span className="text-red-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Lojas 01 a 16
                    </span>
                  </div>

                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    name="loja"
                    value={formData.loja}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione a loja (Loja 01 a Loja 16)...</option>
                    {LOJAS_GRUPO.map((loja) => (
                      <option key={loja} value={loja}>
                        {loja}
                      </option>
                    ))}
                  </select>

                  {/* Quick selection buttons from 01 to 16 */}
                  <div className="pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Seleção Rápida:
                    </span>
                    <div className="grid grid-cols-8 sm:grid-cols-8 gap-1">
                      {LOJAS_GRUPO.map((loja, idx) => {
                        const num = String(idx + 1).padStart(2, '0');
                        const isSelected = formData.loja === loja;
                        return (
                          <button
                            key={loja}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, loja }));
                              setErrorMessage('');
                            }}
                            className={`py-1 text-center text-[11px] font-mono font-bold rounded border transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#003366] border-[#003366] text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                            title={loja}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Data e Horário da Ocorrência */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#003366]" />
                      <span>Data</span>
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      name="data"
                      value={formData.data}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#003366]" />
                        <span>Horário</span>
                        <span className="text-red-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSetCurrentDateTime}
                        className="text-[10px] text-[#003366] hover:underline font-semibold cursor-pointer"
                        title="Preencher com data e hora atuais"
                      >
                        Definir Agora
                      </button>
                    </div>
                    <input
                      type="time"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      name="horario"
                      value={formData.horario}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Descrição dos Fatos */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Descrição dos Fatos <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    name="descricao"
                    placeholder="Descreva a dinâmica da ocorrência..."
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Inclua corredor, vestimentas, câmeras ou comportamento observado.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full bg-[#003366] text-white py-3 rounded font-bold text-sm hover:bg-[#002244] flex items-center justify-center gap-2 cursor-pointer transition uppercase tracking-wider"
                    onClick={() => nextStep(2)}
                  >
                    <span>PRÓXIMA ETAPA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Origem da Notificação <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    name="solicitante_tipo"
                    value={formData.solicitante_tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione quem acionou...</option>
                    <option value="Operador CFTV">Operador CFTV (Monitoramento Ativo)</option>
                    <option value="Gerente">Gerência da Loja</option>
                    <option value="Segurança">Segurança / Fiscal de Prevenção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Nome do Solicitante <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    name="solicitante_nome"
                    placeholder="Ex: Carlos (Fiscal), Roberto (Gerente)..."
                    value={formData.solicitante_nome}
                    onChange={handleChange}
                    required
                  />
                  {formData.solicitante_tipo === 'Operador CFTV' && activeOperador && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            solicitante_nome: activeOperador.nome,
                          }))
                        }
                        className="text-xs text-[#003366] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Preencher com meu nome ({activeOperador.nome})</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className="w-1/3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                    onClick={() => prevStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    type="button"
                    className="w-2/3 bg-[#003366] text-white py-3 rounded font-bold text-xs uppercase tracking-wider hover:bg-[#002244] flex items-center justify-center gap-2 cursor-pointer transition"
                    onClick={() => nextStep(3)}
                  >
                    <span>PRÓXIMA ETAPA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Desfecho da Ação <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label
                      className={`border rounded-lg p-3.5 flex items-center gap-3 cursor-pointer transition ${
                        formData.situacao === 'Roubo Confirmado'
                          ? 'border-red-500 bg-red-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="situacao"
                        value="Roubo Confirmado"
                        checked={formData.situacao === 'Roubo Confirmado'}
                        onChange={handleChange}
                        className="text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <div>
                        <span className="block text-xs font-bold text-red-700 uppercase">
                          Roubo Confirmado
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Houve evasão com mercadoria
                        </span>
                      </div>
                    </label>

                    <label
                      className={`border rounded-lg p-3.5 flex items-center gap-3 cursor-pointer transition ${
                        formData.situacao === 'Produto Recuperado'
                          ? 'border-green-500 bg-green-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="situacao"
                        value="Produto Recuperado"
                        checked={formData.situacao === 'Produto Recuperado'}
                        onChange={handleChange}
                        className="text-green-600 focus:ring-green-500 h-4 w-4"
                      />
                      <div>
                        <span className="block text-xs font-bold text-green-700 uppercase">
                          Produto Recuperado
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Mercadoria retida ou abandonada
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.situacao === 'Roubo Confirmado' && (
                  <div className="p-3.5 bg-red-50/50 border border-red-200 rounded space-y-3 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-red-800 uppercase flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-red-700" />
                        Itens Furtados / Mercadoria
                      </label>

                      {/* Lista de itens adicionados */}
                      <div className="space-y-2">
                        {(formData.items || []).map((it, idx) => (
                          <div key={idx} className="border border-red-100 rounded p-3 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-xs text-red-700">Item {idx + 1}</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    items: prev.items.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className="text-xs text-red-600 hover:underline"
                                title="Remover item"
                              >
                                Remover
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Produto</label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-2 border border-slate-200 rounded text-sm"
                                  value={it.produto}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const items = [...(prev.items || [])];
                                      items[idx] = { ...items[idx], produto: val };
                                      return { ...prev, items };
                                    });
                                  }}
                                  placeholder="Ex: Whisky Red Label"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Quantidade</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full px-2 py-2 border border-slate-200 rounded text-sm"
                                  value={it.quantidade}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const items = [...(prev.items || [])];
                                      items[idx] = { ...items[idx], quantidade: val };
                                      return { ...prev, items };
                                    });
                                  }}
                                  placeholder="Ex: 2"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Valor (R$)</label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-semibold">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-9 pr-2 py-2 border border-slate-200 rounded text-sm"
                                    value={it.valor}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const items = [...(prev.items || [])];
                                        items[idx] = { ...items[idx], valor: val };
                                        return { ...prev, items };
                                      });
                                    }}
                                    placeholder="Ex: 350.00"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                items: [...(prev.items || []), { produto: '', quantidade: '1', valor: '' }],
                              }))
                            }
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-red-700"
                          >
                            Adicionar item
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total estimado */}
                    <div className="space-y-1 pt-2">
                      <label className="block text-[11px] font-bold text-red-800 uppercase flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-red-700" />
                        Valor Estimado do Prejuízo (R$) <span className="text-red-600">*</span>
                      </label>
                      <div className="p-3 bg-red-50 border border-red-100 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-700 font-semibold">Total estimado</span>
                          <span className="text-sm font-bold text-red-800">R$ {(formData.items || []).reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.situacao === 'Produto Recuperado' && (
                  <div className="p-3.5 bg-green-50/50 border border-green-200 rounded space-y-3 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-green-800 uppercase flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-green-700" />
                        Itens Recuperados / Mercadoria
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-green-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="Ex: Fone de ouvido Bluetooth, Barra de chocolate..."
                        value={(formData.items && formData.items[0] && formData.items[0].produto) || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const items = [...(prev.items || [])];
                            if (!items[0]) items[0] = { produto: '', quantidade: '1', valor: '' };
                            items[0] = { ...items[0], produto: val };
                            return { ...prev, items };
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-green-800 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                        Valor dos Produtos Recuperados (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-semibold">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full pl-9 pr-3 py-2 border border-green-300 rounded text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                          placeholder="Ex: 85.00"
                          value={(formData.items && formData.items[0] && formData.items[0].valor) || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const items = [...(prev.items || [])];
                              if (!items[0]) items[0] = { produto: '', quantidade: '1', valor: '' };
                              items[0] = { ...items[0], valor: val };
                              return { ...prev, items };
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className="w-1/3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                    onClick={() => prevStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    type="button"
                    className="w-2/3 bg-[#003366] text-white py-3 rounded font-bold text-xs uppercase tracking-wider hover:bg-[#002244] flex items-center justify-center gap-2 cursor-pointer transition"
                    onClick={() => nextStep(4)}
                  >
                    <span>PRÓXIMA ETAPA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: RESPONSÁVEL FIXO (OPERADOR LOGADO) & MÍDIA */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {/* Responsável Fixo pelo Registro */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Lock className="w-3.5 h-3.5 text-[#003366]" />
                      Responsável pela Ocorrência
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      FIXO (OPERADOR LOGADO)
                    </span>
                  </label>

                  {/* Card Fixo do Operador Autenticado */}
                  <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {currentOperatorName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Operador em Serviço
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {currentOperatorName}
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Terminal Conectado
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O responsável pela ocorrência é fixado automaticamente pelo operador autenticado no terminal para garantir a integridade do registro.
                  </p>
                </div>

                {/* Link ou Arquivo de Mídia */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">
                    Mídia CFTV (OneDrive ou Arquivo de Vídeo)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Video className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      name="midia"
                      placeholder="Link OneDrive ou Nome do Vídeo"
                      value={formData.midia}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Resumo do Registro */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs space-y-1.5 text-slate-700">
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#003366]" />
                    Resumo do Registro
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className="font-semibold text-slate-800">{formData.tipo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loja / Unidade:</span>
                    <span className="font-semibold text-slate-800">{formData.loja || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Data e Horário:</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {formData.data ? formData.data.split('-').reverse().join('/') : ''} às {formData.horario || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Solicitante:</span>
                    <span className="font-semibold text-slate-800">
                      {formData.solicitante_nome} ({formData.solicitante_tipo})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Situação:</span>
                    <span
                      className={`font-bold ${
                        formData.situacao === 'Roubo Confirmado'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {formData.situacao || '-'}
                    </span>
                  </div>
                  {formData.items && formData.items.length > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Produtos:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={(formData.items || []).map(i => i.produto).join(', ')}>
                          {(formData.items || []).map(i => i.produto).filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valor Total:</span>
                        <span className="font-bold text-slate-800">
                          R$ {(formData.items || []).reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Responsável:</span>
                    <span className="font-bold text-[#003366]">{currentOperatorName}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className="w-1/3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                    onClick={() => prevStep(3)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#cc0000] hover:bg-[#a80000] text-white py-3 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>FINALIZAR OCORRÊNCIA</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Protocolo de Emergência removed per request */}
    </div>
  );
};
