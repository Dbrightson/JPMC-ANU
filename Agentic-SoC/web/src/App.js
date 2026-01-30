import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Shield, Brain, Flame, Users, Activity, Zap, Menu, 
  ChevronRight, Bell, ToggleLeft, ToggleRight
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ThreatIntel from "./pages/ThreatIntel";
import CognitiveFirewall from "./pages/CognitiveFirewall";
import AiSoc from "./pages/AiSoc";
import InsiderThreat from "./pages/InsiderThreat";
import WarGames from "./pages/WarGames";
import AccessGate from "./components/AccessGate";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Demo Mode Context
export const DemoContext = createContext();
export const useDemoMode = () => useContext(DemoContext);

const navItems = [
  { path: "/", label: "Command Center", icon: Activity },
  { path: "/threat-intel", label: "Threat Intel", icon: Brain },
  { path: "/firewall", label: "Cognitive Firewall", icon: Flame },
  { path: "/soc", label: "AI SOC", icon: Shield },
  { path: "/insider-threat", label: "Insider Threats", icon: Users },
  { path: "/wargames", label: "War Games", icon: Zap },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0B0F1A]/95 backdrop-blur-xl 
        border-r border-cyan-500/20 z-50 transform transition-transform duration-300
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400 icon-glow" />
            <div>
              <h1 className="font-rajdhani font-bold text-xl text-cyan-400 text-glow-cyan tracking-wider">
                GUARDIAN
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest">AI SECURITY PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200
                  font-mono text-sm tracking-wide
                  ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'icon-glow' : ''}`} />
                <span className="uppercase">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="status-dot low"></span>
            <span className="font-mono">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen, demoMode, setDemoMode }) => {
  const [notifications, setNotifications] = useState(3);
  
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-cyan-500/20 z-30 px-4 lg:px-6">
      <div className="flex items-center justify-between h-full">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2 text-slate-400 hover:text-cyan-400"
          onClick={() => setIsOpen(true)}
          data-testid="mobile-menu-btn"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:block">Demo Mode</span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            data-testid="demo-mode-toggle"
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all
              ${demoMode 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                : 'bg-slate-800/50 border-slate-700 text-slate-500'
              }
            `}
          >
            {demoMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span className="text-xs font-rajdhani font-bold uppercase tracking-wider">
              {demoMode ? 'ACTIVE' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button 
            className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            data-testid="notifications-btn"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Current Time */}
          <div className="hidden md:block text-right">
            <div className="font-rajdhani font-bold text-cyan-400 text-sm">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="fixed bottom-0 right-0 left-0 lg:left-64 h-10 bg-[#030712]/95 border-t border-cyan-500/10 z-20 px-4 flex items-center justify-center">
    <p className="text-[11px] text-slate-500 font-mono text-center">
      For AI security work reach out{' '}
      <span className="text-cyan-400">Siddharth, Mayank, Lalit, Rakesh, Amit, Piyush</span>
      {' '}and if you are confused{' '}
      <span className="text-yellow-400">drinks is on us</span>
    </p>
  </footer>
);

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  return (
    <DemoContext.Provider value={{ demoMode, setDemoMode }}>
      <div className="min-h-screen bg-[#030712] grid-bg">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <Header 
          setIsOpen={setSidebarOpen} 
          demoMode={demoMode} 
          setDemoMode={setDemoMode} 
        />
        
        <main className="lg:ml-64 pt-16 pb-12 min-h-screen">
          <div className="p-4 lg:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/threat-intel" element={<ThreatIntel />} />
              <Route path="/firewall" element={<CognitiveFirewall />} />
              <Route path="/soc" element={<AiSoc />} />
              <Route path="/insider-threat" element={<InsiderThreat />} />
              <Route path="/wargames" element={<WarGames />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </DemoContext.Provider>
  );
};

function App() {
  const [hasAccess, setHasAccess] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const accessGranted = sessionStorage.getItem('guardian_access');
    if (accessGranted === 'mayank_lau') {
      setHasAccess(true);
    }
  }, []);

  const handleAccess = (granted) => {
    if (granted) {
      sessionStorage.setItem('guardian_access', 'mayank_lau');
      setHasAccess(true);
    }
  };

  if (!hasAccess) {
    return <AccessGate onAccess={handleAccess} />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
