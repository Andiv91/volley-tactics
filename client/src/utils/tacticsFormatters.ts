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

export function sortQuestionOptions<T extends { text: string }>(options: T[]): T[] {
  if (!Array.isArray(options)) return [];
  return [...options].sort((a, b) => {
    const getPriority = (txt: string) => {
      const t = (txt || '').toLowerCase();
      if (t.includes('3-2-1')) return 1;
      if (t.includes('3-1-2')) return 2;
      if (t.includes('1-2-2-1') || t.includes('1-2-1-2')) return 3;
      if (t.includes('2-2-2') || t.includes('2-1-2-1')) return 4;
      return 99;
    };
    const pA = getPriority(a.text);
    const pB = getPriority(b.text);
    if (pA !== 99 || pB !== 99) {
      return pA - pB;
    }
    return 0;
  });
}
