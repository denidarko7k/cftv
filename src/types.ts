export type TipoOcorrencia =
  | 'Furto'
  | 'Suspeita de furto'
  | 'Tentativa de furto'
  | 'Consumo em loja/furto'
  | 'Furto PDVs'
  | 'Tentativa de furto PDVs';

export type SolicitanteTipo =
  | 'Operador CFTV'
  | 'Gerente'
  | 'Segurança'
  | 'Outros';

export type SituacaoOcorrencia =
  | 'Roubo Confirmado'
  | 'Produto Recuperado';

export interface Operador {
  id: string;
  nome: string;
  matricula?: string;
  login?: string;
  senha: string;
  posto?: string;
  turno?: string;
  mustChangePassword?: boolean;
}

export interface Ocorrencia {
  id: number;
  tipo: TipoOcorrencia;
  loja: string;
  descricao: string;
  solicitante_tipo: SolicitanteTipo;
  solicitante_nome: string;
  situacao: SituacaoOcorrencia;
  produto?: string;
  valor?: number;
  finalizador: string;
  midia?: string;
  dataHora: string; // ISO string or formatted string
}

export interface InternalAnalysisRecord {
  id: number;
  dataOperacao: string;
  dataAnalise: string;
  horario: string;
  loja: string;
  tipo: string;
  pdv: string;
  operador: string;
  supervisor: string;
  valor: number;
  parecer: string;
  status: string;
  motivoOperador: string;
  procedimentoIncorreto: string;
  observacoesAnalista: string;
  evidencia: string[];
  onedriveLink: string;
  imagens?: string[];
}

export interface FormStepData {
  tipo: TipoOcorrencia | '';
  loja: string;
  data: string;
  horario: string;
  descricao: string;
  solicitante_tipo: SolicitanteTipo | '';
  solicitante_nome: string;
  situacao: SituacaoOcorrencia | '';
  items: Array<{ produto: string; quantidade: string; valor: string }>;
  finalizador: string;
  midia: string;
}

export const LOJAS_GRUPO = [...Array.from({ length: 16 }, (_, i) => `Loja ${String(i + 1).padStart(2, '0')}`), 'Atacado'];
