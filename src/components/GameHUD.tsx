import React from 'react';
import { Smartphone, MousePointer, Armchair } from 'lucide-react';

interface GameHUDProps {
  isLocked: boolean;
  isSitting: boolean;
  isPhoneOpen: boolean;
  isComputerOpen: boolean;
  hasUnreadMessage?: boolean;
  toastMessage?: string | null;
  onTogglePhone: () => void;
  onRequestLock: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  isLocked,
  isSitting,
  isPhoneOpen,
  isComputerOpen,
  hasUnreadMessage = false,
  toastMessage = null,
  onTogglePhone,
  onRequestLock,
}) => {
  const isOverlayOpen = isPhoneOpen || isComputerOpen;

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 inset-x-0 mx-auto z-50 pointer-events-none flex justify-center px-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900/95 border border-amber-500/40 text-neutral-100 px-4 py-2.5 rounded-xl shadow-2xl font-mono text-xs max-w-md text-center flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Click-to-Play Overlay when pointer is unlocked and no modal is active */}
      {!isLocked && !isOverlayOpen && (
        <div
          onClick={onRequestLock}
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 hover:bg-black/30 transition cursor-pointer select-none"
        >
          <div className="bg-neutral-900/90 border border-neutral-700 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 max-w-sm text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-1">
              <MousePointer className="w-5 h-5 animate-bounce" />
            </div>
            <div className="text-sm font-semibold text-neutral-100 font-mono">
              Click to Control Camera
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Use mouse to look around and WASD to walk. Press <span className="text-emerald-400 font-mono font-bold">P</span> to open phone, or <span className="text-emerald-400 font-mono font-bold">ESC</span> to release mouse.
            </p>
          </div>
        </div>
      )}

      {/* Top Left Title Bar */}
      <div className="fixed top-4 left-4 z-20 pointer-events-none select-none font-mono">
        <div className="bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded border border-neutral-800 text-neutral-300 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold tracking-wide">APT 304</span>
          <span className="text-neutral-500 text-[10px]">| v1.5</span>
        </div>
      </div>

      {/* Sitting State Notification */}
      {isSitting && !isOverlayOpen && (
        <div className="fixed top-14 left-4 z-20 pointer-events-none select-none font-mono">
          <div className="bg-neutral-900/85 px-3 py-1.5 rounded border border-neutral-700 text-neutral-300 text-xs flex items-center gap-2 shadow-md">
            <Armchair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sitting at desk &mdash; Press <b className="text-emerald-400">E</b> to stand up</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Legend */}
      {!isOverlayOpen && (
        <div className="fixed bottom-4 left-4 z-20 pointer-events-none select-none font-mono">
          <div className="bg-black/75 px-3 py-2 rounded-md border border-neutral-800 text-neutral-400 text-[11px] flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-[10px]">
                WASD
              </kbd>
              <span>Move</span>
            </div>
            <span className="text-neutral-700">•</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-[10px]">
                Mouse
              </kbd>
              <span>Look</span>
            </div>
            <span className="text-neutral-700">•</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-[10px]">
                E
              </kbd>
              <span>Interact</span>
            </div>
            <span className="text-neutral-700">•</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-[10px]">
                P
              </kbd>
              <span>Phone</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right Phone Toggle Button */}
      <div className="fixed bottom-4 right-4 z-20 select-none">
        <button
          type="button"
          id="hud-phone-toggle"
          onClick={onTogglePhone}
          className="relative px-3 py-2 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 rounded-lg border border-neutral-700 shadow-xl flex items-center gap-2 text-xs font-mono transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Phone</span>
          {hasUnreadMessage && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <kbd className="px-1 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-400">
            P
          </kbd>
        </button>
      </div>
    </>
  );
};
