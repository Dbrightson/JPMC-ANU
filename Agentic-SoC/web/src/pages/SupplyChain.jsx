import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Package, Shield, CheckCircle, AlertTriangle, XCircle,
  RefreshCw, Lock, Unlock, Database, GitBranch
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";

const IntegrityBadge = ({ status }) => {
  const classes = {
    verified: "badge-low",
    warning: "badge-medium",
    unverified: "badge-critical"
  };
  const icons = {
    verified: CheckCircle,
    warning: AlertTriangle,
    unverified: XCircle
  };
  const Icon = icons[status] || AlertTriangle;
  
  return (
    <span className={`badge ${classes[status] || 'badge-info'} flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
};

const ModelCard = ({ model, onVerify }) => {
  const vulnColor = model.vulnerabilities > 5 ? 'text-red-400' : model.vulnerabilities > 0 ? 'text-yellow-400' : 'text-green-400';
  
  return (
    <div className="scifi-card p-4" data-testid={`model-${model.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-sm">
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-slate-200">{model.name}</h4>
            <p className="text-[10px] text-slate-500 font-mono">v{model.version}</p>
          </div>
        </div>
        <IntegrityBadge status={model.integrity_status} />
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div>
          <span className="text-slate-500">Signed</span>
          <div className="flex items-center gap-1 mt-1">
            {model.signed ? (
              <Lock className="w-3 h-3 text-green-400" />
            ) : (
              <Unlock className="w-3 h-3 text-red-400" />
            )}
            <span className={model.signed ? 'text-green-400' : 'text-red-400'}>
              {model.signed ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        <div>
          <span className="text-slate-500">Dependencies</span>
          <div className="font-rajdhani font-bold text-slate-300 mt-1">{model.dependencies}</div>
        </div>
        <div>
          <span className="text-slate-500">Vulnerabilities</span>
          <div className={`font-rajdhani font-bold mt-1 ${vulnColor}`}>{model.vulnerabilities}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <span className="text-[10px] text-slate-500">
          Verified: {new Date(model.last_verified).toLocaleDateString()}
        </span>
        <button 
          onClick={() => onVerify(model.id)}
          className="holo-btn text-[10px] py-1 px-2"
          data-testid={`verify-${model.id}`}
        >
          Re-verify
        </button>
      </div>
    </div>
  );
};

const SupplyChain = () => {
  const { demoMode } = useDemoMode();
  const [models, setModels] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  const fetchData = async () => {
    try {
      const [modelsRes, integrityRes] = await Promise.all([
        axios.get(`${API}/supply-chain/models?limit=12`),
        axios.get(`${API}/supply-chain/integrity`)
      ]);
      setModels(modelsRes.data.models);
      setIntegrity(integrityRes.data);
    } catch (error) {
      console.error("Failed to fetch supply chain data:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyModel = async (modelId) => {
    setVerifying(modelId);
    try {
      await axios.post(`${API}/supply-chain/verify/${modelId}`);
      fetchData();
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setVerifying(null);
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

  const verifiedPercent = integrity ? Math.round((integrity.verified / integrity.total_models) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="supply-chain">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            AI Supply Chain Security
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Model Integrity & Provenance Verification
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-supply-chain">
          <RefreshCw className="w-4 h-4" /> Scan Registry
        </button>
      </div>

      {/* Integrity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-cyan-400">{integrity?.total_models || 0}</div>
          <div className="text-[10px] text-slate-500 uppercase">Total Models</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-green-400">{integrity?.verified || 0}</div>
          <div className="text-[10px] text-slate-500 uppercase">Verified</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-yellow-400">{integrity?.warnings || 0}</div>
          <div className="text-[10px] text-slate-500 uppercase">Warnings</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-red-400">{integrity?.unverified || 0}</div>
          <div className="text-[10px] text-slate-500 uppercase">Unverified</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-green-400">{verifiedPercent}%</div>
          <div className="text-[10px] text-slate-500 uppercase">Integrity Score</div>
        </div>
      </div>

      {/* Dependencies Overview */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" /> Dependency Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-800/30 rounded-sm">
            <div className="font-rajdhani font-bold text-4xl text-cyan-400">{integrity?.total_dependencies || 0}</div>
            <div className="text-xs text-slate-500 uppercase mt-1">Total Dependencies</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-sm">
            <div className={`font-rajdhani font-bold text-4xl ${integrity?.vulnerable_dependencies > 10 ? 'text-red-400' : 'text-yellow-400'}`}>
              {integrity?.vulnerable_dependencies || 0}
            </div>
            <div className="text-xs text-slate-500 uppercase mt-1">Vulnerable</div>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-sm">
            <div className="text-xs text-slate-500">Last Full Scan</div>
            <div className="font-mono text-sm text-cyan-400 mt-1">
              {integrity?.last_full_scan ? new Date(integrity.last_full_scan).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-cyan-400" /> Model Registry
        </h3>
        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} onVerify={verifyModel} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Supply Chain Info */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">Integrity Mesh Active</h4>
            <p className="text-xs text-slate-400 mt-1">
              The AI Supply Chain module tracks model provenance, verifies cryptographic signatures, 
              monitors dependencies for vulnerabilities, and ensures training data integrity. 
              All models are continuously validated against their signed attestations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChain;
