"use client";

import { motion } from "motion/react";

export function UseCases() {
  const cases = [
    {
      title: "Integración Continua (CI)",
      description: "Ejecuta pruebas automatizadas de red y flujos de aprovisionamiento de eSIM en tus pipelines de GitHub Actions o GitLab. El CLI de unuko permite inicializar y desmontar el core 5G y osmo-smdpp de forma desatendida.",
      metric: "Pipelines de red 100% automatizados",
    },
    {
      title: "Sandbox de Desarrollo Local",
      description: "Experimenta y desarrolla localmente sin ensuciar tu sistema host. Controla la inicialización de bases de datos, simuladores de radio e interfaces de red virtual con 'unuko core5g start' y 'unuko core5g stop'.",
      metric: "Entorno local rápido y efímero",
    },
    {
      title: "I+D Extensible y Protocolos",
      description: "Unuko ToolKit es 100% modular y modificable. El uso de TypeScript y XState permite a los ingenieros de software y telecomunicaciones clonar el repositorio, extender el CLI, e implementar sus propias lógicas de red o APDUs.",
      metric: "Diseñado para ser modificado y extendido",
    }
  ];

  return (
    <section id="usecases" className="py-24 sm:py-32 shrink-0 bg-slate-950 relative border-t border-slate-900 isolate">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/20 to-transparent"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1 sticky top-32">
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Construido para <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ingenieros de telecomunicaciones</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed font-light">
              Olvídate del software telco cerrado. Unuko ToolKit proporciona un entorno de desarrollo abierto y extensible que acelera los flujos de pruebas de eSIM 5G.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {cases.map((useCase, index) => (
                <motion.div 
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`${index === 2 ? 'sm:col-span-2' : ''} rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-8 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] group`}
                >
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">{useCase.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {useCase.description}
                  </p>
                  <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 font-mono text-xs text-indigo-400 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    {useCase.metric}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
