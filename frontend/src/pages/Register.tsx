import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        email,
        password
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Please check server connection.');
    }
  };

  return (
    <div className="auth-bg w-full">
      <div className="glass-panel p-8 w-full max-w-md animate-fade-in mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Create Account</h2>
        {error && <p className="text-error mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary mt-6 py-3 w-full">Sign Up</button>
        </form>
        <p className="text-sm text-center text-secondary mt-6">
          Already have an account? <Link to="/login" className="text-accent-primary hover:text-accent-hover font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
