export const es = {
  navbar: {
    features: "Características",
    ecosystem: "Ecosistema",
    usecases: "Casos de Uso",
    docs: "Documentación",
    startDoc: "Doc de Inicio"
  },
  hero: {
    badge: "Desarrollo Activo — Código Abierto AGPLv3",
    titlePart1: "Unuko ToolKit",
    titlePart2: "El lab eSIM 5G que siempre quise tener.",
    description: "Trabajé durante años en telecomunicaciones con JavaScript y sé lo difícil que es probar en entornos reales y lidiar con configuraciones complejas. Creé Unuko para que cualquier desarrollador JS/TS pueda levantar un entorno completo de eSIM 5G en segundos.",
    commandPrompt: "unuko core5g start",
    betaButton: "Probar la Beta",
    licenseLabel: "Licencia",
    extensibilityLabel: "Extensibilidad",
    modifiableLabel: "100% Modificable",
    // terminal logs
    terminal: {
      availableNetworks: "Available 5G Networks (Lima VM Instances)",
      stopped: "Stopped",
      startingVm: "Starting Lima VM (core5g)...",
      startedVm: "Lima VM (core5g) started successfully.",
      dashboardTitle: "Unuko 5G Core & RSP Simulation Dashboard",
      systemServices: "System Services",
      fivegServices: "5G Core Services",
      online: "online",
      database: "Database",
      subscriberDb: "Subscriber DB",
      webui: "Web UI",
      adminPortal: "Admin portal",
      smdpp: "SM-DP+",
      esimServer: "eSIM server",
      mobilityMgmt: "Mobility mgmt",
      sessionMgmt: "Session mgmt",
      userPlane: "User plane data",
      subscriberData: "Subscriber data",
      otherServices: "... +6 other core network functions online",
      ueransimDevices: "Ueransim Simulated 5G Devices",
      connectingUeransim: "Connecting to UERANSIM simulation controller...",
      disconnected: "Disconnected"
    }
  },
  features: {
    badge: "El enfoque técnico",
    title: "¿Por qué construirlo en TypeScript/JavaScript?",
    subtitle: "En telecomunicaciones es común enfrentarse a código cerrado en C++ y entornos imposibles de depurar. Elegí el ecosistema JS/TS moderno para crear un entorno de pruebas accesible, predecible y abierto.",
    items: {
      cli: {
        name: "CLI Unificado `unuko`",
        description: "Diseñado para evitar configuraciones manuales tediosas. Con comandos sencillos como 'unuko core5g start' levanto todo el laboratorio al instante."
      },
      extensible: {
        name: "Estructura Extensible",
        description: "Creé este ToolKit de forma modular. Puedes modificar los flujos lógicos, añadir estados personalizados o integrar tus propios componentes sin restricciones de código propietario."
      },
      telco: {
        name: "Ecosistema Telco Moderno",
        description: "Decidí dejar atrás el código legacy en C/C++. Orquesté todo con TypeScript y Fastify para mayor velocidad, validaciones con Zod y máquinas de estado con XState."
      },
      gsma: {
        name: "Estándares GSMA Nativos",
        description: "Implementé compatibilidad nativa con perfiles de eSIM de Consumo (SGP.22) y el nuevo estándar IoT (SGP.32) para probar aprovisionamientos reales sin hardware físico."
      },
      ai: {
        name: "Auditoría asistida por IA",
        description: "Integré un auditor con Gemini para traducir a lenguaje natural los crípticos códigos APDU hexadecimales de la tarjeta eUICC y las tramas del SM-DP+."
      },
      cryptography: {
        name: "Criptografía por SoftHSM",
        description: "Configuré SoftHSM y PKCS#11 para emular el almacenamiento seguro del chip real, permitiendo generar y firmar claves elípticas secp256r1 en tu propia máquina."
      }
    }
  },
  story: {
    badge: "La historia detrás de Unuko",
    titlePart1: "Por qué decidí construir",
    titlePart2: "este entorno en primera persona.",
    p1: "¡Hola! Soy el creador de Unuko. He pasado gran parte de mi carrera profesional inmerso en el complejo mundo de las telecomunicaciones, mientras que mi ecosistema de programación principal siempre ha sido JavaScript y TypeScript.",
    p2: "Durante años, me enfrenté constantemente al mismo obstáculo: lo increíblemente difícil, costoso y frustrante que es probar desarrollos de red en entornos reales. En las telecos tradicionales, el software es propietario, los estándares se implementan a puerta cerrada y desplegar un laboratorio mínimo de eSIM requiere configurar decenas de máquinas virtuales complejas, interfaces de red virtual oscuras y depender de hardware privativo.",
    p3: "Me cansé de lidiar con scripts legacy indescifrables, fallos de segmentación silenciosos y configuraciones propietarias que solo funcionan en entornos corporativos cerrados.",
    mission: "Mi misión con Unuko es democratizar las telecomunicaciones. Quiero que cualquier desarrollador, especialmente si viene del ecosistema JS/TS, pueda levantar un núcleo 5G virtualizado y simular aprovisionamiento remoto de eSIM en segundos en su propia máquina.",
    caption: "Un desarrollador de telecomunicaciones buscando cambiar las reglas del juego.",
    diagnosisTitle: "El Diagnóstico del Problema",
    diagnosisSubtitle: "Resumen de mi experiencia",
    problem1Title: "El Problema de Configuración",
    problem1Desc: "Montar Open5GS y Osmocom requiere entender protocolos crípticos y escribir cientos de líneas de configuraciones YAML y JSON propensas a errores.",
    problem2Title: "El Hardware Inalcanzable",
    problem2Desc: "Probar eSIMs físicas y chips eUICC solía requerir lectores de tarjetas inteligentes, redes de antenas físicas y hardware comercial restrictivo.",
    solutionTitle: "Mi Solución: Unuko ToolKit",
    solutionDesc: "Orquestación de infraestructura mediante máquinas virtuales (Lima/VM) controladas en TS. Simulamos las tarjetas SIM por software (SoftHSM) conectándolas a antenas y cores 5G emulados.",
    consoleLabelOrigin: "origen",
    consoleValueOrigin: "Telecomunicaciones",
    consoleLabelPassion: "pasion",
    consoleValuePassion: "Ecosistema JS/TS",
    consoleLabelMission: "mision",
    consoleValueMission: "Facilitar el acceso al 5G",
    consoleComment: "// Corre unuko core5g start para comprobarlo"
  },
  techStack: {
    badge: "Ecosistema del Laboratorio",
    title: "Soportado por estándares y software libre",
    subtitle: "Unuko ToolKit orquesta las herramientas libres de telecomunicaciones más potentes del sector y expone sus capacidades mediante un CLI y panel web unificados.",
    open5gs: {
      category: "5G Core Network",
      description: "Integración nativa con Open5GS. Despliega Network Functions (AMF, SMF, UPF) configuradas dinámicamente y expón sus interfaces en tu entorno de desarrollo local sin fricciones.",
      f1: "Aprovisionamiento dinámico vía API/MongoDB",
      f2: "Configuración automática de PLMN y Slices"
    },
    ueransim: {
      category: "RAN & UE Simulator",
      description: "Simula antenas gNodeB y terminales móviles 5G. Unuko emula el socket eUICC del dispositivo móvil para recibir e instalar perfiles eSIM mediante comandos APDU.",
      f1: "Mapeo de UEs a interfaces TUN locales",
      f2: "Comandos APDU enrutados por TCP/IP"
    },
    smdpp: {
      category: "Subscription Manager",
      description: "Servidor de pruebas SM-DP+ de Osmocom integrado. Genera perfiles de eSIM encriptados y responde a las llamadas REST ES9+/ESips conformes a la GSMA.",
      f1: "Fases ES9+ de Autenticación y Descarga",
      f2: "Generación y firmas de BoundProfilePackage"
    },
    softhsm: {
      category: "Criptografía de Tarjeta",
      description: "Gestión de claves y firmas usando tokens criptográficos por software. Emula el almacenamiento seguro y los algoritmos elípticos de un chip físico eUICC.",
      f1: "Par de claves ECDSA secp256r1",
      f2: "Firmas criptográficas conformes al estándar"
    }
  },
  useCases: {
    titlePart1: "Diseñado para resolver",
    titlePart2: "mis necesidades diarias",
    subtitle: "Diseñé Unuko ToolKit pensando en resolver los cuellos de botella que más tiempo me hacían perder al programar flujos de red y eSIM en el ecosistema 5G.",
    ci: {
      title: "Integración Continua (CI)",
      description: "Diseñé el CLI para que pudiera ejecutarse de forma desatendida en GitHub Actions. Esto me permite correr flujos automatizados de eSIM y validaciones de red en cada commit sin intervención manual.",
      metric: "Mis pipelines de red corren 100% automatizados"
    },
    sandbox: {
      title: "Sandbox de Desarrollo Local",
      description: "Quería evitar a toda costa ensuciar mi máquina principal. Con 'unuko core5g start' y 'stop' aíslo la base de datos, los simuladores de radio y las interfaces de red de forma efímera y limpia.",
      metric: "Mi entorno de desarrollo local, rápido y limpio"
    },
    research: {
      title: "I+D Extensible y Protocolos",
      description: "Creé este ToolKit 100% modular en TypeScript para que, igual que yo añado nuevas lógicas de red o estados de APDU con XState, tú puedas clonar el repo y adaptarlo a tus propios experimentos de radio y chip.",
      metric: "Pensado para ser abierto y modificado"
    }
  },
  beta: {
    badge: "Programa de Beta Testers",
    title: "¿Quieres probar Unuko RSP en tu propio entorno?",
    description: "Me interesa muchísimo saber qué tal te funciona y en qué puedo seguir mejorando el ToolKit. Si programas en JS/TS, desarrollas IoT o trabajas en redes de telecomunicaciones, apúntate a la beta y charlamos.",
    placeholder: "tu-correo@empresa.com",
    button: "Registrarme",
    success: "¡Gracias! Te contactaremos pronto con las instrucciones de la Beta.",
    error: "Por favor, introduce un correo electrónico válido."
  },
  footer: {
    copyright: "Unuko Project. Código abierto bajo licencia GNU AGPLv3."
  }
};

export type TranslationDict = typeof es;
