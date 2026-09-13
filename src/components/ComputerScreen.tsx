import React, { useState, useEffect, useRef } from 'react';
import { playClickSound } from '../game/sound';
import { Monitor, Terminal, FileText, Trash2, Folder, X, Minus, Square } from 'lucide-react';

interface ComputerScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComputerScreen: React.FC<ComputerScreenProps> = ({ isOpen, onClose }) => {
  const [activeWindow, setActiveWindow] = useState<'readme' | 'terminal' | null>(null);
  const [currentTime, setCurrentTime] = useState('11:42 PM');
  const openTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = performance.now();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Intercept Windows / Meta keys to prevent Windows Start menu from opening
      if (e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Intercept Alt alone to prevent browser/OS system menu bar activation
      if ((e.code === 'AltLeft' || e.code === 'AltRight' || e.key === 'Alt') && !e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Prevent Tab from shifting focus outside the computer screen
      if (e.code === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // ESC: Close computer screen ONLY, consume event immediately and prevent propagation
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setActiveWindow(null);
        onClose();
        return;
      } else if (e.code === 'KeyE' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Only allow KeyE to exit if at least 300ms have passed since opening
        if (performance.now() - openTimeRef.current > 300) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setActiveWindow(null);
          onClose();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="retro-computer-overlay"
      className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4 select-none backdrop-blur-xs font-mono"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* CRT Monitor Outer Casing */}
      <div className="w-full max-w-4xl h-[640px] bg-[#d9d5c1] rounded-2xl p-6 shadow-2xl border-4 border-[#b8b39d] flex flex-col relative">
        {/* CRT Brand Badge & LED */}
        <div className="absolute top-2 left-6 text-[10px] text-[#787563] font-bold tracking-widest uppercase">
          RetroVision 1998 CRT
        </div>
        <div className="absolute top-2 right-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-[#787563]">POWER ON</span>
        </div>

        {/* CRT Glass Curved Bezel */}
        <div className="flex-1 bg-[#008080] rounded-lg overflow-hidden border-4 border-[#2b2a25] relative flex flex-col shadow-inner">
          {/* CRT Scanline Overlay Effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20" />

          {/* Top Exit Hint Bar */}
          <div className="bg-neutral-900/90 text-neutral-300 text-xs px-3 py-1.5 flex items-center justify-between z-10 border-b border-neutral-700">
            <span>Terminal Station OS (v1.0.4)</span>
            <button
              type="button"
              id="computer-exit-btn"
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                onClose();
              }}
              className="bg-red-700 hover:bg-red-600 text-white px-2.5 py-0.5 text-xs rounded-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Exit Computer [ESC]
            </button>
          </div>

          {/* Desktop Work Area */}
          <div className="flex-1 p-6 relative flex flex-col justify-start">
            {/* Desktop Icons Grid */}
            <div className="grid grid-cols-1 gap-6 w-28">
              {/* My Computer */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setActiveWindow('terminal');
                }}
                className="flex flex-col items-center p-2 rounded hover:bg-white/15 active:bg-white/25 cursor-pointer group text-white text-center"
              >
                <div className="w-10 h-10 bg-[#3a6ea5] border border-white/40 flex items-center justify-center rounded-xs shadow">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] mt-1 drop-shadow font-mono">My System</span>
              </button>

              {/* ReadMe.txt */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setActiveWindow('readme');
                }}
                className="flex flex-col items-center p-2 rounded hover:bg-white/15 active:bg-white/25 cursor-pointer group text-white text-center"
              >
                <div className="w-10 h-10 bg-[#fdf0d5] border border-black/30 flex items-center justify-center rounded-xs shadow">
                  <FileText className="w-6 h-6 text-[#222]" />
                </div>
                <span className="text-[11px] mt-1 drop-shadow font-mono">notes.txt</span>
              </button>

              {/* Terminal */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setActiveWindow('terminal');
                }}
                className="flex flex-col items-center p-2 rounded hover:bg-white/15 active:bg-white/25 cursor-pointer group text-white text-center"
              >
                <div className="w-10 h-10 bg-[#1e1e1e] border border-green-500/60 flex items-center justify-center rounded-xs shadow">
                  <Terminal className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-[11px] mt-1 drop-shadow font-mono">Terminal</span>
              </button>

              {/* Recycle Bin */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                }}
                className="flex flex-col items-center p-2 rounded hover:bg-white/15 active:bg-white/25 cursor-pointer group text-white text-center"
              >
                <div className="w-10 h-10 bg-[#666] border border-white/40 flex items-center justify-center rounded-xs shadow">
                  <Trash2 className="w-6 h-6 text-neutral-200" />
                </div>
                <span className="text-[11px] mt-1 drop-shadow font-mono">Trash</span>
              </button>
            </div>

            {/* Window: ReadMe */}
            {activeWindow === 'readme' && (
              <div className="absolute top-12 left-36 w-[420px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl z-30 font-sans">
                {/* Titlebar */}
                <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between text-xs font-bold font-mono">
                  <span>notes.txt - Notepad</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveWindow(null);
                      }}
                      className="w-4 h-4 bg-[#c0c0c0] text-black text-[10px] flex items-center justify-center font-bold border border-t-white border-l-white border-r-black border-b-black cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4 bg-white text-[#111] text-xs font-mono h-48 overflow-y-auto space-y-2 border border-inset border-neutral-400 m-1">
                  <p className="font-semibold text-neutral-800">APARTMENT 304 - REMINDER</p>
                  <p>1. Rent is due on the 1st of every month ($450).</p>
                  <p>2. Keep the door locked at night.</p>
                  <p>3. Check phone messages regularly.</p>
                  <p className="text-neutral-500 italic pt-2">// System ready for version expansion.</p>
                </div>
              </div>
            )}

            {/* Window: Terminal */}
            {activeWindow === 'terminal' && (
              <div className="absolute top-16 left-44 w-[460px] bg-[#111] border-2 border-green-700 shadow-2xl z-30 font-mono text-xs text-green-400">
                {/* Titlebar */}
                <div className="bg-neutral-800 text-neutral-200 px-2 py-1 flex items-center justify-between text-xs border-b border-neutral-700">
                  <span>Command Prompt - RetroOS 1.0</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveWindow(null);
                    }}
                    className="w-4 h-4 bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] flex items-center justify-center cursor-pointer"
                  >
                    X
                  </button>
                </div>
                {/* Content */}
                <div className="p-4 space-y-1.5 h-52 overflow-y-auto font-mono text-[11px] leading-relaxed">
                  <div>RETRO-OS [Version 1.0.4]</div>
                  <div>(c) 1998 RetroTech Corp. All rights reserved.</div>
                  <div className="pt-2 text-neutral-400">&gt; checking network interfaces...</div>
                  <div className="text-amber-400">&gt; DIAL-UP MODEM: DISCONNECTED</div>
                  <div className="text-emerald-400">&gt; LOCAL STATION: OPERATIONAL</div>
                  <div className="pt-2">&gt; _ <span className="animate-pulse">█</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Retro Taskbar at Bottom */}
          <div className="h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1.5 z-10">
            {/* Start Button */}
            <button
              type="button"
              id="computer-start-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playClickSound();
              }}
              className="h-6 px-2.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white flex items-center gap-1.5 font-bold text-xs text-black cursor-pointer font-sans"
            >
              <div className="w-3.5 h-3.5 bg-red-600 grid grid-cols-2 gap-0.5 p-0.5">
                <div className="bg-blue-600" />
                <div className="bg-yellow-400" />
                <div className="bg-green-600" />
                <div className="bg-red-500" />
              </div>
              Start
            </button>

            {/* Tray Clock */}
            <div className="h-6 px-3 bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex items-center text-xs text-black font-mono">
              {currentTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
