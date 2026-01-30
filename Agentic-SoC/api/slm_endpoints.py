"""
SLM Endpoints - FastAPI endpoints for local Small Language Models
Uses the trained SOC-LLM agents for triage and threat intelligence
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import sys
from pathlib import Path

# Add agents to path
AGENTS_PATH = Path(__file__).parent.parent / "agents" / "triage" / "LLM-Generator" / "src"
sys.path.insert(0, str(AGENTS_PATH))

try:
    from soc_llm.agents.alert_triage import AlertTriageAgent
    from soc_llm.agents.threat_intel import ThreatIntelAgent
    from soc_llm.model import SOCLanguageModel
    from soc_llm.tokenizer import SecurityTokenizer
except ImportError as e:
    print(f"Warning: Could not import SLM agents: {e}")
    AlertTriageAgent = None
    ThreatIntelAgent = None

# Initialize router
slm_router = APIRouter(prefix="/api/slm", tags=["SLM Agents"])

# Global agent instances (lazy loaded)
_triage_agent = None
_threat_intel_agent = None

# ============== PYDANTIC MODELS ==============

class AlertTriageRequest(BaseModel):
    """Request model for alert triage"""
    alert: str = Field(..., description="Alert text to triage")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context (queue_size, recent_alerts, baseline)")

class AlertTriageResponse(BaseModel):
    """Response model for alert triage"""
    severity: str
    verdict: str
    confidence: float
    priority: int
    is_duplicate: bool
    false_positive_likelihood: str
    escalate: bool
    summary: str
    recommended_actions: List[str]
    iocs: Dict[str, List[str]]
    timestamp: str

class BatchTriageRequest(BaseModel):
    """Request model for batch alert triage"""
    alerts: List[str] = Field(..., description="List of alerts to triage")
    context: Optional[Dict[str, Any]] = None

class ThreatIntelRequest(BaseModel):
    """Request model for threat intelligence enrichment"""
    indicator: str = Field(..., description="IOC or indicator to enrich")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context (industry, geo)")

class ThreatIntelResponse(BaseModel):
    """Response model for threat intelligence"""
    severity: str
    verdict: str
    confidence: float
    threat_actor: str
    campaign: str
    malware_families: str
    mitre_techniques: List[str]
    related_iocs: str
    summary: str
    recommended_actions: List[str]
    iocs: Dict[str, List[str]]
    timestamp: str

class BatchEnrichRequest(BaseModel):
    """Request model for batch IOC enrichment"""
    iocs: List[str] = Field(..., description="List of IOCs to enrich")
    context: Optional[Dict[str, Any]] = None

# ============== HELPER FUNCTIONS ==============

def get_triage_agent():
    """Lazy load triage agent"""
    global _triage_agent
    if _triage_agent is None:
        if AlertTriageAgent is None:
            raise HTTPException(
                status_code=503,
                detail="Triage agent not available. Check SLM installation."
            )
        try:
            # Initialize with default model (you can customize this)
            _triage_agent = AlertTriageAgent()
            print("✓ Triage Agent loaded successfully")
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to initialize triage agent: {str(e)}"
            )
    return _triage_agent

def get_threat_intel_agent():
    """Lazy load threat intel agent"""
    global _threat_intel_agent
    if _threat_intel_agent is None:
        if ThreatIntelAgent is None:
            raise HTTPException(
                status_code=503,
                detail="Threat intel agent not available. Check SLM installation."
            )
        try:
            _threat_intel_agent = ThreatIntelAgent()
            print("✓ Threat Intel Agent loaded successfully")
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to initialize threat intel agent: {str(e)}"
            )
    return _threat_intel_agent

# ============== API ENDPOINTS ==============

@slm_router.get("/")
async def slm_root():
    """SLM API root endpoint"""
    return {
        "message": "Small Language Model API",
        "version": "1.0.0",
        "description": "Local SLM agents for SOC operations",
        "agents": {
            "triage": "Alert Triage Agent - /api/slm/triage",
            "threat_intel": "Threat Intelligence Agent - /api/slm/threat-intel"
        },
        "status": {
            "triage_loaded": _triage_agent is not None,
            "threat_intel_loaded": _threat_intel_agent is not None
        }
    }

@slm_router.post("/triage", response_model=AlertTriageResponse)
async def triage_alert(request: AlertTriageRequest):
    """
    Triage a security alert using the local SLM
    
    This endpoint uses the trained Alert Triage Agent to:
    - Classify severity
    - Determine if malicious/suspicious/benign
    - Assign priority
    - Detect duplicates
    - Recommend actions
    """
    try:
        agent = get_triage_agent()
        result = agent.analyze(request.alert, request.context)
        
        return AlertTriageResponse(
            severity=result.severity.value,
            verdict=result.verdict.value,
            confidence=result.confidence,
            priority=int(result.details.get("priority", 3)),
            is_duplicate=result.details.get("is_duplicate", False),
            false_positive_likelihood=result.details.get("false_positive_likelihood", "medium"),
            escalate=result.details.get("escalate", False),
            summary=result.summary,
            recommended_actions=[action.value for action in result.recommended_actions],
            iocs=result.iocs,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage failed: {str(e)}")

@slm_router.post("/triage/batch")
async def batch_triage(request: BatchTriageRequest):
    """
    Triage multiple alerts in batch
    
    Returns prioritized list of alerts sorted by priority
    """
    try:
        agent = get_triage_agent()
        results = agent.batch_triage(request.alerts, request.context)
        
        return {
            "total_alerts": len(request.alerts),
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch triage failed: {str(e)}")

@slm_router.post("/triage/deduplicate")
async def deduplicate_alerts(request: BatchTriageRequest):
    """
    Find duplicate alerts in a batch
    """
    try:
        agent = get_triage_agent()
        results = agent.find_duplicates(request.alerts)
        
        return {
            **results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deduplication failed: {str(e)}")

@slm_router.post("/threat-intel/enrich", response_model=ThreatIntelResponse)
async def enrich_indicator(request: ThreatIntelRequest):
    """
    Enrich an IOC with threat intelligence using the local SLM
    
    This endpoint uses the trained Threat Intel Agent to:
    - Identify threat actors
    - Associate with campaigns
    - Map to MITRE ATT&CK techniques
    - Find related IOCs
    - Provide recommendations
    """
    try:
        agent = get_threat_intel_agent()
        result = agent.analyze(request.indicator, request.context)
        
        return ThreatIntelResponse(
            severity=result.severity.value,
            verdict=result.verdict.value,
            confidence=result.confidence,
            threat_actor=result.details.get("threat_actor", "unknown"),
            campaign=result.details.get("campaign", ""),
            malware_families=result.details.get("malware_families", ""),
            mitre_techniques=result.mitre_techniques,
            related_iocs=result.details.get("related_iocs", ""),
            summary=result.summary,
            recommended_actions=[action.value for action in result.recommended_actions],
            iocs=result.iocs,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")

@slm_router.post("/threat-intel/batch")
async def batch_enrich(request: BatchEnrichRequest):
    """
    Enrich multiple IOCs in batch
    """
    try:
        agent = get_threat_intel_agent()
        results = agent.enrich_iocs(request.iocs, request.context)
        
        return {
            "total_iocs": len(request.iocs),
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch enrichment failed: {str(e)}")

@slm_router.get("/health")
async def health_check():
    """
    Health check for SLM agents
    """
    triage_status = "not_loaded"
    threat_intel_status = "not_loaded"
    
    try:
        if _triage_agent is not None:
            triage_status = "loaded"
        elif AlertTriageAgent is not None:
            triage_status = "available"
    except:
        triage_status = "error"
    
    try:
        if _threat_intel_agent is not None:
            threat_intel_status = "loaded"
        elif ThreatIntelAgent is not None:
            threat_intel_status = "available"
    except:
        threat_intel_status = "error"
    
    return {
        "status": "healthy" if (triage_status in ["loaded", "available"] and 
                               threat_intel_status in ["loaded", "available"]) else "degraded",
        "agents": {
            "triage": triage_status,
            "threat_intel": threat_intel_status
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Export router
__all__ = ['slm_router']
