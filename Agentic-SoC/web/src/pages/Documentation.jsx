import { useState } from "react";
import { 
  FileText, Target, Users, Shield, Brain, Flame, Package,
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Zap
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="scifi-card mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left"
        data-testid={`section-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
          <h3 className="font-rajdhani font-bold text-lg text-cyan-400 uppercase tracking-wider">{title}</h3>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ title, description, icon: Icon }) => (
  <div className="p-4 bg-slate-800/30 rounded-sm border-l-2 border-cyan-500/50">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
      <h4 className="font-rajdhani font-bold text-sm text-slate-200">{title}</h4>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const KPICard = ({ title, description }) => (
  <div className="p-3 bg-slate-800/30 rounded-sm">
    <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-1">{title}</h4>
    <p className="text-[11px] text-slate-400">{description}</p>
  </div>
);

const PRDContent = () => (
  <div className="space-y-4">
    <Section title="Goals" icon={Target} defaultOpen={true}>
      <div className="space-y-4">
        <div className="p-4 bg-slate-800/30 rounded-sm">
          <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Unified AI Security & Compliance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Provide a single platform that integrates all seven advanced AI security domains to give organizations 
            holistic protection across their AI systems and data. The platform dramatically reduces the expanded 
            attack surface introduced by AI (models, agents, data pipelines, etc.) and ensures AI-driven operations 
            remain secure, ethical, and compliant with global regulations.
          </p>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-sm">
          <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Proactive Threat & Risk Management</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuously monitor, detect, and predict threats across the AI lifecycle, shifting security posture 
            from reactive to proactive. This includes real-time attack surface intelligence, autonomous incident 
            response, and built-in risk modeling (e.g. quantifying the economic impact of potential incidents).
          </p>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-sm">
          <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Trustworthy AI Governance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enforce AI governance, ethics, and risk management autonomously across AI deployments using agentic 
            AI "guardians" that observe, decide, and act within governance policies. This fosters trust and 
            transparency in AI use.
          </p>
        </div>
      </div>
    </Section>

    <Section title="User Personas" icon={Users}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/30 rounded-sm border-l-2 border-red-500/50">
          <h4 className="font-rajdhani font-bold text-sm text-red-400 mb-2">CISO</h4>
          <p className="text-xs text-slate-400">
            Needs high-level visibility into AI-related risks and compliance status. Uses unified dashboards 
            for strategic risk reduction and regulatory requirements.
          </p>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-sm border-l-2 border-yellow-500/50">
          <h4 className="font-rajdhani font-bold text-sm text-yellow-400 mb-2">SOC Analyst</h4>
          <p className="text-xs text-slate-400">
            Monitors and investigates threats. Relies on AI SOC for autonomous alert triage and incident 
            remediation with clear, explainable analyses.
          </p>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-sm border-l-2 border-green-500/50">
          <h4 className="font-rajdhani font-bold text-sm text-green-400 mb-2">AI/ML Engineer</h4>
          <p className="text-xs text-slate-400">
            Develops and deploys AI models. Interacts with governance and supply chain modules to validate 
            model security and compliance.
          </p>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-sm border-l-2 border-purple-500/50">
          <h4 className="font-rajdhani font-bold text-sm text-purple-400 mb-2">Compliance Officer</h4>
          <p className="text-xs text-slate-400">
            Focuses on regulatory compliance and risk audits. Uses compliance mapping and contradiction 
            analysis features.
          </p>
        </div>
      </div>
    </Section>

    <Section title="Key Features" icon={Zap}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard 
          icon={Target}
          title="1. AI Attack Surface Intelligence"
          description="Continuous discovery and monitoring of all assets and entry points in the AI ecosystem. Real-time visibility of potential exploitation points spanning data, infrastructure, applications, and users."
        />
        <FeatureCard 
          icon={Shield}
          title="2. Autonomous AI Governance"
          description="Governance engine powered by autonomous agents to enforce policies, ethical guidelines, and risk controls. Auto-detects policy violations, bias in AI outputs, and misuse of AI."
        />
        <FeatureCard 
          icon={Brain}
          title="3. LLM Fraud Analytics"
          description="AI-powered analytics engine using LLMs to detect fraud, abuse, and advanced threats by fusing data from diverse sources including transaction logs, communications, and threat intelligence."
        />
        <FeatureCard 
          icon={Flame}
          title="4. AI Cognitive Firewall"
          description="Real-time 'cognitive firewall' protecting AI systems from malicious inputs, data leakage, and unsafe outputs. Inspects prompts/queries and LLM responses using security policies."
        />
        <FeatureCard 
          icon={Shield}
          title="5. Multi-Agent AI SOC"
          description="AI-driven SOC powered by team-of-agents that collaborate to detect, investigate, and respond to incidents at machine speed with specialized agents for each phase."
        />
        <FeatureCard 
          icon={Package}
          title="6. AI Supply Chain Security"
          description="Secures the AI supply chain end-to-end with data lineage validation, model provenance signing, and environment hardening across the entire AI development lifecycle."
        />
        <FeatureCard 
          icon={AlertTriangle}
          title="7. Insider Threat Detection"
          description="Advanced UEBA powered by AI to baseline normal behavior and flag deviations for both human users and AI agents, treating misbehaving AI as potential insider threats."
        />
      </div>
    </Section>

    <Section title="Key Performance Indicators" icon={CheckCircle}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <KPICard 
          title="Attack Surface Coverage"
          description=">95% coverage of all AI resources (models, data stores, APIs)"
        />
        <KPICard 
          title="MTTD/MTTR"
          description="Detect threats within seconds, automate response within minutes"
        />
        <KPICard 
          title="False Positive Rate"
          description=">90% of high-priority alerts are actionable"
        />
        <KPICard 
          title="Compliance Posture"
          description="Aggregate score representing regulatory compliance status"
        />
        <KPICard 
          title="User Adoption"
          description="Track incidents handled autonomously per month"
        />
        <KPICard 
          title="System Performance"
          description="Latency <100ms impact, 99.9%+ uptime target"
        />
      </div>
    </Section>

    <Section title="User Stories" icon={FileText}>
      <div className="space-y-3">
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">CISO - Risk Overview</p>
          <p className="text-xs text-slate-400">
            "As a CISO, I want a dashboard that gives me real-time insight into all AI-related risks and 
            compliance across my enterprise, so I can confidently report our AI risk posture to the board."
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">SOC Analyst - Autonomous Triage</p>
          <p className="text-xs text-slate-400">
            "As a SOC analyst, I want the platform to automatically investigate common alerts and either 
            resolve them or hand me a concise summary with recommended actions."
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">ML Engineer - Model Deployment</p>
          <p className="text-xs text-slate-400">
            "As an ML engineer, before deploying a new AI model, I want the platform to vet it for security 
            (backdoors, vulnerabilities) and compliance (bias, privacy)."
          </p>
        </div>
      </div>
    </Section>
  </div>
);

const SRSContent = () => (
  <div className="space-y-4">
    <Section title="System Architecture Overview" icon={Shield} defaultOpen={true}>
      <div className="space-y-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          The AI-Native Security Platform is designed as a modular, distributed system with a service-oriented 
          (microservices) architecture. Each of the seven core domains is implemented as a subsystem responsible 
          for specific functionalities, communicating through secure APIs/events.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-sm border border-cyan-500/20">
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Presentation Layer</h4>
            <p className="text-[11px] text-slate-400">
              Next.js/React Frontend served via Vercel, providing responsive UI for monitoring, alerts, 
              reports, and management actions with real-time components.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-sm border border-cyan-500/20">
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Application Layer</h4>
            <p className="text-[11px] text-slate-400">
              Node.js/FastAPI backend services for each module: Attack Surface, Governance, Fraud Analytics, 
              Cognitive Firewall, SOC, Supply Chain, and Insider Threat.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-sm border border-cyan-500/20">
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">AI/ML Components</h4>
            <p className="text-[11px] text-slate-400">
              LLM models and AI models for advanced reasoning, plus Agent Orchestrator (Emergent integration) 
              for managing multi-agent SOC and simulation tasks.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-sm border border-cyan-500/20">
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">Data Layer</h4>
            <p className="text-[11px] text-slate-400">
              PostgreSQL/MongoDB for structured data, graph database for attack surface mapping, vector 
              database for threat intelligence semantic search.
            </p>
          </div>
        </div>
      </div>
    </Section>

    <Section title="Module Specifications" icon={Package}>
      <div className="space-y-4">
        {[
          {
            title: "1. AI Attack Surface Intelligence Module",
            responsibilities: "Discover and monitor AI-related attack surface. Collect data on assets, identify vulnerabilities, map relationships.",
            components: ["Asset Discovery Engine", "Vulnerability Scanner & Analyzer", "Attack Surface Dashboard", "Alerts/Integration"]
          },
          {
            title: "2. Autonomous AI Governance Module",
            responsibilities: "Enforce high-level policies, ensure compliance with regulations and ethics guidelines, manage risk.",
            components: ["Policy Knowledge Base", "Governance Agents", "Risk Assessment Engine", "Compliance Mapping & Reporting"]
          },
          {
            title: "3. LLM Fraud Analytics Engine",
            responsibilities: "Detect fraud and synthesize threat intelligence using LLMs to parse unstructured data.",
            components: ["Data Ingestion Pipeline", "Analytics/Correlation Engine", "LLM Reasoning & NLP", "Threat Intelligence Database"]
          },
          {
            title: "4. AI Cognitive Firewall Module",
            responsibilities: "Protective layer for AI interactions, evaluating and filtering inputs/outputs.",
            components: ["Prompt/Input Filter", "Output/Post-Processor", "Policy Engine", "Monitoring & Logging"]
          },
          {
            title: "5. Multi-Agent AI SOC Module",
            responsibilities: "Orchestrate detection and response using team of AI agents.",
            components: ["Alert Triage Agent", "Investigation Agent", "Planning Agent", "Remediation Agent", "Case Documentation Agent"]
          },
          {
            title: "6. AI Supply Chain Security Module",
            responsibilities: "Safeguard integrity of data and models through the AI development lifecycle.",
            components: ["Data Integrity Validator", "Model Repository & Signing", "Dependency Security", "Continuous Verification"]
          },
          {
            title: "7. Insider Threat Detection Module",
            responsibilities: "Monitor for anomalous behaviors by users or AI indicating insider threats.",
            components: ["User Behavior Baseline", "Anomaly Detection & Scoring", "Insider Threat Patterns", "AI Agent Monitoring"]
          }
        ].map((module, idx) => (
          <div key={idx} className="p-4 bg-slate-800/30 rounded-sm">
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 mb-2">{module.title}</h4>
            <p className="text-[11px] text-slate-400 mb-2">{module.responsibilities}</p>
            <div className="flex flex-wrap gap-1">
              {module.components.map((comp, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Functional Requirements" icon={CheckCircle}>
      <div className="space-y-3">
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">FR1: Asset Discovery</p>
          <p className="text-[11px] text-slate-400">
            The system shall automatically discover and inventory all AI/ML-related assets across environments, 
            updating at least every 24 hours.
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">FR2: Policy Enforcement</p>
          <p className="text-[11px] text-slate-400">
            The system shall continuously monitor compliance with defined policies and external regulations, 
            taking appropriate action on violations.
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">FR3: Prompt Filtering</p>
          <p className="text-[11px] text-slate-400">
            The system shall detect disallowed or dangerous content in prompts and outputs, including prompt 
            injection attempts and sensitive data exposure.
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">FR4: Incident Response</p>
          <p className="text-[11px] text-slate-400">
            The platform shall automatically handle common security incidents end-to-end using AI agents with 
            configurable human-in-the-loop controls.
          </p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">FR5: Model Integrity</p>
          <p className="text-[11px] text-slate-400">
            When deploying a model, the system shall verify its signature/hash against the expected value, 
            blocking deployment if verification fails.
          </p>
        </div>
      </div>
    </Section>

    <Section title="Non-Functional Requirements" icon={Shield}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">Security</p>
          <p className="text-[11px] text-slate-400">Strong authentication (SAML SSO, MFA), encrypted communications (TLS 1.2+), regular penetration testing</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">Performance</p>
          <p className="text-[11px] text-slate-400">Prompt filtering under 100ms, alert dissemination within 5 seconds, handle peak loads gracefully</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">Reliability</p>
          <p className="text-[11px] text-slate-400">99.5%+ uptime, failover support, message queues for transient issues</p>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-sm">
          <p className="text-xs text-cyan-400 font-mono mb-1">Scalability</p>
          <p className="text-[11px] text-slate-400">Support 10,000+ events/second, 1,000+ concurrent users, horizontal scaling</p>
        </div>
      </div>
    </Section>

    <Section title="Compliance Mapping" icon={FileText}>
      <div className="overflow-x-auto">
        <table className="data-table text-xs">
          <thead>
            <tr>
              <th>Framework</th>
              <th>Key Requirements</th>
              <th>Platform Features</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-cyan-400 font-mono">GDPR</td>
              <td className="text-slate-400">Data discovery, Right to erasure, Breach notification</td>
              <td className="text-slate-300">Attack Surface Intel, Data Lineage, AI SOC Reports</td>
            </tr>
            <tr>
              <td className="text-cyan-400 font-mono">HIPAA</td>
              <td className="text-slate-400">Access controls, Encryption, Activity monitoring</td>
              <td className="text-slate-300">RBAC, TLS/Encryption, Insider Threat Detection</td>
            </tr>
            <tr>
              <td className="text-cyan-400 font-mono">SOC 2</td>
              <td className="text-slate-400">Security, Availability, Confidentiality</td>
              <td className="text-slate-300">Cognitive Firewall, HA Design, Data Classification</td>
            </tr>
            <tr>
              <td className="text-cyan-400 font-mono">NIST CSF</td>
              <td className="text-slate-400">Identify, Protect, Detect, Respond, Recover</td>
              <td className="text-slate-300">All 7 modules map to NIST functions</td>
            </tr>
            <tr>
              <td className="text-cyan-400 font-mono">EU AI Act</td>
              <td className="text-slate-400">Risk management, Transparency, Human oversight</td>
              <td className="text-slate-300">Governance Module, Audit Trails, Human-in-loop</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  </div>
);

const Documentation = () => {
  return (
    <div className="space-y-6 animate-fade-in" data-testid="documentation">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Platform Documentation
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Product Requirements & Software Specifications
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="prd" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800 p-1 h-auto">
          <TabsTrigger 
            value="prd" 
            className="font-rajdhani font-bold uppercase tracking-wider data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 py-3"
            data-testid="tab-prd"
          >
            PRD - Product Requirements
          </TabsTrigger>
          <TabsTrigger 
            value="srs" 
            className="font-rajdhani font-bold uppercase tracking-wider data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 py-3"
            data-testid="tab-srs"
          >
            SRS - Software Specifications
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="prd" className="mt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <PRDContent />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="srs" className="mt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <SRSContent />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Info Footer */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">Documentation Version 1.0</h4>
            <p className="text-xs text-slate-400 mt-1">
              This documentation covers the complete Product Requirements Document (PRD) and Software Requirements 
              Specification (SRS) for the AI-Native Security Platform. For updates or contributions, contact the 
              security team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
