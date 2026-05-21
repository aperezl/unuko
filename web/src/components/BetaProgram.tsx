"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export function BetaProgram() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Por favor, introduce un correo electrónico válido.");
      return;
    }

    setStatus("loading");
    
    // Simulate API registration
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <section id="beta-program" className="py-24 sm:py-32 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      
      <div className="mx-auto max-w-4xl px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono rounded-full mb-6 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              Programa de Beta Testers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              ¿Quieres probar Unuko RSP en tu laboratorio?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 leading-relaxed font-light">
              Buscamos ingenieros de telecomunicaciones y desarrolladores de IoT interesados en testear las capacidades de aprovisionamiento de perfiles y orquestación 5G local. Regístrate para obtener acceso prioritario.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu-correo@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                disabled={status === "loading" || status === "success"}
                className="flex-grow rounded-xl bg-slate-950 border border-slate-800 px-5 py-3.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                {status === "loading" ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Registrarme <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="h-10 mt-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm font-medium font-sans"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> ¡Gracias! Te contactaremos pronto con las instrucciones de la Beta.
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-rose-400 text-sm font-medium font-sans"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
