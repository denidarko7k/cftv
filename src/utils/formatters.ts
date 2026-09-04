import { Ocorrencia } from '../types';

export function formatCurrency(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function exportOcorrenciasToCSV(ocorrencias: Ocorrencia[]) {
  const headers = [
    'ID',
    'Tipo',
    'Loja',
    'Data e Hora',
    'Descrição',
    'Solicitante Tipo',
    'Solicitante Nome',
    'Situação',
    'Produto Furtado / Item',
    'Valor (R$)',
    'Responsável (Finalizador)',
    'Mídia'
  ];

  const rows = ocorrencias.map(o => [
    `#${String(o.id).padStart(2, '0')}`,
    `"${(o.tipo || '').replace(/"/g, '""')}"`,
    `"${(o.loja || '').replace(/"/g, '""')}"`,
    formatDateTime(o.dataHora),
    `"${(o.descricao || '').replace(/"/g, '""')}"`,
    `"${(o.solicitante_tipo || '').replace(/"/g, '""')}"`,
    `"${(o.solicitante_nome || '').replace(/"/g, '""')}"`,
    `"${(o.situacao || '').replace(/"/g, '""')}"`,
    `"${(o.produto || '').replace(/"/g, '""')}"`,
    (o.valor ?? 0).toFixed(2),
    `"${(o.finalizador || '').replace(/"/g, '""')}"`,
    `"${(o.midia || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    '\uFEFF' + headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ocorrencias_cftv_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
