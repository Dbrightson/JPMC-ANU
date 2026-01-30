# Agentic SOC Platform

Enterprise-grade AI-powered Security Operations Center with memory-augmented agents.

## 🎯 Project Structure

```
agentic-soc/
├── api/                    # Backend API services
│   ├── memory_api.py      # Memory architecture API
│   ├── server.py          # Main FastAPI server
│   ├── requirements.txt   # Python dependencies
│   └── test_memory_api.py # API tests
├── agents/                 # AI Agents
│   ├── triage/            # Alert triage agent
│   └── threat_intel/      # Threat intelligence agent
├── core/                   # Core utilities and shared code
│   ├── beads.py           # Memory system (Beads)
│   ├── model_wrapper.py   # LLM wrapper
│   └── rag_intel_agent.py # RAG agent
├── data/                   # Data directory
│   ├── training/          # Training datasets
│   └── outputs/           # Model outputs and results
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   └── architecture/      # Architecture documentation
├── web/                    # Web frontend (React)
│   ├── src/
│   └── public/
├── scripts/                # Utility scripts
│   ├── generate_data.py
│   └── train_slm.py
├── beads.db               # SQLite database
└── main.py                # Main entry point
```

## 🚀 Quick Start

### 1. Start the API Server

```bash
cd api
uvicorn server:app --reload
```

### 2. Access API Documentation

Open: http://localhost:8000/docs

### 3. Run Tests

```bash
cd api
python test_memory_api.py
```

## 📚 Documentation

- **API Documentation**: `docs/api/`
- **Architecture**: `docs/architecture/`
- **Quick Start**: `docs/api/QUICKSTART.md`
- **Memory API**: `docs/api/MEMORY_API.md`

## 🤖 Components

### API Services (`api/`)
RESTful API for memory operations, agent coordination, and frontend integration.

**Key Endpoints**:
- `/api/memory/` - Memory architecture endpoints
- `/api/soc/` - SOC operations
- `/api/firewall/` - Cognitive firewall
- `/api/threat-intel/` - Threat intelligence

### Agents (`agents/`)
- **Triage Agent** (`agents/triage/`): Alert classification and severity assignment
- **Threat Intel Agent** (`agents/threat_intel/`): IOC enrichment and threat analysis

### Core (`core/`)
Shared utilities including the Beads memory system and model wrappers.

### Web Frontend (`web/`)
React-based dashboard for visualization and interaction.

## 🔧 Development

### Install Dependencies

```bash
# API dependencies
cd api
pip install -r requirements.txt

# Web dependencies
cd ../web
npm install
```

### Run Development Servers

```bash
# Terminal 1: API Server
cd api
uvicorn server:app --reload

# Terminal 2: Web Frontend
cd web
npm run dev
```

## 📊 Memory Architecture

The system uses an external memory layer (Beads) to store agent decisions and context:

- **Beads**: Atomic facts stored in SQLite
- **Memory API**: RESTful endpoints for memory operations
- **Agent Integration**: Agents read/write shared context

See `docs/architecture/Memory-Architecture.md` for details.

## 🧪 Testing

```bash
# API tests
cd api
python test_memory_api.py

# Agent tests
cd agents/triage
pytest
```

## 📝 License

Part of the Agentic SOC project.

## 🙏 Acknowledgments

Based on memory architecture principles from IBM, CoALA, SGLang, and Trellix AI SOC.

---

**Status**: ✅ Production Ready

**Version**: 2.0.0

**Last Updated**: 2026-01-23
