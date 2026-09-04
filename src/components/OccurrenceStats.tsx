import React from 'react';
import { Ocorrencia } from '../types';

interface Props {
  ocorrencias: Ocorrencia[];
}

function getLastNMonths(n: number) {
  const now = new Date();
  const months: { label: string; year: number; month: number }[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
    months.push({ label, year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export const OccurrenceStats: React.FC<Props> = ({ ocorrencias }) => {
  const months = getLastNMonths(6);

  const data = months.map((m) => {
    const roubos = ocorrencias.filter((o) => {
      if (!o.dataHora) return false;
      const d = new Date(o.dataHora);
      return d.getFullYear() === m.year && d.getMonth() === m.month && o.situacao === 'Roubo Confirmado';
    }).length;

    const recuperados = ocorrencias.filter((o) => {
      if (!o.dataHora) return false;
      const d = new Date(o.dataHora);
      return d.getFullYear() === m.year && d.getMonth() === m.month && o.situacao === 'Produto Recuperado';
    }).length;

    return { label: m.label, roubos, recuperados };
  });

  const rawMax = Math.max(1, ...data.flatMap((d) => [d.roubos, d.recuperados]));

  // Determine display maximum with ceiling 100. If data exceeds 100,
  // pick a "nice" rounded value above the raw max (e.g., next multiple
  // of 10/100 depending on magnitude) so the axis keeps reasonable ticks.
  function niceCeil(v: number) {
    if (v <= 100) return 100;
    const exp = Math.floor(Math.log10(v));
    const base = Math.pow(10, exp);
    // round up to nearest base (10, 100, 1000...) or a multiple thereof
    return Math.ceil((v + 1) / base) * base;
  }

  const maxVal = niceCeil(rawMax);
  const ticksCount = 4;
  const step = Math.max(1, Math.ceil(maxVal / ticksCount));
  const ticks: number[] = [];
  for (let v = 0; v <= maxVal; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < maxVal) ticks.push(maxVal);

  const width = 700;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 40 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;

  const groupWidth = chartW / data.length;
  const barWidth = Math.max(8, Math.min(36, (groupWidth * 0.6) / 2));

  const legendWidth = 260;
  const legendX = margin.left + chartW / 2 - legendWidth / 2;

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold mb-3">Estatísticas Mensais</h3>
      <div className="flex items-center justify-center gap-6 mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#dc2626]"></span>
          <span className="text-sm text-slate-200">Roubo Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#16a34a]"></span>
          <span className="text-sm text-slate-200">Produto Recuperado</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y axis labels */}
          {ticks.map((tick) => {
            const y = chartH - (tick / maxVal) * chartH;
            return (
              <g key={tick}>
                <line x1={0} x2={chartW} y1={y} y2={y} stroke="#eee" />
                <text x={-8} y={y + 4} fontSize={11} textAnchor="end" fill="#6b7280">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const center = i * groupWidth + groupWidth / 2;
            const xLeft = center - (barWidth + 4) / 2 - 4;
            const xRight = center + (barWidth + 4) / 2 - barWidth;
            const hR = (d.roubos / maxVal) * chartH;
            const hRec = (d.recuperados / maxVal) * chartH;
            return (
              <g key={d.label}>
                <rect x={xLeft} y={chartH - hR} width={barWidth} height={hR} fill="#dc2626" rx={3} />
                <rect x={xRight} y={chartH - hRec} width={barWidth} height={hRec} fill="#16a34a" rx={3} />

                {/* value labels */}
                {d.roubos > 0 && (
                  <text x={xLeft + barWidth / 2} y={chartH - hR - 6} fontSize={11} textAnchor="middle" fill="#111">{d.roubos}</text>
                )}
                {d.recuperados > 0 && (
                  <text x={xRight + barWidth / 2} y={chartH - hRec - 6} fontSize={11} textAnchor="middle" fill="#111">{d.recuperados}</text>
                )}

                {/* month label */}
                <text x={center} y={chartH + 18} fontSize={11} textAnchor="middle" fill="#374151">
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Legend moved to HTML above SVG for consistent layout */}
      </svg>
    </div>
  );
};

export default OccurrenceStats;
