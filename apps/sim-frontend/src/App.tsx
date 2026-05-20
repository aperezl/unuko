import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './ui/templates/DashboardLayout';
import { SessionListPage } from './ui/pages/SessionListPage';
import { SessionMonitorPage } from './ui/pages/SessionMonitorPage';
import { WorkflowEditorPage } from './ui/pages/WorkflowEditorPage';
import { DeviceManagerPage } from './ui/pages/DeviceManagerPage';
import { InventoryManagerPage } from './ui/pages/InventoryManagerPage';
import { ProvisioningFormPage } from './ui/pages/ProvisioningFormPage';
import { NetworkTopologyPage } from './ui/pages/NetworkTopologyPage';
import { SettingsPage } from './ui/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/sessions" replace />} />
          <Route path="/sessions" element={<SessionListPage />} />
          <Route path="/session/:id" element={<SessionMonitorPage />} />
          <Route path="/designer" element={<WorkflowEditorPage />} />
          
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
