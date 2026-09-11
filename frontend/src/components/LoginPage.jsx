import React, { useState } from 'react';
import { Box, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, AlertCircle, Building2 } from 'lucide-react';
import { api } from '../api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login({ email, password });
      if (response && response.success) {
        onLoginSuccess(response);
      } else {
        setError(response?.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login({ email: demoUser.email, password: demoUser.password });
      if (response && response.success) {
        onLoginSuccess(response);
      } else {
        setError('Login failed for demo account');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-[#1c2826] font-sans antialiased flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background Decorator Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e0d3_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#1c372e] flex items-center justify-center shadow-md">
            <Box className="w-5 h-5 text-[#f4c453]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-[#1c2826]">
                inventory/room
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#eae7de]">
                MULTI-TENANT
              </span>
            </div>
            <p className="text-[11px] font-mono font-semibold tracking-wider text-[#61716c] uppercase">
              DPS CONTROL · ASSET MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono font-bold text-[#61716c]">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>ENTERPRISE TENANT ISOLATION ACTIVE</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-8">
        <div className="bg-white rounded-3xl p-8 border border-[#eae7de] card-shadow relative">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f4f2ea] text-[#1c372e] mb-3">
              <Lock className="w-6 h-6 text-[#b88c1c]" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-[#1c2826] tracking-tight">
              Sign in to your Workspace
            </h1>
            <p className="text-xs text-[#61716c] mt-1">
              Access your company's isolated asset shelf & team directory.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752]">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs font-semibold text-[#b88c1c] hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-lg hover:bg-[#142a23] transition-all transform active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{isLoading ? 'Authenticating...' : 'Access Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#f4c453]" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#788883] z-10 pt-4 border-t border-[#eae7de]/50">
        <p>© 2026 inventory/room Systems Inc. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-medium">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#1c2826]">Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#1c2826]">Terms of Service</a>
          <a href="#security" onClick={(e) => e.preventDefault()} className="hover:text-[#1c2826]">Security Audit</a>
        </div>
      </footer>
    </div>
  );
}
