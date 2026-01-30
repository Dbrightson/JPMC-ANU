import { useState, useEffect } from "react";
import { API, useDemoMode } from "../App";
import axios from "axios";
import { 
  Zap, Play, Shield, Target, Trophy, Clock,
  RefreshCw, AlertTriangle, CheckCircle, Swords
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";

const StatusBadge = ({ status }) => {
  const classes = {
    completed: "badge-low",
    in_progress: "badge-medium",
    scheduled: "badge-info"
  };
  return <span className={`badge ${classes[status] || 'badge-info'}`}>{status.replace('_', ' ')}</span>;
};

const WarGameCard = ({ game }) => {
  const redWin = game.red_team_score > game.blue_team_score;
  
  return (
    <div className="scifi-card p-4" data-testid={`wargame-${game.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-rajdhani font-bold text-sm text-slate-200">{game.scenario}</h4>
          <StatusBadge status={game.status} />
        </div>
        <Swords className="w-5 h-5 text-cyan-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`text-center p-3 rounded-sm ${redWin ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-500/10'}`}>
          <div className="text-[10px] text-red-400 uppercase mb-1">Red Team</div>
          <div className={`font-rajdhani font-bold text-2xl ${redWin ? 'text-red-400 text-glow-red' : 'text-red-400/70'}`}>
            {game.red_team_score}
          </div>
        </div>
        <div className={`text-center p-3 rounded-sm ${!redWin ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-cyan-500/10'}`}>
          <div className="text-[10px] text-cyan-400 uppercase mb-1">Blue Team</div>
          <div className={`font-rajdhani font-bold text-2xl ${!redWin ? 'text-cyan-400 text-glow-cyan' : 'text-cyan-400/70'}`}>
            {game.blue_team_score}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">{game.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
          <span className="text-slate-400">{game.findings} findings</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
        Started: {new Date(game.started_at).toLocaleString()}
      </div>
    </div>
  );
};

const scenarios = [
  { id: "model_exfil", name: "Model Exfiltration Drill", description: "Simulate attacker trying to steal model weights" },
  { id: "insider", name: "Insider Threat Simulation", description: "Test detection of malicious insider behavior" },
  { id: "prompt_storm", name: "Prompt Injection Storm", description: "Mass prompt injection attack simulation" },
  { id: "supply_chain", name: "Supply Chain Compromise", description: "Poisoned dependency injection scenario" },
  { id: "ddos_inference", name: "DDoS on Inference", description: "Simulate resource exhaustion attack" }
];

const WarGames = () => {
  const { demoMode } = useDemoMode();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0].id);
  const [lastResult, setLastResult] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/wargames/results?limit=6`);
      setResults(response.data.results);
    } catch (error) {
      console.error("Failed to fetch war game results:", error);
    } finally {
      setLoading(false);
    }
  };

  const startWarGame = async () => {
    setStarting(true);
    setLastResult(null);
    try {
      const scenario = scenarios.find(s => s.id === selectedScenario);
      const response = await axios.post(`${API}/wargames/start`, { scenario: scenario?.name || selectedScenario });
      setLastResult(response.data);
      setTimeout(fetchData, 2000);
    } catch (error) {
      console.error("Failed to start war game:", error);
    } finally {
      setStarting(false);
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

  // Calculate stats
  const completedGames = results.filter(r => r.status === 'completed');
  const blueWins = completedGames.filter(r => r.blue_team_score > r.red_team_score).length;
  const totalFindings = completedGames.reduce((sum, r) => sum + r.findings, 0);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="war-games">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl md:text-3xl text-cyan-400 text-glow-cyan uppercase tracking-wider">
            War Games Simulation
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Red Team vs Blue Team AI Agent Battles
          </p>
        </div>
        <button onClick={fetchData} className="holo-btn flex items-center gap-2 text-xs" data-testid="refresh-wargames">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-cyan-400">{results.length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Total Simulations</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-cyan-400">{blueWins}</div>
          <div className="text-[10px] text-slate-500 uppercase">Blue Team Wins</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-red-400">{completedGames.length - blueWins}</div>
          <div className="text-[10px] text-slate-500 uppercase">Red Team Wins</div>
        </div>
        <div className="scifi-card p-4 text-center">
          <div className="font-rajdhani font-bold text-3xl text-yellow-400">{totalFindings}</div>
          <div className="text-[10px] text-slate-500 uppercase">Total Findings</div>
        </div>
      </div>

      {/* Launch Panel */}
      <div className="scifi-card p-6 box-glow-cyan">
        <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Launch War Game
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-2">Select Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-sm px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
              data-testid="scenario-select"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-2">
              {scenarios.find(s => s.id === selectedScenario)?.description}
            </p>
          </div>
          
          <div className="flex flex-col justify-end">
            <button
              onClick={startWarGame}
              disabled={starting}
              className="holo-btn w-full py-4 flex items-center justify-center gap-3 text-base"
              data-testid="start-wargame-btn"
            >
              {starting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {starting ? 'Deploying Agents...' : 'Start Simulation'}
            </button>
          </div>
        </div>

        {lastResult && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-rajdhani font-bold uppercase">{lastResult.status}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{lastResult.message}</p>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="scifi-card p-4">
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Recent Simulations
        </h3>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((game) => (
              <WarGameCard key={game.id} game={game} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Info */}
      <div className="scifi-card p-4 border-l-4 border-cyan-500">
        <div className="flex items-start gap-3">
          <Swords className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-rajdhani font-bold text-sm text-cyan-400 uppercase">Chaos Engineering for AI Security</h4>
            <p className="text-xs text-slate-400 mt-1">
              War Games pit autonomous Red Team agents against Blue Team defenders. Red agents 
              simulate sophisticated attacks (model theft, prompt injection, data poisoning), 
              while Blue agents detect and respond. Results help identify security gaps and 
              train the AI SOC to handle emerging threats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarGames;
