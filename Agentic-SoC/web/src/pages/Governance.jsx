import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Scale, Shield, FileText, AlertCircle, CheckCircle,
  TrendingUp, TrendingDown, RefreshCw, ChevronRight, XCircle
} from "lucide-react";
import { Progress } from "../components/ui/progress";

const ComplianceCard = ({ framework }) => {
  const scoreColor = framework.score >= 85 ? "text-green-400" : framework.score >= 70 ? "text-yellow-400" : "text-red-400";
  const progressColor = framework.score >= 85 ? "bg-green-500" : framework.score >= 70 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="scifi-card p-4" data-testid={`compliance-${framework.name.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-rajdhani font-bold text-lg text-slate-200">{framework.name}</h4>
        <span className={`badge ${framework.status === 'compliant' ? 'badge-low' : 'badge-medium'}`}>
          {framework.status}
        </span>
      </div>
      
      <div className="flex items-end gap-4 mb-4">
        <div className={`font-rajdhani font-bold text-4xl ${scoreColor}`}>
          {framework.score}%
        </div>
        <div className="text-xs text-slate-500 pb-1">
          {framework.controls_passed}/{framework.controls_total} controls
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${framework.score}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Last audit: {new Date(framework.last_audit).toLocaleDateString()}</span>
          <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PolicyRow = ({ policy }) => (
  <tr className="hover:bg-cyan-500/5 transition-colors" data-testid={`policy-${policy.id}`}>
    <td className="py-3 px-4">
      <span className="font-mono text-xs text-slate-400">{policy.id}</span>
    </td>
    <td className="py-3 px-4">
      <span className="font-mono text-sm text-slate-300">{policy.name}</span>
    </td>
    <td className="py-3 px-4">
      <span className={`badge ${policy.status === 'active' ? 'badge-low' : 'badge-medium'}`}>
        {policy.status}
      </span>
    </td>
    <td className="py-3 px-4">
      <span className={`font-rajdhani font-bold ${policy.violations > 0 ? 'text-red-400' : 'text-green-400'}`}>
        {policy.violations}
      </span>
    </td>
    <td className="py-3 px-4">
      <button className="holo-btn text-[10px] py-1 px-2" data-testid={`edit-policy-${policy.id}`}>
        Edit
      </button>
    </td>
  </tr>
);

const RiskItem = ({ risk }) => {
  const likelihoodColors = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400"
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-sm" data-testid={`risk-${risk.name.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-3">
        <AlertCircle className={`w-4 h-4 ${risk.score > 60 ? 'text-red-400' : 'text-yellow-400'}`} />
        <div>
          <div className="text-sm text-slate-300">{risk.name}</div>
          <div className={`text-[10px] ${likelihoodColors[risk.likelihood]}`}>
            Likelihood: {risk.likelihood}
          </div>
        </div>
      </div>
      <div className={`font-rajdhani font-bold text-xl ${risk.score > 60 ? 'text-red-400' : 'text-yellow-400'}`}>
        {risk.score}
      </div>
    </div>
  );
};

const Governance = () => {
  const { demoMode } = useDemoMode();
  const [compliance, setCompliance] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [compRes, polRes, riskRes] = await Promise.all([
        axios.get(`${API}/governance/compliance`),
        axios.get(`${API}/governance/policies`),
        axios.get(`${API}/governance/risk-score`)
      ]);
      setCompliance(compRes.data.frameworks);
      setPolicies(polRes.data.policies);
      setRiskData(riskRes.data);
    } catch (error) {
      console.error("Failed to fetch governance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [demoMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const trendColor = riskData?.trend === 'improving' ? 'text-green-400' : riskData?.trend === 'degrading' ? 'text-red-400' : 'text-yellow-400';

  const TrendIcon = () => {
    if (riskData?.trend === 'improving') return <TrendingDown className="w-4 h-4" />;
    if (riskData?.trend === 'degrading') return <TrendingUp className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="governance">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            AI Governance & Risk
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Compliance Monitoring & Risk Orchestration
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-governance">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="scifi-card p-6 box-glow-cyan md:col-span-1">
          <div className="font-rajdhani text-xs text-slate-500 uppercase tracking-widest mb-2">
            Overall Risk Score
          </div>
          <div className="flex items-center gap-4">
            <div className={`font-rajdhani font-bold text-5xl ${riskData?.overall > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
              {riskData?.overall || 0}
            </div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon />
              <span className="text-xs uppercase">{riskData?.trend}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500">Potential Economic Impact</div>
            <div className="font-rajdhani font-bold text-xl text-red-400">
              ${(riskData?.economic_impact_usd || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="scifi-card p-4 md:col-span-2">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">
            Top Risk Factors
          </h3>
          <div className="space-y-3">
            {riskData?.top_risks?.map((risk, idx) => (
              <RiskItem key={idx} risk={risk} />
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div>
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> Compliance Frameworks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compliance.map((fw) => (
            <ComplianceCard key={fw.id} framework={fw} />
          ))}
        </div>
      </div>

      {/* Policies Table */}
      <div className="scifi-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Active Policies
          </h3>
          <button className="holo-btn text-xs" data-testid="add-policy-btn">
            Add Policy
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Policy Name</th>
                <th>Status</th>
                <th>Violations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <PolicyRow key={policy.id} policy={policy} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Governance;
