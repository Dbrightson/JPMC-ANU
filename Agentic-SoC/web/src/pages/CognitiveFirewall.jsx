import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Flame, Shield, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Send, Clock, Zap, Eye
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";

const ActionBadge = ({ action }) => {
  const classes = {
    blocked: "badge-critical",
    sanitized: "badge-medium",
    flagged: "badge-info",
    allowed_monitored: "badge-low"
  };
  return <span className={`badge ${classes[action] || 'badge-info'}`}>{action.replace('_', ' ')}</span>;
};

const RiskBadge = ({ level }) => {
  const classes = {
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low"
  };
  return <span className={`badge ${classes[level] || 'badge-info'}`}>{level}</span>;
};

const FirewallEventCard = ({ event }) => (
  <div className="scifi-card p-4" data-testid={`event-${event.id}`}>
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        {event.action === 'blocked' ? (
          <XCircle className="w-4 h-4 text-red-400" />
        ) : event.action === 'sanitized' ? (
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        ) : (
          <Eye className="w-4 h-4 text-cyan-400" />
        )}
        <span className="text-xs text-slate-500 uppercase">{event.type.replace('_', ' ')}</span>
      </div>
      <ActionBadge action={event.action} />
    </div>
    
    <div className="bg-slate-900/50 p-2 rounded-sm mb-2 font-mono text-xs text-red-300 border-l-2 border-red-500/50">
      "{event.prompt_snippet}"
    </div>
    
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-slate-500">{event.reason}</span>
      <RiskBadge level={event.risk_level} />
    </div>
    
    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
      {new Date(event.timestamp).toLocaleString()}
    </div>
  </div>
);

const CognitiveFirewall = () => {
  const { demoMode } = useDemoMode();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        axios.get(`${API}/firewall/events?limit=12`),
        axios.get(`${API}/firewall/stats`)
      ]);
      setEvents(eventsRes.data.events);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch firewall data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePrompt = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await axios.post(`${API}/firewall/analyze`, { prompt: testPrompt });
      setTestResult(response.data);
    } catch (error) {
      console.error("Failed to analyze prompt:", error);
    } finally {
      setTesting(false);
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

  const blockRate = stats ? ((stats.blocked / stats.total_requests_today) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="cognitive-firewall">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Cognitive Firewall
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Real-time LLM & Agent Protection Layer
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-firewall">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-cyan-400">
            {stats?.total_requests_today?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Requests Today</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-red-400">
            {stats?.blocked?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Blocked</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-yellow-400">
            {stats?.sanitized?.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Sanitized</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-cyan-400">
            {stats?.flagged_for_review || 0}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Flagged</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-green-400">
            {stats?.avg_latency_ms || 0}ms
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Latency</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-2xl text-yellow-400">
            {blockRate}%
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Block Rate</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">
          Blocked by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats?.by_category && Object.entries(stats.by_category).map(([category, count]) => (
            <div key={category} className="text-center p-3 bg-slate-800/30 rounded-sm">
              <div className="font-rajdhani font-bold text-xl text-red-400">{count}</div>
              <div className="text-[10px] text-slate-500 uppercase">{category.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Tester */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Prompt Analyzer
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Powered by GPT-4o-mini</span>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a prompt to test against the firewall..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-sm px-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              data-testid="prompt-input"
              onKeyDown={(e) => e.key === 'Enter' && analyzePrompt()}
            />
            <button 
              onClick={analyzePrompt}
              disabled={testing}
              className="holo-btn flex items-center gap-2"
              data-testid="analyze-prompt-btn"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Analyze
            </button>
          </div>
          
          {testResult && (
            <div className={`p-4 rounded-sm border ${testResult.action === 'blocked' ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {testResult.action === 'blocked' ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  <span className={`font-rajdhani font-bold uppercase ${testResult.action === 'blocked' ? 'text-red-400' : 'text-green-400'}`}>
                    {testResult.action}
                  </span>
                </div>
                <span className="font-rajdhani font-bold text-lg">
                  Risk Score: <span className={testResult.risk_score > 50 ? 'text-red-400' : 'text-green-400'}>{testResult.risk_score}</span>
                </span>
              </div>
              {testResult.reasons?.length > 0 && (
                <div className="text-xs text-slate-400">
                  Reasons: {testResult.reasons.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" /> Recent Firewall Events
        </h3>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <FirewallEventCard key={event.id} event={event} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CognitiveFirewall;
