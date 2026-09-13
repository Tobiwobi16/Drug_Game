import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '../game/types';
import { StoryMessage, DialogueChoice } from '../game/story';
import { playClickSound } from '../game/sound';
import {
  MessageSquare,
  Settings,
  ArrowLeft,
  Circle,
  Wifi,
  Battery,
  Signal,
  X,
  Volume2,
  Sliders,
  Tv,
} from 'lucide-react';

export interface PhoneProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  messages: StoryMessage[];
  availableChoices: DialogueChoice[];
  isBobTyping: boolean;
  onSelectChoice: (choice: DialogueChoice) => void;
}

type PhoneScreen = 'home' | 'messages' | 'settings';

export const Phone: React.FC<PhoneProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  messages,
  availableChoices,
  isBobTyping,
  onSelectChoice,
}) => {
  const [currentScreen, setCurrentScreen] = useState<PhoneScreen>('home');
  const [currentTime, setCurrentTime] = useState('23:42');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom of message list on new message or typing change
  useEffect(() => {
    if (currentScreen === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBobTyping, availableChoices, currentScreen]);

  // Handle Escape key and intercept OS keys when Phone is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

      // Prevent Tab from shifting focus outside the phone
      if (e.code === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // ESC: Close phone ONLY, consume event immediately and prevent propagation
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (screen: PhoneScreen) => {
    playClickSound();
    setCurrentScreen(screen);
  };

  return (
    <div
      id="retro-phone-overlay"
      className="fixed inset-y-0 right-4 sm:right-12 my-auto z-40 flex items-center justify-center pointer-events-auto select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        // Prevent any keystrokes inside phone from bubbling to 3D world
        e.stopPropagation();
      }}
    >
      {/* Smartphone Body */}
      <div className="w-84 h-[580px] bg-neutral-900 rounded-[38px] p-3 shadow-2xl border-4 border-neutral-700 flex flex-col relative">
        {/* Top speaker & front camera */}
        <div className="w-full flex items-center justify-center gap-2 pb-1">
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full border border-neutral-700" />
        </div>

        {/* Screen Bezel Frame */}
        <div className="flex-1 bg-neutral-950 rounded-[24px] overflow-hidden flex flex-col border border-neutral-800 relative font-mono">
          {/* Status Bar */}
          <div className="h-6 bg-neutral-900 px-3 flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800">
            <span className="font-semibold text-neutral-300">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-neutral-400" />
              <Wifi className="w-3 h-3 text-neutral-400" />
              <Battery className="w-3.5 h-3.5 text-neutral-300" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-neutral-900 text-neutral-100">
            {/* 1. HOME SCREEN */}
            {currentScreen === 'home' && (
              <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-neutral-900 to-neutral-950">
                {/* Clock & Widget */}
                <div className="text-center pt-5">
                  <div className="text-4xl font-bold tracking-tight text-neutral-100 font-mono">
                    {currentTime}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    Sunday, Sep 13
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Signal: Active
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-2 gap-4 my-auto px-4">
                  {/* Messages App Icon */}
                  <button
                    type="button"
                    id="phone-btn-messages"
                    onClick={() => navigateTo('messages')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-800 active:scale-95 transition border border-neutral-700 relative group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg group-hover:bg-emerald-500 transition">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs mt-2 font-medium text-neutral-200">Messages</span>
                    {/* Badge if choices ready or messages active */}
                    {availableChoices.length > 0 && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-bounce">
                        1
                      </span>
                    )}
                  </button>

                  {/* Settings App Icon */}
                  <button
                    type="button"
                    id="phone-btn-settings"
                    onClick={() => navigateTo('settings')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-800 active:scale-95 transition border border-neutral-700 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-neutral-700 flex items-center justify-center shadow-lg group-hover:bg-neutral-600 transition">
                      <Settings className="w-7 h-7 text-neutral-200" />
                    </div>
                    <span className="text-xs mt-2 font-medium text-neutral-200">Settings</span>
                  </button>
                </div>

                {/* Bottom hint */}
                <div className="text-center text-[10px] text-neutral-500 pb-1 font-mono">
                  Press [ESC] or tap X to close phone
                </div>
              </div>
            )}

            {/* 2. MESSAGES APP (DIALOGUE / CHOICE SYSTEM) */}
            {currentScreen === 'messages' && (
              <div className="flex-1 flex flex-col h-full bg-neutral-950">
                {/* Header */}
                <div className="h-12 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="p-1 hover:text-neutral-200 text-neutral-400 cursor-pointer"
                    title="Back to Apps"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-neutral-100">Bob</div>
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {isBobTyping ? 'typing...' : 'Online • High school friend'}
                    </div>
                  </div>
                  <div className="w-4" />
                </div>

                {/* Chat Message History */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs flex flex-col">
                  {messages.map((msg) => {
                    const isPlayer = msg.sender === 'Player';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-xl break-words leading-relaxed ${
                            isPlayer
                              ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm'
                              : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-bl-xs shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-neutral-500 mt-0.5 px-1 font-mono">
                          {msg.time}
                        </span>
                      </div>
                    );
                  })}

                  {/* Bob typing indicator */}
                  {isBobTyping && (
                    <div className="flex items-start">
                      <div className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-xl rounded-bl-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Predefined Response Choices (NO free text input) */}
                <div className="p-2.5 bg-neutral-900 border-t border-neutral-800 space-y-1.5">
                  {isBobTyping ? (
                    <div className="text-center py-2 text-neutral-500 text-[11px] font-mono italic">
                      Waiting for Bob to reply...
                    </div>
                  ) : availableChoices.length > 0 ? (
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5 px-1">
                        Select a response:
                      </div>
                      <div className="space-y-1.5">
                        {availableChoices.map((choice, idx) => (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => onSelectChoice(choice)}
                            className="w-full text-left p-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 active:bg-emerald-950/40 border border-neutral-700 hover:border-emerald-500/60 text-[11px] text-neutral-200 hover:text-white transition shadow-sm active:scale-[0.99] cursor-pointer flex items-start gap-2"
                          >
                            <span className="text-emerald-400 font-mono font-bold">{idx + 1}.</span>
                            <span className="leading-snug">{choice.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2.5 px-2 bg-neutral-950/60 rounded-lg border border-neutral-800 text-center">
                      <div className="text-xs font-semibold text-neutral-300">
                        Conversation concluded
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        Bob is waiting at the park.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SETTINGS APP */}
            {currentScreen === 'settings' && (
              <div className="flex-1 flex flex-col bg-neutral-950">
                {/* Header */}
                <div className="h-12 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="p-1 hover:text-neutral-200 text-neutral-400 cursor-pointer"
                    title="Back to Apps"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="text-xs font-semibold text-neutral-200">Settings</div>
                  <div className="w-4" />
                </div>

                {/* Settings list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-5 text-xs">
                  {/* Master Volume */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        Master Volume
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {Math.round(settings.masterVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.masterVolume}
                      onChange={(e) =>
                        onUpdateSettings({ masterVolume: parseFloat(e.target.value) })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Mouse Sensitivity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        Mouse Sensitivity
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {settings.mouseSensitivity.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={settings.mouseSensitivity}
                      onChange={(e) =>
                        onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Graphics / Pixelation Toggle */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                      <Tv className="w-3.5 h-3.5 text-emerald-400" />
                      Render Resolution
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'retro-low', label: '320x240' },
                          { id: 'retro-med', label: '640x480' },
                          { id: 'native', label: 'Native' },
                        ] as const
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onUpdateSettings({ graphicsMode: mode.id });
                          }}
                          className={`py-1.5 px-1 rounded text-center border text-[10px] font-mono cursor-pointer transition ${
                            settings.graphicsMode === mode.id
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CRT Scanline Filter */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                    <span className="text-neutral-300">CRT Scanlines</span>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onUpdateSettings({ crtFilter: !settings.crtFilter });
                      }}
                      className={`px-3 py-1 rounded text-[11px] font-mono border cursor-pointer transition ${
                        settings.crtFilter
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {settings.crtFilter ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Virtual Softkeys / Navigation Bar */}
          <div className="h-10 bg-neutral-950 border-t border-neutral-800 flex items-center justify-around px-8">
            <button
              type="button"
              id="phone-nav-back"
              onClick={() => navigateTo('home')}
              className="p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="phone-nav-home"
              onClick={() => navigateTo('home')}
              className="p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Home"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="phone-nav-close"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Close Phone (ESC / P)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Physical Home Button Indicator at bottom bezel */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              if (currentScreen !== 'home') setCurrentScreen('home');
              else onClose();
            }}
            className="w-8 h-8 rounded-full border-2 border-neutral-700 bg-neutral-800 flex items-center justify-center cursor-pointer hover:border-neutral-600"
            title="Physical Home Button"
          >
            <div className="w-3 h-3 rounded-xs border border-neutral-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
