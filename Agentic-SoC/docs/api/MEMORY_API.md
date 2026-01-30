# Memory Architecture API Documentation

## Overview

The Memory Architecture API provides RESTful endpoints to access the **Beads Memory System** - an external memory layer for the Agentic SOC platform. This API allows agents and frontend applications to store, retrieve, and analyze atomic facts (beads) about security events, alerts, and entities.

## Base URL

```
http://localhost:8000/api/memory
```

## Architecture

The Memory API is built on the **Beads** concept - atomic, immutable facts stored in SQLite:

- **Bead**: An atomic unit of memory containing:
  - `bead_type`: Category of information (e.g., 'triage_decision', 'intel_enrichment')
  - `entity`: The subject (e.g., alert UUID, IP address, hostname)
  - `value`: The actual data/fact
  - `confidence`: Confidence score (0.0 to 1.0)
  - `source_agent`: Agent that created the bead
  - `timestamp`: When the bead was created

## API Endpoints

### 1. Root Endpoint

**GET** `/api/memory/`

Returns API information and status.

**Response:**
```json
{
  "message": "Beads Memory Architecture API",
  "version": "1.0.0",
  "description": "External memory layer for Agentic SOC system",
  "database": "path/to/beads.db"
}
```

---

### 2. Create Bead

**POST** `/api/memory/beads`

Create a new bead (atomic fact) in memory.

**Request Body:**
```json
{
  "bead_type": "triage_decision",
  "entity": "alert-12345",
  "value": {
    "verdict": "malicious",
    "severity": "high",
    "reason": "Suspicious login pattern detected"
  },
  "confidence": 0.92,
  "source_agent": "triage_agent"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Bead created for entity 'alert-12345'",
  "bead": {
    "bead_type": "triage_decision",
    "entity": "alert-12345",
    "source_agent": "triage_agent",
    "timestamp": "2026-01-23T05:10:51.123456"
  }
}
```

---

### 3. Get Beads by Entity

**GET** `/api/memory/beads/{entity}`

Retrieve all beads for a specific entity.

**Query Parameters:**
- `bead_type` (optional): Filter by bead type
- `source_agent` (optional): Filter by source agent
- `min_confidence` (optional): Minimum confidence threshold (0.0-1.0)

**Example:**
```
GET /api/memory/beads/alert-12345?bead_type=triage_decision&min_confidence=0.8
```

**Response:**
```json
[
  {
    "id": 1,
    "bead_type": "triage_decision",
    "entity": "alert-12345",
    "value": {
      "verdict": "malicious",
      "severity": "high"
    },
    "confidence": 0.92,
    "source_agent": "triage_agent",
    "timestamp": "2026-01-23T05:10:51.123456"
  }
]
```

---

### 4. Get Latest Verdict

**GET** `/api/memory/beads/{entity}/latest`

Get the most recent triage verdict for an entity.

**Example:**
```
GET /api/memory/beads/alert-12345/latest
```

**Response:**
```json
{
  "entity": "alert-12345",
  "verdict": "malicious",
  "timestamp": "2026-01-23T05:10:51.123456"
}
```

---

### 5. Memory Statistics

**GET** `/api/memory/stats`

Get comprehensive statistics about the memory system.

**Response:**
```json
{
  "total_beads": 1523,
  "unique_entities": 342,
  "bead_types": {
    "triage_decision": 450,
    "intel_enrichment": 380,
    "vulnerability_scan": 693
  },
  "agents": {
    "triage_agent": 450,
    "threat_intel_agent": 380,
    "vuln_agent": 693
  },
  "avg_confidence": 0.847,
  "recent_activity": [
    {
      "bead_type": "triage_decision",
      "entity": "alert-12345",
      "source_agent": "triage_agent",
      "timestamp": "2026-01-23T05:10:51.123456",
      "confidence": 0.92
    }
  ],
  "database_path": "path/to/beads.db"
}
```

---

### 6. Search Beads

**GET** `/api/memory/search`

Search beads across all entities with filters.

**Query Parameters:**
- `bead_type` (optional): Filter by bead type
- `source_agent` (optional): Filter by source agent
- `min_confidence` (optional): Minimum confidence (0.0-1.0)
- `limit` (optional, default=100, max=1000): Maximum results

**Example:**
```
GET /api/memory/search?source_agent=threat_intel_agent&min_confidence=0.9&limit=50
```

**Response:**
```json
[
  {
    "id": 42,
    "bead_type": "intel_enrichment",
    "entity": "192.168.1.100",
    "value": {
      "threat_level": "high",
      "known_malware": true
    },
    "confidence": 0.95,
    "source_agent": "threat_intel_agent",
    "timestamp": "2026-01-23T05:10:51.123456"
  }
]
```

---

### 7. List Entities

**GET** `/api/memory/entities`

List all entities in memory with their bead counts.

**Query Parameters:**
- `limit` (optional, default=50, max=500): Maximum entities to return

**Response:**
```json
[
  {
    "entity": "alert-12345",
    "bead_count": 5,
    "last_updated": "2026-01-23T05:10:51.123456",
    "avg_confidence": 0.89
  },
  {
    "entity": "192.168.1.100",
    "bead_count": 3,
    "last_updated": "2026-01-23T04:30:22.654321",
    "avg_confidence": 0.92
  }
]
```

---

### 8. Get Entity Timeline

**GET** `/api/memory/timeline/{entity}`

Get a chronological timeline of all memory for an entity.

**Example:**
```
GET /api/memory/timeline/alert-12345
```

