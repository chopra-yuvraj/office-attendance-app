'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/apiClient';
import ThemeToggle from '@/components/shared/ThemeToggle';

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
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-lg dark:shadow-slate-900/50 p-8 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Chopra Creations</h1>
          <ThemeToggle />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="your.username"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-2.5 px-6 transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          Forgot password? Contact your administrator.
        </p>
      </form>
    </div>
  );
}
