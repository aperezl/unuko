import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionSummary } from './types';
import { Layout } from './components/Layout';
import { SessionListPage } from './pages/SessionListPage';
import { SessionMonitorPage } from './pages/SessionMonitorPage';
import { WorkflowEditorPage } from './pages/WorkflowEditorPage';
import { DeviceManagerPage } from './pages/DeviceManagerPage';
import { InventoryManagerPage } from './pages/InventoryManagerPage';
import { ProvisioningFormPage } from './pages/ProvisioningFormPage';
import { NetworkTopologyPage } from './pages/NetworkTopologyPage';
import { SettingsPage } from './pages/SettingsPage';


export default function App() {
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);

  // Fetch session list centrally
  const fetchSessions = async () => {
    try {
      const response = await fetch('/v1/orchestrator/sessions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        setSessions(json);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setSessions([]);
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json && json.sessionId) {
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
              <SessionListPage 
                sessions={sessions} 
                onCreate={handleCreateSession} 
                onDelete={handleDeleteSession}
              />
            } 
          />
          <Route path="/session/:id" element={<SessionMonitorPage />} />
          <Route 
            path="/designer" 
            element={<WorkflowEditorPage onExecute={(def) => handleCreateSession('dynamic', def)} />} 
          />
          
          <Route path="/devices" element={<DeviceManagerPage />}>
            <Route path="ue" element={<div />} />
            <Route path="gnb" element={<div />} />
            <Route index element={<Navigate to="ue" replace />} />
          </Route>
          <Route path="/inventory" element={<InventoryManagerPage />} />
          <Route path="/inventory/new" element={<ProvisioningFormPage />} />
          <Route path="/inventory/edit/:imsi" element={<ProvisioningFormPage />} />
          <Route path="/network" element={<NetworkTopologyPage />} />
          <Route path="/analytics" element={<div className="p-10 text-muted-foreground font-mono">Analytics module coming soon...</div>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
