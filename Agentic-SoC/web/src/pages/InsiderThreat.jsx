import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Users, Bot, AlertTriangle, Eye, Activity, UserX,
  RefreshCw, TrendingUp, Shield, Clock
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";

const StatusBadge = ({ status }) => {
  const classes = {
    monitoring: "badge-info",
    investigating: "badge-medium",
    contained: "badge-high",
    cleared: "badge-low"
  };
  return <span className={`badge ${classes[status] || 'badge-info'}`}>{status}</span>;
};

const EntityTypeBadge = ({ type }) => {
  const classes = {
    user: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    ai_agent: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    service_account: "bg-orange-500/20 text-orange-400 border-orange-500/50"
  };
  const icons = {
    user: Users,
    ai_agent: Bot,
    service_account: Activity
  };
  const Icon = icons[type] || Users;
  
  return (
    <span className={`badge ${classes[type] || 'badge-info'} flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {type.replace('_', ' ')}
    </span>
  );
};

const ThreatCard = ({ threat }) => {
  const riskColor = threat.risk_score > 70 ? 'text-red-400' : threat.risk_score > 40 ? 'text-yellow-400' : 'text-green-400';
  const deviationColor = threat.baseline_deviation > 5 ? 'text-red-400' : 'text-yellow-400';
  
  return (
    <div className="scifi-card p-4" data-testid={`insider-${threat.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${threat.risk_score > 70 ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            {threat.risk_score > 70 ? (
              <UserX className={`w-4 h-4 ${riskColor}`} />
            ) : (
              <AlertTriangle className={`w-4 h-4 ${riskColor}`} />
            )}
          </div>
          <div>
            <h4 className="font-mono text-sm text-slate-200">{threat.entity_name}</h4>
            <EntityTypeBadge type={threat.entity_type} />
          </div>
        </div>
        <div className="text-right">
          <div className={`font-rajdhani font-bold text-2xl ${riskColor}`}>{threat.risk_score}</div>
          <div className="text-[10px] text-slate-500">Risk Score</div>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Anomaly Type</span>
          <span className="text-slate-300 capitalize">{threat.anomaly_type.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Baseline Deviation</span>
          <span className={`font-rajdhani font-bold ${deviationColor}`}>{threat.baseline_deviation}σ</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <StatusBadge status={threat.status} />
        <span className="text-[10px] text-slate-500">
          {new Date(threat.detected_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const InsiderThreat = () => {
  const { demoMode } = useDemoMode();
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [threatsRes, statsRes] = await Promise.all([
        axios.get(`${API}/insider-threat/alerts?limit=12`),
        axios.get(`${API}/insider-threat/stats`)
      ]);
      setThreats(threatsRes.data.threats);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch insider threat data:", error);
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

  const highRiskThreats = threats.filter(t => t.risk_score > 70);
  const mediumRiskThreats = threats.filter(t => t.risk_score > 40 && t.risk_score <= 70);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="insider-threat">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Insider Threat Detection
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            User & AI Agent Behavioral Analytics
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-insider">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-cyan-400">
            {stats?.entities_monitored?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Monitored</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-red-400">
            {stats?.high_risk_entities || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">High Risk</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-yellow-400">
            {stats?.anomalies_detected_today || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Anomalies</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-cyan-400">
            {stats?.investigations_active || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Investigating</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-purple-400">
            {stats?.ai_agents_monitored || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">AI Agents</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-green-400">
            {stats?.baseline_accuracy || 0}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">
          Risk Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-sm border border-red-500/30">
            <div className="p-3 bg-red-500/20 rounded-full">
              <UserX className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="font-rajdhani font-bold text-3xl text-red-400">{highRiskThreats.length}</div>
              <div className="text-xs text-red-400/70 uppercase">High Risk (70+)</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-yellow-500/10 rounded-sm border border-yellow-500/30">
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="font-rajdhani font-bold text-3xl text-yellow-400">{mediumRiskThreats.length}</div>
              <div className="text-xs text-yellow-400/70 uppercase">Medium Risk (40-70)</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-sm border border-green-500/30">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="font-rajdhani font-bold text-3xl text-green-400">
                {threats.length - highRiskThreats.length - mediumRiskThreats.length}
              </div>
              <div className="text-xs text-green-400/70 uppercase">Low Risk (&lt;40)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Threats Grid */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" /> Behavioral Anomalies
        </h3>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threats.map((threat) => (
              <ThreatCard key={threat.id} threat={threat} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Info */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">UEBA Engine Active</h4>
            <p className="text-xs text-slate-400 mt-1">
              User and Entity Behavior Analytics monitors both human users and AI agents. 
              The system establishes behavioral baselines and detects deviations that may indicate 
              insider threats, compromised accounts, or AI agents acting outside their intended scope.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsiderThreat;
