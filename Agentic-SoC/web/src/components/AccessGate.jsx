import { useState } from "react";
import { Shield, Lock, AlertTriangle } from "lucide-react";

const AccessGate = ({ onAccess }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedName = name.trim().toLowerCase();
    
    // Only allow Mayank Lau
    if (normalizedName === "mayank lau" || normalizedName === "mayank" || normalizedName === "mayanklau") {
      onAccess(true);
    } else {
      setError("Access Denied. This platform is restricted to authorized personnel only.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] grid-bg flex items-center justify-center p-4">
      <div className="scifi-card p-8 max-w-md w-full box-glow-cyan">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Shield className="w-16 h-16 text-cyan-400 icon-glow mb-4" />
          <h1 className="font-rajdhani font-bold text-3xl text-cyan-400 text-glow-cyan tracking-wider">
            GUARDIAN
          </h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase">
            AI Security Platform
          </p>
        </div>

        {/* Access Form */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-sm">
            <Lock className="w-5 h-5 text-yellow-400" />
            <p className="text-xs text-yellow-400">
              Restricted Access - Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">
                Enter Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Full Name"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-sm px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                data-testid="access-name-input"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full holo-btn py-3 text-sm uppercase tracking-wider"
              data-testid="access-submit-btn"
            >
              Request Access
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-slate-600">
              Contact system administrator if you need access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;
