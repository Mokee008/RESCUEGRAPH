import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 6', desc: 'Direct jump to Scene S0 (Hero) through S6 (Validation)' },
    { key: '→ / ↓', desc: 'Advance to next slide' },
    { key: '← / ↑', desc: 'Return to previous slide' },
    { key: 'PageUp / PageDn', desc: 'Quick step through presentation' },
    { key: 'L', desc: 'Toggle Lite Mode (Flat colors, no tilt, low-end GPU fallback)' },
    { key: 'N', desc: 'Toggle Language between English and Nepali (नेपाली)' },
    { key: '?', desc: 'Toggle this keyboard shortcuts cheatsheet' },
    { key: 'Esc', desc: 'Close open dialogs and overlays' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 clip-chamfer-md border border-white/30 bg-black/95 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-white" />
            <h3 className="font-['Michroma'] text-sm uppercase tracking-wider text-white font-bold">
              Mission Control Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Table */}
        <div className="space-y-2.5">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded clip-chamfer-sm bg-white/5 border border-white/10"
            >
              <kbd className="px-2.5 py-1 rounded font-mono text-xs font-bold text-white bg-white/15 border border-white/30 shadow-inner">
                {item.key}
              </kbd>
              <span className="font-mono text-xs text-slate-300 text-right">
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>FLOODSAT RESCUE CONSOLE</span>
          <span>PRESS [?] OR [ESC] TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}
