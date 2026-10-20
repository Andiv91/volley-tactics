export function formatQuestionComplexity(difficulty?: string): {
  label: string;
  shortLabel: string;
  badgeClass: string;
  color: string;
} {
  const diff = (difficulty || '').toUpperCase();
  if (diff === 'PRINCIPIANTE' || diff === 'BAJA') {
    return {
      label: 'Situación de Baja Complejidad',
      shortLabel: 'Baja Complejidad',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      color: '#10b981',
    };
  }
  if (diff === 'AVANZADO' || diff === 'ALTA') {
    return {
      label: 'Situación de Alta Complejidad',
      shortLabel: 'Alta Complejidad',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      color: '#f43f5e',
    };
  }
  // Default: Mediana Complejidad
  return {
    label: 'Situación de Mediana Complejidad',
    shortLabel: 'Mediana Complejidad',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    color: '#f59e0b',
  };
}
