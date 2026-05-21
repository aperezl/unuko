import { motion } from "motion/react";
import { Terminal, Braces, RotateCcw, GitBranch, Github, Layers } from "lucide-react";

export function Features() {
  const features = [
    {
      name: "Infraestructura Declarativa",
      description: "Define tu entorno en archivos YAML (similares a docker-compose) y déjale a Unuko la orquestación de red subyacente.",
      icon: Braces,
    },
    {
      name: "Feedback Loop Inmediato",
      description: "Arranca y destruye entornos en segundos. Permite a los desarrolladores iterar sin esperar a infraestructuras pesadas.",
      icon: RotateCcw,
    },
    {
      name: "GitOps Ready",
      description: "Tus laboratorios ahora viven en Git. Versiona configuraciones 5G, comparte reproducciones de bugs y estandariza los entornos de todo el equipo.",
      icon: GitBranch,
    },
    {
      name: "CLI Centric",
      description: "Una CLI construida en Rust que expone comandos limpios e intuitivos para inspeccionar paquetes y ver logs tail en tiempo real.",
      icon: Terminal,
    },
    {
      name: "Totalmente Open Source",
      description: "Desarrollado bajo principios open-source, transparente y respaldado e impulsado por contribuciones de la comunidad.",
      icon: Github,
    },
    {
      name: "Abstracción Inteligente",
      description: "No necesitas ser experto en telecomunicaciones para arrancar el core. Unuko maneja la complejidad de GTP, SCTP y NGAP por ti.",
      icon: Layers,
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 shrink-0 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block px-3 py-1 border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-mono rounded-full mb-4 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Developer Experience First
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Herramientas que respetan tu tiempo
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Unuko elimina el dolor de configurar laboratorios 5G manuales. Traemos las mejores prácticas del desarrollo web al ecosistema Telco.
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
