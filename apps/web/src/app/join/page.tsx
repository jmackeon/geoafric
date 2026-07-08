'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { familiesApi } from '@/lib/api/families';
import { useAuthStore } from '@/lib/store/auth.store';

function JoinPageContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { user }     = useAuthStore();
  const code         = params.get('code')?.toUpperCase() ?? '';

  const [preview, setPreview]   = useState<any>(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [joining, setJoining]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    if (!code) { setError('No invite code provided.'); setLoading(false); return; }
    familiesApi.previewInvite(code)
      .then((res) => setPreview(res.data))
      .catch((e) => setError(e.response?.data?.message ?? 'Invalid or expired invite link.'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!user) {
      // Save code and redirect to register
      sessionStorage.setItem('pending_invite', code);
      router.push(`/auth/register?invite=${code}`);
      return;
    }
    setJoining(true);
    try {
      await familiesApi.join(code);
      setDone(true);
      toast.success('Welcome to the family! 🎉');
      setTimeout(() => router.push('/dashboard/family'), 2000);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to join family.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-geo-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gold-gradient mb-4 shadow-glow-gold">
            <span className="text-2xl font-display font-bold text-navy-800">G</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">GeoAfric</h1>
          <p className="text-navy-300 text-sm mt-1">Family Invite</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-navy-400" />
              <p className="text-sm text-gray-500">Checking invite code…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="font-display font-bold text-navy-800">Invite Invalid</h2>
              <p className="text-sm text-gray-500">{error}</p>
              <Link href="/dashboard/family" className="btn-outline mt-2">Go to dashboard</Link>
            </div>
          )}

          {!loading && !error && preview && !done && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-navy-800 mb-3">
                  <Users className="w-7 h-7 text-gold-400" />
                </div>
                <h2 className="text-lg font-display font-bold text-navy-800">You&apos;re invited!</h2>
                <p className="text-sm text-gray-500 mt-1">Join this family on GeoAfric:</p>
              </div>

              <div className="p-4 rounded-2xl bg-navy-50 text-center">
                <p className="text-2xl font-display font-bold text-navy-800">{preview.family_name}</p>
                <p className="text-sm text-gray-500 mt-1">{preview.member_count} member{preview.member_count !== 1 ? 's' : ''}</p>
              </div>

              <p className="text-xs text-center text-gray-400">
                Invite expires {new Date(preview.expires_at).toLocaleDateString()}
              </p>

              {!user && (
                <div className="p-3 rounded-2xl bg-gold-50 border border-gold-200 text-xs text-gold-700 text-center">
                  You&apos;ll need a GeoAfric account to join. We&apos;ll redirect you to sign up.
                </div>
              )}

              <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {joining ? 'Joining…' : user ? 'Join family' : 'Sign up & join'}
              </button>

              {user && (
                <Link href="/dashboard/family" className="block text-center text-sm text-gray-400 hover:text-gray-600">
                  Maybe later
                </Link>
              )}
            </div>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-teal-500" />
              </div>
              <h2 className="font-display font-bold text-navy-800">You&apos;re in!</h2>
              <p className="text-sm text-gray-500">Redirecting to your family dashboard…</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-geo-gradient flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
