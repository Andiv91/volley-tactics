import React from 'react';
import { PerformanceLevel } from '../../types';
import { Award, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface PerformanceBadgeProps {
  level?: PerformanceLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export function getPerformanceConfig(level?: string) {
  switch (level?.toUpperCase()) {
    case 'PROFESIONAL':
      return {
        label: 'Profesional',
        title: 'Nivel Profesional',
        description: 'Dominio táctico avanzado. Resuelve con alta precisión situaciones de juego bajo presión.',
        badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        cardBg: 'from-amber-950/40 via-yellow-900/30 to-black/60 border-amber-500/40',
        textColor: 'text-amber-300',
        icon: Trophy,
      };
    case 'COMPETENTE':
      return {
        label: 'Competente',
        title: 'Nivel Competente',
        description: 'Buen criterio táctico. Aplica decisiones correctas en la mayoría de las fases del juego.',
        badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
        cardBg: 'from-emerald-950/40 via-teal-900/30 to-black/60 border-emerald-500/40',
        textColor: 'text-emerald-300',
        icon: ShieldCheck,
      };
    case 'PRINCIPIANTE':
    default:
      return {
        label: 'Principiante',
        title: 'Nivel Principiante',
        description: 'En formación. Requiere fortalecer lectura de juego y conceptos tácticos esenciales.',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        cardBg: 'from-orange-950/40 via-stone-900/40 to-black/60 border-orange-500/40',
        textColor: 'text-orange-300',
        icon: Award,
      };
  }
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  level = 'PRINCIPIANTE',
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  const config = getPerformanceConfig(level);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] space-x-1',
    md: 'px-3 py-1 text-xs space-x-1.5',
    lg: 'px-4 py-1.5 text-sm space-x-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center font-black uppercase tracking-wider rounded-full border shadow-sm ${config.badgeBg} ${sizeClasses} ${className}`}
      >
        <Icon className={`${iconSizes} flex-shrink-0`} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-stone-300 mt-1 max-w-xs">{config.description}</span>
      )}
    </div>
  );
};
