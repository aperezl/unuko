import { motion } from "motion/react";
import { GitBranch, Box, Radio } from "lucide-react";

export function TechStack() {
  return (
    <section id="stack" className="relative py-24 sm:py-32 overflow-hidden bg-slate-950 shrink-0">
      {/* Abstract background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-900/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <div className="inline-block px-3 py-1 border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs font-mono rounded-full mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            Ecosistema Open Source
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Soportado por gigantes de código abierto
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Unuko actúa como la capa unificadora para las tecnologías de red más adoptadas por la comunidad. No reinventamos la rueda, la hacemos accesible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Open5GS */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 p-8 md:p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-slate-700 md:col-span-1 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <ServerIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Open5GS</h3>
                <p className="text-sm font-mono text-indigo-400/80 mt-1">Core Network</p>
              </div>
            </div>
            <p className="text-slate-400 mb-8 flex-grow text-base leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">
              Integración nativa con Open5GS. Levanta NFs (AMF, SMF, UPF) configuradas dinámicamente y expón sus interfaces en tu localhost sin conflictos de red oscuros.
            </p>
            <ul className="space-y-4 text-sm text-slate-400 font-mono relative z-10">
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                </div>
                Zero-config subscriber provisioning
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                </div>
                PCAP streaming automático
              </li>
            </ul>
          </motion.div>

          {/* UERANSIM */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 p-8 md:p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-slate-700 md:col-span-1 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Radio className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">UERANSIM</h3>
                <p className="text-sm font-mono text-cyan-400/80 mt-1">RAN Simulator</p>
              </div>
            </div>
            <p className="text-slate-400 mb-8 flex-grow text-base leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">
              Define perfiles de UEs y gNodeB en YAML. Unuko sincroniza con el core en tiempo de simulación y recolecta métricas de tráfico y atenuación de forma programática.
            </p>
            <ul className="space-y-4 text-sm text-slate-400 font-mono relative z-10">
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                </div>
                Mapeo de UEs a interfaces TUN
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                </div>
                Carga de tráfico estandarizada
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Simple fallback icon just in case
function ServerIcon(props: any) {
  return <Box {...props} />;
}
