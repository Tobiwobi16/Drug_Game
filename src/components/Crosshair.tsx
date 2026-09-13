import React from 'react';

interface CrosshairProps {
  prompt: string | null;
  showCrosshair: boolean;
}

export const Crosshair: React.FC<CrosshairProps> = ({ prompt, showCrosshair }) => {
  if (!showCrosshair) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-20 select-none">
      {/* Center Pixel Crosshair */}
      <div className="relative flex items-center justify-center">
        {/* Dot in center */}
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
            prompt ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-125' : 'bg-white/80'
          }`}
        />
        {/* Subtle crosshair brackets when hovering interactable */}
        {prompt && (
          <div className="absolute w-7 h-7 border border-emerald-400/60 rounded-full animate-pulse" />
        )}
      </div>

      {/* Interaction Prompt Box */}
      {prompt && (
        <div className="mt-8 px-3.5 py-1.5 bg-black/85 border border-emerald-500/80 rounded-md text-emerald-300 font-mono text-xs tracking-wider shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
          <span className="font-semibold">{prompt}</span>
        </div>
      )}
    </div>
  );
};
