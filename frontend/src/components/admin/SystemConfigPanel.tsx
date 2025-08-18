import React from 'react';

export function SystemConfigPanel() {
  // Placeholder: Replace with real system config panel
  return (
    <div className="p-2">
      <h2 className="font-bold mb-2">System Configuration</h2>
      <div>
        <label className="block mb-2">Enable Maintenance Mode</label>
        <input type="checkbox" className="mr-2" />
        <span>Maintenance Mode</span>
      </div>
      <div className="mt-4">
        <label className="block mb-2">Platform Version</label>
        <span className="px-2 py-1 bg-gray-200 rounded">v1.0.0</span>
      </div>
    </div>
  );
}
