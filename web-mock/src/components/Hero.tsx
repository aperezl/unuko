import { motion } from "motion/react";
import { Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-32 shrink-0">
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
                v1.0.0 is now live — Open Source
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm"
            >
              Developer Experience <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">para redes 5G.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl font-light"
            >
              Levanta laboratorios completos de Core y RAN en segundos con un enfoque declarativo. Open source, reproducible y construido para que los desarrolladores vuelvan a disfrutar experimentando.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-5 py-3.5 font-mono text-sm text-slate-300 shadow-xl backdrop-blur-md flex-1 md:flex-none">
                <span className="text-indigo-400">$</span> npm install -g unuko
              </div>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all hover:scale-105 flex-1 md:flex-none">
                Quickstart <span aria-hidden="true">→</span>
              </button>
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
              <div className="p-6 font-mono text-sm text-slate-400 overflow-x-auto relative min-h-[300px]">
                <div className="text-cyan-400"><span className="text-slate-600">~/lab $</span> unuko core5g start</div>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-2 text-indigo-400">⠋ Parsing deployment manifest (lab.yaml)...</motion.div>
                <div className="text-slate-500">⠙ Pulling Open5GS & UERANSIM images...</div>
                <div className="text-slate-300 mt-2">✓ Configured Control Plane (AMF, SMF)</div>
                <div className="text-slate-300">✓ Attached User Plane (UPF)</div>
                <div className="text-slate-300">✓ Simulated 5x gNodeB connections</div>
                <div className="text-cyan-400 mt-4 font-bold border-l-2 border-cyan-500 pl-3">
                  Environment ready! (14.2s)<br/>
                  <span className="text-slate-500 font-normal mt-1 block">Dashboard: http://localhost:3000</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-slate-900/95 backdrop-blur-xl px-6 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-800 hidden sm:flex gap-6 transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Latencia</div>
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono">0.8ms</div>
              </div>
              <div className="w-px h-10 bg-slate-800 self-center"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Nodos Activos</div>
                <div className="text-xl font-bold text-slate-200 font-mono">128</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
