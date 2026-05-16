import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionSummary } from './types';
import { Layout } from './components/Layout';
import { SessionList } from './components/SessionList';
import { SessionMonitor } from './components/SessionMonitor';
import { WorkflowEditor } from './components/WorkflowEditor';
import { DeviceManager } from './components/DeviceManager';

export default function App() {
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);

  // Fetch session list centrally
  const fetchSessions = async () => {
    try {
      const response = await fetch('/v1/orchestrator/sessions');
      const json = await response.json();
      setSessions(json);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  React.useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/v1/orchestrator/session/${sessionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleCreateSession = async (workflow: string = 'provisioning', workflowDefinition?: any) => {
    try {
      const response = await fetch('/v1/orchestrator/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, workflowDefinition })
      });
      const json = await response.json();
      if (json.sessionId) {
        fetchSessions();
        return json.sessionId;
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/sessions" replace />} />
          <Route 
            path="/sessions" 
            element={
              <SessionList 
                sessions={sessions} 
                onCreate={handleCreateSession} 
                onDelete={handleDeleteSession}
              />
            } 
          />
          <Route path="/session/:id" element={<SessionMonitor />} />
          <Route 
            path="/designer" 
            element={<WorkflowEditor onExecute={(def) => handleCreateSession('dynamic', def)} />} 
          />
          
          {/* Placeholder routes for future expansion */}
          <Route path="/devices" element={<DeviceManager />}>
            <Route path="ue" element={<div />} />
            <Route path="gnb" element={<div />} />
            <Route index element={<Navigate to="ue" replace />} />
          </Route>
          <Route path="/inventory" element={<div className="p-10 text-slate-500 font-mono">Inventory module coming soon...</div>} />
          <Route path="/analytics" element={<div className="p-10 text-slate-500 font-mono">Analytics module coming soon...</div>} />
          <Route path="/settings" element={<div className="p-10 text-slate-500 font-mono">Settings module coming soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