**Response:**
```json
{
  "entity": "alert-12345",
  "timeline": [
    {
      "timestamp": "2026-01-23T05:00:00.000000",
      "agent": "triage_agent",
      "type": "triage_decision",
      "confidence": 0.85,
      "value": {"verdict": "suspicious"}
    },
    {
      "timestamp": "2026-01-23T05:05:00.000000",
      "agent": "threat_intel_agent",
      "type": "intel_enrichment",
      "confidence": 0.92,
      "value": {"threat_level": "high"}
    }
  ],
  "total_events": 2,
  "agents_involved": ["triage_agent", "threat_intel_agent"],
  "types_recorded": ["triage_decision", "intel_enrichment"],
  "first_seen": "2026-01-23T05:00:00.000000",
  "last_updated": "2026-01-23T05:05:00.000000"
}
```

---

### 9. Delete Entity Beads

**DELETE** `/api/memory/beads/{entity}`

Delete all beads for a specific entity. **Use with caution!**

**Example:**
```
DELETE /api/memory/beads/alert-12345
```

**Response:**
```json
{
  "status": "success",
  "message": "Deleted 5 beads for entity 'alert-12345'",
  "entity": "alert-12345",
  "deleted_count": 5
}
```

---

## Common Bead Types

### Triage Agent
- `triage_decision`: Alert classification and severity assignment
- `false_positive`: False positive identification

### Threat Intelligence Agent
- `intel_enrichment`: IOC enrichment and threat context
- `threat_campaign`: Threat campaign association
- `ioc_reputation`: Indicator reputation score

### Vulnerability Management Agent
- `vulnerability_scan`: Vulnerability detection
- `patch_status`: Patch application status
- `risk_assessment`: Asset risk evaluation

### Incident Response Agent
- `incident_action`: Actions taken during incident
- `containment_step`: Containment measures
- `remediation_plan`: Remediation recommendations

---

## Usage Examples

### Example 1: Triage Agent Writing Decision

```python
import requests

# Agent makes a triage decision
response = requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "triage_decision",
        "entity": "alert-67890",
        "value": {
            "verdict": "benign",
            "severity": "low",
            "reason": "Known safe process"
        },
        "confidence": 0.95,
        "source_agent": "triage_agent"
    }
)
print(response.json())
```

### Example 2: Threat Intel Agent Enriching IOC

```python
# Enrich an IP address with threat intelligence
response = requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "intel_enrichment",
        "entity": "203.0.113.42",
        "value": {
            "threat_level": "critical",
            "known_malware": True,
            "campaigns": ["APT-XYZ"],
            "first_seen": "2026-01-15"
        },
        "confidence": 0.98,
        "source_agent": "threat_intel_agent"
    }
)
```

### Example 3: Frontend Retrieving Alert History

```javascript
// Fetch all memory for an alert
const response = await fetch(
  'http://localhost:8000/api/memory/timeline/alert-12345'
);
const timeline = await response.json();

console.log(`Alert has ${timeline.total_events} events`);
console.log(`Agents involved: ${timeline.agents_involved.join(', ')}`);
```

### Example 4: Analyzing Memory Statistics

```python
# Get system-wide memory statistics
response = requests.get("http://localhost:8000/api/memory/stats")
stats = response.json()

print(f"Total beads: {stats['total_beads']}")
print(f"Unique entities: {stats['unique_entities']}")
print(f"Average confidence: {stats['avg_confidence']}")
print(f"Bead types: {stats['bead_types']}")
```

---

## Integration with Frontend

### React/JavaScript Example

```javascript
// Memory API client
class MemoryAPI {
  constructor(baseURL = 'http://localhost:8000/api/memory') {
    this.baseURL = baseURL;
  }

  async createBead(beadData) {
    const response = await fetch(`${this.baseURL}/beads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beadData)
    });
    return response.json();
  }

  async getEntityBeads(entity, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${this.baseURL}/beads/${entity}?${params}`
    );
    return response.json();
  }

  async getTimeline(entity) {
    const response = await fetch(`${this.baseURL}/timeline/${entity}`);
    return response.json();
  }

  async getStats() {
    const response = await fetch(`${this.baseURL}/stats`);
    return response.json();
  }
}

// Usage
const memoryAPI = new MemoryAPI();

// Display alert timeline
async function showAlertHistory(alertId) {
  const timeline = await memoryAPI.getTimeline(alertId);
  
  timeline.timeline.forEach(event => {
    console.log(`[${event.timestamp}] ${event.agent}: ${event.type}`);
    console.log(`  Confidence: ${event.confidence}`);
    console.log(`  Value:`, event.value);
  });
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Entity not found
- **500 Internal Server Error**: Server error

Error responses include details:

```json
{
  "detail": "Failed to create bead: Invalid confidence value"
}
```

---

## Performance Considerations

1. **Indexing**: The database is indexed on `entity` for fast lookups
2. **Limits**: Use the `limit` parameter to control result sizes
3. **Filtering**: Apply filters at the API level for better performance
4. **Caching**: Consider caching frequently accessed entities in your frontend

---

## Security Notes

1. **Authentication**: Add authentication middleware in production
2. **Authorization**: Implement role-based access control for sensitive operations
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: All inputs are validated via Pydantic models
5. **SQL Injection**: Protected via parameterized queries

---

## Future Enhancements

- [ ] Vector similarity search for semantic memory
- [ ] Time-based retention policies
- [ ] Memory compression for old beads
- [ ] Real-time WebSocket updates
- [ ] Memory export/import functionality
- [ ] Advanced analytics and pattern detection

---

## Support

For issues or questions, refer to:
- Memory Architecture documentation: `Memory-Architecture.txt`
- Beads implementation: `src/beads.py`
- API implementation: `Frontend/backend/memory_api.py`
