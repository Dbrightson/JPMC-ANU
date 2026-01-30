import sys
import json
import os
from typing import Dict, Optional, List

# Add the path to soc_llm
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../Triage-Agent-SLM/LLM-Generator/src")))

from soc_llm.agents.threat_intel import ThreatIntelAgent
from soc_llm.agents.base import AgentOutput, Verdict, Severity

class RAGThreatIntelAgent(ThreatIntelAgent):
    """
    Threat Intel Agent extended with local RAG capabilities.
    """
    def __init__(self, model, tokenizer, knowledge_base_path: str):
        super().__init__(model, tokenizer)
        self.knowledge_base = self._load_knowledge_base(knowledge_base_path)
    
    def _load_knowledge_base(self, path: str) -> Dict:
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading knowledge base: {e}")
            return {}

    def _lookup_ioc(self, text: str) -> List[Dict]:
        """Simple keyword-based lookup in knowledge base."""
        hits = []
        for ioc, data in self.knowledge_base.items():
            if ioc in text:
                hits.append({"ioc": ioc, "data": data})
        return hits

    def _create_prompt(self, input_data: str, context: Optional[Dict] = None) -> str:
        # Perform retrieval
        hits = self._lookup_ioc(str(input_data))
        
        rag_context = ""
        if hits:
            rag_context = "\n[LOCAL INTELLIGENCE DATABASE MATCHES]\n"
            for hit in hits:
                data = hit['data']
                rag_context += f"IOC: {hit['ioc']}\n"
                rag_context += f"  Actor: {data.get('threat_actor')}\n"
                rag_context += f"  Campaign: {data.get('campaign')}\n"
                rag_context += f"  Verdict: {data.get('verdict')}\n"
                rag_context += f"  Summary: {data.get('summary')}\n"
                rag_context += "---\n"
        
        # Inject into context
        if context is None:
            context = {}
        
        # We append our RAG context to the existing context string or create a new field
        # Base class uses {context_section} which is built from context dict.
        # We'll rely on the base class's _create_prompt to formatting, but we need to inject our RAG text.
        # However, Base class `_create_prompt` only looks for specific keys like 'industry', 'geo'.
        # We should OVERRIDE `_create_prompt` fully or inject into `input_data`.
        
        # Let's inject into input_data essentially, making it part of what the model analyzes
        enriched_input = f"{input_data}\n\n{rag_context}"
        
        return super()._create_prompt(enriched_input, context)

