import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Trash2,
  Activity,
  Wifi,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Insights {
  currentState: string;
  rrcConnection: 'Connected' | 'Searching' | 'Offline' | 'Pending';
  errorsCount: number;
  warningsCount: number;
  selectedPlmn: string;
}

interface AILogAuditorProps {
  logs: string;
  deviceId: string;
}

// System Prompt for real window.ai
const SYSTEM_PROMPT = `Eres Unuko RSP-AI, un asistente experto de IA local de clase mundial en telecomunicaciones 5G, protocolos celulares (NAS, RRC, NGAP, GTP, PFCP) y arquitectura de nodos de red. 
Tu tarea es analizar los logs de dispositivos de un simulador UERANSIM 5G UE o gNodeB, explicar cualquier problema, advertencia o transición de estado de protocolo, y guiar a los ingenieros de red.
Sé altamente técnico, preciso, conciso y de gran ayuda. Utiliza la terminología estándar 3GPP.
SIEMPRE responde en español.`;

// Extend global scope for Chrome's experimental Prompt API
declare global {
  interface Window {
    LanguageModel?: any;
    ai?: {
      languageModel?: {
        availability(options?: any): Promise<'readily' | 'after-download' | 'no'>;
        create(options?: any): Promise<any>;
      };
      assistant?: {
        availability(options?: any): Promise<'readily' | 'after-download' | 'no'>;
        create(options?: any): Promise<any>;
      };
    };
  }
  const LanguageModel: any;
}

// Simple Custom Markdown/Text Formatter to render AI responses with styled markup
const FormattedMessage = ({ text }: { text: string }) => {
  const parseLine = (line: string, lineIdx: number) => {
    // Check for headers (e.g. ### Header or **Header**)
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="text-[13px] font-black uppercase tracking-wider text-primary mt-3 mb-1.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          {line.replace('### ', '')}
        </h4>
      );
    }

    // Check for lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().replace(/^[-*]\s+/, '');
      return (
        <li key={lineIdx} className="ml-4 list-disc text-[12.5px] leading-relaxed text-muted-foreground my-0.5">
          {parseInlineElements(content)}
        </li>
      );
    }

    // Check for numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const [_, num, content] = numMatch;
      return (
        <div key={lineIdx} className="flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground my-1 pl-1">
          <span className="text-primary font-bold">{num}.</span>
          <span>{parseInlineElements(content)}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="text-[12.5px] leading-relaxed text-foreground/90 my-1.5">
        {parseInlineElements(line)}
      </p>
    );
  };

  const parseInlineElements = (text: string) => {
    // Split by bold elements (**bold**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;

    // We do a simple sequential replacement of markdown styles
    let parts: React.ReactNode[] = [text];

    // Process code blocks
    let newParts: React.ReactNode[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const subParts = [];
        let lastIndex = 0;
        let match;

        // Reset regex index
        codeRegex.lastIndex = 0;
        while ((match = codeRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            subParts.push(part.substring(lastIndex, match.index));
          }
          subParts.push(
            <code key={`code-${match.index}`} className="px-1.5 py-0.5 rounded bg-muted/80 text-[11.5px] font-mono border border-border/50 text-purple-400 font-semibold">
              {match[1]}
            </code>
          );
          lastIndex = codeRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          subParts.push(part.substring(lastIndex));
        }
        newParts.push(...subParts);
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    // Process bold blocks
    newParts = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const subParts = [];
        let lastIndex = 0;
        let match;

        boldRegex.lastIndex = 0;
        while ((match = boldRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            subParts.push(part.substring(lastIndex, match.index));
          }
          subParts.push(
            <strong key={`bold-${match.index}`} className="font-extrabold text-foreground tracking-tight">
              {match[1]}
            </strong>
          );
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          subParts.push(part.substring(lastIndex));
        }
        newParts.push(...subParts);
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    return <>{parts}</>;
  };

  const lines = text.split('\n');
  return <div className="space-y-0.5 font-sans">{lines.map((line, idx) => parseLine(line, idx))}</div>;
};

