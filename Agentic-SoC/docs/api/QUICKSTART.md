# Quick Start Guide - Memory Architecture API

## Prerequisites

- Python 3.8+
- FastAPI server dependencies installed
- Beads database (`beads.db`) in project root

## Installation

### 1. Install Dependencies

```bash
cd Frontend/backend
pip install -r requirements.txt
```

All required packages are already in `requirements.txt`:
- `fastapi` - Web framework
- `pydantic` - Data validation
- `uvicorn` - ASGI server
- `motor` - Async MongoDB (for other endpoints)

### 2. Verify Beads Module

The API uses the existing `src/beads.py` module. Ensure it's accessible:

```bash
# From project root
ls src/beads.py  # Should exist
ls beads.db      # Should exist (or will be created)
```

## Starting the Server

### Option 1: Standard Start

```bash
cd Frontend/backend
uvicorn server:app --reload
```

### Option 2: Custom Port

```bash
uvicorn server:app --reload --port 8080
```

### Option 3: Production Mode

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
```

## Verify Installation

### 1. Check Server is Running

Open browser to: `http://localhost:8000/api/memory/`

Expected response:
```json
{
  "message": "Beads Memory Architecture API",
  "version": "1.0.0",
  "description": "External memory layer for Agentic SOC system",
  "database": "path/to/beads.db"
}
```

### 2. View API Documentation

Open browser to: `http://localhost:8000/docs`

You'll see interactive Swagger UI with all endpoints.

### 3. Run Test Suite

```bash
cd Frontend/backend
python test_memory_api.py
```

Expected output:
```
============================================================
  MEMORY ARCHITECTURE API TEST SUITE
============================================================

Base URL: http://localhost:8000/api/memory
Time: 2026-01-23T05:10:51.123456

============================================================
  Testing Root Endpoint
============================================================

Status: 200
{
  "message": "Beads Memory Architecture API",
  ...
}

...

============================================================
  All Tests Completed Successfully!
============================================================
```

## Basic Usage

### Create a Bead (Python)

```python
import requests

response = requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "triage_decision",
        "entity": "alert-001",
        "value": {"verdict": "malicious", "severity": "high"},
        "confidence": 0.92,
        "source_agent": "triage_agent"
    }
)

print(response.json())
```

### Retrieve Beads (Python)

```python
response = requests.get(
    "http://localhost:8000/api/memory/beads/alert-001"
)

beads = response.json()
for bead in beads:
    print(f"{bead['source_agent']}: {bead['value']}")
```

### Get Timeline (JavaScript)

```javascript
const response = await fetch(
  'http://localhost:8000/api/memory/timeline/alert-001'
);
const timeline = await response.json();

console.log(`Total events: ${timeline.total_events}`);
console.log(`Agents: ${timeline.agents_involved.join(', ')}`);
```

## Integration with Agents

### Triage Agent Example

```python
from src.beads import BeadsMemory, Bead
import requests

# Option 1: Direct database access
memory = BeadsMemory("beads.db")
bead = Bead(
    bead_type="triage_decision",
    entity="alert-123",
    value={"verdict": "benign"},
    confidence=0.95,
    source_agent="triage_agent"
)
memory.add_bead(bead)

# Option 2: Via API (recommended for distributed systems)
requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "triage_decision",
        "entity": "alert-123",
        "value": {"verdict": "benign"},
        "confidence": 0.95,
        "source_agent": "triage_agent"
    }
)
```

### Threat Intel Agent Example

```python
# Enrich an IP address
requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "intel_enrichment",
        "entity": "192.168.1.100",
        "value": {
            "threat_level": "critical",
            "known_malware": True,
            "campaigns": ["APT-XYZ"]
        },
        "confidence": 0.98,
        "source_agent": "threat_intel_agent"
    }
)

# Later, retrieve enrichment
response = requests.get(
    "http://localhost:8000/api/memory/beads/192.168.1.100"
)
enrichments = response.json()
```

## Frontend Integration

### Add to React Dashboard

```javascript
// In your main dashboard component
import { MemoryTimeline, MemoryStatsDashboard } from './components/MemoryTimeline';

function Dashboard() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <div>
      {/* Memory Stats Widget */}
      <MemoryStatsDashboard />

      {/* Alert Timeline */}
      {selectedAlert && (
        <MemoryTimeline entityId={selectedAlert} />
      )}
    </div>
  );
}
```

## Common Operations

### 1. Get Memory Statistics

```bash
curl http://localhost:8000/api/memory/stats
```

### 2. Search High-Confidence Decisions

```bash
curl "http://localhost:8000/api/memory/search?min_confidence=0.9&limit=10"
```

### 3. List Top Entities

```bash
curl "http://localhost:8000/api/memory/entities?limit=20"
```

### 4. Get Alert Timeline

```bash
curl http://localhost:8000/api/memory/timeline/alert-001
```

### 5. Delete Entity Memory

```bash
curl -X DELETE http://localhost:8000/api/memory/beads/alert-001
```

## Troubleshooting

### Issue: "Module 'beads' not found"

**Solution**: The API adds the parent directory to Python path. Verify:
```python
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent / "src"))
```

### Issue: "Database locked"

**Solution**: SQLite doesn't handle high concurrency well. For production:
1. Use connection pooling
2. Consider PostgreSQL for high-load scenarios
3. Implement retry logic

### Issue: "CORS errors in frontend"

**Solution**: The server already has CORS middleware. Verify:
```python
# In server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Port already in use"

**Solution**: Change the port:
```bash
uvicorn server:app --reload --port 8080
```

## Environment Variables

Create `.env` file in `Frontend/backend/`:

```env
# MongoDB (for other endpoints)
MONGO_URL=mongodb://localhost:27017
DB_NAME=agentic_soc

# OpenAI (for LLM features)
EMERGENT_LLM_KEY=your-api-key-here

# CORS (optional)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Performance Tips

1. **Use Filters**: Always filter at the API level
   ```python
   # Good
   /api/memory/beads/alert-001?bead_type=triage_decision
   
   # Avoid
   /api/memory/beads/alert-001  # Then filter in code
   ```

2. **Limit Results**: Use the `limit` parameter
   ```python
   /api/memory/search?limit=50
   ```

3. **Cache Frontend**: Cache entity timelines in React state
   ```javascript
   const [cache, setCache] = useState({});
   ```

4. **Batch Operations**: Create multiple beads in a loop efficiently
   ```python
   # Use connection pooling or batch inserts
   ```

## Next Steps

1. ✅ Start the server
2. ✅ Run test suite
3. ✅ Try creating beads via API
4. ✅ Integrate React components
5. ✅ Connect your agents

## Resources

- **API Documentation**: `Frontend/MEMORY_API.md`
- **Implementation Summary**: `Frontend/IMPLEMENTATION_SUMMARY.md`
- **Memory Architecture**: `Memory-Architecture.txt`
- **Beads Source**: `src/beads.py`
- **API Source**: `Frontend/backend/memory_api.py`
- **Test Suite**: `Frontend/backend/test_memory_api.py`
- **React Components**: `Frontend/frontend/src/components/MemoryTimeline.jsx`

## Support

For issues or questions:
1. Check the API docs: `Frontend/MEMORY_API.md`
2. Review test suite: `test_memory_api.py`
3. Check server logs for errors
4. Verify database exists and is accessible

---

**Happy Coding! 🚀**
