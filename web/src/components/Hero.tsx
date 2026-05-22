"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Terminal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export function Hero() {
  const { dict } = useLanguage();
  const [lines, setLines] = useState<React.ReactNode[]>([]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    let active = true;

    // Helper to simulate sleep
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function runSimulation() {
      while (active) {
        setLines([]);
        await sleep(1000);
        if (!active) break;

        // 1. unuko list
        await typeCommand("unuko list");
        if (!active) break;
        await sleep(600);

        const listOutput = (
          <div key={`list-output-${Math.random()}`} className="mt-2 text-xs leading-relaxed">
            <div className="text-cyan-400 font-bold">  {dict.hero.terminal.availableNetworks}</div>
            <div className="text-slate-500 font-medium">  =========================================</div>
            <div className="grid grid-cols-[100px_120px_100px_1fr] gap-x-4 text-slate-400 mt-2 font-bold whitespace-nowrap">
              <span>NETWORK</span>
              <span>STATUS</span>
              <span>SSH PORT</span>
              <span>SPEC</span>
            </div>
            <div className="text-slate-600">---------------------------------------------------</div>
            <div className="grid grid-cols-[100px_120px_100px_1fr] gap-x-4 text-slate-300 whitespace-nowrap">
              <span>core5g</span>
              <span className="text-rose-400 font-semibold">🔴 {dict.hero.terminal.stopped}</span>
              <span>N/A</span>
              <span>4 CPU / 4 GiB</span>
            </div>
          </div>
        );
        setLines((prev) => [...prev, listOutput]);
        await sleep(3500);
        if (!active) break;

        // 2. unuko core5g start
        await typeCommand("unuko core5g start");
        if (!active) break;
        await sleep(600);

        const startLog1 = <div key={`start-log-1-${Math.random()}`} className="mt-2 text-blue-400 font-semibold text-xs">🚀 {dict.hero.terminal.startingVm}</div>;
        setLines((prev) => [...prev, startLog1]);
        await sleep(1500);
        if (!active) break;

        const startLog2 = <div key={`start-log-2-${Math.random()}`} className="text-emerald-400 font-bold text-xs">✔ {dict.hero.terminal.startedVm}</div>;
        setLines((prev) => [...prev, startLog2]);
        await sleep(2500);
        if (!active) break;

        // 3. unuko core5g status
        await typeCommand("unuko core5g status");
        if (!active) break;
        await sleep(600);

        const statusOutput = (
          <div key={`status-output-${Math.random()}`} className="mt-2 text-xs leading-relaxed">
            <div className="text-cyan-400 font-bold">  {dict.hero.terminal.dashboardTitle}</div>
            <div className="text-slate-500 font-medium">  ========================================</div>
            <div className="text-slate-300 mt-2">  Lima VM (core5g): <span className="text-emerald-400 font-bold">🟢 Running</span></div>
            <div className="text-slate-500">  [Specs: CPUs: 4 | RAM: 4GiB | SSH Port: 63914]</div>
            <div className="text-slate-600">  ----------------------------------------</div>
            <div className="text-amber-400 font-bold mt-2">  {dict.hero.terminal.systemServices}:</div>

            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">{dict.hero.terminal.database}</span>
                <span className="text-slate-500">(mongod)</span>
                <span className="text-slate-400">- {dict.hero.terminal.subscriberDb}</span>
              </div>
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">{dict.hero.terminal.webui}</span>
                <span className="text-slate-500">(open5gs-webui)</span>
                <span className="text-slate-400">- {dict.hero.terminal.adminPortal}</span>
              </div>
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">{dict.hero.terminal.smdpp}</span>
                <span className="text-slate-500">(osmo-smdpp)</span>
                <span className="text-slate-400">- {dict.hero.terminal.esimServer}</span>
              </div>
            </div>

            <div className="text-amber-400 font-bold mt-3">  {dict.hero.terminal.fivegServices} (Open5GS):</div>
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">AMF</span>
                <span className="text-slate-500">(open5gs-amfd)</span>
                <span className="text-slate-400">- {dict.hero.terminal.mobilityMgmt}</span>
              </div>
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">SMF</span>
                <span className="text-slate-500">(open5gs-smfd)</span>
                <span className="text-slate-400">- {dict.hero.terminal.sessionMgmt}</span>
              </div>
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">UPF</span>
                <span className="text-slate-500">(open5gs-upfd)</span>
                <span className="text-slate-400">- {dict.hero.terminal.userPlane}</span>
              </div>
              <div className="grid grid-cols-[100px_95px_130px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span className="text-emerald-400">  🟢 {dict.hero.terminal.online}</span>
                <span className="text-slate-100 font-bold">UDM</span>
                <span className="text-slate-500">(open5gs-udmd)</span>
                <span className="text-slate-400">- {dict.hero.terminal.subscriberData}</span>
              </div>
            </div>
            <div className="text-slate-500 font-light italic mt-1.5 ml-4">
              {dict.hero.terminal.otherServices}
            </div>
          </div>
        );
        setLines((prev) => [...prev, statusOutput]);
        await sleep(4000);
        if (!active) break;

        // 4. unuko core5g devices
        await typeCommand("unuko core5g devices");
        if (!active) break;
        await sleep(600);

        const devicesOutput = (
          <div key={`devices-output-${Math.random()}`} className="mt-2 text-xs leading-relaxed">
            <div className="text-cyan-400 font-bold">  {dict.hero.terminal.ueransimDevices}</div>
            <div className="text-slate-500 font-medium">  =============================</div>
            <div className="text-slate-400 mt-1">  {dict.hero.terminal.connectingUeransim}</div>

            <div className="grid grid-cols-[130px_70px_100px_100px_1fr] gap-x-2 text-slate-400 mt-3 font-bold whitespace-nowrap">
              <span>ID</span>
              <span>TYPE</span>
              <span>STATUS</span>
              <span>IP ADDRESS</span>
              <span>CONNECTION</span>
            </div>
            <div className="text-slate-600">---------------------------------------------------------</div>
            <div className="space-y-1">
              <div className="grid grid-cols-[130px_70px_100px_100px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span>gnb-0x00001</span>
                <span>GNB</span>
                <span className="text-rose-500 font-semibold">STOPPED</span>
                <span>N/A</span>
                <span className="text-rose-500">🔴 {dict.hero.terminal.disconnected}</span>
              </div>
              <div className="grid grid-cols-[130px_70px_100px_100px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span>gnb-0x00002</span>
                <span>GNB</span>
                <span className="text-rose-500 font-semibold">STOPPED</span>
                <span>N/A</span>
                <span className="text-rose-500">🔴 {dict.hero.terminal.disconnected}</span>
              </div>
              <div className="grid grid-cols-[130px_70px_100px_100px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span>imsi-9997001</span>
                <span>UE</span>
                <span className="text-rose-500 font-semibold">STOPPED</span>
                <span>N/A</span>
                <span className="text-rose-500">🔴 {dict.hero.terminal.disconnected}</span>
              </div>
              <div className="grid grid-cols-[130px_70px_100px_100px_1fr] gap-x-2 text-slate-300 whitespace-nowrap">
                <span>imsi-9997002</span>
                <span>UE</span>
                <span className="text-rose-500 font-semibold">STOPPED</span>
                <span>N/A</span>
                <span className="text-rose-500">🔴 {dict.hero.terminal.disconnected}</span>
              </div>
            </div>
            <div className="text-slate-500 italic mt-1.5 ml-2">
              ... +10 other simulated devices stopped
            </div>
          </div>
        );
        setLines((prev) => [...prev, devicesOutput]);

        await sleep(10000); // Show final screen for 10 seconds before resetting
      }
    }

    async function typeCommand(cmd: string) {
      let currentText = "";
      const lineId = `prompt-${Math.random()}`;

      for (let i = 0; i < cmd.length; i++) {
        if (!active) return;
        currentText += cmd[i];

        const promptLine = (
          <div key={lineId} className="mt-3 font-semibold text-xs">
            <span className="text-emerald-400">→ </span>
            <span className="text-cyan-400">network-lab-5g </span>
            <span className="text-slate-400">git:(</span>
            <span className="text-rose-400">main</span>
            <span className="text-slate-400">) </span>
            <span className="text-amber-400">✗ </span>
            <span className="text-slate-200">{currentText}</span>
            <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle"></span>
          </div>
        );

        setLines((prev) => {
          const index = prev.findIndex((item) => (item as React.ReactElement).key === lineId);
          if (index !== -1) {
            const newLines = [...prev];
            newLines[index] = promptLine;
            return newLines;
          } else {
            return [...prev, promptLine];
          }
        });

        await sleep(50 + Math.random() * 70);
      }

      const finalPromptLine = (
        <div key={lineId} className="mt-3 font-semibold text-xs">
          <span className="text-emerald-400">→ </span>
          <span className="text-cyan-400">network-lab-5g </span>
          <span className="text-slate-400">git:(</span>
          <span className="text-rose-400">main</span>
          <span className="text-slate-400">) </span>
          <span className="text-amber-400">✗ </span>
          <span className="text-slate-200">{cmd}</span>
        </div>
      );
      setLines((prev) => {
        const index = prev.findIndex((item) => (item as React.ReactElement).key === lineId);
        if (index !== -1) {
          const newLines = [...prev];
          newLines[index] = finalPromptLine;
          return newLines;
        } else {
          return [...prev, finalPromptLine];
        }
      });
    }

    runSimulation();

    return () => {
      active = false;
    };
  }, [dict]);

  return (
    <section className="relative pt-24 pb-32 shrink-0 overflow-hidden">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-6 flex items-center gap-2 max-w-fit shadow-[0_0_15px_rgba(99,102,241,0.15)] backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse"></span>
                {dict.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-sm animate-fade-in"
            >
              {dict.hero.titlePart1} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300">{dict.hero.titlePart2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl font-light"
            >
              {dict.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-5 py-3.5 font-mono text-sm text-slate-300 shadow-xl backdrop-blur-md flex-1 md:flex-none">
                <span className="text-indigo-400">$</span> {dict.hero.commandPrompt}
              </div>
              <a href="#beta-program" className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all hover:scale-105 flex-1 md:flex-none">
                {dict.hero.betaButton} <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="lg:col-span-7 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-slate-800/50 flex flex-col">
              <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-2 border-b border-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-xs text-slate-500 font-mono ml-2">unuko-cli ~ /lab</span>
              </div>
              <div ref={terminalContainerRef} className="p-6 font-mono text-slate-300 overflow-x-auto relative min-h-[380px] max-h-[420px] overflow-y-auto text-xs">
                {lines}
              </div>
            </div>

            <div className="absolute -top-6 -right-4 bg-slate-900/95 backdrop-blur-xl px-5 py-3 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-800 hidden sm:flex gap-5 transform group-hover:-translate-y-1 transition-transform duration-500 z-10">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">{dict.hero.licenseLabel}</div>
                <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> AGPLv3
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800 self-center"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">{dict.hero.extensibilityLabel}</div>
                <div className="text-sm font-bold text-slate-200 font-mono">{dict.hero.modifiableLabel}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
