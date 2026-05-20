import React from 'react';
import { cn } from '../lib/utils';

interface HexViewerProps {
  data: string | Buffer | Uint8Array;
  className?: string;
}

export const HexViewer = ({ data, className }: HexViewerProps) => {
  const getBytes = (input: string | Uint8Array): Uint8Array => {
    if (input instanceof Uint8Array) return input;
    const cleanInput = input.replace(/\s/g, '');
    const bytes = new Uint8Array(cleanInput.length / 2);
    for (let i = 0; i < cleanInput.length; i += 2) {
      bytes[i / 2] = parseInt(cleanInput.substring(i, i + 2), 16);
    }
    return bytes;
  };

  const buffer = getBytes(data as any);

  const rows = [];
  const bytesPerRow = 16;

  for (let i = 0; i < buffer.length; i += bytesPerRow) {
    const rowBytes = buffer.subarray(i, i + bytesPerRow);
    rows.push({
      offset: i.toString(16).padStart(4, '0').toUpperCase(),
      bytes: Array.from(rowBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()),
      ascii: Array.from(rowBytes).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('')
    });
  }

  return (
    <div className={cn("font-mono text-[11px] bg-[#05070a] rounded-lg border border-slate-800/50 overflow-hidden shadow-inner", className)}>
      <div className="grid grid-cols-[auto_1fr_auto] border-b border-slate-800/50 bg-slate-900/30 px-4 py-2 gap-8 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
        <div>Offset</div>
        <div>Hexadecimal</div>
        <div className="w-[120px]">ASCII</div>
      </div>
      <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[auto_1fr_auto] gap-8 group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
            <span className="text-slate-600 font-bold">{row.offset}</span>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {row.bytes.map((byte, bIdx) => (
                <span 
                  key={bIdx} 
                  className={cn(
                    "text-slate-400 group-hover:text-slate-200 transition-colors",
                    // Highlight potential tags (simplified)
                    (byte === '80' || byte === 'BF') && "text-sky-400/80 font-bold"
                  )}
                >
                  {byte}
                </span>
              ))}
              {/* Padding to keep columns aligned if last row is short */}
              {row.bytes.length < bytesPerRow && Array.from({ length: bytesPerRow - row.bytes.length }).map((_, bIdx) => (
                <span key={`pad-${bIdx}`} className="w-4 opacity-0">00</span>
              ))}
            </div>
            <span className="text-slate-500 w-[120px] whitespace-pre truncate opacity-60 group-hover:opacity-100 transition-opacity">
              {row.ascii}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 bg-slate-900/20 border-t border-slate-800/50 flex justify-between items-center text-[9px] text-slate-600 font-bold">
        <span>LENGTH: {buffer.length} BYTES (0x{buffer.length.toString(16).toUpperCase()})</span>
        <span className="text-sky-500/50 uppercase">Telecom Mode Activated</span>
      </div>
    </div>
  );
};
