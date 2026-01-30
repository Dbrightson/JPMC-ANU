import sqlite3
import json
import logging
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, List, Optional, Dict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BeadsMemory")

@dataclass
class Bead:
    """Atomic fact unit."""
    bead_type: str  # e.g., 'triage_decision', 'intel_enrichment'
    entity: str     # e.g., 'alert_uuid', '1.2.3.4'
    value: Any      # The actual data (stored as JSON string)
    confidence: float
    source_agent: str
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat()

class BeadsMemory:
    """Minimal external memory using SQLite."""
    
    def __init__(self, db_path: str = "beads.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS beads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bead_type TEXT NOT NULL,
                entity TEXT NOT NULL,
                value TEXT NOT NULL,
                confidence REAL,
                source_agent TEXT,
                timestamp TEXT
            )
        """)
        conn.commit()
        conn.close()

    def add_bead(self, bead: Bead):
        """Write a bead to memory."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Serialize value to JSON if it's a dict/list
        if isinstance(bead.value, (dict, list)):
            value_str = json.dumps(bead.value)
        else:
            value_str = str(bead.value)

        cursor.execute("""
            INSERT INTO beads (bead_type, entity, value, confidence, source_agent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (bead.bead_type, bead.entity, value_str, bead.confidence, bead.source_agent, bead.timestamp))
        
        conn.commit()
        conn.close()
        logger.info(f"Added bead: {bead.bead_type} for {bead.entity}")

    def get_beads(self, entity: str) -> List[Dict]:
        """Retrieve all beads for a specific entity."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM beads WHERE entity = ? ORDER BY timestamp ASC", (entity,))
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            # Try to parse JSON value
            try:
                val = json.loads(row['value'])
            except json.JSONDecodeError:
                val = row['value']
                
            results.append({
                "id": row['id'],
                "bead_type": row['bead_type'],
                "entity": row['entity'],
                "value": val,
                "confidence": row['confidence'],
                "source_agent": row['source_agent'],
                "timestamp": row['timestamp']
            })
        
        conn.close()
        return results

    def get_latest_verdict(self, entity: str) -> Optional[str]:
        """Helper to get the latest triage verdict for an entity."""
        beads = self.get_beads(entity)
        for bead in reversed(beads):
            if bead['bead_type'] == 'triage_decision':
                # Assuming value is a dict with 'verdict' or text
                if isinstance(bead['value'], dict):
                    return bead['value'].get('verdict')
                return bead['value']
        return None
