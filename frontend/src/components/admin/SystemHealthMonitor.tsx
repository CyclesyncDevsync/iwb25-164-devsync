import React from 'react';

export function SystemHealthMonitor() {
  // Placeholder: Replace with real system health indicators
  return (
    <div className="p-2">
      <h2 className="font-bold mb-2">System Health</h2>
      <ul>
        <li>API: <span className="text-green-500">Healthy</span></li>
        <li>Database: <span className="text-green-500">Healthy</span></li>
        <li>Storage: <span className="text-green-500">Healthy</span></li>
        <li>Uptime: <span className="text-blue-500">99.8%</span></li>
      </ul>
    </div>
  );
}
