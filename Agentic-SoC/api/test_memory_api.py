"""
Test script for Memory Architecture API
Run this after starting the FastAPI server to verify endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/memory"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_root():
    print_section("Testing Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_create_beads():
    print_section("Creating Test Beads")
    
    # Test bead 1: Triage decision
    bead1 = {
        "bead_type": "triage_decision",
        "entity": "alert-test-001",
        "value": {
            "verdict": "malicious",
            "severity": "high",
            "reason": "Suspicious login from unknown location"
        },
        "confidence": 0.92,
        "source_agent": "triage_agent"
    }
    
    response = requests.post(f"{BASE_URL}/beads", json=bead1)
    print(f"Bead 1 Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    # Test bead 2: Intel enrichment
    bead2 = {
        "bead_type": "intel_enrichment",
        "entity": "192.168.1.100",
        "value": {
            "threat_level": "critical",
            "known_malware": True,
            "campaigns": ["APT-XYZ", "Operation-ABC"]
        },
        "confidence": 0.98,
        "source_agent": "threat_intel_agent"
    }
    
    response = requests.post(f"{BASE_URL}/beads", json=bead2)
    print(f"\nBead 2 Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    # Test bead 3: Another decision for same alert
    bead3 = {
        "bead_type": "incident_action",
        "entity": "alert-test-001",
        "value": {
            "action": "quarantine_host",
            "status": "completed"
        },
        "confidence": 0.95,
        "source_agent": "incident_response_agent"
    }
    
    response = requests.post(f"{BASE_URL}/beads", json=bead3)
    print(f"\nBead 3 Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_get_beads():
    print_section("Retrieving Beads by Entity")
    
    response = requests.get(f"{BASE_URL}/beads/alert-test-001")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_latest_verdict():
    print_section("Getting Latest Verdict")
    
    response = requests.get(f"{BASE_URL}/beads/alert-test-001/latest")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_stats():
    print_section("Memory Statistics")
    
    response = requests.get(f"{BASE_URL}/stats")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_search():
    print_section("Searching Beads")
    
    # Search by agent
    response = requests.get(f"{BASE_URL}/search?source_agent=triage_agent&limit=10")
    print(f"Search by agent - Status: {response.status_code}")
    print(f"Found {len(response.json())} beads from triage_agent")
    
    # Search by confidence
    response = requests.get(f"{BASE_URL}/search?min_confidence=0.95&limit=10")
    print(f"\nSearch by confidence - Status: {response.status_code}")
    print(f"Found {len(response.json())} beads with confidence >= 0.95")

def test_entities():
    print_section("Listing Entities")
    
    response = requests.get(f"{BASE_URL}/entities?limit=10")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_timeline():
    print_section("Entity Timeline")
    
    response = requests.get(f"{BASE_URL}/timeline/alert-test-001")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def main():
    print("\n" + "="*60)
    print("  MEMORY ARCHITECTURE API TEST SUITE")
    print("="*60)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    try:
        # Run tests
        test_root()
        test_create_beads()
        test_get_beads()
        test_latest_verdict()
        test_stats()
        test_search()
        test_entities()
        test_timeline()
        
        print_section("All Tests Completed Successfully!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API server.")
        print("Make sure the FastAPI server is running on http://localhost:8000")
        print("\nTo start the server, run:")
        print("  cd Frontend/backend")
        print("  uvicorn server:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
