"use client";

import { motion } from "motion/react";
import { RadioTower } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="flex w-full h-full bg-slate-950 rounded-[7px] items-center justify-center text-white">
              <RadioTower className="h-4 w-4" />
            </div>
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-white drop-shadow-sm">
            Unuko <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-1 font-semibold">ToolKit</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="/#features" className="hover:text-white transition-colors duration-300">Características</a>
          <a href="/#stack" className="hover:text-white transition-colors duration-300">Ecosistema</a>
          <a href="/#usecases" className="hover:text-white transition-colors duration-300">Casos de Uso</a>
          <Link href="/docs" className="hover:text-white transition-colors duration-300">Documentación</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 px-3 py-2">
            Doc de Inicio
          </Link>
          <a href="https://github.com/unuko/unuko" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-white/10 hover:scale-105 hover:shadow-indigo-500/10 backdrop-blur-md">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
            GitHub
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
