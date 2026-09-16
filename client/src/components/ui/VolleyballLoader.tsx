import React from 'react';

interface VolleyballLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const VolleyballLogo: React.FC<{ className?: string; size?: number; spinning?: boolean }> = ({
  className = '',
  size = 48,
  spinning = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <img
        src="/icons/fondoblanco.png"
        alt="Balón de Voleibol"
        width={size}
        height={size}
        className={`object-contain drop-shadow-md select-none pointer-events-none transition-transform duration-500 ${
          spinning ? 'animate-[spin_4s_linear_infinite]' : ''
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    </div>
  );
};

export const VolleyballLoader: React.FC<VolleyballLoaderProps> = ({
  size = 'md',
  text = 'Cargando táctica de voleibol...',
}) => {
  const pixelSize = size === 'sm' ? 40 : size === 'lg' ? 76 : 56;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex flex-col items-center">
        {/* Bouncing & 360 Spinning Volleyball */}
        <div className="animate-volleyball-bounce">
          <img
            src="/icons/fondoblanco.png"
            alt="Cargando"
            width={pixelSize}
            height={pixelSize}
            className="animate-[spin_2.5s_linear_infinite] drop-shadow-2xl select-none pointer-events-none"
            style={{
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
            }}
          />
        </div>

        {/* Dynamic Squishing Court Shadow */}
        <div className="w-10 h-2 bg-black/50 rounded-full blur-[2px] animate-shadow-squish mt-1" />
      </div>

      {text && (
        <p className="text-xs sm:text-sm font-bold tracking-wider text-rose-100 uppercase animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
};
