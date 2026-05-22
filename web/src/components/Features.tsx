"use client";

import { motion } from "motion/react";
import { Braces, ShieldCheck, Terminal, Cpu, Sparkles, Network } from "lucide-react";

export function Features() {
  const features = [
    {
      name: "CLI Unificado `unuko`",
      description: "Abstrae toda la complejidad del laboratorio. Despliega el entorno con 'unuko core5g start' y contrólalo de forma rápida y sencilla.",
      icon: Terminal,
    },
    {
      name: "Extensibilidad Total",
      description: "Unuko es un ToolKit completo pensado para desarrolladores. Extiende y modifica los flujos lógicos, añade estados personalizados o integra tus propios módulos de red sin restricciones.",
      icon: Braces,
    },
    {
      name: "Stack Telco Disruptivo",
      description: "Traemos la fiabilidad del software moderno a las telecomunicaciones. Olvídate del código legacy; orquesta con TypeScript, Fastify, validaciones estrictas con Zod y máquinas de estados en XState.",
      icon: Network,
    },
    {
      name: "Estándares GSMA Nativos",
      description: "Soporte completo e integrado para perfiles de eSIM de Consumo (SGP.22) y el nuevo estándar IoT (SGP.32) con aprovisionamiento push.",
      icon: ShieldCheck,
    },
    {
      name: "Auditoría con IA",
      description: "El auditor integrado con Gemini traduce y desglosa las peticiones del SM-DP+ y los crípticos códigos hex de los comandos APDU del chip en diagnósticos comprensibles.",
      icon: Sparkles,
    },
    {
      name: "Seguridad Real por HSM",
      description: "Emulación de almacenamiento seguro a nivel de hardware usando SoftHSM y PKCS#11. Genera y resguarda firmas y pares de claves elípticas secp256r1 localmente.",
      icon: Cpu,
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 shrink-0 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block px-3 py-1 border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-mono rounded-full mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Unuko ToolKit Core
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Un stack disruptivo para ingeniería de red
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400 font-light">
            Unuko ToolKit rompe con el ecosistema de telecomunicaciones tradicional al introducir herramientas modernas, extensibles y de código abierto para desarrolladores.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex flex-col bg-slate-900/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all font-sans group cursor-default relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:from-indigo-500/40 group-hover:to-cyan-500/40 transition-colors"></div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all shadow-inner relative z-10">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <dt className="text-xl font-bold leading-7 text-white relative z-10">
                  {feature.name}
                </dt>
                <dd className="mt-2 flex flex-auto flex-col text-sm leading-relaxed text-slate-400 relative z-10">
                  <p className="flex-auto group-hover:text-slate-300 transition-colors">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
