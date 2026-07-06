'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

type SessionState = 'checking' | 'ready' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [done, setDone]                   = useState(false);
  const [sessionState, setSessionState]   = useState<SessionState>('checking');

  // Supabase puts the session in the URL hash when coming from the email link
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession()
      .then(({ data }) => setSessionState(data.session ? 'ready' : 'invalid'))
      .catch(() => setSessionState('invalid'));
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionState === 'checking') {
    return (
      <div className="min-h-screen bg-geo-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold-gradient mx-auto mb-3 animate-pulse" />
          <p className="text-white text-sm">Validating reset link…</p>
        </div>
      </div>
    );
  }

  if (sessionState === 'invalid') {
    return (
      <div className="min-h-screen bg-geo-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gold-gradient mb-4 shadow-glow-gold">
              <span className="text-2xl font-display font-bold text-navy-800">G</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">New Password</h1>
            <p className="text-navy-200 text-sm">Choose a strong, unique password</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-display font-bold text-navy-800 mb-2">Link expired or invalid</h2>
              <p className="text-sm text-gray-500 mb-6">
                This password reset link is no longer valid. It may have already been used or expired.
                Request a new one to continue.
              </p>
              <Link href="/auth/forgot-password" className="btn-primary w-full justify-center mb-3">
                Request a new link
              </Link>
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-navy-700 transition-colors">
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-geo-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gold-gradient mb-4 shadow-glow-gold">
            <span className="text-2xl font-display font-bold text-navy-800">G</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">New Password</h1>
          <p className="text-navy-200 text-sm">Choose a strong, unique password</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
                <CheckCircle2 className="w-8 h-8 text-teal-500" />
              </div>
              <h2 className="text-lg font-display font-bold text-navy-800 mb-2">Password updated!</h2>
              <p className="text-sm text-gray-500">Redirecting you to login…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="input-label">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" className="input pl-10 pr-10" required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password" className="input pl-10" required
                  />
                </div>
              </div>
              {/* Password strength hint */}
              <div className="flex gap-1.5">
                {[8, 12, 16].map((len) => (
                  <div key={len} className={`flex-1 h-1 rounded-full transition-colors ${
                    password.length >= len ? 'bg-teal-400' : 'bg-gray-200'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {password.length < 8 ? 'Too short' : password.length < 12 ? 'Good' : password.length < 16 ? 'Strong' : 'Very strong'}
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Updating...' : 'Set new password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