export const AILogAuditor: React.FC<AILogAuditorProps> = ({ logs, deviceId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [promptApiStatus, setPromptApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [aiSession, setAiSession] = useState<any>(null);

  // Real-time parsed insights from logs
  const [insights, setInsights] = useState<Insights>({
    currentState: 'UNKNOWN',
    rrcConnection: 'Offline',
    errorsCount: 0,
    warningsCount: 0,
    selectedPlmn: 'N/A'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Collapsible telemetry state
  const [telemetryCollapsed, setTelemetryCollapsed] = useState(() => {
    const saved = localStorage.getItem('unuko_telemetry_collapsed');
    return saved === 'true';
  });

  const toggleTelemetry = () => {
    setTelemetryCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('unuko_telemetry_collapsed', next.toString());
      return next;
    });
  };

  // Parse logs in real-time
  useEffect(() => {
    if (!logs) return;

    const lines = logs.split('\n');
    let errs = 0;
    let warns = 0;
    let lastState = 'INITIAL';
    let plmn = 'N/A';
    let conn: 'Connected' | 'Searching' | 'Offline' | 'Pending' = 'Offline';

    lines.forEach(line => {
      const lower = line.toLowerCase();

      // Count warnings and errors
      if (lower.includes('[error]')) errs++;
      if (lower.includes('[warning]') || lower.includes('[warn]')) warns++;

      // Check for state transitions
      const stateMatch = line.match(/UE switches to state \[(MM-[^\]]+|CM-[^\]]+|RRC-[^\]]+)\]/i);
      if (stateMatch) {
        lastState = stateMatch[1];
      }

      // Check for selected PLMN
      const plmnMatch = line.match(/selected plmn\[(.*?)\]/i);
      if (plmnMatch) {
        plmn = plmnMatch[1];
      }

      // Check signal coverage or search status
      if (lower.includes('cell selection failure') || lower.includes('no cell is in coverage')) {
        conn = 'Offline';
      } else if (lower.includes('plmn-search') || lower.includes('searching')) {
        conn = 'Searching';
      } else if (lower.includes('rrc connection established') || lower.includes('rrc-connected') || lower.includes('normal-service') || lower.includes('cm-connected')) {
        conn = 'Connected';
      } else if (lower.includes('new signal detected') || lower.includes('selected cell plmn')) {
        conn = 'Pending';
      }
    });

    // If active state is CM-CONNECTED or RRC-CONNECTED, guarantee Connection status is Connected
    if (lastState.includes('CONNECTED') || lastState.includes('NORMAL-SERVICE')) {
      conn = 'Connected';
    }

    setInsights({
      currentState: lastState,
      rrcConnection: conn,
      errorsCount: errs,
      warningsCount: warns,
      selectedPlmn: plmn
    });
  }, [logs]);

  // Check LanguageModel (Prompt API) availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // A. Standard LanguageModel from documentation
        if (typeof LanguageModel !== 'undefined') {
          const avail = await LanguageModel.availability();
          if (avail !== 'no') {
            setPromptApiStatus('available');
            return;
          }
        }

        // B. Fallback to older window.ai
        if (window.ai && window.ai.languageModel) {
          const avail = await window.ai.languageModel.availability();
          if (avail !== 'no') {
            setPromptApiStatus('available');
            return;
          }
        } else if (window.ai && window.ai.assistant) {
          const avail = await window.ai.assistant.availability();
          if (avail !== 'no') {
            setPromptApiStatus('available');
            return;
          }
        }
        setPromptApiStatus('unavailable');
      } catch (err) {
        console.error('Error checking model availability:', err);
        setPromptApiStatus('unavailable');
      }
    };

    checkAvailability();

    // Add initial greeting from the AI expert
    setMessages([
      {
        id: 'greet',
        role: 'assistant',
        content: `### ¡Bienvenido de nuevo, Ingeniero! ⚡
Soy **Unuko RSP-AI**, tu experto local en diagnóstico de protocolos y telecomunicaciones 5G.

Me he conectado automáticamente a la traza activa de logs del dispositivo \`${deviceId}\`. Puedes:
- Ver la telemetría de conexión en tiempo real arriba.
- Hacer clic en **"Ejecutar Auditoría Profunda"** para analizar el búfer de logs activo en busca de advertencias o fallos.
- Hacerme preguntas técnicas (por ejemplo, transiciones de estado, parámetros de búsqueda de celdas, temporizadores de protocolo) usando el chat.`,
        timestamp: new Date()
      }
    ]);
  }, [deviceId]);

  // Destroy AI Session on unmount
  useEffect(() => {
    return () => {
      if (aiSession && typeof aiSession.destroy === 'function') {
        aiSession.destroy();
      }
    };
  }, [aiSession]);

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Initialize or retrieve AI session
  const getAISession = async () => {
    if (aiSession) return aiSession;

    // A. Standard LanguageModel session creation from documentation
    if (typeof LanguageModel !== 'undefined') {
      try {
        const session = await LanguageModel.create({
          initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }]
        });
        setAiSession(session);
        return session;
      } catch (err) {
        console.error('Failed to create LanguageModel session:', err);
      }
    }

    // B. Legacy fallback to window.ai
    if (window.ai) {
      const api = window.ai.languageModel || window.ai.assistant;
      if (api) {
        try {
          const session = await api.create({
            systemPrompt: SYSTEM_PROMPT,
            initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }]
          });
          setAiSession(session);
          return session;
        } catch (err) {
          console.error('Failed to create window.ai session:', err);
        }
      }
    }
    return null;
  };



  // Submit Prompt to AI (Real local Gemini Nano)
  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiLoading(true);

    const activeLogsSnippet = logs.split('\n').slice(-100).join('\n'); // Grab last 100 lines of logs

    // 1. If Prompt API is not available, show instructional warning
    if (promptApiStatus === 'unavailable') {
      setTimeout(() => {
        setIsAiLoading(false);
        const responseId = `msg-${Date.now()}-assistant`;
        setMessages(prev => [...prev, {
          id: responseId,
          role: 'assistant',
          content: `### ⚠️ API de IA Local No Disponible
La **Prompt API (\`window.ai\`)** no está disponible o no se encuentra habilitada en tu navegador actual.

Como has solicitado evaluar **únicamente el comportamiento real del modelo Gemini Nano** (sin simulaciones ni reglas estáticas de \`if/else\`), debes activar las capacidades nativas de Chrome para que el modelo local procese esta consulta en tu máquina:

1. **Activar el Modelo Local**: Abre \`chrome://flags/#optimization-guide-on-device-model\` en Chrome y cámbialo a **Enabled BypassPerfRequirement**.
2. **Activar la API de Prompts**: Abre \`chrome://flags/#prompt-api-for-gemini-nano\` y establécelo en **Enabled**.
3. **Reiniciar Chrome**: Haz clic en el botón de reinicio (*Relaunch*).
4. **Verificar Descarga**: Abre \`chrome://on-device-internals\` para comprobar que el modelo Gemini Nano se ha descargado correctamente (pesa ~1.5 GB).

*Una vez completado, el banner superior cambiará a **"Local Gemini Nano"** y el modelo procesará directamente tus logs.*`,
          timestamp: new Date()
        }]);
      }, 600);
      return;
    }

    // 2. If real Prompt API is available, try to use it
    try {
      const session = await getAISession();
      if (session) {
        // Prepare prompt including current log context in Spanish
        const fullPrompt = `Contexto de logs:\n"""\n${activeLogsSnippet}\n"""\n\nPregunta del usuario: ${text}\n\nResponde en español de forma técnica.`;

        let aiResponse = '';
        const responseId = `msg-${Date.now()}-assistant`;

        // Let's check if promptStreaming is available
        if (typeof session.promptStreaming === 'function') {
          const stream = session.promptStreaming(fullPrompt);
          setIsAiLoading(false); // Disable typing spinner once stream starts

          // Add placeholder assistant message
          setMessages(prev => [...prev, {
            id: responseId,
            role: 'assistant',
            content: 'Pensando...',
            timestamp: new Date()
          }]);

          for await (const chunk of stream) {
            // Auto-detect if the chunk is cumulative or a delta token
            if (aiResponse && chunk.startsWith(aiResponse)) {
              aiResponse = chunk;
            } else {
              aiResponse += chunk;
            }
            setMessages(prev => prev.map(m => m.id === responseId ? { ...m, content: aiResponse } : m));
            console.log('Stream chunk:', chunk);
          }
          console.log('🤖 [window.ai] Respuesta final recibida por streaming de la IA local:', aiResponse);
        } else {
          // Fallback to standard prompt block
          const result = await session.prompt(fullPrompt);
          console.log('🤖 [window.ai] Respuesta final recibida (síncrona) de la IA local:', result);
          setMessages(prev => [...prev, {
            id: responseId,
            role: 'assistant',
            content: result,
            timestamp: new Date()
          }]);
          setIsAiLoading(false);
        }
        return;
      }
    } catch (err) {
      console.error('Error during Prompt API call:', err);
      setIsAiLoading(false);
      const responseId = `msg-${Date.now()}-assistant`;
      setMessages(prev => [...prev, {
        id: responseId,
        role: 'assistant',
        content: `### ❌ Error al invocar el modelo local\nOcurrió un error al intentar llamar a la Prompt API del navegador:\n\n\`\`\`text\n${err instanceof Error ? err.message : String(err)}\n\`\`\`\n\nPor favor, verifica el estado en \`chrome://on-device-internals\`.`,
        timestamp: new Date()
      }]);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Deseas restablecer esta sesión de auditoría?')) {
      if (aiSession && typeof aiSession.destroy === 'function') {
        aiSession.destroy();
        setAiSession(null);
      }
      setMessages([
        {
          id: `greet-${Date.now()}`,
          role: 'assistant',
          content: `### Sesión de auditoría restablecida. 🧹\n¿Cómo puedo ayudarte a analizar los logs del dispositivo \`${deviceId}\` ahora?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Helper colors for connection telemetry
  const getConnBadge = (status: Insights['rrcConnection']) => {
    switch (status) {
      case 'Connected':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
      case 'Searching':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse';
      case 'Offline':
        return 'bg-destructive/10 text-destructive border border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border-l border-border/80 relative text-foreground font-sans">
      {/* Telemetry Dashboard Widget */}
      <div className="bg-card/60 backdrop-blur-md border-b border-border/50 select-none">
        {/* Clickable Header */}
        <div 
          onClick={toggleTelemetry}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 active:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              Log Telemetry
              {telemetryCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/60" />}
            </h4>
          </div>
          <Badge className={cn(getConnBadge(insights.rrcConnection), "text-[9px] uppercase font-black px-1.5 py-0.5 rounded-sm shrink-0")}>
            <Wifi className="w-2.5 h-2.5 mr-1" />
            {insights.rrcConnection}
          </Badge>
        </div>

        {/* Collapsible content with animation */}
        <AnimatePresence initial={false}>
          {!telemetryCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden px-4 pb-4"
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* State */}
                <div className="bg-slate-950/40 p-2 rounded border border-border/20 flex flex-col justify-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">NAS State</span>
                  <span className="text-[10px] font-mono font-bold text-purple-400 truncate mt-0.5" title={insights.currentState}>
                    {insights.currentState}
                  </span>
                </div>
                {/* PLMN */}
                <div className="bg-slate-950/40 p-2 rounded border border-border/20 flex flex-col justify-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Lock PLMN</span>
                  <span className="text-[10px] font-mono font-bold text-sky-400 truncate mt-0.5">
                    {insights.selectedPlmn}
                  </span>
                </div>
                {/* Warnings */}
                <div className="bg-slate-950/40 p-2 rounded border border-border/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Warnings</span>
                    <span className="text-[11px] font-mono font-black text-amber-500 mt-0.5">{insights.warningsCount}</span>
                  </div>
                  <AlertTriangle className={cn("w-3.5 h-3.5 text-amber-500/80", insights.warningsCount > 0 && "animate-bounce")} />
                </div>
                {/* Errors */}
                <div className="bg-slate-950/40 p-2 rounded border border-border/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Errors</span>
                    <span className="text-[11px] font-mono font-black text-destructive mt-0.5">{insights.errorsCount}</span>
                  </div>
                  <ShieldAlert className={cn("w-3.5 h-3.5 text-destructive/80", insights.errorsCount > 0 && "animate-pulse")} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Model Mode Banner */}
      <div className="px-4 py-2 border-b border-border/30 bg-slate-950/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className={cn("w-3.5 h-3.5 text-primary", promptApiStatus === 'available' && "animate-pulse text-emerald-400")} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Mode: {promptApiStatus === 'available' ? 'Local Gemini Nano' : 'Local AI Unavailable'}
          </span>
        </div>

        {promptApiStatus === 'unavailable' && (
          <button
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="text-[9px] font-black text-primary uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Enable local window.ai
            {showConfigGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Local AI Guide Panel */}
      <AnimatePresence>
        {showConfigGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card/90 border-b border-border/50 text-[10px] overflow-hidden leading-relaxed text-muted-foreground"
          >
            <div className="p-4 space-y-2 font-sans max-h-48 overflow-y-auto">
              <div className="flex items-center gap-1 text-foreground font-black uppercase tracking-widest text-[9px] mb-1">
                <Info className="w-3.5 h-3.5 text-primary" />
                How to enable Chrome Prompt API
              </div>
              <p>To run Gemini Nano completely locally on your machine for logs diagnostics, configure the following flags in **Google Chrome (v148+)**:</p>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>
                  Open <code className="px-1 py-0.5 rounded bg-muted font-mono select-all">chrome://flags/#optimization-guide-on-device-model</code> and set to <span className="text-foreground font-bold">Enabled BypassPerfRequirement</span>.
                </li>
                <li>
                  Open <code className="px-1 py-0.5 rounded bg-muted font-mono select-all">chrome://flags/#prompt-api-for-gemini-nano</code> and set to <span className="text-foreground font-bold">Enabled</span>.
                </li>
                <li>
                  Relaunch your browser and open <code className="px-1 py-0.5 rounded bg-muted font-mono select-all">chrome://on-device-internals</code> to monitor the Gemini Nano model download.
                </li>
              </ol>
              <p className="text-[9px] text-primary/80 italic flex items-center gap-1 mt-1">
                <ExternalLink className="w-3 h-3" />
                No data is sent to the internet; all auditing happens entirely on your machine.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-muted">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border shadow-inner",
                msg.role === 'user'
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-purple-500/10 text-purple-500 border-purple-500/20"
              )}>
                {msg.role === 'user' ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "max-w-[85%] rounded p-3 text-[12.5px] shadow-lg border",
                msg.role === 'user'
                  ? "bg-primary/5 border-primary/10 text-foreground"
                  : "bg-card/40 border-border/40 text-foreground/90 font-sans"
              )}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-sans font-medium text-[12.5px] leading-relaxed text-foreground">{msg.content}</p>
                ) : (
                  <FormattedMessage text={msg.content} />
                )}

                <span className="block text-[9px] font-mono text-muted-foreground/60 text-right mt-1.5 uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}

          {isAiLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 flex-row"
            >
              <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-purple-500/10 text-purple-500 border border-purple-500/20 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-card/30 border border-border/30 rounded p-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-muted-foreground font-medium pl-1">Auditando traza de logs...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Preset Suggestions / Chip Options */}
      <div className="px-4 py-2 border-t border-border/20 flex flex-wrap gap-1.5 bg-slate-950/20">
        <button
          onClick={() => handleSendPrompt("Ejecutar auditoría profunda de la traza de logs.")}
          className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Ejecutar Auditoría Profunda
        </button>
        <button
          onClick={() => handleSendPrompt("Explicar las transiciones de estado de protocolo.")}
          className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded bg-card hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          Explicar Transiciones de Estado
        </button>
        <button
          onClick={() => handleSendPrompt("Solucionar errores activos y fallos de configuración de RRC.")}
          className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded bg-card hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          Solucionar Errores
        </button>
        <button
          onClick={() => handleSendPrompt("¿Qué es el temporizador de protocolo NAS T3517?")}
          className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded bg-card hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          ¿Qué es NAS T3517?
        </button>
      </div>

      {/* Input Form Box */}
      <div className="p-4 bg-card/60 border-t border-border/50 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleClearChat}
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive border-border/80 hover:border-destructive/30 hover:bg-destructive/5"
          title="Restablecer Sesión de Auditoría"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <input
          type="text"
          placeholder="Pregúntale a Unuko AI sobre logs celulares..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendPrompt(inputValue);
            }
          }}
          disabled={isAiLoading}
          className="flex-1 h-9 rounded bg-background border border-border px-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-all font-sans font-medium"
        />

        <Button
          onClick={() => handleSendPrompt(inputValue)}
          disabled={!inputValue.trim() || isAiLoading}
          className="h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center rounded"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
