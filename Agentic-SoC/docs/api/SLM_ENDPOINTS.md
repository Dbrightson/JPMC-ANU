# SLM Endpoints Documentation

## Overview

The SLM (Small Language Model) endpoints provide access to **locally trained** AI agents for SOC operations. These are **NOT cloud-based** models - they run entirely on your infrastructure.

## Available Agents

### 1. **Alert Triage Agent** (`/api/slm/triage`)
- **Purpose**: Classify and prioritize security alerts
- **Model**: Locally trained SLM
- **No external API calls**: Runs 100% locally

### 2. **Threat Intelligence Agent** (`/api/slm/threat-intel`)
- **Purpose**: Enrich IOCs with threat intelligence
- **Model**: Locally trained SLM
- **No external API calls**: Runs 100% locally

## Base URL

```
http://localhost:8000/api/slm
```

## Endpoints

### 1. Root Endpoint

**GET** `/api/slm/`

Returns SLM API information and agent status.

**Response:**
```json
{
  "message": "Small Language Model API",
  "version": "1.0.0",
  "description": "Local SLM agents for SOC operations",
  "agents": {
    "triage": "Alert Triage Agent - /api/slm/triage",
    "threat_intel": "Threat Intelligence Agent - /api/slm/threat-intel"
  },
  "status": {
    "triage_loaded": true,
    "threat_intel_loaded": true
  }
}
```

---

### 2. Triage Alert

**POST** `/api/slm/triage`

Triage a single security alert using the local SLM.

**Request Body:**
```json
{
  "alert": "Failed SSH login from 192.168.1.100 for user admin - 5 attempts in 60 seconds",
  "context": {
    "queue_size": 42,
    "recent_alerts": "3 similar alerts in last hour",
    "baseline": "Normal: 1-2 failed logins per hour"
  }
}
```

**Response:**
```json
{
  "severity": "high",
  "verdict": "suspicious",
  "confidence": 0.92,
  "priority": 2,
  "is_duplicate": false,
  "false_positive_likelihood": "low",
  "escalate": true,
  "summary": "Multiple failed SSH attempts from external IP - potential brute force attack",
  "recommended_actions": ["block_ip", "investigate", "escalate"],
  "iocs": {
    "ips": ["192.168.1.100"],
    "users": ["admin"]
  },
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

---

### 3. Batch Triage

**POST** `/api/slm/triage/batch`

Triage multiple alerts and get prioritized list.

**Request Body:**
```json
{
  "alerts": [
    "Failed login attempt from 10.0.0.5",
    "Malware detected on workstation-42",
    "Unusual network traffic to external IP"
  ],
  "context": {
    "queue_size": 100
  }
}
```

**Response:**
```json
{
  "total_alerts": 3,
  "results": [
    {
      "alert": "Malware detected on workstation-42",
      "priority": 1,
      "severity": "critical",
      "is_duplicate": false,
      "escalate": true,
      "fp_likelihood": "low"
    },
    {
      "alert": "Unusual network traffic to external IP",
      "priority": 2,
      "severity": "high",
      "is_duplicate": false,
      "escalate": false,
      "fp_likelihood": "medium"
    },
    {
      "alert": "Failed login attempt from 10.0.0.5",
      "priority": 3,
      "severity": "medium",
      "is_duplicate": false,
      "escalate": false,
      "fp_likelihood": "high"
    }
  ],
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

---

### 4. Deduplicate Alerts

**POST** `/api/slm/triage/deduplicate`

Find duplicate alerts in a batch.

**Request Body:**
```json
{
  "alerts": [
    "Failed login from 10.0.0.1",
    "Failed login from 10.0.0.1",
    "Failed login from 10.0.0.2"
  ]
}
```

**Response:**
```json
{
  "total_alerts": 3,
  "unique_alerts": 2,
  "duplicate_pattern": "Repeated failed login from same IP",
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

---

### 5. Enrich Indicator

**POST** `/api/slm/threat-intel/enrich`

Enrich an IOC with threat intelligence using the local SLM.

**Request Body:**
```json
{
  "indicator": "203.0.113.42",
  "context": {
    "industry": "finance",
    "geo": "US"
  }
}
```

**Response:**
```json
{
  "severity": "critical",
  "verdict": "malicious",
  "confidence": 0.95,
  "threat_actor": "APT-XYZ",
  "campaign": "Operation-ABC",
  "malware_families": "Mimikatz, Cobalt Strike",
  "mitre_techniques": ["T1078", "T1110", "T1021"],
  "related_iocs": "203.0.113.43, 203.0.113.44",
  "summary": "Known C2 server associated with APT-XYZ targeting financial sector",
  "recommended_actions": ["block", "investigate", "alert"],
  "iocs": {
    "ips": ["203.0.113.42"]
  },
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

---

### 6. Batch Enrich

**POST** `/api/slm/threat-intel/batch`

Enrich multiple IOCs in batch.

**Request Body:**
```json
{
  "iocs": [
    "203.0.113.42",
    "malware.exe",
    "evil.com"
  ],
  "context": {
    "industry": "healthcare"
  }
}
```

**Response:**
```json
{
  "total_iocs": 3,
  "results": [
    {
      "ioc": "203.0.113.42",
      "enrichment": {
        "threat_actor": "APT-XYZ",
        "campaign": "Operation-ABC",
        "malware_families": "Mimikatz"
      },
      "verdict": "malicious"
    },
    {
      "ioc": "malware.exe",
      "enrichment": {
        "threat_actor": "unknown",
        "campaign": "",
        "malware_families": "Trojan"
      },
      "verdict": "suspicious"
    },
    {
      "ioc": "evil.com",
      "enrichment": {
        "threat_actor": "unknown",
        "campaign": "",
        "malware_families": ""
      },
      "verdict": "suspicious"
    }
  ],
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

---

### 7. Health Check

**GET** `/api/slm/health`

Check the health status of SLM agents.

**Response:**
```json
{
  "status": "healthy",
  "agents": {
    "triage": "loaded",
    "threat_intel": "loaded"
  },
  "timestamp": "2026-01-23T05:56:20.123456Z"
}
```

**Status Values:**
- `not_loaded` - Agent not initialized yet
- `available` - Agent can be loaded
- `loaded` - Agent is loaded and ready
- `error` - Agent failed to load

---

## Usage Examples

### Python Example

```python
import requests

# Triage an alert
response = requests.post(
    "http://localhost:8000/api/slm/triage",
    json={
        "alert": "Suspicious PowerShell execution detected on server-01",
        "context": {
            "queue_size": 25
        }
    }
)

result = response.json()
print(f"Severity: {result['severity']}")
print(f"Priority: {result['priority']}")
print(f"Escalate: {result['escalate']}")
print(f"Actions: {result['recommended_actions']}")
```

### JavaScript Example

```javascript
// Enrich an IOC
const response = await fetch('http://localhost:8000/api/slm/threat-intel/enrich', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    indicator: '192.168.1.100',
    context: { industry: 'finance' }
  })
});

