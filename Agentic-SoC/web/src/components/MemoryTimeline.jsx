/**
 * Memory Timeline Component
 * Displays the memory timeline for a specific entity (alert, IP, etc.)
 * Integrates with the Memory Architecture API
 */

import React, { useState, useEffect } from 'react';

const MEMORY_API_BASE = 'http://localhost:8000/api/memory';

// Memory API Client
class MemoryAPI {
  static async getTimeline(entity) {
    const response = await fetch(`${MEMORY_API_BASE}/timeline/${entity}`);
    if (!response.ok) throw new Error('Failed to fetch timeline');
    return response.json();
  }

  static async getBeads(entity, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${MEMORY_API_BASE}/beads/${entity}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch beads');
    return response.json();
  }

  static async createBead(beadData) {
    const response = await fetch(`${MEMORY_API_BASE}/beads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beadData)
    });
    if (!response.ok) throw new Error('Failed to create bead');
    return response.json();
  }

  static async getStats() {
    const response = await fetch(`${MEMORY_API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }

  static async searchBeads(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${MEMORY_API_BASE}/search?${params}`);
    if (!response.ok) throw new Error('Failed to search beads');
    return response.json();
  }
}

// Timeline Event Component
const TimelineEvent = ({ event }) => {
  const getAgentColor = (agent) => {
    const colors = {
      'triage_agent': '#3b82f6',
      'threat_intel_agent': '#ef4444',
      'incident_response_agent': '#f59e0b',
      'vuln_agent': '#8b5cf6'
    };
    return colors[agent] || '#6b7280';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'triage_decision': '⚖️',
      'intel_enrichment': '🔍',
      'incident_action': '🛡️',
      'vulnerability_scan': '🔒'
    };
    return icons[type] || '📝';
  };

  return (
    <div className="timeline-event" style={{
      borderLeft: `4px solid ${getAgentColor(event.agent)}`,
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{getTypeIcon(event.type)}</span>
          <span style={{ 
            color: getAgentColor(event.agent),
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {event.agent.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          {new Date(event.timestamp).toLocaleString()}
        </span>
      </div>
      
      <div style={{ marginLeft: '28px' }}>
        <div style={{ 
          color: '#d1d5db',
          fontSize: '13px',
          marginBottom: '8px'
        }}>
          Type: <span style={{ color: '#fbbf24' }}>{event.type}</span>
        </div>
        
        <div style={{
          backgroundColor: '#0a0a0a',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontFamily: 'monospace'
        }}>
          <pre style={{ margin: 0, color: '#e5e7eb' }}>
            {JSON.stringify(event.value, null, 2)}
          </pre>
        </div>
        
        <div style={{ 
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Confidence:</span>
          <div style={{
            width: '100px',
            height: '6px',
            backgroundColor: '#374151',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${event.confidence * 100}%`,
              height: '100%',
              backgroundColor: event.confidence > 0.8 ? '#10b981' : event.confidence > 0.6 ? '#fbbf24' : '#ef4444',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ color: '#d1d5db', fontSize: '12px', fontWeight: 'bold' }}>
            {(event.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Memory Timeline Component
const MemoryTimeline = ({ entityId }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    agent: 'all',
    type: 'all'
  });

  useEffect(() => {
    loadTimeline();
  }, [entityId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MemoryAPI.getTimeline(entityId);
      setTimeline(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
        <div className="spinner">Loading memory timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        backgroundColor: '#7f1d1d', 
        color: '#fecaca',
        borderRadius: '8px',
        margin: '16px'
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!timeline || timeline.total_events === 0) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center', 
        color: '#9ca3af',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        margin: '16px'
      }}>
        No memory found for entity: <strong>{entityId}</strong>
      </div>
    );
  }

  // Filter timeline
  const filteredTimeline = timeline.timeline.filter(event => {
    if (filter.agent !== 'all' && event.agent !== filter.agent) return false;
    if (filter.type !== 'all' && event.type !== filter.type) return false;
    return true;
  });

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#0a0a0a',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          color: '#f9fafb',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          Memory Timeline: {timeline.entity}
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          color: '#9ca3af',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <span>📊 {timeline.total_events} events</span>
          <span>🤖 {timeline.agents_involved.length} agents</span>
          <span>🏷️ {timeline.types_recorded.length} types</span>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          marginTop: '16px'
        }}>
          <select
            value={filter.agent}
            onChange={(e) => setFilter({ ...filter, agent: e.target.value })}
            style={{
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Agents</option>
            {timeline.agents_involved.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            style={{
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Types</option>
            {timeline.types_recorded.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button
            onClick={loadTimeline}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Timeline Events */}
      <div>
        {filteredTimeline.length === 0 ? (
          <div style={{ 
            padding: '24px', 
            textAlign: 'center', 
            color: '#9ca3af',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px'
          }}>
            No events match the current filters
          </div>
        ) : (
          filteredTimeline.map((event, index) => (
            <TimelineEvent key={index} event={event} />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>First Seen</div>
          <div style={{ color: '#f9fafb', fontSize: '14px', fontWeight: 'bold' }}>
            {new Date(timeline.first_seen).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>Last Updated</div>
          <div style={{ color: '#f9fafb', fontSize: '14px', fontWeight: 'bold' }}>
            {new Date(timeline.last_updated).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>Showing</div>
          <div style={{ color: '#f9fafb', fontSize: '14px', fontWeight: 'bold' }}>
            {filteredTimeline.length} / {timeline.total_events} events
          </div>
        </div>
      </div>
    </div>
  );
};

// Memory Stats Dashboard Component
const MemoryStatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await MemoryAPI.getStats();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  if (loading || !stats) {
    return <div style={{ padding: '24px', color: '#9ca3af' }}>Loading stats...</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #3b82f6'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Total Beads</div>
        <div style={{ color: '#f9fafb', fontSize: '32px', fontWeight: 'bold' }}>
          {stats.total_beads.toLocaleString()}
        </div>
      </div>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #10b981'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Unique Entities</div>
        <div style={{ color: '#f9fafb', fontSize: '32px', fontWeight: 'bold' }}>
          {stats.unique_entities.toLocaleString()}
        </div>
      </div>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #fbbf24'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Avg Confidence</div>
        <div style={{ color: '#f9fafb', fontSize: '32px', fontWeight: 'bold' }}>
          {(stats.avg_confidence * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

// Export components
export { MemoryTimeline, MemoryStatsDashboard, MemoryAPI };
export default MemoryTimeline;
