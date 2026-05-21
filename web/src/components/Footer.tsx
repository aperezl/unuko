"use client";

import { RadioTower, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/50 py-12 shrink-0 backdrop-blur-sm relative z-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://github.com/unuko/unuko" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">Discord</span>
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0 flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 opacity-80 mix-blend-screen">
              <div className="flex w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="flex w-full h-full bg-slate-950 rounded-[7px] items-center justify-center text-white">
                  <RadioTower className="h-4 w-4" />
                </div>
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-white drop-shadow-sm">
                Unuko <span className="text-xs text-indigo-400">ToolKit</span>
              </span>
            </div>
            <p className="text-center text-sm leading-5 text-slate-500 font-light">
              &copy; {new Date().getFullYear()} Unuko Project. Código abierto bajo licencia GNU AGPLv3.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