const result = await response.json();
console.log(`Threat Actor: ${result.threat_actor}`);
console.log(`MITRE Techniques: ${result.mitre_techniques.join(', ')}`);
```

### cURL Example

```bash
# Batch triage
curl -X POST http://localhost:8000/api/slm/triage/batch \
  -H "Content-Type: application/json" \
  -d '{
    "alerts": [
      "Failed login from 10.0.0.1",
      "Malware detected on host-42"
    ]
  }'
```

---

## Key Differences from OpenAI Endpoints

| Feature | SLM Endpoints | OpenAI Endpoints |
|---------|---------------|------------------|
| **Location** | Local (your server) | Cloud (OpenAI servers) |
| **Cost** | Free (after training) | Pay per token |
| **Privacy** | 100% private | Data sent to OpenAI |
| **Speed** | Fast (local inference) | Network latency |
| **Customization** | Fully customizable | Limited |
| **Offline** | Works offline | Requires internet |

---

## Performance

### Typical Response Times

- **Single triage**: 50-200ms
- **Batch triage (10 alerts)**: 300-800ms
- **Single enrichment**: 50-200ms
- **Batch enrichment (10 IOCs)**: 300-800ms

*Times vary based on hardware and model size*

---

## Integration with Memory API

The SLM agents can write their decisions to the Memory API:

```python
import requests

# 1. Triage with SLM
triage_response = requests.post(
    "http://localhost:8000/api/slm/triage",
    json={"alert": "Suspicious activity detected"}
).json()

# 2. Store decision in memory
requests.post(
    "http://localhost:8000/api/memory/beads",
    json={
        "bead_type": "triage_decision",
        "entity": "alert-12345",
        "value": {
            "verdict": triage_response["verdict"],
            "severity": triage_response["severity"],
            "priority": triage_response["priority"]
        },
        "confidence": triage_response["confidence"],
        "source_agent": "triage_slm"
    }
)
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid input
- **500 Internal Server Error**: Agent error
- **503 Service Unavailable**: Agent not loaded

**Error Response:**
```json
{
  "detail": "Triage failed: Model not loaded"
}
```

---

## Model Information

The SLM agents use the SOC-LLM engine:

- **Architecture**: Custom transformer optimized for security
- **Tokenizer**: BPE with security-specific tokens
- **Training**: Trained on cybersecurity corpus
- **Size**: Configurable (10M - 760M parameters)

See `agents/triage/LLM-Generator/README.md` for details.

---

## Next Steps

1. **Start the server**: `cd api && uvicorn server:app --reload`
2. **Test endpoints**: `http://localhost:8000/docs`
3. **Check health**: `http://localhost:8000/api/slm/health`
4. **Triage an alert**: Use the examples above

---

## Support

For issues or questions:
- Check agent logs in console
- Verify agents are in `agents/triage/LLM-Generator/`
- Ensure dependencies are installed
- See `agents/triage/LLM-Generator/README.md`

---

**Status**: ✅ Ready to Use

**Version**: 1.0.0

**Last Updated**: 2026-01-23
