"use client";

import { motion } from "motion/react";
import { Terminal, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-24 pb-32 shrink-0 overflow-hidden">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-6 flex items-center gap-2 max-w-fit shadow-[0_0_15px_rgba(99,102,241,0.15)] backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse"></span>
                Desarrollo Activo — Código Abierto AGPLv3
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm animate-fade-in"
            >
              Unuko ToolKit <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">La suite eSIM 5G para programadores.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl font-light"
            >
              Despliega laboratorios completos de Open5GS, emula chips eUICC (UERANSIM) y levanta servidores de aprovisionamiento como osmo-smdpp con una sola herramienta. Extensible, modular y controlado desde una CLI moderna y un panel de control interactivo.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-5 py-3.5 font-mono text-sm text-slate-300 shadow-xl backdrop-blur-md flex-1 md:flex-none">
                <span className="text-indigo-400">$</span> unuko up core5g
              </div>
              <a href="#beta-program" className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all hover:scale-105 flex-1 md:flex-none">
                Probar la Beta <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-slate-800/50 flex flex-col">
              <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-2 border-b border-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-xs text-slate-500 font-mono ml-2">unuko-cli ~ /lab</span>
              </div>
              <div className="p-6 font-mono text-xs sm:text-sm text-slate-400 overflow-x-auto relative min-h-[300px]">
                <div className="text-cyan-400"><span className="text-slate-600">~/unuko-workspace $</span> unuko up core5g</div>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-2 text-indigo-400">⠋ [unuko] Levantando suite de servicios de red 5G...</motion.div>
                <div className="text-slate-500">⠙ Inicializando contenedores e interfaces loopback locales...</div>
                <div className="text-slate-300 mt-2">✓ Core Network (Open5GS AMF/UPF/UDM) iniciado</div>
                <div className="text-slate-300">✓ Osmocom SM-DP+ (osmo-smdpp) escuchando en puerto 8081</div>
                <div className="text-slate-300">✓ Token PKCS#11 activo en SoftHSM (label: unuko-token)</div>
                <div className="text-slate-300">✓ Autenticación eUICC exitosa (ES9+ initiateAuthentication)</div>
                <div className="text-slate-300">✓ Descarga de BoundProfilePackage completada</div>
                <div className="text-slate-300">✓ Transmitiendo APDUs de perfil eSIM a UERANSIM (uesimtun0)</div>
                <div className="text-cyan-400 mt-4 font-bold border-l-2 border-cyan-500 pl-3">
                  [unuko] Entorno listo y operativo! (9.2s)<br/>
                  <span className="text-slate-500 font-normal mt-1 block">Panel de Control: http://localhost:3000</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-slate-900/95 backdrop-blur-xl px-6 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-800 hidden sm:flex gap-6 transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Licencia</div>
                <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> AGPLv3
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800 self-center"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Extensibilidad</div>
                <div className="text-sm font-bold text-slate-200 font-mono">100% Modificable</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
