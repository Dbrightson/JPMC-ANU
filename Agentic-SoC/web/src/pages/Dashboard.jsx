import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Shield, AlertTriangle, TrendingUp, TrendingDown, Activity,
  Flame, Users, Brain, Zap, CheckCircle, RefreshCw
} from "lucide-react";

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "cyan" }) => {
  const colorClasses = {
    cyan: "text-cyan-400 border-cyan-500/30",
    red: "text-red-400 border-red-500/30",
    green: "text-green-400 border-green-500/30",
    yellow: "text-yellow-400 border-yellow-500/30"
  };

  return (
    <div className={`scifi-card p-4 ${colorClasses[color]}`} data-testid={`metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-slate-800/50 rounded-sm">
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]} icon-glow`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`metric-value ${colorClasses[color].split(' ')[0]} text-glow-${color}`}>
        {value}
      </div>
      <div className="font-rajdhani text-xs text-slate-400 uppercase tracking-wider mt-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-[10px] text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

const RecentEvent = ({ event }) => {
  const severityColors = {
    critical: "border-red-500 bg-red-500/10",
    high: "border-orange-500 bg-orange-500/10",
    medium: "border-yellow-500 bg-yellow-500/10",
    low: "border-green-500 bg-green-500/10",
    info: "border-cyan-500 bg-cyan-500/10"
  };

  const typeIcons = {
    threat: AlertTriangle,
    incident: Shield,
    agent: Zap,
    wargame: Activity
  };

  const Icon = typeIcons[event.type] || Activity;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-sm border-l-2 ${severityColors[event.severity]}`}>
      <Icon className="w-4 h-4 text-slate-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 truncate">{event.message}</p>
        <p className="text-[10px] text-slate-500">{event.time}</p>
      </div>
    </div>
  );
};

const ModuleStatusCard = ({ title, icon: Icon, metrics, status }) => {
  return (
    <div className="scifi-card p-4" data-testid={`module-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-cyan-400 icon-glow" />
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300">{title}</h3>
        </div>
        <span className={`status-dot ${status}`}></span>
      </div>
      <div className="space-y-2">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{metric.label}</span>
            <span className={`font-rajdhani font-bold ${metric.color || 'text-slate-300'}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { demoMode } = useDemoMode();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`);
      setData(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [demoMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const { posture, threats, soc, firewall, insider, threat_intel, recent_events } = data || {};

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Command Center
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            AI-Native Security Platform - 6 Core Modules with GPT-4o-mini
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-mono">
            Last update: {lastRefresh.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchData}
            className="holo-btn flex items-center gap-2 text-xs"
            data-testid="refresh-dashboard"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Security Score */}
      <div className="scifi-card p-6 box-glow-cyan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left">
            <div className="font-rajdhani text-xs text-slate-500 uppercase tracking-widest mb-2">
              Overall Security Posture
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="font-rajdhani font-bold text-6xl text-cyan-400 text-glow-cyan">
                {posture?.score || 0}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm ${posture?.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {posture?.trend === 'up' ? '+' : ''}{posture?.change || 0}%
                </span>
                <span className="text-[10px] text-slate-500">vs last week</span>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-800/30 rounded-sm">
                <div className="font-rajdhani font-bold text-2xl text-red-400">{threats?.active || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase">Active Threats</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-sm">
                <div className="font-rajdhani font-bold text-2xl text-green-400">{threats?.resolved_24h || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase">Resolved 24h</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-sm">
                <div className="font-rajdhani font-bold text-2xl text-cyan-400">{soc?.agents_active || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase">AI Agents</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-sm">
                <div className="font-rajdhani font-bold text-2xl text-yellow-400">{threat_intel?.alerts_today || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase">Intel Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Critical Threats"
          value={threats?.critical || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Requires immediate action"
        />
        <MetricCard
          title="Firewall Blocks"
          value={firewall?.blocked_today?.toLocaleString() || 0}
          icon={Flame}
          color="yellow"
          subtitle={`${firewall?.avg_latency_ms || 0}ms avg latency`}
        />
        <MetricCard
          title="Incidents Open"
          value={soc?.incidents_open || 0}
          icon={Shield}
          color="cyan"
          subtitle={`${soc?.auto_resolution_rate || 0}% auto-resolved`}
        />
        <MetricCard
          title="High Risk Entities"
          value={insider?.high_risk_entities || 0}
          icon={Users}
          color="red"
          subtitle={`${insider?.anomalies_today || 0} anomalies today`}
        />
      </div>

      {/* Module Status Grid - 6 Modules */}
      <div>
        <h2 className="font-rajdhani font-bold text-lg text-slate-300 uppercase tracking-wider mb-4">
          Core Security Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModuleStatusCard
            title="Threat Intelligence"
            icon={Brain}
            status="low"
            metrics={[
              { label: "Alerts Today", value: threat_intel?.alerts_today || 0, color: "text-cyan-400" },
              { label: "High Confidence", value: threat_intel?.high_confidence || 0, color: "text-green-400" },
              { label: "AI Analysis", value: "GPT-4o-mini", color: "text-yellow-400" }
            ]}
          />
          <ModuleStatusCard
            title="Cognitive Firewall"
            icon={Flame}
            status="low"
            metrics={[
              { label: "Requests Today", value: (firewall?.requests_today || 0).toLocaleString(), color: "text-cyan-400" },
              { label: "Blocked", value: firewall?.blocked_today || 0, color: "text-red-400" },
              { label: "Avg Latency", value: `${firewall?.avg_latency_ms || 0}ms`, color: "text-green-400" }
            ]}
          />
          <ModuleStatusCard
            title="AI SOC"
            icon={Shield}
            status="low"
            metrics={[
              { label: "Active Agents", value: soc?.agents_active || 0, color: "text-cyan-400" },
              { label: "Open Incidents", value: soc?.incidents_open || 0, color: "text-yellow-400" },
              { label: "Auto Resolution", value: `${soc?.auto_resolution_rate || 0}%`, color: "text-green-400" }
            ]}
          />
          <ModuleStatusCard
            title="Insider Threats"
            icon={Users}
            status="medium"
            metrics={[
              { label: "High Risk", value: insider?.high_risk_entities || 0, color: "text-red-400" },
              { label: "Anomalies Today", value: insider?.anomalies_today || 0, color: "text-yellow-400" },
              { label: "Behavioral AI", value: "Active", color: "text-green-400" }
            ]}
          />
          <ModuleStatusCard
            title="War Games"
            icon={Zap}
            status="low"
            metrics={[
              { label: "Simulations", value: "5", color: "text-cyan-400" },
              { label: "Red Team Active", value: "Yes", color: "text-red-400" },
              { label: "Blue Team Active", value: "Yes", color: "text-cyan-400" }
            ]}
          />
          <ModuleStatusCard
            title="System Health"
            icon={Activity}
            status="low"
            metrics={[
              { label: "Uptime", value: "99.9%", color: "text-green-400" },
              { label: "API Status", value: "Operational", color: "text-green-400" },
              { label: "LLM Status", value: "Connected", color: "text-green-400" }
            ]}
          />
        </div>
      </div>

      {/* Recent Events */}
      <div className="scifi-card p-6">
        <h2 className="font-rajdhani font-bold text-lg text-slate-300 uppercase tracking-wider mb-4">
          Recent Security Events
        </h2>
        <div className="space-y-2">
          {recent_events?.map((event, idx) => (
            <RecentEvent key={idx} event={event} />
          ))}
        </div>
      </div>

      {/* AI Integration Badge */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-sm">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono text-cyan-400">Powered by OpenAI GPT-4o-mini</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
