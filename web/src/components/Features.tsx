"use client";

import { motion } from "motion/react";
import { Braces, ShieldCheck, Terminal, Cpu, Sparkles, Network } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function Features() {
  const { dict } = useLanguage();

  const features = [
    {
      name: dict.features.items.cli.name,
      description: dict.features.items.cli.description,
      icon: Terminal,
    },
    {
      name: dict.features.items.extensible.name,
      description: dict.features.items.extensible.description,
      icon: Braces,
    },
    {
      name: dict.features.items.telco.name,
      description: dict.features.items.telco.description,
      icon: Network,
    },
    {
      name: dict.features.items.gsma.name,
      description: dict.features.items.gsma.description,
      icon: ShieldCheck,
    },
    {
      name: dict.features.items.ai.name,
      description: dict.features.items.ai.description,
      icon: Sparkles,
    },
    {
      name: dict.features.items.cryptography.name,
      description: dict.features.items.cryptography.description,
      icon: Cpu,
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 shrink-0 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block px-3 py-1 border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-mono rounded-full mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            {dict.features.badge}
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {dict.features.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400 font-light">
            {dict.features.subtitle}
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


