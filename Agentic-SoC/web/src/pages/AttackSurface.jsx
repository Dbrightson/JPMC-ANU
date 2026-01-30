import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Target, Globe, Server, Database, Wifi, AlertTriangle,
  Search, Filter, RefreshCw, Eye, Shield, ExternalLink
} from "lucide-react";
import { Progress } from "../components/ui/progress";
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

const StatusBadge = ({ status }) => {
  const classes = {
    healthy: "badge-low",
    warning: "badge-medium",
    critical: "badge-critical",
    active: "badge-critical",
    investigating: "badge-medium",
    contained: "badge-info",
    resolved: "badge-low"
  };
  return <span className={`badge ${classes[status] || 'badge-info'}`}>{status}</span>;
};

const AssetCard = ({ asset }) => {
  const riskColor = asset.risk_score > 70 ? "text-red-400" : asset.risk_score > 40 ? "text-yellow-400" : "text-green-400";
  
  const typeIcons = {
    llm_endpoint: Globe,
    ml_model: Database,
    data_pipeline: Server,
    api_gateway: Wifi,
    training_server: Server,
    inference_cluster: Database
  };
  
  const Icon = typeIcons[asset.type] || Server;

  return (
    <div className="scifi-card p-4 hover:border-cyan-500/50 transition-all cursor-pointer" data-testid={`asset-${asset.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-sm">
            <Icon className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-mono text-sm text-slate-200">{asset.name}</h4>
            <p className="text-[10px] text-slate-500 uppercase">{asset.type.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <StatusBadge status={asset.status} />
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Risk</span>
          <div className={`font-rajdhani font-bold ${riskColor}`}>{asset.risk_score}</div>
        </div>
        <div>
          <span className="text-slate-500">Vulns</span>
          <div className={`font-rajdhani font-bold ${asset.vulnerabilities > 5 ? 'text-red-400' : 'text-slate-300'}`}>
            {asset.vulnerabilities}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Location</span>
          <div className="font-mono text-slate-300 text-[10px]">{asset.location}</div>
        </div>
      </div>
      
      {asset.ip_address && (
        <div className="mt-2 pt-2 border-t border-slate-800">
          <span className="font-mono text-[10px] text-slate-500">{asset.ip_address}</span>
        </div>
      )}
    </div>
  );
};

const ThreatRow = ({ threat }) => (
  <tr className="hover:bg-cyan-500/5 transition-colors" data-testid={`threat-${threat.id}`}>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <span className={`status-dot ${threat.severity}`}></span>
        <span className="font-mono text-sm text-slate-300">{threat.name}</span>
      </div>
    </td>
    <td className="py-3 px-4"><SeverityBadge severity={threat.severity} /></td>
    <td className="py-3 px-4"><span className="text-xs text-slate-400">{threat.type.replace(/_/g, ' ')}</span></td>
    <td className="py-3 px-4"><span className="font-mono text-xs text-slate-400">{threat.source}</span></td>
    <td className="py-3 px-4"><span className="font-mono text-xs text-cyan-400">{threat.target}</span></td>
    <td className="py-3 px-4"><StatusBadge status={threat.status} /></td>
    <td className="py-3 px-4">
      <button className="holo-btn text-[10px] py-1 px-2" data-testid={`investigate-${threat.id}`}>
        <Eye className="w-3 h-3" />
      </button>
    </td>
  </tr>
);

const AttackSurface = () => {
  const { demoMode } = useDemoMode();
  const [assets, setAssets] = useState([]);
  const [threats, setThreats] = useState([]);
  const [vulnStats, setVulnStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [assetsRes, threatsRes, vulnRes] = await Promise.all([
        axios.get(`${API}/attack-surface/assets?limit=20`),
        axios.get(`${API}/attack-surface/threats?limit=10`),
        axios.get(`${API}/attack-surface/vulnerabilities`)
      ]);
      setAssets(assetsRes.data.assets);
      setThreats(threatsRes.data.threats);
      setVulnStats(vulnRes.data);
    } catch (error) {
      console.error("Failed to fetch attack surface data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, [demoMode]);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="attack-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            Attack Surface Intelligence
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            AI Asset Discovery & Vulnerability Monitoring
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-attack-surface">
          <RefreshCw className="w-4 h-4" /> Scan Now
        </button>
      </div>

      {/* Vulnerability Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: vulnStats?.total || 0, color: "text-cyan-400" },
          { label: "Critical", value: vulnStats?.critical || 0, color: "text-red-400" },
          { label: "High", value: vulnStats?.high || 0, color: "text-orange-400" },
          { label: "Medium", value: vulnStats?.medium || 0, color: "text-yellow-400" },
          { label: "Low", value: vulnStats?.low || 0, color: "text-green-400" }
        ].map((item) => (
          <div key={item.label} className="scifi-card p-4 text-center">
            <div className={`font-rajdhani font-bold text-3xl ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Vulnerability by Type */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">
          Vulnerability Distribution by Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {vulnStats?.by_type && Object.entries(vulnStats.by_type).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="font-rajdhani font-bold text-xl text-cyan-400">{count}</div>
              <div className="text-[10px] text-slate-500 uppercase">{type.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="scifi-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" /> Discovered Assets
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-sm pl-10 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 w-full md:w-64"
              data-testid="search-assets"
            />
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Active Threats Table */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 icon-glow-red" /> Active Threats
        </h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Threat Name</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Source</th>
                <th>Target</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {threats.map((threat) => (
                <ThreatRow key={threat.id} threat={threat} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttackSurface;
