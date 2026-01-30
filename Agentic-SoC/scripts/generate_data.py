import sys
import os
import json
import logging
import asyncio

# Setup path to import modules from Data-Generator root
base_path = os.path.abspath("Triage-Agent-SLM/Data-Generator")
sys.path.append(base_path)

# Try to import generators from src package
try:
    from src.generators.network_security import NetworkSecurityGenerator
    from src.generators.agentic_soc import AgenticSOCGenerator
    from src.generators.incident_response import IncidentResponseGenerator
    from src.core.config import GeneratorConfig
    from src.models.schemas import RealismLevel
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)

async def generate():
    os.makedirs("data", exist_ok=True)
    
    # 1. Network Security (for Triage)
    print("Generating Network Security events...")
    net_gen = NetworkSecurityGenerator() # default config
    # Some generators might require config or init args
    # Let's assume defaults work based on README "generator = GeneratorRegistry.get..."
    
    events = net_gen.generate_batch(100)
    with open("data/network_events.json", "w") as f:
        # Convert Pydantic models to dict
        json.dump([e.model_dump() for e in events], f, default=str)

    # 2. Agentic SOC (for general agent reasoning)
    print("Generating Agentic SOC events...")
    agent_gen = AgenticSOCGenerator()
    events = agent_gen.generate_batch(100)
    with open("data/agentic_events.json", "w") as f:
        json.dump([e.model_dump() for e in events], f, default=str)

    # 3. Incident Response (for upper tier agents)
    print("Generating Incident Response events...")
    ir_gen = IncidentResponseGenerator()
    events = ir_gen.generate_batch(50)
    with open("data/incident_events.json", "w") as f:
        json.dump([e.model_dump() for e in events], f, default=str)

if __name__ == "__main__":
    asyncio.run(generate())
