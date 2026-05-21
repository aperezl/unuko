import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const sidebarItems = [
    {
      title: "Introducción",
      items: [
        { name: "Introducción a ToolKit", slug: "introduccion" },
        { name: "Requisitos de Sistema", slug: "requisitos" },
      ],
    },
    {
      title: "Guía de Inicio Rápido",
      items: [
        { name: "Despliegue con unuko CLI", slug: "despliegue-cli" },
        { name: "Alta de Dispositivo", slug: "alta-dispositivo" },
      ],
    },
    {
      title: "Estándares y Arquitectura",
      items: [
        { name: "GSMA SGP.22 vs SGP.32", slug: "gsma-standards" },
        { name: "Flujo de Aprovisionamiento", slug: "flujo-rsp" },
      ],
    },
    {
      title: "Criptografía y HSM",
      items: [
        { name: "SoftHSM y PKCS#11", slug: "softhsm-pkcs11" },
        { name: "Curva Elíptica secp256r1", slug: "curvas-elipticas" },
      ],
    },
    {
      title: "Simulación de Radio 5G",
      items: [
        { name: "UERANSIM y eSIM", slug: "ueransim-esim" },
        { name: "Rutas y Enrutamiento NAT", slug: "enrutamiento-nat" },
      ],
    },
    {
      title: "API y Panel Web",
      items: [
        { name: "Endpoints de Orquestación", slug: "api-endpoints" },
        { name: "Auditoría de Logs con IA", slug: "auditor-ia" },
      ],
    },
  ];

  return (
    <div className="font-sans antialiased text-slate-300 bg-slate-950 flex flex-col min-h-screen relative">
      <div className="fixed inset-0 z-0 bg-slate-950"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/10 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <div className="flex-grow max-w-7xl w-full mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 sticky top-28 h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-r border-slate-900 hidden lg:block scrollbar-thin">
              <nav className="space-y-8">
                {sidebarItems.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      {section.title}
                    </h4>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/docs/${item.slug}`}
                            className="block text-sm text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Mobile Navigation Dropdown (Visible on small screens) */}
            <div className="lg:hidden w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
              <details className="group">
                <summary className="flex items-center justify-between font-medium text-sm text-white cursor-pointer list-none">
                  <span>Navegar por la Documentación</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <nav className="mt-4 space-y-6 pt-4 border-t border-slate-800 max-h-[300px] overflow-y-auto">
                  {sidebarItems.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {section.title}
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {section.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={`/docs/${item.slug}`}
                              className="block text-sm text-slate-400 hover:text-indigo-400 py-1"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </details>
            </div>

            {/* Main Content Area */}
            <main className="lg:col-span-9 w-full">
              <article className="prose prose-invert max-w-none">
                {children}
              </article>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
