import React, { useState } from 'react';

const mockNotifications = [
  { id: 1, type: 'info', message: 'System update completed.', priority: 'low', read: false },
  { id: 2, type: 'warning', message: 'Agent assignment pending.', priority: 'high', read: false },
  { id: 3, type: 'error', message: 'Payment processing failed.', priority: 'high', read: true },
  { id: 4, type: 'success', message: 'Dispute resolved.', priority: 'medium', read: false },
];

export function AdminNotificationSystem() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Notifications</h2>
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={markAllAsRead}>Mark All as Read</button>
      </div>
      <ul className="space-y-2">
        {notifications.map(n => (
          <li key={n.id} className={`p-3 rounded border flex justify-between items-center ${n.read ? 'bg-gray-100' : 'bg-white'}`}>
            <div>
              <span className={`font-bold mr-2 ${n.type === 'error' ? 'text-red-500' : n.type === 'warning' ? 'text-yellow-500' : n.type === 'success' ? 'text-green-500' : 'text-blue-500'}`}>{n.type.toUpperCase()}</span>
              <span>{n.message}</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${n.priority === 'high' ? 'bg-red-200 text-red-800' : n.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>{n.priority}</span>
            </div>
            {!n.read && (
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => markAsRead(n.id)}>Mark as Read</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
