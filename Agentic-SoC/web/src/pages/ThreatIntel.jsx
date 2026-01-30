import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Brain, Globe, AlertTriangle, Search, Eye, Link,
  RefreshCw, TrendingUp, Database, Fingerprint
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";

const SeverityBadge = ({ severity }) => {
  const classes = {
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low"
  };
  return <span className={`badge ${classes[severity] || 'badge-info'}`}>{severity}</span>;
};

const ThreatIntelCard = ({ alert }) => {
  const sourceIcons = {
    OSINT: Globe,
    "Dark Web Monitor": Eye,
    "Vendor Advisory": AlertTriangle,
    "Internal Hunt": Search,
    "Partner Intel": Link
  };
  
  const Icon = sourceIcons[alert.source] || Brain;
  
  return (
    <div className="scifi-card p-4 hover:border-cyan-500/50 transition-all" data-testid={`intel-${alert.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] text-slate-500 uppercase">{alert.source}</span>
        </div>
        <SeverityBadge severity={alert.severity} />
      </div>
      
      <h4 className="font-rajdhani font-bold text-sm text-slate-200 mb-2">{alert.title}</h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Fingerprint className="w-3 h-3 text-slate-500" />
          <span className="text-slate-500">IOC:</span>
          <code className="text-cyan-400 bg-slate-800/50 px-1 rounded text-[10px]">
            {alert.ioc_type}: {alert.ioc_value.substring(0, 12)}...
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Confidence: <span className="text-cyan-400">{alert.confidence}%</span>
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(alert.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const FraudPatternCard = ({ pattern }) => (
  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-sm">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-yellow-400" />
      <span className="text-sm text-slate-300">{pattern.name}</span>
    </div>
    <div className="font-rajdhani font-bold text-lg text-yellow-400">{pattern.count}</div>
  </div>
);

const ThreatIntel = () => {
  const { demoMode } = useDemoMode();
  const [alerts, setAlerts] = useState([]);
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [alertsRes, fraudRes] = await Promise.all([
        axios.get(`${API}/threat-intel/alerts?limit=12`),
        axios.get(`${API}/threat-intel/fraud-indicators`)
      ]);
      setAlerts(alertsRes.data.alerts);
      setFraudStats(fraudRes.data);
    } catch (error) {
      console.error("Failed to fetch threat intel:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, [demoMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="threat-intel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Threat Intelligence
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            GPT-4o-mini Powered Fraud Analytics & Threat Fusion
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-threat-intel">
          <RefreshCw className="w-4 h-4" /> Refresh Intel
        </button>
      </div>

      {/* Fraud Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-cyan-400">
            {fraudStats?.total_analyzed?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Analyzed</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-yellow-400">
            {fraudStats?.flagged || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Flagged</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-red-400">
            {fraudStats?.confirmed_fraud || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Confirmed Fraud</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-green-400">
            {fraudStats?.total_analyzed ? ((fraudStats.total_analyzed - fraudStats.confirmed_fraud) / fraudStats.total_analyzed * 100).toFixed(1) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Clean Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Patterns */}
        <div className="scifi-card p-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" /> Fraud Patterns Detected
          </h3>
          <div className="space-y-3">
            {fraudStats?.patterns?.map((pattern, idx) => (
              <FraudPatternCard key={idx} pattern={pattern} />
            ))}
          </div>
        </div>

        {/* Threat Intel Feed */}
        <div className="scifi-card p-4 lg:col-span-2">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" /> Intelligence Feed
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <ThreatIntelCard key={alert.id} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* LLM Analysis Note */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">LLM Fusion Engine Active</h4>
            <p className="text-xs text-slate-400 mt-1">
              The threat intelligence fusion engine correlates data from multiple sources using advanced 
              language models to identify hidden patterns and emerging threats. Analysis includes dark web 
              monitoring, OSINT feeds, and internal behavioral signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;
