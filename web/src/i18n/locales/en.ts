import { TranslationDict } from "./es";

export const en: TranslationDict = {
  navbar: {
    features: "Features",
    ecosystem: "Ecosystem",
    usecases: "Use Cases",
    docs: "Documentation",
    startDoc: "Getting Started"
  },
  hero: {
    badge: "Active Development — Open Source AGPLv3",
    titlePart1: "Unuko ToolKit",
    titlePart2: "The 5G eSIM lab I always wanted to have.",
    description: "I worked for years in telecom with JavaScript and I know how difficult it is to test in real environments and deal with complex configurations. I created Unuko so that any JS/TS developer can spin up a complete 5G eSIM environment in seconds.",
    commandPrompt: "unuko core5g start",
    betaButton: "Try the Beta",
    licenseLabel: "License",
    extensibilityLabel: "Extensibility",
    modifiableLabel: "100% Modifiable",
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
    badge: "Technical Approach",
    title: "Why build it in TypeScript/JavaScript?",
    subtitle: "In telecommunications it is common to face closed C++ code and environments that are impossible to debug. I chose the modern JS/TS ecosystem to build an accessible, predictable, and open testing environment.",
    items: {
      cli: {
        name: "Unified `unuko` CLI",
        description: "Designed to avoid tedious manual setups. With simple commands like 'unuko core5g start' I bring up the entire lab instantly."
      },
      extensible: {
        name: "Extensible Structure",
        description: "I created this ToolKit in a modular way. You can modify logical flows, add custom states, or integrate your own components without proprietary code restrictions."
      },
      telco: {
        name: "Modern Telco Ecosystem",
        description: "I decided to leave legacy C/C++ code behind. Everything is orchestrated with TypeScript and Fastify for speed, validation with Zod, and state machines with XState."
      },
      gsma: {
        name: "Native GSMA Standards",
        description: "I implemented native compatibility with Consumer (SGP.22) and the new IoT (SGP.32) eSIM profiles to test real provisioning without physical hardware."
      },
      ai: {
        name: "AI-Assisted Auditing",
        description: "I integrated a Gemini-based auditor to translate cryptic hex APDU commands of the eUICC card and SM-DP+ frames into plain English."
      },
      cryptography: {
        name: "SoftHSM Cryptography",
        description: "I configured SoftHSM and PKCS#11 to emulate real secure chip storage, allowing you to generate and sign elliptical secp256r1 keys on your own machine."
      }
    }
  },
  story: {
    badge: "The Story Behind Unuko",
    titlePart1: "Why I decided to build",
    titlePart2: "this environment myself.",
    p1: "Hi! I am the creator of Unuko. I spent a large part of my professional career immersed in the complex world of telecommunications, while my main programming ecosystem has always been JavaScript and TypeScript.",
    p2: "For years, I constantly faced the same obstacle: how incredibly difficult, expensive, and frustrating it is to test network developments in real environments. In traditional telecom, software is proprietary, standards are implemented behind closed doors, and deploying a minimal eSIM lab requires configuring dozens of complex virtual machines, obscure virtual network interfaces, and relying on restrictive hardware.",
    p3: "I got tired of dealing with undecipherable legacy scripts, silent segmentation faults, and proprietary setups that only work in closed corporate environments.",
    mission: "My mission with Unuko is to democratize telecommunications. I want any developer, especially coming from the JS/TS ecosystem, to be able to spin up a virtualized 5G core and simulate remote eSIM provisioning in seconds on their own machine.",
    caption: "A telecom developer looking to change the rules of the game.",
    diagnosisTitle: "The Problem Diagnosis",
    diagnosisSubtitle: "Summary of my experience",
    problem1Title: "The Configuration Problem",
    problem1Desc: "Setting up Open5GS and Osmocom requires understanding cryptic protocols and writing hundreds of lines of error-prone YAML and JSON configurations.",
    problem2Title: "The Unreachable Hardware",
    problem2Desc: "Testing physical eSIMs and eUICC chips used to require smart card readers, physical antenna networks, and restrictive commercial hardware.",
    solutionTitle: "My Solution: Unuko ToolKit",
    solutionDesc: "Infrastructure orchestration using virtual machines (Lima/VM) controlled in TS. We simulate SIM cards via software (SoftHSM) connecting them to emulated antennas and 5G cores.",
    consoleLabelOrigin: "origin",
    consoleValueOrigin: "Telecommunications",
    consoleLabelPassion: "passion",
    consoleValuePassion: "JS/TS Ecosystem",
    consoleLabelMission: "mission",
    consoleValueMission: "Facilitate 5G Access",
    consoleComment: "// Run unuko core5g start to try it"
  },
  techStack: {
    badge: "Laboratory Ecosystem",
    title: "Powered by open standards and open source",
    subtitle: "Unuko ToolKit orchestrates the most powerful open telecom tools in the industry and exposes their capabilities through a unified CLI and web panel.",
    open5gs: {
      category: "5G Core Network",
      description: "Native integration with Open5GS. Deploy dynamically configured Network Functions (AMF, SMF, UPF) and expose their interfaces in your local development environment friction-free.",
      f1: "Dynamic provisioning via API/MongoDB",
      f2: "Automatic PLMN and Slice configuration"
    },
    ueransim: {
      category: "RAN & UE Simulator",
      description: "Simulates gNodeB antennas and 5G mobile devices. Unuko emulates the eUICC socket of the mobile device to receive and install eSIM profiles via APDU commands.",
      f1: "Mapping of UEs to local TUN interfaces",
      f2: "APDU commands routed over TCP/IP"
    },
    smdpp: {
      category: "Subscription Manager",
      description: "Integrated Osmocom SM-DP+ test server. Generates encrypted eSIM profiles and responds to GSMA-compliant ES9+/ESips REST calls.",
      f1: "ES9+ Authentication and Download phases",
      f2: "BoundProfilePackage generation and signing"
    },
    softhsm: {
      category: "Card Cryptography",
      description: "Key and signature management using software cryptographic tokens. Emulates secure storage and elliptical algorithms of a physical eUICC chip.",
      f1: "secp256r1 ECDSA key pair",
      f2: "Standard-compliant cryptographic signatures"
    }
  },
  useCases: {
    titlePart1: "Designed to solve",
    titlePart2: "my daily needs",
    subtitle: "I designed Unuko ToolKit with the goal of resolving the bottlenecks that wasted most of my time when programming network and eSIM flows in the 5G ecosystem.",
    ci: {
      title: "Continuous Integration (CI)",
      description: "I designed the CLI to run headlessly in GitHub Actions. This allows me to run automated eSIM flows and network validations on every commit without manual intervention.",
      metric: "My network pipelines run 100% automated"
    },
    sandbox: {
      title: "Local Development Sandbox",
      description: "I wanted to avoid cluttering my host machine at all costs. With 'unuko core5g start' and 'stop' I isolate the database, radio simulators, and network interfaces cleanly and ephemerally.",
      metric: "My local development environment, fast and clean"
    },
    research: {
      title: "Extensible R&D and Protocols",
      description: "I made this ToolKit 100% modular in TypeScript so that, just like I add new network logic or APDU states using XState, you can clone the repo and adapt it to your own radio and chip experiments.",
      metric: "Designed to be open and modified"
    }
  },
  beta: {
    badge: "Beta Tester Program",
    title: "Do you want to test Unuko RSP in your own environment?",
    description: "I am very interested in knowing how it works for you and how I can keep improving the ToolKit. If you code in JS/TS, develop IoT, or work in telecom networks, sign up for the beta and let's chat.",
    placeholder: "your-email@company.com",
    button: "Sign Up",
    success: "Thank you! We will contact you soon with the Beta instructions.",
    error: "Please enter a valid email address."
  },
  footer: {
    copyright: "Unuko Project. Open source under GNU AGPLv3 license."
  }
};
