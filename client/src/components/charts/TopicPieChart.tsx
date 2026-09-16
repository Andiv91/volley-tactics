import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CircularPieSlice } from '../../types';

interface TopicPieChartProps {
  data: CircularPieSlice[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_COLORS = [
  '#ef4444', // Rojo (K1)
  '#f97316', // Naranja (K2)
  '#8b5cf6', // Púrpura (Percepción)
  '#06b6d4', // Cian (Decisiones)
  '#10b981', // Esmeralda (Ética)
  '#eab308', // Amarillo
  '#ec4899', // Rosa
  '#3b82f6', // Azul
];

export const TopicPieChart: React.FC<TopicPieChartProps> = ({
  data,
  title = 'Dominio de Conocimiento por Tema Táctico',
  subtitle = 'Porcentaje de asertividad y respuestas correctas por categoría evaluada',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center border border-white/10 shadow-xl">
        <p className="text-stone-300 text-sm">No hay datos de respuestas para calcular el gráfico circular.</p>
      </div>
    );
  }

  const averagePercentage = Math.round(
    data.reduce((acc, curr) => acc + curr.percentage, 0) / (data.length || 1)
  );

  // Formateador personalizado para el Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CircularPieSlice;
      return (
        <div className="bg-stone-900/95 border border-white/20 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-white z-50">
          <p className="font-bold text-xs sm:text-sm text-rose-300">{item.name}</p>
          <div className="mt-1 space-y-0.5 text-xs text-stone-200">
            <p>
              Aciertos:{' '}
              <span className="font-bold text-white">
                {item.value} / {item.total}
              </span>
            </p>
            <p>
              Efectividad Táctica:{' '}
              <span className="font-extrabold text-emerald-400">{item.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/15 shadow-2xl flex flex-col items-center w-full overflow-hidden">
      {/* Encabezado */}
      <div className="w-full text-left mb-2">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-rose-200">{subtitle}</p>}
      </div>

      {/* Contenedor del Gráfico Circular sin desbordamientos */}
      <div className="w-full h-64 sm:h-72 relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              animationBegin={100}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  stroke="#4c0519"
                  strokeWidth={2}
                  className="transition-all hover:opacity-85 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Métrica Promedio en el Centro Exacto del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-2xl sm:text-3xl font-black text-white leading-none">
            {averagePercentage}%
          </span>
          <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-1">
            Promedio
          </span>
        </div>
      </div>

      {/* Leyenda responsiva en HTML puro (evita colisiones y superposiciones en cualquier pantalla) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 my-3 px-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-stone-200"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
            />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Tarjetas Desglosadas por Tema con layout responsivo fluido */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
        {data.map((topic, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: topic.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              <span className="text-xs font-semibold text-stone-200 truncate">{topic.name}</span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-2">
              <span className="text-sm font-extrabold text-white">{topic.percentage}%</span>
              <span className="text-[10px] text-stone-400 whitespace-nowrap">
                {topic.value}/{topic.total} correctas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
