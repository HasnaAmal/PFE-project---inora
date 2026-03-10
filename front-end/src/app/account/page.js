'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.js';
import Link from 'next/link';

export default function AccountPage() {
  const { user, setUser } = useAuth();

  const [activeSection, setActiveSection] = useState('personal');
  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState({ type: '', text: '' });
  const [nameForm,      setNameForm]      = useState({ fullName: '' });
  const [nameMsg,       setNameMsg]       = useState({ type: '', text: '' });
  const [nameLoading,   setNameLoading]   = useState(false);
  const [emailForm,     setEmailForm]     = useState({ email: '', currentPassword: '' });
  const [emailMsg,      setEmailMsg]      = useState({ type: '', text: '' });
  const [emailLoading,  setEmailLoading]  = useState(false);
  const [passForm,      setPassForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg,       setPassMsg]       = useState({ type: '', text: '' });
  const [passLoading,   setPassLoading]   = useState(false);
  const [deleteForm,    setDeleteForm]    = useState({ password: '' });
  const [deleteMsg,     setDeleteMsg]     = useState({ type: '', text: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Bookings state ──
  const [bookings,        setBookings]        = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError,   setBookingsError]   = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed to load profile'); return res.json(); })
      .then(data => {
        setProfile(data);
        setNameForm({ fullName: data.fullName || '' });
        setEmailForm(f => ({ ...f, email: data.email || '' }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch bookings when section becomes active
  useEffect(() => {
    if (activeSection !== 'bookings') return;
    setBookingsLoading(true);
    setBookingsError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed to load bookings'); return res.json(); })
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => setBookingsError(err.message))
      .finally(() => setBookingsLoading(false));
  }, [activeSection]);

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/avatar`, { method: 'PATCH', credentials: 'include', body: formData });
      const data = await res.json();
      if (!res.ok) { setAvatarMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setUser(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setAvatarMsg({ type: 'success', text: 'Photo updated!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 4000);
    } finally { setAvatarLoading(false); }
  };

  const handleName = async (e) => {
    e.preventDefault(); setNameLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/name`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(nameForm) });
      const data = await res.json();
      if (!res.ok) { setNameMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, fullName: data.fullName }));
      setUser(prev => ({ ...prev, fullName: data.fullName }));
      setNameMsg({ type: 'success', text: 'Name updated successfully' });
      setTimeout(() => setNameMsg({ type: '', text: '' }), 4000);
    } finally { setNameLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setEmailLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/email`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(emailForm) });
      const data = await res.json();
      if (!res.ok) { setEmailMsg({ type: 'error', text: data.message }); return; }
      setProfile(prev => ({ ...prev, email: data.email }));
      setUser(prev => ({ ...prev, email: data.email }));
      setEmailMsg({ type: 'success', text: 'Email updated successfully' });
      setEmailForm(f => ({ ...f, currentPassword: '' }));
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 4000);
    } finally { setEmailLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { setPassMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setPassLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/password`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(passForm) });
      const data = await res.json();
      if (!res.ok) { setPassMsg({ type: 'error', text: data.message }); return; }
      setPassMsg({ type: 'success', text: 'Password updated successfully' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMsg({ type: '', text: '' }), 4000);
    } finally { setPassLoading(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(deleteForm) });
      const data = await res.json();
      if (!res.ok) { setDeleteMsg({ type: 'error', text: data.message }); return; }
      window.location.href = '/';
    } finally { setDeleteLoading(false); }
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Member';
  const avatarUrl   = profile?.avatarUrl ?? user?.avatarUrl ?? null;

  // ── Style tokens ──
  const IC  = "w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-[#C87D87]/30 focus:border-[#C87D87] focus:ring-2 focus:ring-[#C87D87]/15 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/55 transition-all duration-300 rounded-xl";
  const LC  = "font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#5a4a3a] block mb-2 font-semibold";
  const BTN = "font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-[#FBEAD6] bg-[#6B7556] px-10 py-3.5 rounded-xl hover:bg-[#4a5240] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 inline-block cursor-pointer font-semibold shadow-[0_6px_20px_rgba(107,117,86,0.30)] hover:shadow-[0_10px_28px_rgba(107,117,86,0.38)] hover:-translate-y-0.5";

  const sideNav = [
    { id: 'personal',  icon: '✦', label: 'Personal Details',    sub: 'Name & email address'      },
    { id: 'bookings',  icon: '◈', label: 'My Bookings',         sub: 'Reservations & status'     },
    { id: 'security',  icon: '⚿', label: 'Password & Security', sub: 'Change your password'      },
    { id: 'danger',    icon: '✕', label: 'Delete Account',      sub: 'Permanently remove account'},
  ];

  // ── Booking status config ──
  const statusConfig = {
    pending:   { label: 'Pending',   bg: 'bg-amber-50',   border: 'border-amber-300/60',  text: 'text-amber-600',  dot: 'bg-amber-400',  icon: '⏳' },
    confirmed: { label: 'Confirmed', bg: 'bg-green-50',   border: 'border-green-300/60',  text: 'text-green-600',  dot: 'bg-green-400',  icon: '✓'  },
    done:      { label: 'Completed', bg: 'bg-[#6B7556]/8', border: 'border-[#6B7556]/30', text: 'text-[#6B7556]',  dot: 'bg-[#6B7556]',  icon: '★'  },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50',     border: 'border-red-300/60',    text: 'text-red-500',    dot: 'bg-red-400',    icon: '✕'  },
    rejected:  { label: 'Rejected',  bg: 'bg-red-50',     border: 'border-red-300/60',    text: 'text-red-500',    dot: 'bg-red-400',    icon: '✕'  },
  };

  const getStatus = (status) =>
    statusConfig[status?.toLowerCase()] ?? { label: status ?? 'Unknown', bg: 'bg-gray-50', border: 'border-gray-300/60', text: 'text-gray-500', dot: 'bg-gray-400', icon: '?' };

  // ── Shared card ──
  const FormCard = ({ children, danger = false }) => (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-300
      hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(58,48,39,0.14)]
      ${danger
        ? 'bg-[#FBEAD6]/95 border border-red-300/60 shadow-[0_4px_16px_rgba(58,48,39,0.08)]'
        : 'bg-[#FBEAD6]/95 border border-[#C87D87]/20 shadow-[0_4px_16px_rgba(58,48,39,0.08)]'
      }`}>
      <div className={`absolute inset-0 rounded-2xl border pointer-events-none ${danger ? 'border-red-200/40' : 'border-[#C87D87]/10'}`}/>
      <div className={`absolute inset-[5px] rounded-xl border pointer-events-none ${danger ? 'border-red-200/20' : 'border-[#C87D87]/6'}`}/>
      <div className={`absolute top-0 left-0 w-full h-[2px] ${danger ? 'bg-gradient-to-r from-transparent via-red-400 to-transparent' : 'bg-gradient-to-r from-transparent via-[#C87D87] to-transparent'}`}/>
      {children}
    </div>
  );

  const SectionHeader = ({ eyebrow, title, danger = false }) => (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-6 h-px ${danger ? 'bg-red-400' : 'bg-[#C87D87]'}`}/>
        <p className={`font-['Cormorant_Garamond',serif] italic text-sm tracking-[0.35em] uppercase ${danger ? 'text-red-300' : 'text-[#C87D87]/80'}`}>
          {eyebrow}
        </p>
      </div>
      <h2 className="font-['Playfair_Display',serif] italic text-[clamp(1.8rem,3vw,2.8rem)] text-[#FBEAD6] leading-tight">
        {title}
      </h2>
      <div className={`w-12 h-[1.5px] mt-3 ${danger ? 'bg-red-400' : 'bg-[#C87D87]'}`}/>
    </div>
  );

  const Msg = ({ msg }) => msg.text ? (
    <p className={`font-['Cormorant_Garamond',serif] italic text-base mb-5 flex items-center gap-2 ${
      msg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'
    }`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${
        msg.type === 'success' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'
      }`}>{msg.type === 'success' ? '✓' : '✕'}</span>
      {msg.text}
    </p>
  ) : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#6B7556 0%,#5a6347 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#C87D87]/40 border-t-[#C87D87] animate-spin"/>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/70 text-base tracking-[0.3em]">
          Loading your profile…
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#6B7556 0%,#5a6347 100%)' }}>
      <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6] text-lg">{error}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer   { from{background-position:-200% center} to{background-position:200% center} }
        @keyframes lacePulse { 0%,100%{opacity:.45} 50%{opacity:.9} }
        @keyframes rotateSlow{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes auraPulse { 0%,100%{opacity:.55;filter:blur(8px)} 50%{opacity:.85;filter:blur(14px)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.7) inset;
          -webkit-text-fill-color: #3a3027;
        }
      `}</style>

      {/* ══ BACK HOME ══ */}
      <div className="fixed top-7 left-8 z-50">
        <Link href="/" aria-label="Back to home"
          className="group flex items-center gap-2.5 bg-[#FBEAD6]/12 backdrop-blur-sm border border-[#FBEAD6]/20 rounded-xl px-3 py-2 hover:bg-[#FBEAD6]/20 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-[#FBEAD6]/70 group-hover:text-[#C87D87] group-hover:-translate-x-0.5 transition-all duration-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          <span className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/60 text-sm group-hover:text-[#FBEAD6]/90 transition-colors duration-300">
            Home
          </span>
        </Link>
      </div>

      {/* ══ PAGE ══ */}
      <div className="min-h-screen pt-20 pb-24 relative overflow-x-hidden"
        style={{ background:'linear-gradient(135deg,#6B7556 0%,#5a6347 100%)' }}>

        {/* ambient orbs */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(200,125,135,0.10) 0%,transparent 65%)', animation:'auraPulse 8s ease-in-out infinite', filter:'blur(20px)' }}/>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background:'radial-gradient(circle,rgba(251,234,214,0.06) 0%,transparent 65%)', animation:'auraPulse 11s ease-in-out infinite 2s', filter:'blur(24px)' }}/>
          <div className="absolute top-16 right-16 w-20 h-20 rounded-full bg-[#C87D87]/6 blur-2xl animate-[float_7s_ease-in-out_infinite]"/>
          <div className="absolute bottom-16 left-16 w-28 h-28 rounded-full bg-[#FBEAD6]/4 blur-3xl animate-[float_9s_ease-in-out_infinite_2s]"/>
        </div>

        {/* lace frame */}
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-3  border border-[#FBEAD6]/15"/>
          <div className="absolute inset-5  border border-[#FBEAD6]/7"/>
          {[
            {pos:'top-3 left-3',    b:'border-t border-l', ci:'top-1 left-1'  },
            {pos:'top-3 right-3',   b:'border-t border-r', ci:'top-1 right-1' },
            {pos:'bottom-3 left-3', b:'border-b border-l', ci:'bottom-1 left-1'},
            {pos:'bottom-3 right-3',b:'border-b border-r', ci:'bottom-1 right-1'},
          ].map(({pos,b,ci},i)=>(
            <div key={i} className={`absolute ${pos} w-14 h-14`}>
              <div className={`absolute inset-0 ${b} border-[#FBEAD6]/22`}/>
              <div className={`absolute w-3 h-3 ${ci} ${b} border-[#C87D87]/45`}/>
            </div>
          ))}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 animate-[lacePulse_4s_ease-in-out_infinite]">
            <div className="w-20 h-px bg-[#FBEAD6]/15"/>
            <span className="text-[#FBEAD6]/25 text-[0.55rem]">✦</span>
            <div className="w-20 h-px bg-[#FBEAD6]/15"/>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 animate-[lacePulse_4s_ease-in-out_infinite_.9s]">
            <div className="w-20 h-px bg-[#FBEAD6]/15"/>
            <span className="text-[#FBEAD6]/25 text-[0.55rem]">✦</span>
            <div className="w-20 h-px bg-[#FBEAD6]/15"/>
          </div>
        </div>

        {/* ══ LAYOUT ══ */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-20">
          <div className="flex gap-8 items-start">

            {/* ════ SIDEBAR ════ */}
            <aside className="w-80 flex-shrink-0 sticky top-8 space-y-4"
              style={{ animation:'fadeUp .5s cubic-bezier(.4,0,.2,1) .1s both' }}>

              {/* Profile card */}
              <div className="relative rounded-2xl overflow-hidden bg-[#FBEAD6]/95 border border-[#C87D87]/22
                shadow-[0_8px_32px_rgba(58,48,39,0.15)]">
                <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/10 pointer-events-none"/>
                <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/6 pointer-events-none"/>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent"/>

                <div className="px-8 pt-10 pb-7 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,125,135,0.07)_0%,transparent_70%)] pointer-events-none rounded-2xl"/>
                  <div className="relative inline-block mb-4">
                    <label htmlFor="avatar-upload" className="cursor-pointer group/av block">
                      {avatarUrl ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="avatar"
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#C87D87]/25 shadow-xl mx-auto transition-all duration-300 group-hover/av:opacity-70"/>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C87D87] to-[#6B7556] flex items-center justify-center text-[#FBEAD6] font-['Playfair_Display',serif] font-bold text-4xl mx-auto ring-4 ring-[#C87D87]/20 shadow-xl transition-all duration-300 group-hover/av:opacity-70">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity duration-300">
                        <div className="w-24 h-24 rounded-full bg-[#3a3027]/50 backdrop-blur-sm flex items-center justify-center">
                          {avatarLoading ? (
                            <span className="text-white text-xs tracking-widest animate-pulse">···</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </label>
                    <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden" onChange={handleAvatar} disabled={avatarLoading}/>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6B7556] border-2 border-[#FBEAD6] flex items-center justify-center shadow-md pointer-events-none">
                      <span className="text-[#FBEAD6] text-[0.42rem]">✦</span>
                    </div>
                  </div>

                  {avatarMsg.text ? (
                    <p className={`font-['Cormorant_Garamond',serif] italic text-sm mb-2 flex items-center justify-center gap-1.5 ${avatarMsg.type === 'success' ? 'text-[#6B7556]' : 'text-[#C87D87]'}`}>
                      <span className={`w-4 h-4 rounded-full text-white text-[0.5rem] flex items-center justify-center ${avatarMsg.type === 'success' ? 'bg-[#6B7556]' : 'bg-[#C87D87]'}`}>
                        {avatarMsg.type === 'success' ? '✓' : '✕'}
                      </span>
                      {avatarMsg.text}
                    </p>
                  ) : (
                    <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a] mb-2">
                      Click photo to change
                    </p>
                  )}

                  <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.32em] uppercase mt-3 mb-1">
                    Welcome back
                  </p>
                  <h2 className="font-['Playfair_Display',serif] italic text-[1.55rem] text-[#3a3027] leading-tight">
                    {displayName}<span className="text-[#C87D87]">.</span>
                  </h2>
                  <div className="flex items-center justify-center gap-2 my-3">
                    <div className="w-10 h-px bg-[#C87D87]/35"/>
                    <span className="text-[#C87D87]/50 text-[0.48rem]">✦</span>
                    <div className="w-10 h-px bg-[#C87D87]/35"/>
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] break-all leading-relaxed">
                    {profile?.email}
                  </p>
                </div>

                <div className="divide-y divide-[#C87D87]/12 border-t border-[#C87D87]/18">
                  {[
                    {
                      label: 'Role',
                      value: (
                        <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg border font-semibold ${
                          profile?.role === 'admin'
                            ? 'text-[#6B7556] border-[#6B7556]/45 bg-[#6B7556]/10'
                            : 'text-[#C87D87] border-[#C87D87]/45 bg-[#C87D87]/8'
                        }`}>{profile?.role ?? 'member'}</span>
                      )
                    },
                    {
                      label: 'Since',
                      value: (
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027]">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})
                            : '—'}
                        </p>
                      )
                    },
                    {
                      label: 'ID',
                      value: (
                        <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a] tracking-widest">
                          #{String(profile?.id ?? 0).padStart(5,'0')}
                        </p>
                      )
                    },
                  ].map(({label,value}) => (
                    <div key={label} className="flex items-center justify-between px-6 py-3.5">
                      <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#7a6a5a] font-semibold">{label}</p>
                      {value}
                    </div>
                  ))}
                </div>

                <div className="text-center py-3 border-t border-[#C87D87]/12">
                  <span className="text-[#C87D87]/40 text-xs tracking-[0.5em]">✦ ✦ ✦</span>
                </div>
              </div>

              {/* Nav card */}
              <div className="relative rounded-2xl overflow-hidden bg-[#FBEAD6]/95 border border-[#C87D87]/22
                shadow-[0_4px_16px_rgba(58,48,39,0.10)]">
                <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/10 pointer-events-none"/>
                <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/6 pointer-events-none"/>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C87D87] to-transparent"/>
                <div className="px-6 py-4 border-b border-[#C87D87]/15">
                  <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.3em] uppercase text-[#7a6a5a] font-semibold">
                    Settings
                  </p>
                </div>
                <div className="divide-y divide-[#C87D87]/8 p-2">
                  {sideNav.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl transition-all duration-300 relative group mb-0.5 ${
                        activeSection === item.id
                          ? item.id === 'danger'
                            ? 'bg-red-50 shadow-sm'
                            : 'bg-[#6B7556]/10 shadow-sm'
                          : 'hover:bg-[#C87D87]/6'
                      }`}>
                      {activeSection === item.id && (
                        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${
                          item.id === 'danger' ? 'bg-red-400' : 'bg-[#6B7556]'
                        }`}/>
                      )}
                      <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border text-sm transition-all duration-300 ${
                        activeSection === item.id
                          ? item.id === 'danger'
                            ? 'border-red-300 bg-red-50 text-red-400'
                            : 'border-[#6B7556]/55 bg-[#6B7556]/10 text-[#6B7556]'
                          : item.id === 'danger'
                            ? 'border-red-200/60 text-red-300/70 group-hover:border-red-300 group-hover:text-red-400'
                            : 'border-[#C87D87]/25 text-[#C87D87]/55 group-hover:border-[#6B7556]/45 group-hover:text-[#6B7556]'
                      }`}>{item.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-['Cormorant_Garamond',serif] text-sm tracking-[0.15em] uppercase font-semibold transition-colors duration-300 ${
                          activeSection === item.id
                            ? item.id === 'danger' ? 'text-red-500' : 'text-[#3a3027]'
                            : 'text-[#5a4a3a] group-hover:text-[#3a3027]'
                        }`}>{item.label}</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a] mt-0.5 truncate">
                          {item.sub}
                        </p>
                      </div>
                      {activeSection === item.id && (
                        <span className={`ml-auto text-base flex-shrink-0 ${item.id === 'danger' ? 'text-red-300' : 'text-[#6B7556]/65'}`}>›</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ════ CONTENT ════ */}
            <div className="flex-1 min-w-0" style={{ animation:'fadeUp .6s cubic-bezier(.4,0,.2,1) .2s both' }}>

              {/* ── PERSONAL ── */}
              {activeSection === 'personal' && (
                <div className="pt-4 space-y-5" style={{ animation:'fadeIn .3s ease forwards' }}>
                  <SectionHeader eyebrow="Account Settings" title="Personal Details"/>
                  <FormCard>
                    <form onSubmit={handleName} className="p-8">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-5 h-px bg-[#C87D87]/60"/>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase">Update</p>
                      </div>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Full Name</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7"/>
                      <label className={LC}>Name</label>
                      <input type="text" value={nameForm.fullName}
                        onChange={e => setNameForm({ fullName: e.target.value })}
                        placeholder="Your full name" className={`${IC} mb-6`}/>
                      <Msg msg={nameMsg}/>
                      <button type="submit" disabled={nameLoading} className={BTN}>
                        {nameLoading ? 'Saving…' : 'Save Name'}
                      </button>
                    </form>
                  </FormCard>
                  <FormCard>
                    <form onSubmit={handleEmail} className="p-8">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-5 h-px bg-[#C87D87]/60"/>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase">Update</p>
                      </div>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Email Address</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7"/>
                      <label className={LC}>New Email</label>
                      <input type="email" value={emailForm.email}
                        onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com" className={`${IC} mb-5`}/>
                      <label className={LC}>Current Password</label>
                      <input type="password" value={emailForm.currentPassword}
                        onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                        placeholder="Confirm with your password" className={`${IC} mb-6`}/>
                      <Msg msg={emailMsg}/>
                      <button type="submit" disabled={emailLoading} className={BTN}>
                        {emailLoading ? 'Saving…' : 'Save Email'}
                      </button>
                    </form>
                  </FormCard>
                </div>
              )}

              {/* ── BOOKINGS ── */}
              {activeSection === 'bookings' && (
                <div className="pt-4 space-y-5" style={{ animation:'fadeIn .3s ease forwards' }}>
                  <SectionHeader eyebrow="Your Reservations" title="My Bookings"/>

                  {bookingsLoading && (
                    <div className="flex flex-col items-center gap-4 py-20">
                      <div className="w-10 h-10 rounded-full border-2 border-[#C87D87]/40 border-t-[#C87D87] animate-spin"/>
                      <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/60 text-sm tracking-widest">
                        Loading your bookings…
                      </p>
                    </div>
                  )}

                  {bookingsError && (
                    <FormCard>
                      <div className="p-8 text-center">
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-base">{bookingsError}</p>
                      </div>
                    </FormCard>
                  )}

                  {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                    <FormCard>
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#C87D87]/10 border border-[#C87D87]/20 flex items-center justify-center mx-auto mb-5">
                          <span className="text-[#C87D87]/50 text-2xl">◈</span>
                        </div>
                        <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-2">No bookings yet</h3>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a] text-base mb-6">
                          You haven't made any reservations yet. Plan your first gathering!
                        </p>
                        <Link href="/gatherings"
                          className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-[#FBEAD6] bg-[#C87D87] px-8 py-3 rounded-xl hover:bg-[#6B7556] transition-all duration-300 inline-block shadow-[0_6px_20px_rgba(200,125,135,0.30)]">
                          Plan a Gathering
                        </Link>
                      </div>
                    </FormCard>
                  )}

                  {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                    <>
                      {/* Summary pills */}
                      <div className="flex flex-wrap gap-3 mb-2">
                        {Object.entries(
                          bookings.reduce((acc, b) => {
                            const key = b.status?.toLowerCase() ?? 'unknown';
                            acc[key] = (acc[key] ?? 0) + 1;
                            return acc;
                          }, {})
                        ).map(([status, count]) => {
                          const s = getStatus(status);
                          return (
                            <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${s.bg} ${s.border}`}>
                              <span className={`w-2 h-2 rounded-full ${s.dot}`}/>
                              <span className={`font-['Cormorant_Garamond',serif] text-sm font-semibold ${s.text}`}>
                                {count} {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Booking cards */}
                      <div className="space-y-4">
                        {bookings.map((booking, i) => {
                          const s = getStatus(booking.status);
                          return (
                            <div key={booking.id}
                              className={`relative rounded-2xl overflow-hidden border ${s.bg} ${s.border} shadow-[0_4px_16px_rgba(58,48,39,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(58,48,39,0.14)]`}
                              style={{ animation:`fadeIn .3s ease ${i * 0.06}s both` }}>
                              {/* top shimmer */}
                              <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${s.dot.replace('bg-','via-')} to-transparent`}/>

                              <div className="p-6">
                                {/* Header row */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border ${s.border} ${s.bg} flex items-center justify-center flex-shrink-0`}>
                                      <span className={`text-base ${s.text}`}>{s.icon}</span>
                                    </div>
                                    <div>
                                      <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027] leading-tight">
                                        {booking.activity || booking.activityType || 'Activity'}
                                      </h3>
                                      <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a] tracking-widest mt-0.5">
                                        #{String(booking.id).padStart(5, '0')}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Status badge */}
                                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-[0.15em] uppercase font-['Cormorant_Garamond',serif] flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                                    {s.label}
                                  </span>
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[
                                    { icon: '📅', label: 'Date',      value: booking.date ? new Date(booking.date).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'}) : '—' },
                                    { icon: '🕐', label: 'Time',      value: booking.timeSlot || '—' },
                                    { icon: '👥', label: 'Guests',    value: `${booking.participants || 1} person${(booking.participants || 1) > 1 ? 's' : ''}` },
                                    { icon: '📞', label: 'Contact',   value: booking.preferredContact || '—' },
                                  ].map(({ icon, label, value }) => (
                                    <div key={label} className="bg-white/50 rounded-xl px-4 py-3 border border-[#C87D87]/10">
                                      <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#7a6a5a] mb-1">{icon} {label}</p>
                                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] font-semibold">{value}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Optional notes */}
                                {(booking.specialRequests || booking.allergies) && (
                                  <div className="mt-3 px-4 py-3 bg-white/40 rounded-xl border border-[#C87D87]/10">
                                    {booking.specialRequests && (
                                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]">
                                        <span className="not-italic font-semibold text-xs tracking-widest uppercase text-[#7a6a5a]">Requests: </span>
                                        {booking.specialRequests}
                                      </p>
                                    )}
                                    {booking.allergies && (
                                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] mt-1">
                                        <span className="not-italic font-semibold text-xs tracking-widest uppercase text-[#7a6a5a]">Allergies: </span>
                                        {booking.allergies}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Footer: date booked */}
                                <div className="mt-4 pt-3 border-t border-[#C87D87]/12 flex items-center justify-between">
                                  <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]">
                                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})}
                                  </p>
                                  {booking.status?.toLowerCase() === 'pending' && (
                                    <p className="font-['Cormorant_Garamond',serif] italic text-xs text-amber-500 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
                                      Awaiting confirmation
                                    </p>
                                  )}
                                 {/* ── Payment footer ── */}
{booking.status?.toLowerCase() === 'confirmed' && (
  booking.paymentStatus === 'PAID' ? (
    // ✅ Already paid badge
    <div className="inline-flex items-center gap-2 font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.2em] uppercase text-[#6B7556] bg-[#6B7556]/10 border border-[#6B7556]/30 px-4 py-2 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Avance réglée · {booking.advancePaid} MAD
    </div>
  ) : (
    // 💳 Pay now button
    <Link
      href={`/checkout?bookingId=${booking.id}`}
      className="inline-flex items-center gap-2 font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.2em] uppercase text-white bg-[#6B7556] px-4 py-2 rounded-lg hover:bg-[#4a5240] transition-all duration-300 shadow-[0_4px_12px_rgba(107,117,86,0.30)]">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
      </svg>
      Procéder au paiement
    </Link>
  )
)}


                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === 'security' && (
                <div className="pt-4" style={{ animation:'fadeIn .3s ease forwards' }}>
                  <SectionHeader eyebrow="Account Settings" title="Password & Security"/>
                  <FormCard>
                    <form onSubmit={handlePassword} className="p-8">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-5 h-px bg-[#C87D87]/60"/>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.3em] uppercase">Update</p>
                      </div>
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-[#3a3027] mb-1">Change Password</h3>
                      <div className="w-8 h-[1.5px] bg-[#C87D87] mb-7"/>
                      <div className="space-y-5 mb-6">
                        {[
                          { lbl:'Current Password', key:'currentPassword', ph:'Your current password' },
                          { lbl:'New Password',      key:'newPassword',     ph:'At least 6 characters' },
                          { lbl:'Confirm Password',  key:'confirmPassword', ph:'Repeat new password'   },
                        ].map(({lbl,key,ph}) => (
                          <div key={key}>
                            <label className={LC}>{lbl}</label>
                            <input type="password" value={passForm[key]}
                              onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                              placeholder={ph} className={IC}/>
                          </div>
                        ))}
                      </div>
                      <Msg msg={passMsg}/>
                      <button type="submit" disabled={passLoading} className={BTN}>
                        {passLoading ? 'Updating…' : 'Update Password'}
                      </button>
                    </form>
                  </FormCard>
                </div>
              )}

              {/* ── DANGER ── */}
              {activeSection === 'danger' && (
                <div className="pt-4 space-y-5" style={{ animation:'fadeIn .3s ease forwards' }}>
                  <SectionHeader eyebrow="Danger Zone" title="Delete Account" danger/>
                  <FormCard danger>
                    <div className="p-7">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl border border-red-300/50 bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-400 text-base">⚠</span>
                        </div>
                        <div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-xs tracking-[0.2em] uppercase mb-2">
                            Please read carefully
                          </p>
                          <p className="font-['Cormorant_Garamond',serif] text-base text-[#5a4a3a] leading-relaxed">
                            Deleting your account is{' '}
                            <span className="text-red-500 font-bold">permanent and irreversible</span>.
                            {' '}All your data will be permanently removed and cannot be recovered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </FormCard>
                  <FormCard danger>
                    <form onSubmit={handleDelete} className="p-8">
                      <h3 className="font-['Playfair_Display',serif] italic text-2xl text-red-500 mb-1">Confirm Deletion</h3>
                      <div className="w-8 h-[1.5px] bg-red-400 mb-7"/>
                      <label className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.18em] uppercase text-[#5a4a3a] block mb-2 font-semibold">
                        Enter your password to confirm
                      </label>
                      <input type="password" value={deleteForm.password}
                        onChange={e => setDeleteForm({ password: e.target.value })}
                        placeholder="Your password"
                        className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-red-300/50 focus:border-red-400 focus:ring-2 focus:ring-red-200 focus:outline-none font-['Cormorant_Garamond',serif] italic text-base text-[#3a3027] placeholder:text-[#7a6a5a]/50 transition-all duration-300 rounded-xl mb-6"/>
                      {deleteMsg.text && (
                        <p className="font-['Cormorant_Garamond',serif] italic text-base mb-5 text-red-500 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">✕</span>
                          {deleteMsg.text}
                        </p>
                      )}
                      <button type="submit" disabled={deleteLoading}
                        className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.22em] uppercase text-white bg-red-500 px-10 py-3.5 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 cursor-pointer font-semibold shadow-[0_6px_20px_rgba(239,68,68,0.28)] hover:shadow-[0_10px_28px_rgba(239,68,68,0.35)] hover:-translate-y-0.5">
                        {deleteLoading ? 'Deleting…' : 'Delete My Account'}
                      </button>
                    </form>
                  </FormCard>
                </div>
              )}

              <div className="text-center py-10">
                <span className="text-[#FBEAD6]/18 text-xl tracking-[0.6em]">✦ ✦ ✦</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
