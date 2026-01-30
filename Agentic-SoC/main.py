import sys
import os
import json
import logging
from typing import Dict

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "Triage-Agent-SLM/LLM-Generator/src")))

from soc_llm.agents.alert_triage import AlertTriageAgent
from src.rag_intel_agent import RAGThreatIntelAgent
from src.beads import BeadsMemory, Bead
from src.model_wrapper import HFSOCModel, CompatibleTokenizer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AgenticSOC")

def main():
    logger.info("Initializing Agentic SOC POC...")

    # 1. Initialize Memory
    memory = BeadsMemory("beads.db")

    # 2. Initialize Model (using distilgpt2 for speed/size)
    if os.path.exists("./fine_tuned_soc_model"):
        MODEL_NAME = "./fine_tuned_soc_model"
        logger.info(f"Loading Fine-Tuned Model from: {MODEL_NAME}")
    else:
        MODEL_NAME = "distilgpt2" 
        logger.info(f"Loading Base Model: {MODEL_NAME}")
    
    try:
        model = HFSOCModel(MODEL_NAME)
        tokenizer = CompatibleTokenizer(MODEL_NAME)
    except Exception as e:
        logger.error(f"Failed to load model. Ensure transformers/torch are installed. Error: {e}")
        return

    # 3. Initialize Agents
    logger.info("Initializing Agents...")
    triage_agent = AlertTriageAgent(model, tokenizer)
    intel_agent = RAGThreatIntelAgent(model, tokenizer, knowledge_base_path="data/knowledge_base.json")

    # 4. Generate/Load Input Alert
    # Using the sample from README that matches our KB
    alert = {
      "event_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "timestamp": "2025-01-15T14:23:45Z",
      "device_type": "Firewall",
      "device_vendor": "Palo Alto",
      "source_ip": "185.220.101.50",
      "dest_ip": "10.0.100.25",
      "protocol": "HTTPS",
      "action": "block",
      "severity": "high",
      "alert_name": "Malware C2 Communication - HTTPS",
      "threat_actor": "APT28"
    }
    alert_str = json.dumps(alert, indent=2)
    logger.info(f"Incoming Alert: {alert['alert_name']} from {alert['source_ip']}")

    # 5. Pipeline Execution
    
    # Step A: Triage
    logger.info("--- Step 1: Triage Agent ---")
    triage_result = triage_agent.analyze(alert_str)
    
    # Persist Triage Decision
    bead_triage = Bead(
        bead_type="triage_decision",
        entity=alert['event_id'],
        value=triage_result.to_dict(),
        confidence=triage_result.confidence,
        source_agent="AlertTriageAgent"
    )
    memory.add_bead(bead_triage)
    logger.info(f"Triage Decision: {triage_result.verdict.value} (Confidence: {triage_result.confidence})")

    # Step B: Conditional Escalation
    if triage_result.verdict.value in ["suspicious", "malicious", "unknown"]:
        logger.info("--- Step 2: Threat Intel Enrichment (Escalated) ---")
        
        # Extract IOCs (simplified: just take IPs from alert)
        iocs = [alert['source_ip'], alert['dest_ip']]
        
        for ioc in iocs:
            logger.info(f"Enriching IOC: {ioc}")
            intel_result = intel_agent.analyze(ioc)
            
            # Persist Enrichment
            bead_intel = Bead(
                bead_type="intel_enrichment",
                entity=ioc,
                value=intel_result.to_dict(),
                confidence=intel_result.confidence,
                source_agent="RAGThreatIntelAgent"
            )
            memory.add_bead(bead_intel)
            logger.info(f"Intel Result for {ioc}: {intel_result.summary}")

    # 6. Final Report
    logger.info("--- POC Execution Complete ---")
    print("\n=== FINAL SYSTEM STATE ===")
    print(f"Alert ID: {alert['event_id']}")
    print("Stored Beads:")
    all_beads = memory.get_beads(alert['event_id'])
    for b in all_beads:
        print(f"- [Triage] {b['timestamp']}: {b['value']['verdict']} ({b['value']['summary']})")
    
    # Also show beads for the IOCs
    for ioc in [alert['source_ip'], alert['dest_ip']]:
        ioc_beads = memory.get_beads(ioc)
        for b in ioc_beads:
             print(f"- [Intel]  {b['timestamp']} ({ioc}): {b['value']['summary']}")

if __name__ == "__main__":
    main()
