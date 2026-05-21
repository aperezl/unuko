import { RadioTower, Github, Twitter, TerminalSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/50 py-12 shrink-0 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <span className="sr-only">Discord</span>
              <TerminalSquare className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0 flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 opacity-80 mix-blend-screen">
              <div className="flex w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="flex w-full h-full bg-slate-950 rounded-[7px] items-center justify-center text-white">
                  <RadioTower className="h-4 w-4" />
                </div>
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-white drop-shadow-sm">
                Unuko
              </span>
            </div>
            <p className="text-center text-sm leading-5 text-slate-500 font-light">
              Construido con ❤️ por la comunidad. Open source bajo licencia MIT.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
