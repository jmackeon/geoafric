'use client';

import { useState, useEffect } from 'react';
import {
  Users, Plus, Copy, Check, UserPlus, LogOut,
  Shield, Crown, MapPin, Loader2, QrCode,
  AlertCircle, Trash2, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

interface Family { id: string; name: string; description: string | null; invite_code: string; }
interface Member { id: string; user_id: string; role: string; joined_at: string; profiles: { full_name: string | null; avatar_url: string | null; }; }

export default function FamilyPage() {
  const { user } = useAuthStore();
  const [families, setFamilies]     = useState<Family[]>([]);
  const [members, setMembers]       = useState<Member[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeFamily, setActive]   = useState<Family | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [joinCode, setJoinCode]     = useState('');
  const [creating, setCreating]     = useState(false);
  const [joining, setJoining]       = useState(false);
  const [copied, setCopied]         = useState(false);

  useEffect(() => { loadFamilies(); }, []);

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/families');
      setFamilies(data ?? []);
      if (data?.length > 0) {
        setActive(data[0]);
        await loadMembers(data[0].id);
      }
    } catch { toast.error('Failed to load families'); }
    finally { setLoading(false); }
  };

  const loadMembers = async (familyId: string) => {
    try {
      const { data } = await apiClient.get(`/families/${familyId}`);
      setMembers(data?.members ?? []);
    } catch {}
  };

  const handleCreate = async () => {
    if (!familyName.trim()) { toast.error('Enter a family name'); return; }
    setCreating(true);
    try {
      const { data } = await apiClient.post('/families', { name: familyName.trim() });
      toast.success('Family created! 🎉');
      setFamilyName(''); setShowCreate(false);
      await loadFamilies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create family');
    } finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { toast.error('Enter invite code'); return; }
    setJoining(true);
    try {
      await apiClient.post('/families/join', { invite_code: joinCode.trim().toUpperCase() });
      toast.success('Joined family! 🎉');
      setJoinCode(''); setShowJoin(false);
      await loadFamilies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Invalid invite code');
    } finally { setJoining(false); }
  };

  const copyCode = () => {
    if (!activeFamily) return;
    navigator.clipboard.writeText(activeFamily.invite_code);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin' || role === 'owner') return <Crown style={{ width: '12px', height: '12px', color: '#F5A623' }} />;
    if (role === 'guardian') return <Shield style={{ width: '12px', height: '12px', color: '#00B67A' }} />;
    return <MapPin style={{ width: '12px', height: '12px', color: '#9CA3AF' }} />;
  };

  const getRoleBg = (role: string) => {
    if (role === 'admin' || role === 'owner') return { bg: 'rgba(245,166,35,0.12)', color: '#D97706' };
    if (role === 'guardian') return { bg: 'rgba(0,182,122,0.12)', color: '#065F46' };
    return { bg: '#F3F4F6', color: '#6B7280' };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
      <Loader2 style={{ width: '32px', height: '32px', color: '#00B67A', animation: 'fam-spin 1s linear infinite' }} />
      <style>{`@keyframes fam-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (families.length === 0 && !showCreate && !showJoin) return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white',
        borderRadius: '24px', boxShadow: '0 2px 16px rgba(13,27,61,0.08)', marginBottom: '16px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '28px',
          background: 'linear-gradient(135deg, #0D1B3D, #12295C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Users style={{ width: '36px', height: '36px', color: '#F5A623' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 8px' }}>
          No family yet
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6 }}>
          Create a family group to share locations, monitor health, and set safety zones together.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowJoin(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 20px',
              borderRadius: '14px', border: '2px solid #E5E7EB', background: 'white',
              fontSize: '14px', fontWeight: 700, color: '#0D1B3D', cursor: 'pointer', fontFamily: 'inherit' }}>
            <QrCode style={{ width: '16px', height: '16px' }} /> Join with code
          </button>
          <button onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 20px',
              borderRadius: '14px', border: 'none', background: '#F5A623',
              fontSize: '14px', fontWeight: 700, color: '#0D1B3D', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245,166,35,0.35)', fontFamily: 'inherit' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Create family
          </button>
        </div>
      </div>

      {/* Join form */}
      {showJoin && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 16px rgba(13,27,61,0.08)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 16px' }}>Join a family</h3>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="FMLY-XXXX"
            style={{ width: '100%', padding: '13px 16px', borderRadius: '14px', border: '1.5px solid #E5E7EB',
              fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', color: '#0D1B3D',
              fontFamily: 'inherit', marginBottom: '12px', boxSizing: 'border-box', outline: 'none',
              textTransform: 'uppercase' }}
            onFocus={e => { e.target.style.borderColor = '#00B67A'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowJoin(false)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB',
                background: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280' }}>
              Cancel
            </button>
            <button onClick={handleJoin} disabled={joining}
              style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                background: '#00B67A', color: 'white', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px' }}>
              {joining ? <Loader2 style={{ width: '16px', height: '16px', animation: 'fam-spin 1s linear infinite' }} /> : null}
              {joining ? 'Joining…' : 'Join Family'}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 16px rgba(13,27,61,0.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 16px' }}>Create a family</h3>
          <input value={familyName} onChange={e => setFamilyName(e.target.value)}
            placeholder="e.g. The Mensah Family"
            style={{ width: '100%', padding: '13px 16px', borderRadius: '14px', border: '1.5px solid #E5E7EB',
              fontSize: '14px', color: '#0D1B3D', fontFamily: 'inherit',
              marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = '#F5A623'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCreate(false)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB',
                background: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280' }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={creating}
              style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                background: '#F5A623', color: '#0D1B3D', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(245,166,35,0.35)' }}>
              {creating ? <Loader2 style={{ width: '16px', height: '16px', animation: 'fam-spin 1s linear infinite' }} /> : null}
              {creating ? 'Creating…' : 'Create Family'}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes fam-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Family dashboard ──────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Family header card */}
      {activeFamily && (
        <div style={{ background: 'linear-gradient(135deg, #0D1B3D 0%, #12295C 55%, #086B63 100%)',
          borderRadius: '24px', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px',
            borderRadius: '50%', background: 'rgba(245,166,35,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                  margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Active Family
                </p>
                <h2 style={{ fontSize: '24px', fontWeight: 950, margin: 0, fontFamily: 'Sora, sans-serif' }}>
                  {activeFamily.name}
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Users style={{ width: '14px', height: '14px', color: '#00E6D2' }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{members.length} member{members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Invite code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
              borderRadius: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 3px', fontWeight: 600 }}>Invite Code</p>
                <p style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '0.12em', color: '#F5A623',
                  fontFamily: 'Sora, sans-serif' }}>{activeFamily.invite_code}</p>
              </div>
              <button onClick={copyCode}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
                  borderRadius: '12px', border: 'none', background: copied ? '#00B67A' : '#F5A623',
                  color: '#0D1B3D', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.2s' }}>
                {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members list */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
        boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: 0 }}>
            Members
          </h3>
          <button onClick={() => { setShowJoin(true); setShowCreate(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '12px', border: 'none', background: '#F5A623',
              color: '#0D1B3D', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <UserPlus style={{ width: '14px', height: '14px' }} /> Invite
          </button>
        </div>

        {members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <Users style={{ width: '36px', height: '36px', color: '#D1D5DB', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 4px', fontWeight: 600 }}>Just you for now</p>
            <p style={{ fontSize: '12px', color: '#D1D5DB', margin: 0 }}>Share the invite code to add family members</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map(member => {
              const name = member.profiles?.full_name ?? 'Family member';
              const initial = name[0]?.toUpperCase() ?? 'F';
              const isMe = member.user_id === user?.id;
              const { bg, color } = getRoleBg(member.role);
              return (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px', borderRadius: '16px', background: isMe ? 'rgba(0,182,122,0.05)' : '#F9FAFB',
                  border: isMe ? '1px solid rgba(0,182,122,0.2)' : '1px solid transparent' }}>
                  {member.profiles?.avatar_url
                    ? <img src={member.profiles.avatar_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '14px', objectFit: 'cover' }} />
                    : <div style={{ width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                        background: isMe ? '#00B67A' : '#0D1B3D',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: 800, color: 'white' }}>{initial}</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3D', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                      {isMe && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                        borderRadius: '999px', background: 'rgba(0,182,122,0.15)', color: '#065F46',
                        flexShrink: 0 }}>You</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getRoleIcon(member.role)}
                      <span style={{ fontSize: '12px', fontWeight: 600, color, background: bg,
                        padding: '2px 8px', borderRadius: '999px', textTransform: 'capitalize' }}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, flexShrink: 0 }}>
                    Joined {new Date(member.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join modal */}
      {showJoin && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 16px' }}>
            Join another family
          </h3>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="FMLY-XXXX"
            style={{ width: '100%', padding: '13px 16px', borderRadius: '14px', border: '1.5px solid #E5E7EB',
              fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', color: '#0D1B3D',
              fontFamily: 'inherit', marginBottom: '12px', boxSizing: 'border-box', outline: 'none',
              textTransform: 'uppercase' }}
            onFocus={e => { e.target.style.borderColor = '#00B67A'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowJoin(false)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB',
                background: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280' }}>
              Cancel
            </button>
            <button onClick={handleJoin} disabled={joining}
              style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                background: '#00B67A', color: 'white', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px' }}>
              {joining ? <Loader2 style={{ width: '16px', height: '16px', animation: 'fam-spin 1s linear infinite' }} /> : null}
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes fam-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
