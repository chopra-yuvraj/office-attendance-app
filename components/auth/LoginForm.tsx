'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/apiClient';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/api/auth/login', { username, password });
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role',  data.role);
        localStorage.setItem('name',  data.name);
      } catch {
        // E12: fallback to sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role',  data.role);
        sessionStorage.setItem('name',  data.name);
      }
      // Role-based redirect
      router.push(data.role === 'admin' ? '/admin/dashboard' : '/worker/home');
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-slate-800 text-center">Chopra Creations Login</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="your.username"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-2.5 px-6 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-xs text-center text-slate-400">
          Forgot password? Contact your administrator.
        </p>
      </form>
    </div>
  );
}
