import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Shield, Users, Zap, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Play, Pause, Bot, Activity, Eye
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";

const SeverityBadge = ({ severity }) => {
  const classes = {
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low"
  };
  return <span className={`badge ${classes[severity] || 'badge-info'}`}>{severity}</span>;
};

const StatusBadge = ({ status }) => {
  const classes = {
    new: "badge-critical",
    in_progress: "badge-medium",
    escalated: "badge-high",
    resolved: "badge-low"
  };
  return <span className={`badge ${classes[status] || 'badge-info'}`}>{status.replace('_', ' ')}</span>;
};

const AgentCard = ({ agent }) => {
  const statusColor = agent.status === 'active' ? 'text-green-400' : 'text-slate-500';
  
  return (
    <div className="scifi-card p-4" data-testid={`agent-${agent.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${agent.status === 'active' ? 'bg-green-500/20' : 'bg-slate-800'}`}>
            <Bot className={`w-4 h-4 ${statusColor}`} />
          </div>
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-slate-200">{agent.name}</h4>
            <p className="text-[10px] text-slate-500 uppercase">{agent.role}</p>
          </div>
        </div>
        <span className={`status-dot ${agent.status === 'active' ? 'low' : 'medium'}`}></span>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Incidents Handled</span>
        <span className="font-rajdhani font-bold text-cyan-400">{agent.incidents_handled}</span>
      </div>
    </div>
  );
};

const IncidentRow = ({ incident, onAction }) => (
  <tr className="hover:bg-cyan-500/5 transition-colors" data-testid={`incident-${incident.id}`}>
    <td className="py-3 px-4">
      <span className="font-mono text-xs text-cyan-400">{incident.id}</span>
    </td>
    <td className="py-3 px-4">
      <div>
        <span className="text-sm text-slate-300">{incident.title}</span>
        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{incident.description}</p>
      </div>
    </td>
    <td className="py-3 px-4"><SeverityBadge severity={incident.severity} /></td>
    <td className="py-3 px-4"><StatusBadge status={incident.status} /></td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <Bot className="w-3 h-3 text-cyan-400" />
        <span className="text-xs text-slate-400">{incident.assigned_agent}</span>
      </div>
    </td>
    <td className="py-3 px-4">
      <span className="font-rajdhani font-bold text-cyan-400">{incident.actions_taken}</span>
    </td>
    <td className="py-3 px-4">
      <div className="flex gap-1">
        <button 
          onClick={() => onAction(incident.id, 'investigate')}
          className="holo-btn text-[10px] py-1 px-2" 
          data-testid={`investigate-${incident.id}`}
        >
          <Eye className="w-3 h-3" />
        </button>
        <button 
          onClick={() => onAction(incident.id, 'resolve')}
          className="holo-btn text-[10px] py-1 px-2" 
          data-testid={`resolve-${incident.id}`}
        >
          <CheckCircle className="w-3 h-3" />
        </button>
      </div>
    </td>
  </tr>
);

const AiSoc = () => {
  const { demoMode } = useDemoMode();
  const [incidents, setIncidents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [incRes, agentsRes, metricsRes] = await Promise.all([
        axios.get(`${API}/soc/incidents?limit=15`),
        axios.get(`${API}/soc/agents`),
        axios.get(`${API}/soc/metrics`)
      ]);
      setIncidents(incRes.data.incidents);
      setAgents(agentsRes.data.agents);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Failed to fetch SOC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (incidentId, action) => {
    try {
      await axios.post(`${API}/soc/incidents/${incidentId}/action`, { action });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
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
    <div className="space-y-6 animate-fade-in" data-testid="ai-soc">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Multi-Agent AI SOC
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            GPT-4o-mini Assisted Incident Detection & Response
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-soc">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-cyan-400">
            {metrics?.mttd_minutes || 0}m
          </div>
          <div className="text-[10px] text-slate-500 uppercase">MTTD</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-green-400">
            {metrics?.mttr_hours || 0}h
          </div>
          <div className="text-[10px] text-slate-500 uppercase">MTTR</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-yellow-400">
            {metrics?.incidents_today || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Today</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-green-400">
            {metrics?.auto_resolved || 0}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Auto-Resolved</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-yellow-400">
            {metrics?.escalated_to_human || 0}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Escalated</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-green-400">
            {metrics?.false_positive_rate || 0}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase">FP Rate</div>
        </div>
      </div>

      {/* AI Agents */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400 icon-glow" /> Active AI Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" /> Active Incidents
        </h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Incident</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Actions</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <IncidentRow key={incident.id} incident={incident} onAction={handleAction} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOC Info */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">Multi-Agent Collaboration</h4>
            <p className="text-xs text-slate-400 mt-1">
              The AI SOC operates with specialized agents: Triage agents assess incoming alerts, 
              Investigation agents gather context and evidence, Planning agents create response playbooks, 
              and Remediation agents execute containment actions. Human-in-the-loop approval is required 
              for critical actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSoc;
