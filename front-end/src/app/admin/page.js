'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab,        setActiveTab]        = useState('overview');
  const [pageReady,        setPageReady]        = useState(false);

  const [approvedReviews,  setApprovedReviews]  = useState([]);
  const [pendingReviews,   setPendingReviews]   = useState([]);

  const [users,            setUsers]            = useState([]);
  const [usersLoading,     setUsersLoading]     = useState(false);
  const [userSearch,       setUserSearch]       = useState('');
  const [selectedUser,     setSelectedUser]     = useState(null); // ← drawer

  const [bookings,         setBookings]         = useState([]);
  const [bookingsLoading,  setBookingsLoading]  = useState(true);

  const [payments,         setPayments]         = useState([]);
  const [paymentsLoading,  setPaymentsLoading]  = useState(false);

  const displayName = user?.fullName ?? user?.name ?? 'Admin';

  useEffect(() => {
    fetchAll();
    setTimeout(() => setPageReady(true), 100);
  }, []);

  const fetchAll = () => {
    fetchReviews();
    fetchUsers();
    fetchBookings();
    fetchPayments();
  };

  // ── fetchers ──
  const fetchReviews = async () => {
    try {
      const [a, p] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/approved`, { credentials: 'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/pending`,  { credentials: 'include' }),
      ]);
      setApprovedReviews(Array.isArray(await a.json()) ? await a.json() : []);
      setPendingReviews(Array.isArray(await p.json())  ? await p.json() : []);
    } catch { setApprovedReviews([]); setPendingReviews([]); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/users`, { credentials: 'include' });
      if (res.ok) setUsers(await res.json());
    } finally { setUsersLoading(false); }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, { credentials: 'include' });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch { setBookings([]); }
    finally  { setBookingsLoading(false); }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/paid`, { credentials: 'include' });
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch { setPayments([]); }
    finally  { setPaymentsLoading(false); }
  };

  // ── actions ──
  const approveReview = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}/approve`, { method: 'PATCH', credentials: 'include' });
    fetchReviews();
  };
  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchReviews();
  };
  const toggleSuspend = async (id, suspended) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/users/${id}/suspend`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: !suspended }),
    });
    fetchUsers();
  };
  const updateBookingStatus = async (id, status) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}/status`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  };
const deleteBooking = async (id) => {
  if (!confirm('Supprimer cette réservation ?')) return;
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`, {
    method: 'DELETE', credentials: 'include',
  });
  fetchBookings();
  fetchPayments();
};
  // ── helpers ──
  const statusCfg = {
    pending:   { label: 'Pending',   dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50',    border: 'border-amber-200'  },
    confirmed: { label: 'Confirmed', dot: 'bg-green-400', text: 'text-green-600', bg: 'bg-green-50',    border: 'border-green-200'  },
    completed: { label: 'Completed', dot: 'bg-[#6B7556]', text: 'text-[#6B7556]',bg: 'bg-[#6B7556]/8', border: 'border-[#6B7556]/30'},
    cancelled: { label: 'Cancelled', dot: 'bg-red-400',   text: 'text-red-500',  bg: 'bg-red-50',      border: 'border-red-200'    },
  };
  const getStatus = s => statusCfg[s?.toLowerCase()] ?? { label: s ?? '—', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };

  const userBookings = (u) => bookings.filter(b => b.email?.toLowerCase() === u.email?.toLowerCase());
  const userPayments = (u) => payments.filter(p => p.email?.toLowerCase() === u.email?.toLowerCase());
  const userReviews  = (u) => [...approvedReviews, ...pendingReviews].filter(r => r.user?.id === u.id);

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const navItems = [
    { id: 'overview',     label: 'Overview',      icon: '◈' },
    { id: 'bookings',     label: 'Réservations',  icon: '◷', badge: bookings.filter(b=>b.status==='pending').length },
    { id: 'members',      label: 'Members',       icon: '◎' },
    { id: 'payments',     label: 'Payments',       icon: '◇' },
    { id: 'reviews',      label: 'Reviews',        icon: '◉', badge: pendingReviews.length },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .lace-sidebar {
          background-color:#6B7556;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='10' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.07'/%3E%3Ccircle cx='0' cy='0' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='60' cy='0' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='0' cy='60' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3Ccircle cx='60' cy='60' r='2' fill='none' stroke='%23FBEAD6' stroke-width='0.3' opacity='0.10'/%3E%3C/svg%3E");
        }
        .lace-bg {
          background-color:#FBEAD6;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='16' fill='none' stroke='%23C87D87' stroke-width='0.2' opacity='0.10'/%3E%3Ccircle cx='0' cy='0' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Ccircle cx='80' cy='0' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Ccircle cx='0' cy='80' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3Ccircle cx='80' cy='80' r='3' fill='none' stroke='%23C87D87' stroke-width='0.3' opacity='0.12'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className={`min-h-screen flex transition-opacity duration-500 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>

        {/* ═══════ SIDEBAR ═══════ */}
        <aside className="lace-sidebar fixed top-0 left-0 h-full w-64 z-40 flex flex-col" style={{boxShadow:'4px 0 40px rgba(107,117,86,0.25)'}}>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent"/>

          {/* Logo */}
          <div className="px-8 pt-10 pb-7 border-b border-[#FBEAD6]/10">
            <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.4em] uppercase text-[#C87D87]/60 mb-0.5">Admin Panel</p>
            <h1 className="font-['Playfair_Display',serif] italic text-3xl text-[#FBEAD6]">Inora</h1>
          </div>

          {/* Admin info */}
          <div className="px-6 py-4 border-b border-[#FBEAD6]/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6]/80 flex items-center justify-center text-[#6B7556] font-bold text-sm flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#FBEAD6] truncate">{displayName}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/50 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'bg-[#FBEAD6]/15 text-[#FBEAD6]'
                    : 'text-[#FBEAD6]/45 hover:text-[#FBEAD6]/80 hover:bg-[#FBEAD6]/8'
                }`}>
                <span className={`text-base transition-colors ${activeTab===item.id ? 'text-[#C87D87]' : 'text-[#FBEAD6]/30 group-hover:text-[#C87D87]/60'}`}>
                  {item.icon}
                </span>
                <span className="font-['Cormorant_Garamond',serif] text-[0.75rem] tracking-[0.18em] uppercase flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-[#C87D87] text-white text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="px-3 pb-6 space-y-1 border-t border-[#FBEAD6]/8 pt-3">
            <button onClick={fetchAll}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#FBEAD6]/40 hover:text-[#FBEAD6]/70 hover:bg-[#FBEAD6]/8 transition-all group">
              <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">↺</span>
              <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.18em] uppercase">Refresh</span>
            </button>
            <button onClick={async () => { await logout(); router.push('/'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#FBEAD6]/40 hover:text-[#C87D87]/80 hover:bg-[#C87D87]/10 transition-all">
              <span className="text-sm">→</span>
              <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.18em] uppercase">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ═══════ MAIN ═══════ */}
        <main className="lace-bg ml-64 flex-1 min-h-screen">

          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-[#FBEAD6]/95 backdrop-blur-sm border-b border-[#C87D87]/12 px-10 py-4 flex items-center justify-between">
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] tracking-[0.3em] uppercase text-[#C87D87]/50">
                Inora › {navItems.find(n=>n.id===activeTab)?.label}
              </p>
              <h2 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] leading-tight">
                {navItems.find(n=>n.id===activeTab)?.label}<span className="text-[#C87D87]">.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[0.6rem] font-['Cormorant_Garamond',serif] uppercase tracking-widest text-[#7a6a5a]/40">
              <span>{bookings.length} réservations</span>
              <span className="text-[#C87D87]/30">·</span>
              <span>{users.length} membres</span>
              <span className="text-[#C87D87]/30">·</span>
              <span>{payments.length} paiements</span>
            </div>
          </header>

          <div className="p-10" style={{animation:'fadeUp .4s ease both'}}>

            {/* ══════════════════════════════════════
                OVERVIEW
            ══════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Réservations',  value: bookings.length,                                    sub: `${bookings.filter(b=>b.status==='pending').length} en attente`,  color: '#C87D87' },
                    { label: 'Membres',        value: users.length,                                        sub: `${users.filter(u=>u.role==='admin').length} admins`,             color: '#6B7556' },
                    { label: 'Paiements',      value: payments.length,                                     sub: `${payments.reduce((s,p)=>s+(p.advancePaid||0),0).toLocaleString()} MAD collectés`, color: '#3a3027' },
                    { label: 'Avis en attente',value: pendingReviews.length,                               sub: `${approvedReviews.length} publiés`,                              color: '#C87D87' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/60 border border-[#C87D87]/12 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50 mb-2">{s.label}</p>
                      <p className="font-['Playfair_Display',serif] italic text-4xl leading-none mb-1" style={{color:s.color}}>{s.value}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Recent bookings */}
                <div className="bg-white/60 border border-[#C87D87]/12 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#C87D87]/10 flex items-center justify-between">
                    <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">Dernières réservations</h3>
                    <button onClick={() => setActiveTab('bookings')} className="font-['Cormorant_Garamond',serif] text-xs tracking-widest uppercase text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">
                      Voir tout →
                    </button>
                  </div>
                  {bookings.slice(0, 5).map((b, i) => {
                    const s = getStatus(b.status);
                    return (
                      <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-[#C87D87]/6 last:border-0 hover:bg-[#C87D87]/3 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87D87]/30 to-[#6B7556]/20 flex items-center justify-center text-[#3a3027] font-bold text-xs flex-shrink-0">
                          {(b.fullName || b.user?.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.fullName || b.user?.fullName}</p>
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50 truncate">{b.activity}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[0.58rem] tracking-widest uppercase font-['Cormorant_Garamond',serif] font-semibold flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40 flex-shrink-0 hidden lg:block">
                          {new Date(b.createdAt).toLocaleDateString('fr-FR', {day:'numeric',month:'short'})}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Pending reviews */}
                {pendingReviews.length > 0 && (
                  <div className="bg-white/60 border border-[#C87D87]/12 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#C87D87]/10 flex items-center justify-between">
                      <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">
                        Avis en attente <span className="text-[#C87D87] font-['Cormorant_Garamond',serif] text-base not-italic">{pendingReviews.length}</span>
                      </h3>
                      <button onClick={() => setActiveTab('reviews')} className="font-['Cormorant_Garamond',serif] text-xs tracking-widest uppercase text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">
                        Gérer →
                      </button>
                    </div>
                    <div className="divide-y divide-[#C87D87]/6">
                      {pendingReviews.slice(0,3).map(r => (
                        <div key={r.id} className="flex items-center gap-4 px-6 py-3.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87D87]/30 to-[#6B7556]/20 flex items-center justify-center font-bold text-xs text-[#3a3027] flex-shrink-0">
                            {r.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{r.user.fullName}</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60 truncate">{r.comment}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => approveReview(r.id)} className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase px-3 py-1.5 border border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">✓</button>
                            <button onClick={() => deleteReview(r.id)}  className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase px-3 py-1.5 border border-[#C87D87]/40 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all rounded-lg">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════
                BOOKINGS
            ══════════════════════════════════════ */}
            {/* ══ BOOKINGS TAB ══ */}
{activeTab === 'bookings' && (
  <div className="space-y-4" style={{animation:'fadeIn .3s ease both'}}>
    <div className="bg-white/60 border border-[#C87D87]/12 rounded-2xl overflow-hidden">
      {/* Table header — 7 cols now */}
      <div className="grid grid-cols-[1.4fr_1.1fr_0.6fr_0.8fr_0.7fr_1fr_44px] gap-3 px-6 py-3 bg-[#C87D87]/5 border-b border-[#C87D87]/10">
        {['Client','Activité','Pers.','Date','Paiement','Statut',''].map(h => (
          <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50">{h}</p>
        ))}
      </div>

      {bookingsLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center py-16 font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40">Aucune réservation</p>
      ) : bookings.map((b, i) => {
        const s = getStatus(b.status);
        const isPaid = b.paymentStatus === 'PAID';
        return (
          <div key={b.id}
            className="grid grid-cols-[1.4fr_1.1fr_0.6fr_0.8fr_0.7fr_1fr_44px] gap-3 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0 hover:bg-[#C87D87]/3 transition-colors"
            style={{animation:`fadeUp .25s ease ${i*30}ms both`}}>

            {/* Client */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C87D87]/30 to-[#6B7556]/20 flex items-center justify-center text-[#3a3027] font-bold text-xs flex-shrink-0">
                {(b.fullName || b.user?.fullName || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.fullName || b.user?.fullName}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/40 truncate">{b.email}</p>
              </div>
            </div>

            {/* Activity */}
            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] truncate">{b.activity}</p>

            {/* Participants */}
            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] text-center">{b.participants}</p>

            {/* Date */}
            <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60">
              {b.date ? new Date(b.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : '—'}
            </p>

            {/* Payment status */}
            {isPaid ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#6B7556]/10 border border-[#6B7556]/25 text-[#6B7556] text-[0.55rem] tracking-widest uppercase font-['Cormorant_Garamond',serif] w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7556]"/>
                {b.advancePaid} MAD
              </span>
            ) : (
              <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#7a6a5a]/30">—</span>
            )}

            {/* Booking status dropdown */}
            <select value={b.status || 'pending'} onChange={e => updateBookingStatus(b.id, e.target.value)}
              className="font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase border border-[#C87D87]/25 bg-white/70 px-2 py-1.5 focus:outline-none focus:border-[#C87D87] transition-colors cursor-pointer rounded-xl text-[#3a3027] w-full">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Delete */}
            <button onClick={() => deleteBooking(b.id)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#C87D87]/20 text-[#C87D87]/30 hover:text-white hover:bg-[#C87D87] hover:border-[#C87D87] transition-all flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}


            {/* ══════════════════════════════════════
                MEMBERS  (click → drawer)
            ══════════════════════════════════════ */}
            {activeTab === 'members' && (
              <div style={{animation:'fadeIn .3s ease both'}}>
                {/* Search */}
                <div className="relative mb-5 max-w-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#7a6a5a]/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Rechercher un membre…"
                    className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-[#C87D87]/20 focus:border-[#C87D87] focus:outline-none font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder-[#7a6a5a]/40 rounded-xl transition-all"/>
                </div>

                {/* Table */}
                <div className="bg-white/60 border border-[#C87D87]/12 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-[1.5fr_1.8fr_80px_60px_60px_60px] gap-4 px-6 py-3 bg-[#C87D87]/5 border-b border-[#C87D87]/10">
                    {['Membre','Email','Rôle','Rés.','Pmt','Avis'].map(h => (
                      <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50">{h}</p>
                    ))}
                  </div>
                  {usersLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
                    </div>
                  ) : filteredUsers.map((u, i) => {
                    const ub = userBookings(u);
                    const up = userPayments(u);
                    const ur = userReviews(u);
                    return (
                      <div key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`grid grid-cols-[1.5fr_1.8fr_80px_60px_60px_60px] gap-4 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0 hover:bg-[#C87D87]/5 transition-colors cursor-pointer ${u.suspended ? 'opacity-50' : ''}`}
                        style={{animation:`fadeUp .25s ease ${i*25}ms both`}}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-gradient-to-br ${u.role==='admin' ? 'from-[#6B7556] to-[#3a3027]' : 'from-[#C87D87] to-[#6B7556]'}`}>
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{u.fullName}</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/40">
                              {new Date(u.createdAt).toLocaleDateString('fr-FR',{month:'short',year:'numeric'})}
                            </p>
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60 truncate">{u.email}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.58rem] tracking-widest uppercase w-fit font-['Cormorant_Garamond',serif] ${u.role==='admin' ? 'bg-[#6B7556]/15 text-[#6B7556] border border-[#6B7556]/25' : 'bg-[#C87D87]/10 text-[#C87D87] border border-[#C87D87]/20'}`}>
                          {u.role}
                        </span>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] text-center font-semibold">{ub.length || '—'}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#6B7556] text-center font-semibold">{up.length || '—'}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#C87D87] text-center font-semibold">{ur.length || '—'}</p>
                      </div>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <p className="text-center py-12 font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40">Aucun membre trouvé</p>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                PAYMENTS
            ══════════════════════════════════════ */}
            {activeTab === 'payments' && (
              <div className="space-y-5" style={{animation:'fadeIn .3s ease both'}}>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label:'Total collecté', value:`${payments.reduce((s,p)=>s+(p.advancePaid||0),0).toLocaleString()} MAD`, color:'#6B7556' },
                    { label:'Paiements',       value: payments.length,                                                           color:'#C87D87' },
                    { label:'Clients uniques', value: new Set(payments.map(p=>p.email)).size,                                    color:'#3a3027' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/60 border border-[#C87D87]/12 rounded-2xl p-5">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50 mb-1">{s.label}</p>
                      <p className="font-['Playfair_Display',serif] italic text-3xl" style={{color:s.color}}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/60 border border-[#C87D87]/12 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_1fr_0.8fr] gap-4 px-6 py-3 bg-[#C87D87]/5 border-b border-[#C87D87]/10">
                    {['Client','Activité','Pers.','Avance','Payé le','Statut'].map(h => (
                      <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/50">{h}</p>
                    ))}
                  </div>
                  {paymentsLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
                    </div>
                  ) : payments.length === 0 ? (
                    <p className="text-center py-16 font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40">Aucun paiement reçu</p>
                  ) : payments.map((p, i) => {
                    const s = getStatus(p.status);
                    return (
                      <div key={p.id}
                        className="grid grid-cols-[1.5fr_1.2fr_0.7fr_0.7fr_1fr_0.8fr] gap-4 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0 hover:bg-[#C87D87]/3 transition-colors"
                        style={{animation:`fadeUp .25s ease ${i*30}ms both`}}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C87D87]/30 to-[#6B7556]/20 flex items-center justify-center text-[#3a3027] font-bold text-xs flex-shrink-0">
                            {(p.user?.fullName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.user?.fullName || '—'}</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/40 truncate">{p.email}</p>
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] truncate">{p.activity}</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] text-center">{p.participants}</p>
                        <p className="font-['Playfair_Display',serif] italic text-base text-[#6B7556] font-semibold">{p.advancePaid} MAD</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/60">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[0.58rem] tracking-widest uppercase font-['Cormorant_Garamond',serif] font-semibold w-fit ${s.bg} ${s.border} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                REVIEWS
            ══════════════════════════════════════ */}
            {activeTab === 'reviews' && (
              <div className="space-y-8" style={{animation:'fadeIn .3s ease both'}}>
                {/* Pending */}
                {pendingReviews.length > 0 && (
                  <div>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-4">
                      En attente <span className="text-[#C87D87] font-['Cormorant_Garamond',serif] text-base not-italic">{pendingReviews.length}</span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingReviews.map(r => (
                        <div key={r.id} className="bg-white/65 border border-[#C87D87]/15 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-bold text-sm flex-shrink-0">
                              {r.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{r.user.fullName}</p>
                              <span className="text-[#C87D87] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                            </div>
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed mb-4 line-clamp-3">{r.comment}</p>
                          <div className="flex gap-2">
                            <button onClick={() => approveReview(r.id)} className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#6B7556] border border-[#6B7556]/40 py-2 rounded-xl hover:bg-[#6B7556] hover:text-white transition-all">Approuver</button>
                            <button onClick={() => deleteReview(r.id)}  className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#C87D87] border border-[#C87D87]/40 py-2 rounded-xl hover:bg-[#C87D87] hover:text-white transition-all">Supprimer</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved */}
                <div>
                  <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-4">
                    Publiés <span className="text-[#6B7556] font-['Cormorant_Garamond',serif] text-base not-italic">{approvedReviews.length}</span>
                  </h3>
                  {approvedReviews.length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-center py-10">Aucun avis publié</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedReviews.map(r => (
                        <div key={r.id} className="bg-white/65 border border-[#6B7556]/15 rounded-2xl p-6 group hover:-translate-y-0.5 transition-transform">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {r.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{r.user.fullName}</p>
                              <span className="text-[#C87D87] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                            </div>
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed mb-4 line-clamp-3">{r.comment}</p>
                          <button onClick={() => deleteReview(r.id)} className="w-full font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#C87D87]/50 border border-[#C87D87]/15 py-2 rounded-xl hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all opacity-0 group-hover:opacity-100">
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* ══════════════════════════════════════
            USER DRAWER (slide in from right)
        ══════════════════════════════════════ */}
        {selectedUser && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-[#3a3027]/30 backdrop-blur-sm z-50" onClick={() => setSelectedUser(null)}/>

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#FBEAD6] z-50 overflow-y-auto shadow-2xl flex flex-col"
              style={{animation:'slideIn .3s cubic-bezier(.4,0,.2,1) both'}}>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#C87D87]/60 via-[#C87D87]/30 to-transparent"/>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#C87D87]/12 bg-[#FBEAD6]/95 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-['Playfair_Display',serif] font-bold text-lg bg-gradient-to-br ${selectedUser.role==='admin' ? 'from-[#6B7556] to-[#3a3027]' : 'from-[#C87D87] to-[#6B7556]'}`}>
                    {selectedUser.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027]">{selectedUser.fullName}</h3>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/60">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedUser.role !== 'admin' && (
                    <button onClick={() => { toggleSuspend(selectedUser.id, selectedUser.suspended); setSelectedUser({...selectedUser, suspended: !selectedUser.suspended}); }}
                      className={`font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-widest uppercase px-4 py-2 rounded-xl border transition-all ${selectedUser.suspended ? 'text-[#6B7556] border-[#6B7556]/40 hover:bg-[#6B7556]/10' : 'text-[#C87D87] border-[#C87D87]/40 hover:bg-[#C87D87]/10'}`}>
                      {selectedUser.suspended ? 'Restaurer' : 'Suspendre'}
                    </button>
                  )}
                  <button onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 rounded-full border border-[#C87D87]/20 flex items-center justify-center text-[#7a6a5a]/50 hover:text-[#C87D87] hover:border-[#C87D87]/40 transition-all">
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 space-y-7 flex-1">

                {/* User meta */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'Rôle',       value: selectedUser.role,                                                              color: selectedUser.role==='admin' ? '#6B7556' : '#C87D87' },
                    { label:'Statut',     value: selectedUser.suspended ? 'Suspendu' : 'Actif',                                  color: selectedUser.suspended ? '#ef4444' : '#6B7556' },
                    { label:'Membre depuis', value: new Date(selectedUser.createdAt).toLocaleDateString('fr-FR',{month:'short',year:'numeric'}), color:'#3a3027' },
                  ].map(m => (
                    <div key={m.label} className="bg-white/60 border border-[#C87D87]/10 rounded-xl p-3 text-center">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase text-[#7a6a5a]/40 mb-1">{m.label}</p>
                      <p className="font-['Cormorant_Garamond',serif] text-sm font-semibold capitalize" style={{color:m.color}}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Reservations */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Réservations
                    <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#C87D87]">{userBookings(selectedUser).length}</span>
                  </h4>
                  {userBookings(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm py-4 text-center bg-white/40 rounded-xl">Aucune réservation</p>
                  ) : (
                    <div className="space-y-2">
                      {userBookings(selectedUser).map(b => {
                        const s = getStatus(b.status);
                        return (
                          <div className="flex items-center gap-2 flex-shrink-0">
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[0.55rem] tracking-widest uppercase font-['Cormorant_Garamond',serif] ${s.bg} ${s.border} ${s.text}`}>
    <span className={`w-1 h-1 rounded-full ${s.dot}`}/>{s.label}
  </span>
  <select value={b.status||'pending'} onChange={e=>updateBookingStatus(b.id,e.target.value)}
    className="font-['Cormorant_Garamond',serif] text-[0.58rem] uppercase border border-[#C87D87]/20 bg-white/80 px-2 py-1 focus:outline-none rounded-lg text-[#3a3027] cursor-pointer">
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
  <button onClick={() => deleteBooking(b.id)}
    className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#C87D87]/20 text-[#C87D87]/30 hover:text-white hover:bg-[#C87D87] transition-all flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  </button>
</div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Payments */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Paiements
                    <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#6B7556]">{userPayments(selectedUser).length}</span>
                  </h4>
                  {userPayments(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm py-4 text-center bg-white/40 rounded-xl">Aucun paiement</p>
                  ) : (
                    <div className="space-y-2">
                      {userPayments(selectedUser).map(p => (
                        <div key={p.id} className="bg-white/60 border border-[#6B7556]/15 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.activity}</p>
                            <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">
                              {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                            </p>
                          </div>
                          <p className="font-['Playfair_Display',serif] italic text-lg text-[#6B7556] font-semibold flex-shrink-0">{p.advancePaid} MAD</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Avis
                    <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#C87D87]">{userReviews(selectedUser).length}</span>
                  </h4>
                  {userReviews(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm py-4 text-center bg-white/40 rounded-xl">Aucun avis</p>
                  ) : (
                    <div className="space-y-2">
                      {userReviews(selectedUser).map(r => {
                        const isApproved = approvedReviews.some(a => a.id === r.id);
                        return (
                          <div key={r.id} className="bg-white/60 border border-[#C87D87]/10 rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[#C87D87] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                              <span className={`font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full border ${isApproved ? 'bg-[#6B7556]/10 text-[#6B7556] border-[#6B7556]/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                {isApproved ? 'Publié' : 'En attente'}
                              </span>
                            </div>
                            <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed line-clamp-2">{r.comment}</p>
                            {!isApproved && (
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => approveReview(r.id)} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1 border border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">Approuver</button>
                                <button onClick={() => deleteReview(r.id)}  className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1 border border-[#C87D87]/40 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all rounded-lg">Supprimer</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}
