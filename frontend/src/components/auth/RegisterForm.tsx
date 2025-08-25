import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input" />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input" />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
