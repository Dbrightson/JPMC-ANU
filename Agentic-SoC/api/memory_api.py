"""
Memory Architecture API - FastAPI endpoints for Beads Memory System
Provides access to the external memory layer for Agentic SOC agents
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import sys
from pathlib import Path

# Add parent directory to path to import beads module
sys.path.append(str(Path(__file__).parent.parent / "core"))

from core.beads import BeadsMemory, Bead

# Initialize router
memory_router = APIRouter(prefix="/api/memory", tags=["Memory Architecture"])

# Initialize Beads Memory (using the database in the project root)
BEADS_DB_PATH = str(Path(__file__).parent.parent / "beads.db")
memory = BeadsMemory(db_path=BEADS_DB_PATH)

# ============== PYDANTIC MODELS ==============

class BeadCreate(BaseModel):
    """Model for creating a new bead"""
    bead_type: str = Field(..., description="Type of bead (e.g., 'triage_decision', 'intel_enrichment', 'vulnerability_scan')")
    entity: str = Field(..., description="Entity identifier (e.g., alert UUID, IP address, hostname)")
    value: Any = Field(..., description="The actual data/fact to store")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0 to 1.0)")
    source_agent: str = Field(..., description="Agent that created this bead (e.g., 'triage_agent', 'threat_intel_agent')")

class BeadResponse(BaseModel):
    """Model for bead response"""
    id: int
    bead_type: str
    entity: str
    value: Any
    confidence: float
    source_agent: str
    timestamp: str

class BeadQueryParams(BaseModel):
    """Model for querying beads"""
    entity: Optional[str] = None
    bead_type: Optional[str] = None
    source_agent: Optional[str] = None
    min_confidence: Optional[float] = None
    limit: Optional[int] = 100

class MemoryStats(BaseModel):
    """Statistics about the memory system"""
    total_beads: int
    unique_entities: int
    bead_types: Dict[str, int]
    agents: Dict[str, int]
    avg_confidence: float
    recent_activity: List[Dict[str, Any]]

# ============== API ENDPOINTS ==============

@memory_router.get("/", response_model=Dict[str, str])
async def memory_root():
    """Memory API root endpoint"""
    return {
        "message": "Beads Memory Architecture API",
        "version": "1.0.0",
        "description": "External memory layer for Agentic SOC system",
        "database": BEADS_DB_PATH
    }

@memory_router.post("/beads", response_model=Dict[str, Any])
async def create_bead(bead_data: BeadCreate):
    """
    Create a new bead (atomic fact) in memory
    
    This endpoint allows agents to write decisions, enrichments, and observations
    to the external memory layer.
    """
    try:
        bead = Bead(
            bead_type=bead_data.bead_type,
            entity=bead_data.entity,
            value=bead_data.value,
            confidence=bead_data.confidence,
            source_agent=bead_data.source_agent
        )
        
        memory.add_bead(bead)
        
        return {
            "status": "success",
            "message": f"Bead created for entity '{bead_data.entity}'",
            "bead": {
                "bead_type": bead_data.bead_type,
                "entity": bead_data.entity,
                "source_agent": bead_data.source_agent,
                "timestamp": bead.timestamp
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create bead: {str(e)}")

@memory_router.get("/beads/{entity}", response_model=List[BeadResponse])
async def get_beads_by_entity(
    entity: str,
    bead_type: Optional[str] = Query(None, description="Filter by bead type"),
    source_agent: Optional[str] = Query(None, description="Filter by source agent"),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum confidence threshold")
):
    """
    Retrieve all beads for a specific entity
    
    Returns the memory timeline for an entity (e.g., all decisions and enrichments
    for a specific alert or IP address)
    """
    try:
        beads = memory.get_beads(entity)
        
        # Apply filters
        if bead_type:
            beads = [b for b in beads if b['bead_type'] == bead_type]
        
        if source_agent:
            beads = [b for b in beads if b['source_agent'] == source_agent]
        
        if min_confidence is not None:
            beads = [b for b in beads if b['confidence'] >= min_confidence]
        
        return beads
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve beads: {str(e)}")

@memory_router.get("/beads/{entity}/latest", response_model=Dict[str, Any])
async def get_latest_verdict(entity: str):
    """
    Get the latest triage verdict for an entity
    
    Helper endpoint to quickly retrieve the most recent decision for an alert or entity
    """
    try:
        verdict = memory.get_latest_verdict(entity)
        
        if verdict is None:
            return {
                "entity": entity,
                "verdict": None,
                "message": "No triage decision found for this entity"
            }
        
        return {
            "entity": entity,
            "verdict": verdict,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve verdict: {str(e)}")

@memory_router.get("/stats", response_model=Dict[str, Any])
async def get_memory_stats():
    """
    Get statistics about the memory system
    
    Provides insights into memory usage, agent activity, and data distribution
    """
    try:
        import sqlite3
        
        conn = sqlite3.connect(BEADS_DB_PATH)
        cursor = conn.cursor()
        
        # Total beads
        cursor.execute("SELECT COUNT(*) FROM beads")
        total_beads = cursor.fetchone()[0]
        
        # Unique entities
        cursor.execute("SELECT COUNT(DISTINCT entity) FROM beads")
        unique_entities = cursor.fetchone()[0]
        
        # Bead types distribution
        cursor.execute("SELECT bead_type, COUNT(*) FROM beads GROUP BY bead_type")
        bead_types = dict(cursor.fetchall())
        
        # Agent activity
        cursor.execute("SELECT source_agent, COUNT(*) FROM beads GROUP BY source_agent")
        agents = dict(cursor.fetchall())
        
        # Average confidence
        cursor.execute("SELECT AVG(confidence) FROM beads")
        avg_confidence = cursor.fetchone()[0] or 0.0
        
        # Recent activity (last 10 beads)
        cursor.execute("""
            SELECT bead_type, entity, source_agent, timestamp, confidence 
            FROM beads 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        recent_rows = cursor.fetchall()
        recent_activity = [
            {
                "bead_type": row[0],
                "entity": row[1],
                "source_agent": row[2],
                "timestamp": row[3],
                "confidence": row[4]
            }
            for row in recent_rows
        ]
        
        conn.close()
        
        return {
            "total_beads": total_beads,
            "unique_entities": unique_entities,
            "bead_types": bead_types,
            "agents": agents,
            "avg_confidence": round(avg_confidence, 3),
            "recent_activity": recent_activity,
            "database_path": BEADS_DB_PATH
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {str(e)}")

@memory_router.get("/search", response_model=List[BeadResponse])
async def search_beads(
    bead_type: Optional[str] = Query(None, description="Filter by bead type"),
    source_agent: Optional[str] = Query(None, description="Filter by source agent"),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum confidence"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum results to return")
):
    """
    Search beads across all entities with filters
    
    Useful for analyzing patterns across the entire memory system
    """
    try:
        import sqlite3
        
        conn = sqlite3.connect(BEADS_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Build dynamic query
        query = "SELECT * FROM beads WHERE 1=1"
        params = []
        
        if bead_type:
            query += " AND bead_type = ?"
            params.append(bead_type)
        
        if source_agent:
            query += " AND source_agent = ?"
            params.append(source_agent)
        
        if min_confidence is not None:
            query += " AND confidence >= ?"
            params.append(min_confidence)
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            import json
            try:
                val = json.loads(row['value'])
            except (json.JSONDecodeError, TypeError):
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search beads: {str(e)}")

@memory_router.get("/entities", response_model=List[Dict[str, Any]])
async def list_entities(
    limit: int = Query(50, ge=1, le=500, description="Maximum entities to return")
):
    """
    List all entities in memory with their bead counts
    
    Useful for understanding which entities have the most memory/context
    """
    try:
        import sqlite3
        
        conn = sqlite3.connect(BEADS_DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                entity, 
                COUNT(*) as bead_count,
                MAX(timestamp) as last_updated,
                AVG(confidence) as avg_confidence
            FROM beads 
            GROUP BY entity 
            ORDER BY bead_count DESC 
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        
        entities = [
            {
                "entity": row[0],
                "bead_count": row[1],
                "last_updated": row[2],
                "avg_confidence": round(row[3], 3) if row[3] else 0.0
            }
            for row in rows
        ]
        
        conn.close()
        return entities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list entities: {str(e)}")

@memory_router.delete("/beads/{entity}")
async def delete_entity_beads(entity: str):
    """
    Delete all beads for a specific entity
    
    Use with caution - this removes all memory for the entity
    """
    try:
        import sqlite3
        
        conn = sqlite3.connect(BEADS_DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM beads WHERE entity = ?", (entity,))
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": f"Deleted {deleted_count} beads for entity '{entity}'",
            "entity": entity,
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete beads: {str(e)}")

@memory_router.get("/timeline/{entity}", response_model=Dict[str, Any])
async def get_entity_timeline(entity: str):
    """
    Get a chronological timeline of all memory for an entity
    
    Useful for understanding the full context and decision history
    """
    try:
        beads = memory.get_beads(entity)
        
        if not beads:
            return {
                "entity": entity,
                "timeline": [],
                "total_events": 0,
                "message": "No memory found for this entity"
            }
        
        # Organize timeline by agent and type
        timeline = []
        for bead in beads:
            timeline.append({
                "timestamp": bead['timestamp'],
                "agent": bead['source_agent'],
                "type": bead['bead_type'],
                "confidence": bead['confidence'],
                "value": bead['value']
            })
        
        # Calculate summary stats
        agents_involved = list(set(b['source_agent'] for b in beads))
        types_recorded = list(set(b['bead_type'] for b in beads))
        
        return {
            "entity": entity,
            "timeline": timeline,
            "total_events": len(beads),
            "agents_involved": agents_involved,
            "types_recorded": types_recorded,
            "first_seen": beads[0]['timestamp'] if beads else None,
            "last_updated": beads[-1]['timestamp'] if beads else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve timeline: {str(e)}")

# Export router
__all__ = ['memory_router']
