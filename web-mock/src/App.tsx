/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { TechStack } from './components/TechStack';
import { UseCases } from './components/UseCases';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="font-sans antialiased text-slate-300 bg-slate-950 flex flex-col min-h-screen selection:bg-indigo-500/30 selection:text-indigo-100 relative">
      <div className="fixed inset-0 z-0 bg-slate-950"></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Hero />
          <Features />
          <TechStack />
          <UseCases />
        </main>
        <Footer />
      </div>
    </div>
  );
}
