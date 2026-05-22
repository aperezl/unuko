"use client";

import { motion } from "motion/react";
import { Server, Radio, KeyRound, Cpu } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function TechStack() {
  const { dict } = useLanguage();

  const stack = [
    {
      name: "Open5GS",
      category: dict.techStack.open5gs.category,
      description: dict.techStack.open5gs.description,
      features: [
        dict.techStack.open5gs.f1,
        dict.techStack.open5gs.f2,
      ],
      icon: Server,
      color: "from-indigo-500/20 to-indigo-600/20",
      iconColor: "text-indigo-400",
      shadow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]",
      borderColor: "border-indigo-500/30"
    },
    {
      name: "UERANSIM",
      category: dict.techStack.ueransim.category,
      description: dict.techStack.ueransim.description,
      features: [
        dict.techStack.ueransim.f1,
        dict.techStack.ueransim.f2,
      ],
      icon: Radio,
      color: "from-cyan-500/20 to-teal-500/20",
      iconColor: "text-cyan-400",
      shadow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
      borderColor: "border-cyan-500/30"
    },
    {
      name: "osmo-smdpp & Mock Server",
      category: dict.techStack.smdpp.category,
      description: dict.techStack.smdpp.description,
      features: [
        dict.techStack.smdpp.f1,
        dict.techStack.smdpp.f2,
      ],
      icon: KeyRound,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      borderColor: "border-emerald-500/30"
    },
    {
      name: "SoftHSM & PKCS#11",
      category: dict.techStack.softhsm.category,
      description: dict.techStack.softhsm.description,
      features: [
        dict.techStack.softhsm.f1,
        dict.techStack.softhsm.f2,
      ],
      icon: Cpu,
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      shadow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      borderColor: "border-purple-500/30"
    }
  ];

  return (
    <section id="stack" className="relative py-24 sm:py-32 overflow-hidden bg-slate-950 shrink-0">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <div className="inline-block px-3 py-1 border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs font-mono rounded-full mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            {dict.techStack.badge}
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {dict.techStack.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400 font-light">
            {dict.techStack.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {stack.map((item, index) => (
            <motion.div 
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 p-8 md:p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-slate-700 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className={`flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} border ${item.borderColor} ${item.iconColor} group-hover:scale-110 transition-transform duration-500 ${item.shadow}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{item.name}</h3>
                  <p className="text-sm font-mono text-slate-500 mt-1">{item.category}</p>
                </div>
              </div>
              <p className="text-slate-400 mb-8 flex-grow text-base leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors">
                {item.description}
              </p>
              <ul className="space-y-4 text-sm text-slate-400 font-mono relative z-10">
                {item.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-500/10 border border-slate-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

