"use client";

import { motion } from "motion/react";
import { Code2, Radio, Sparkles, Heart } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function CreatorStory() {
  const { dict } = useLanguage();

  return (
    <section id="motivation" className="relative py-24 sm:py-32 overflow-hidden bg-slate-950 shrink-0 border-t border-slate-900">
      {/* Background Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] rounded-full bg-indigo-900/10 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-cyan-900/5 blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Story Letter Column */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono rounded-full mb-6 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Heart className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20 animate-pulse" /> {dict.story.badge}
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-8">
                {dict.story.titlePart1} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">{dict.story.titlePart2}</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6 text-slate-400 leading-relaxed font-light text-base"
            >
              <p>
                {dict.story.p1}
              </p>
              
              <p>
                {dict.story.p2}
              </p>

              <p>
                {dict.story.p3}
              </p>

              <p className="text-white font-medium bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <span className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></span>
                {dict.story.mission}
              </p>

              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-px bg-slate-800"></div>
                <span className="font-mono text-sm text-slate-500 italic">{dict.story.caption}</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Card / Stats Column */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col"
            >
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-gradient-to-br from-indigo-500 to-cyan-400 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
                <Code2 className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{dict.story.diagnosisTitle}</h3>
                  <p className="text-xs text-slate-500 font-mono">{dict.story.diagnosisSubtitle}</p>
                </div>
              </div>

              {/* Bullet points comparing corporate vs developer approach */}
              <div className="space-y-6 flex-grow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold font-mono">
                    !
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{dict.story.problem1Title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {dict.story.problem1Desc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold font-mono">
                    !
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{dict.story.problem2Title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {dict.story.problem2Desc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 my-6"></div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      {dict.story.solutionTitle} <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {dict.story.solutionDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Console Mock Signature */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 space-y-1 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60">
                <div><span className="text-cyan-400">const</span> <span className="text-slate-300">creador</span> = &#123;</div>
                <div className="pl-4">{dict.story.consoleLabelOrigin}: <span className="text-amber-300">"{dict.story.consoleValueOrigin}"</span>,</div>
                <div className="pl-4">{dict.story.consoleLabelPassion}: <span className="text-amber-300">"{dict.story.consoleValuePassion}"</span>,</div>
                <div className="pl-4">{dict.story.consoleLabelMission}: <span className="text-amber-300">"{dict.story.consoleValueMission}"</span>,</div>
                <div>&#125;;</div>
                <div className="pt-2 text-indigo-400">{dict.story.consoleComment}</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

