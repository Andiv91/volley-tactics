import React from 'react';

export const VolleyballHeroBackground: React.FC<{ children: React.ReactNode; showAthletes?: boolean }> = ({
  children,
  showAthletes = true,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#7f1325] via-[#a11630] to-[#590a19] text-white">
      {/* Background Decorative Patterns */}

      {/* 1. Left Dot Grid Pattern */}
      <div className="absolute top-20 left-4 md:left-12 w-32 h-64 bg-dot-matrix pointer-events-none opacity-40" />
      <div className="absolute bottom-16 left-6 w-24 h-48 bg-dot-matrix-dense pointer-events-none opacity-30" />

      {/* 2. Right Dot Grid Matrix */}
      <div className="absolute top-16 right-8 md:right-16 w-36 h-72 bg-dot-matrix-dense pointer-events-none opacity-35" />

      {/* 3. Concentric Arc Lines (Top Left) */}
      <svg
        className="absolute -top-16 -left-16 w-96 h-96 pointer-events-none opacity-20"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="100" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="150" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="220" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="300" stroke="#ffffff" strokeWidth="1" />
      </svg>

      {/* 4. Diagonal Athletic Action Vectors */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="0" y1="180" x2="800" y2="40" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="300" y1="600" x2="1200" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 6" />
        <line x1="100" y1="900" x2="900" y2="300" stroke="#ffffff" strokeWidth="1.2" />
      </svg>

      {/* 5. Right Action Imagery / Dynamic Sports Volleyball Cutouts (when enabled) */}
      {showAthletes && (
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden select-none">
          {/* Subtle athlete silhouettes and action photos blending into the red curves */}
          <div className="absolute right-[-5%] top-[10%] w-[520px] h-[580px] rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          
          <img
            src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1000&q=80"
            alt="Volleyball Action"
            className="absolute right-8 top-16 w-[420px] h-[340px] object-cover rounded-3xl opacity-35 mix-blend-luminosity rotate-2 shadow-2xl border-2 border-white/20"
          />

          <img
            src="https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80"
            alt="Spike Attack"
            className="absolute right-36 bottom-28 w-[360px] h-[300px] object-cover rounded-3xl opacity-30 mix-blend-overlay -rotate-3 shadow-2xl border border-white/20"
          />
        </div>
      )}

      {/* 6. Soft Organic Wave Shapes at Bottom (Faithful to Reference Image) */}
      <div className="absolute -bottom-10 right-0 w-[650px] h-[320px] pointer-events-none">
        <svg viewBox="0 0 600 300" fill="none" className="w-full h-full">
          <path
            d="M0,180 C150,90 250,260 420,170 C510,120 560,200 600,160 L600,300 L0,300 Z"
            fill="#e11d48"
            fillOpacity="0.85"
          />
          <path
            d="M60,210 C190,140 280,290 460,210 C530,170 580,240 600,210 L600,300 L60,300 Z"
            fill="#f43f5e"
            fillOpacity="0.6"
          />
          <path
            d="M120,240 C240,190 320,300 500,240 C560,210 590,260 600,240 L600,300 L120,300 Z"
            fill="#fb7185"
            fillOpacity="0.4"
          />
        </svg>
      </div>

      {/* Main Foreground Content */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};
