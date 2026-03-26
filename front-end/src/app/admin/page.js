'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const ACTIVITY_IMGS = {
  'Crochet Circle':   'https://images.unsplash.com/photo-1612278675615-7b093b07772d',
  'Painting Session': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
  'Pottery Workshop': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
};

const TIME_SLOTS = [
  { id:'morning',   label:'Morning',   hours:'09:30 – 12:30', icon:'◎', sub:'Soft light & fresh starts' },
  { id:'afternoon', label:'Afternoon', hours:'14:30 – 17:30', icon:'◈', sub:'Golden hour creativity'    },
  { id:'evening',   label:'Evening',   hours:'19:30 – 22:30', icon:'◇', sub:'Candlelit & intimate'      },
];
const SETTINGS_MAP = {
  garden:  { label:'Sunlit Garden',    icon:'❧' },
  indoor:  { label:'Cosy Indoor',      icon:'⌂' },
  terrace: { label:'Open-Air Terrace', icon:'◻' },
};

// ── Lace Corner (from account page) ──
const LaceCorner = ({ flip = false, danger = false }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
    className="pointer-events-none select-none"
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
    <line x1="0"  y1="1"  x2="22" y2="1"  stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.8" strokeOpacity="0.50"/>
    <line x1="1"  y1="0"  x2="1"  y2="22" stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.8" strokeOpacity="0.50"/>
    <rect x="2" y="2" width="4.5" height="4.5" transform="rotate(45 4.25 4.25)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.7" strokeOpacity="0.80"/>
    <circle cx="4.25" cy="4.25" r="0.8" fill={danger ? '#ef4444' : '#C87D87'} fillOpacity="0.45"/>
    <rect x="8"  y="1.5" width="3" height="3" transform="rotate(45 9.5 3)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.5" strokeOpacity="0.30"/>
    <rect x="1.5" y="8" width="3" height="3" transform="rotate(45 3 9.5)" fill="none"
          stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.5" strokeOpacity="0.30"/>
    {[8,12,16,20].map((x,j) => (
      <line key={x} x1={x} y1="1" x2={x} y2={j%2===0?4:3}
            stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.4" strokeOpacity="0.25"/>
    ))}
    {[8,12,16,20].map((y,j) => (
      <line key={y} x1="1" y1={y} x2={j%2===0?4:3} y2={y}
            stroke={danger ? '#ef4444' : '#C87D87'} strokeWidth="0.4" strokeOpacity="0.25"/>
    ))}
  </svg>
);

// ── Panel Card (account page style) ──
const Panel = ({ children, className = '' }) => (
  <div className={`bg-[#fef6ec] rounded-2xl overflow-hidden border border-[#C87D87]/20 shadow-[0_2px_12px_rgba(58,48,39,0.06)] relative ${className}`}>
    <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C87D87]/50 to-transparent"/>
    <div className="absolute top-0 left-0"><LaceCorner/></div>
    <div className="absolute top-0 right-0"><LaceCorner flip/></div>
    {children}
  </div>
);

// ── Deleted Account Badge ──
const DeletedBadge = () => (
  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-widest uppercase flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
    </svg>
    Deleted
  </span>
);

export default function Admin() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab,       setActiveTab]       = useState('overview');
  const [pageReady,       setPageReady]       = useState(false);
  const [collapsed,       setCollapsed]       = useState(false);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [pendingReviews,  setPendingReviews]  = useState([]);
  const [users,           setUsers]           = useState([]);
  const [usersLoading,    setUsersLoading]    = useState(false);
  const [userSearch,      setUserSearch]      = useState('');
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [bookings,        setBookings]        = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [payments,        setPayments]        = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const displayName = user?.fullName ?? user?.name ?? 'Admin';

  useEffect(() => { fetchAll(); setTimeout(() => setPageReady(true), 100); }, []);

  const fetchAll     = () => { fetchReviews(); fetchUsers(); fetchBookings(); fetchPayments(); };
  const fetchReviews = async () => {
    try {
      const [aRes, pRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/approved`, { credentials:'include' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/pending`,  { credentials:'include' }),
      ]);
      const aData = await aRes.json(); const pData = await pRes.json();
      setApprovedReviews(Array.isArray(aData) ? aData : []);
      setPendingReviews(Array.isArray(pData)  ? pData : []);
    } catch { setApprovedReviews([]); setPendingReviews([]); }
  };
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/users`, { credentials:'include' });
      if (res.ok) setUsers(await res.json());
    } finally { setUsersLoading(false); }
  };
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, { credentials:'include' });
      const d   = await res.json();
      setBookings(Array.isArray(d) ? d : []);
    } catch { setBookings([]); } finally { setBookingsLoading(false); }
  };
  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/paid`, { credentials:'include' });
      const d   = await res.json();
      setPayments(Array.isArray(d) ? d : []);
    } catch { setPayments([]); } finally { setPaymentsLoading(false); }
  };

  const approveReview = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}/approve`, { method:'PATCH', credentials:'include' });
    fetchReviews();
  };
  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}`, { method:'DELETE', credentials:'include' });
    fetchReviews();
  };
  const toggleSuspend = async (id, suspended) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/users/${id}/suspend`, {
      method:'PATCH', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ suspended: !suspended }),
    });
    fetchUsers();
  };
  const updateBookingStatus = async (id, status) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}/status`, {
      method:'PATCH', credentials:'include',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
    if (selectedBooking?.id === id) setSelectedBooking(b => ({ ...b, status }));
  };
  const deleteBooking = async (id) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`, { method:'DELETE', credentials:'include' });
    fetchBookings(); fetchPayments();
    if (selectedBooking?.id === id) setSelectedBooking(null);
  };

  const statusCfg = {
    pending:   { label:'Pending',   dot:'bg-amber-400',  text:'text-amber-600',  bg:'bg-amber-50',       border:'border-amber-200'    },
    confirmed: { label:'Confirmed', dot:'bg-[#6B7556]',  text:'text-[#4a5240]',  bg:'bg-[#6B7556]/10',   border:'border-[#6B7556]/30' },
    completed: { label:'Completed', dot:'bg-[#6B7556]',  text:'text-[#4a5240]',  bg:'bg-[#6B7556]/10',   border:'border-[#6B7556]/30' },
    cancelled: { label:'Cancelled', dot:'bg-red-400',    text:'text-red-500',     bg:'bg-red-50',         border:'border-red-200'      },
  };
  const getStatus = s => statusCfg[s?.toLowerCase()] ?? {
    label: s ?? '—', dot:'bg-[#C87D87]', text:'text-[#C87D87]', bg:'bg-[#C87D87]/8', border:'border-[#C87D87]/20'
  };

  const slotFromBooking    = b => TIME_SLOTS.find(t => t.hours === b?.timeSlot) ?? null;
  const settingFromBooking = b => SETTINGS_MAP[b?.setting] ?? null;

  const userBookings  = u => bookings.filter(b => b.email?.toLowerCase() === u.email?.toLowerCase());
  const userPayments  = u => payments.filter(p => p.email?.toLowerCase() === u.email?.toLowerCase());
  const userReviews   = u => [...approvedReviews, ...pendingReviews].filter(r => r.user?.id === u.id);
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const navItems = [
    { id:'overview', label:'Overview',     icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id:'bookings', label:'Réservations', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: bookings.filter(b=>b.status==='pending').length },
    { id:'members',  label:'Members',      icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id:'payments', label:'Payments',     icon:'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id:'reviews',  label:'Reviews',      icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', badge: pendingReviews.length },
  ];

  const sideW  = collapsed ? 'w-[72px]' : 'w-64';
  const mainML = collapsed ? 'ml-[72px]' : 'ml-64';

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

        .pink-sidebar { background: linear-gradient(160deg,#C87D87 0%,#b56b76 55%,#a55e6a 100%); }
        .nav-item { transition:background .18s; border-radius:12px; }
        .nav-item:hover { background:rgba(255,255,255,0.10); }
        .nav-item-active { background:rgba(255,255,255,0.18); }

        .dash-bg {
          background-color: #FBEAD6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cline x1='0' y1='1' x2='18' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='0' x2='1' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='1' x2='62' y2='1' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='0' x2='79' y2='18' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='0' y1='79' x2='18' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='1' y1='80' x2='1' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='80' y1='79' x2='62' y2='79' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Cline x1='79' y1='80' x2='79' y2='62' stroke='%23C87D87' stroke-width='0.8' stroke-opacity='0.18'/%3E%3Crect x='2' y='2' width='3.5' height='3.5' transform='rotate(45 3.75 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='2' width='3.5' height='3.5' transform='rotate(45 75.25 3.75)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='2' y='73.5' width='3.5' height='3.5' transform='rotate(45 3.75 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Crect x='73.5' y='73.5' width='3.5' height='3.5' transform='rotate(45 75.25 75.25)' fill='none' stroke='%23C87D87' stroke-width='0.7' stroke-opacity='0.35'/%3E%3Ccircle cx='3.75' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='3.75' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='3.75' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3Ccircle cx='76.25' cy='76.25' r='0.8' fill='%23C87D87' fill-opacity='0.25'/%3E%3C/svg%3E");
        }

        .admin-topbar {
          background: linear-gradient(160deg,#C87D87 0%,#b56b76 100%);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 2px 24px rgba(200,125,135,0.28);
        }

        .stat-card { background:#fef6ec; border:1px solid rgba(200,125,135,0.20); border-radius:18px; padding:20px; transition:all .22s; position:relative; overflow:hidden; }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(200,125,135,0.5),transparent); }
        .stat-card:hover { border-color:rgba(200,125,135,0.40); transform:translateY(-2px); box-shadow:0 8px 32px rgba(58,48,39,0.10); }

        .trow { transition:background .15s; }
        .trow:hover { background:rgba(200,125,135,0.05); cursor:pointer; }

        .search-input {
          background:#fdf3e7;
          border:1.5px solid rgba(200,125,135,0.25);
          border-radius:12px;
          padding:10px 14px;
          font-family:'Cormorant Garamond',serif;
          font-size:.9rem;
          color:#3a3027;
          outline:none;
          width:100%;
          transition:all .18s;
        }
        .search-input:focus { border-color:rgba(200,125,135,0.55); background:#fef6ec; box-shadow:0 0 0 3px rgba(200,125,135,0.08); }

        .rev-card { background:#fef6ec; border:1px solid rgba(200,125,135,0.18); border-radius:16px; padding:20px; transition:transform .2s, box-shadow .2s; position:relative; overflow:hidden; }
        .rev-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(200,125,135,0.4),transparent); }
        .rev-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(58,48,39,0.08); }

        .bmodal-bg { background:rgba(58,48,39,0.55); backdrop-filter:blur(8px); }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#FBEAD6; }
        ::-webkit-scrollbar-thumb { background:rgba(200,125,135,0.30); border-radius:8px; }
      `}</style>

      <div className={`min-h-screen flex font-['Cormorant_Garamond',serif] transition-opacity duration-500 ${pageReady?'opacity-100':'opacity-0'}`}>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside className={`pink-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ${sideW} overflow-hidden`}
          style={{ boxShadow:'6px 0 32px rgba(200,125,135,0.30)' }}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"/>

          <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed?'justify-center px-0 py-5':'justify-between px-6 py-5'}`}>
            {!collapsed && (
              <div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.5rem] tracking-[0.4em] uppercase text-white/50">Admin Panel</p>
                <h1 className="font-['Playfair_Display',serif] italic text-2xl text-white leading-tight">Inora</h1>
                <div className="mt-1 w-8 h-px bg-gradient-to-r from-white/30 to-transparent"/>
              </div>
            )}
            <button onClick={() => setCollapsed(c=>!c)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {collapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
              </svg>
            </button>
          </div>

          {!collapsed ? (
            <div className="px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-['Cormorant_Garamond',serif] text-sm text-white font-semibold truncate">{displayName}</p>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-white/50 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-3 border-b border-white/8 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : ''}
                className={`nav-item w-full flex items-center text-left relative group
                  ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}
                  ${activeTab===item.id?'nav-item-active':''}`}>
                {activeTab===item.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full"/>}
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 w-5 h-5 transition-colors ${activeTab===item.id?'text-white':'text-white/50 group-hover:text-white/80'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                </svg>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className={`font-['Cormorant_Garamond',serif] text-[0.72rem] tracking-[0.15em] uppercase transition-colors ${activeTab===item.id?'text-white':'text-white/55 group-hover:text-white/85'}`}>
                        {item.label}
                      </p>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-white text-[#C87D87] text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center leading-none">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full"/>}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/8 py-3 px-2 space-y-0.5 flex-shrink-0">
            <button onClick={fetchAll} title="Refresh"
              className={`nav-item w-full flex items-center text-white/40 hover:text-white/70 ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Refresh</span>}
            </button>
            <button onClick={async () => { await logout(); router.push('/'); }} title="Sign Out"
              className={`nav-item w-full flex items-center text-white/40 hover:text-white hover:bg-white/10 ${collapsed?'justify-center px-0 py-3':'gap-3 px-3 py-2.5'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {!collapsed && <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.15em] uppercase">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ═══════════ MAIN ═══════════ */}
        <main className={`${mainML} flex-1 min-h-screen dash-bg transition-all duration-300`}>

          {/* ── TOPBAR ── */}
          <header className="admin-topbar sticky top-0 z-30 px-6 py-2 flex items-center justify-between relative">
            <div className="absolute top-0 left-0 pointer-events-none"><LaceCorner/></div>
            <div className="absolute top-0 right-0 pointer-events-none"><LaceCorner flip/></div>
            <div>
              <p className="font-['Cormorant_Garamond',serif] italic text-[0.55rem] tracking-[0.32em] uppercase text-white/55">
                Inora › {navItems.find(n=>n.id===activeTab)?.label}
              </p>
              <h2 className="font-['Playfair_Display',serif] italic text-xl text-white leading-tight">
                {navItems.find(n=>n.id===activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {bookings.filter(b=>b.status==='pending').length > 0 && (
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 text-white border border-white/25">
                  {bookings.filter(b=>b.status==='pending').length} en attente
                </span>
              )}
              {pendingReviews.length > 0 && (
                <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 text-white border border-white/25">
                  {pendingReviews.length} avis
                </span>
              )}
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-white/60 hidden md:block">
                {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </p>
            </div>
          </header>

          <div className="p-7" style={{ animation:'fadeUp .4s ease both' }}>

            {/* ════════════ OVERVIEW ════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6" style={{animation:'fadeIn .3s ease both'}}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label:'Réservations',   n: bookings.length,       sub:`${bookings.filter(b=>b.status==='pending').length} en attente`, c:'#C87D87', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { label:'Membres',        n: users.length,          sub:`${users.filter(u=>u.role==='admin').length} admins`,            c:'#6B7556', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                    { label:'MAD collectés',  n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()}`, sub:`${payments.length} paiements`, c:'#3a3027', icon:'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                    { label:'Avis en attente',n: pendingReviews.length, sub:`${approvedReviews.length} publiés`,                          c:'#C87D87', icon:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
                  ].map((s,i) => (
                    <div key={s.label} className="stat-card" style={{ animation:`fadeUp .3s ease ${i*60}ms both` }}>
                      <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background:`${s.c}18` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={s.c} strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/>
                        </svg>
                      </div>
                      <p className="font-['Playfair_Display',serif] italic text-3xl leading-none mb-1" style={{ color:s.c }}>{s.n}</p>
                      <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#7a6a5a]/55 mb-0.5">{s.label}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/35">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Recent bookings */}
                <Panel>
                  <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
                    <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">Dernières réservations</h3>
                    <button onClick={() => setActiveTab('bookings')} className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">Voir tout →</button>
                  </div>
                  {bookings.slice(0,6).map(b => {
                    const s = getStatus(b.status);
                    return (
                      <div key={b.id} onClick={() => setSelectedBooking(b)}
                        className="trow flex items-center gap-4 px-6 py-3.5 border-b border-[#C87D87]/6 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0">
                          {(b.fullName||b.user?.fullName||'?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.fullName||b.user?.fullName}</p>
                            {b.user?.isDeleted && <DeletedBadge/>}
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">
                            {b.activity}{b.activityTheme ? ` · ${b.activityTheme}` : ''}{b.timeSlot ? ` · ${b.timeSlot}` : ''}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase flex-shrink-0 ${s.bg} ${s.border} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                        {b.totalPrice > 0 && (
                          <p className="font-['Playfair_Display',serif] italic text-sm text-[#6B7556] flex-shrink-0 hidden lg:block">{b.totalPrice} MAD</p>
                        )}
                      </div>
                    );
                  })}
                </Panel>

                {/* Pending reviews */}
                {pendingReviews.length > 0 && (
                  <Panel>
                    <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
                      <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">
                        Avis en attente <span className="text-[#C87D87] not-italic text-sm font-['Cormorant_Garamond',serif]">{pendingReviews.length}</span>
                      </h3>
                      <button onClick={() => setActiveTab('reviews')} className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60 hover:text-[#C87D87] transition-colors">Gérer →</button>
                    </div>
                    {pendingReviews.slice(0,3).map(r => (
                      <div key={r.id} className="trow flex items-center gap-4 px-6 py-3.5 border-b border-[#C87D87]/6 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center font-bold text-xs text-[#C87D87] flex-shrink-0">
                          {r.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold">{r.user.fullName}</p>
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">{r.comment}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={e=>{e.stopPropagation();approveReview(r.id);}} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 border border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">✓</button>
                          <button onClick={e=>{e.stopPropagation();deleteReview(r.id);}}  className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase px-3 py-1.5 border border-[#C87D87]/40 text-[#C87D87] hover:bg-[#C87D87]  hover:text-white transition-all rounded-lg">✕</button>
                        </div>
                      </div>
                    ))}
                  </Panel>
                )}
              </div>
            )}

            {/* ════════════ BOOKINGS ════════════ */}
            {activeTab === 'bookings' && (
              <div style={{ animation:'fadeIn .3s ease both' }}>
                <Panel>
                  <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#C87D87]/10">
                    <h3 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027]">
                      Toutes les réservations <span className="text-[#C87D87] not-italic text-sm font-['Cormorant_Garamond',serif]">{bookings.length}</span>
                    </h3>
                    <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40">Cliquez sur une ligne pour voir les détails</p>
                  </div>
                  <div className="grid grid-cols-[2fr_1.6fr_0.8fr_1fr_1fr_0.7fr] gap-4 px-6 py-3 border-b border-[#C87D87]/8" style={{background:'rgba(200,125,135,0.04)'}}>
                    {['Client','Activité · Cadre','Pers.','Date · Horaire','Statut','Total'].map(h => (
                      <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
                    ))}
                  </div>
                  {bookingsLoading ? (
                    <div className="flex flex-col items-center gap-3 py-16">
                      <div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/50 tracking-widest">Chargement…</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-center py-16 text-[#7a6a5a]/35">Aucune réservation</p>
                  ) : bookings.map((b,i) => {
                    const s       = getStatus(b.status);
                    const setting = settingFromBooking(b);
                    return (
                      <div key={b.id} onClick={() => setSelectedBooking(b)}
                        className="trow grid grid-cols-[2fr_1.6fr_0.8fr_1fr_1fr_0.7fr] gap-4 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0"
                        style={{ animation:`fadeUp .22s ease ${i*25}ms both` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0">
                            {(b.fullName||b.user?.fullName||'?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.fullName||b.user?.fullName}</p>
                              {b.user?.isDeleted && <DeletedBadge/>}
                            </div>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{b.email}</p>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] truncate">{b.activity}</p>
                          <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/55 truncate mt-0.5">
                            {[setting ? `${setting.icon} ${setting.label}` : b.setting, b.activityTheme].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] text-center">{b.participants}</p>
                        <div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#5a4a3a]">
                            {b.date ? new Date(b.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : '—'}
                          </p>
                          {b.timeSlot && <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/60 mt-0.5">{b.timeSlot}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase w-fit ${s.bg} ${s.border} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                        </span>
                        <p className="font-['Playfair_Display',serif] italic text-sm text-[#6B7556]">
                          {b.totalPrice > 0 ? `${b.totalPrice} MAD` : '—'}
                        </p>
                      </div>
                    );
                  })}
                </Panel>
              </div>
            )}

            {/* ════════════ MEMBERS ════════════ */}
            {activeTab === 'members' && (
              <div style={{ animation:'fadeIn .3s ease both' }}>
                <div className="relative mb-5 max-w-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Rechercher…" className="search-input pl-9"/>
                </div>
                <Panel>
                  <div className="grid grid-cols-[2fr_2fr_80px_55px_55px_55px] gap-4 px-6 py-3 border-b border-[#C87D87]/8" style={{background:'rgba(200,125,135,0.04)'}}>
                    {['Membre','Email','Rôle','Rés.','Pmt','Avis'].map(h => (
                      <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
                    ))}
                  </div>
                  {usersLoading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/></div>
                  ) : filteredUsers.map((u,i) => {
                    const ub=userBookings(u), up=userPayments(u), ur=userReviews(u);
                    return (
                      <div key={u.id} onClick={() => setSelectedUser(u)}
                        className={`trow grid grid-cols-[2fr_2fr_80px_55px_55px_55px] gap-4 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0 ${u.suspended?'opacity-40':''}`}
                        style={{ animation:`fadeUp .22s ease ${i*22}ms both` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${u.role==='admin'?'bg-[#6B7556]':'bg-[#C87D87]'}`}>
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{u.fullName}</p>
                              {u.isDeleted && <DeletedBadge/>}
                            </div>
                            <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45">
                              {new Date(u.createdAt).toLocaleDateString('fr-FR',{month:'short',year:'numeric'})}
                            </p>
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 truncate">{u.email}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase w-fit
                          ${u.role==='admin'?'bg-[#6B7556]/12 text-[#4a5240] border border-[#6B7556]/25':'bg-[#C87D87]/10 text-[#C87D87] border border-[#C87D87]/22'}`}>
                          {u.role}
                        </span>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] text-center font-semibold">{ub.length||'—'}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#6B7556] text-center font-semibold">{up.length||'—'}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#C87D87] text-center font-semibold">{ur.length||'—'}</p>
                      </div>
                    );
                  })}
                  {filteredUsers.length===0 && <p className="font-['Cormorant_Garamond',serif] italic text-center py-12 text-[#7a6a5a]/35">Aucun membre trouvé</p>}
                </Panel>
              </div>
            )}

            {/* ════════════ PAYMENTS ════════════ */}
            {activeTab === 'payments' && (
              <div className="space-y-5" style={{ animation:'fadeIn .3s ease both' }}>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label:'Total collecté', n:`${payments.reduce((s,p)=>s+(p.totalPrice||p.advancePaid||0),0).toLocaleString()} MAD`, c:'#6B7556' },
                    { label:'Paiements',       n: payments.length,                                                                        c:'#C87D87' },
                    { label:'Clients uniques', n: new Set(payments.map(p=>p.email)).size,                                                 c:'#3a3027' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45 mb-1">{s.label}</p>
                      <p className="font-['Playfair_Display',serif] italic text-3xl" style={{color:s.c}}>{s.n}</p>
                    </div>
                  ))}
                </div>
                <Panel>
                  <div className="grid grid-cols-[2fr_1.4fr_0.5fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-3 px-6 py-3 border-b border-[#C87D87]/8" style={{background:'rgba(200,125,135,0.04)'}}>
                    {['Client','Activité','Pers.','Date','Horaire','Cadre','Total'].map(h => (
                      <p key={h} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-[0.22em] uppercase text-[#7a6a5a]/45">{h}</p>
                    ))}
                  </div>
                  {paymentsLoading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#C87D87]/20 border-t-[#C87D87] rounded-full animate-spin"/></div>
                  ) : payments.length===0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-center py-16 text-[#7a6a5a]/35">Aucun paiement reçu</p>
                  ) : payments.map((p,i) => (
                    <div key={p.id}
                      className="trow grid grid-cols-[2fr_1.4fr_0.5fr_0.9fr_0.8fr_0.7fr_0.8fr] gap-3 px-6 py-4 items-center border-b border-[#C87D87]/6 last:border-0"
                      style={{ animation:`fadeUp .22s ease ${i*28}ms both` }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-xs flex-shrink-0">
                          {(p.user?.fullName||p.fullName||'?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.user?.fullName||p.fullName||'—'}</p>
                            {p.user?.isDeleted && <DeletedBadge/>}
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#7a6a5a]/45 truncate">{p.email}</p>
                        </div>
                      </div>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] truncate">{p.activity}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a] text-center">{p.participants}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55">
                        {p.date ? new Date(p.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : '—'}
                      </p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/65 truncate">{p.timeSlot||'—'}</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/55 capitalize truncate">
                        {SETTINGS_MAP[p.setting]?.label || p.setting || '—'}
                      </p>
                      <p className="font-['Playfair_Display',serif] italic text-base text-[#6B7556]">{p.totalPrice||p.advancePaid||0} MAD</p>
                    </div>
                  ))}
                </Panel>
              </div>
            )}

            {/* ════════════ REVIEWS ════════════ */}
            {activeTab === 'reviews' && (
              <div className="space-y-8" style={{ animation:'fadeIn .3s ease both' }}>
                {pendingReviews.length > 0 && (
                  <div>
                    <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-4">
                      En attente <span className="font-['Cormorant_Garamond',serif] text-[#C87D87] not-italic text-sm">{pendingReviews.length}</span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingReviews.map(r => (
                        <div key={r.id} className="rev-card">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#C87D87]/15 flex items-center justify-center text-[#C87D87] font-bold text-sm flex-shrink-0">
                              {r.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{r.user.fullName}</p>
                              <span className="text-[#C87D87] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                            </div>
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a] leading-relaxed mb-4 line-clamp-3">{r.comment}</p>
                          <div className="flex gap-2">
                            <button onClick={() => approveReview(r.id)} className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#6B7556] border border-[#6B7556]/35 py-2 rounded-xl hover:bg-[#6B7556] hover:text-white transition-all">Approuver</button>
                            <button onClick={() => deleteReview(r.id)}  className="flex-1 font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#C87D87] border border-[#C87D87]/35 py-2 rounded-xl hover:bg-[#C87D87] hover:text-white transition-all">Supprimer</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027] mb-4">
                    Publiés <span className="font-['Cormorant_Garamond',serif] text-[#6B7556] not-italic text-sm">{approvedReviews.length}</span>
                  </h3>
                  {approvedReviews.length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/35 text-center py-10">Aucun avis publié</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedReviews.map(r => (
                        <div key={r.id} className="rev-card group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B7556] to-[#C87D87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {r.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{r.user.fullName}</p>
                              <span className="text-[#6B7556] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                            </div>
                          </div>
                          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a] leading-relaxed mb-4 line-clamp-3">{r.comment}</p>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase text-[#6B7556] bg-[#6B7556]/10 border border-[#6B7556]/22 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7556]"/> Publié
                            </span>
                            <button onClick={() => deleteReview(r.id)} className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#C87D87]/30 hover:text-[#C87D87] transition-colors opacity-0 group-hover:opacity-100">
                              Retirer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* ═══════════════════════════════════════
            BOOKING DETAIL MODAL
        ═══════════════════════════════════════ */}
        {selectedBooking && (() => {
          const b           = selectedBooking;
          const s           = getStatus(b.status);
          const slot        = TIME_SLOTS.find(t => t.hours === b.timeSlot) ?? null;
          const setting     = SETTINGS_MAP[b.setting] ?? null;
          const img         = ACTIVITY_IMGS[b.activity] ?? 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b';
          const guests      = Number(b.participants) || 0;
          const total       = b.totalPrice > 0 ? b.totalPrice : guests * 150;
          const isPending   = (b.status || 'pending').toLowerCase() === 'pending';
          const isConfirmed = b.status?.toLowerCase() === 'confirmed';
          const isCancelled = b.status?.toLowerCase() === 'cancelled';
          const isCompleted = b.status?.toLowerCase() === 'completed';

          return (
            <div className="bmodal-bg fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedBooking(null)}>
              <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}
                style={{ animation:'slideUp .35s cubic-bezier(.4,0,.2,1) both' }}>
                <div className="bg-[#fef6ec] text-[#3a3027] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(58,48,39,0.35)] border border-[#C87D87]/20 relative">
                  <div className="h-1.5 bg-gradient-to-r from-[#C87D87] via-[#b5726e] to-[#6B7556]"/>
                  <div className="absolute top-0 left-0 z-10"><LaceCorner/></div>
                  <div className="absolute top-0 right-0 z-10"><LaceCorner flip/></div>

                  <div className="relative h-32 overflow-hidden">
                    <img src={img} alt={b.activity} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a3027]/65 to-[#3a3027]/10"/>
                    <button onClick={() => setSelectedBooking(null)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white/80 hover:text-white transition-all text-sm z-10">
                      ✕
                    </button>
                    <p className="absolute bottom-3 left-5 font-['Playfair_Display',serif] italic text-white text-xl">{b.activity}</p>
                    <div className="absolute bottom-3 right-5 flex items-center gap-2">
                      {b.user?.isDeleted && <DeletedBadge/>}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-widest uppercase ${s.bg} ${s.border} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 pt-5 pb-2">
                    {[
                      { label: 'Name',       value: b.fullName || b.user?.fullName },
                      { label: 'Email',      value: b.email },
                      { label: 'Phone',      value: b.phone || null },
                      { label: 'Contact via',value: b.preferredContact ? b.preferredContact.charAt(0).toUpperCase() + b.preferredContact.slice(1) : null },
                      { label: 'Date',       value: b.date ? new Date(b.date).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—' },
                      { label: 'Time',       value: b.timeSlot ? `${b.timeSlot}${slot ? `  ·  ${slot.icon} ${slot.label}` : ''}` : '—' },
                      { label: 'Guests',     value: `${b.participants} people` },
                      { label: 'Setting',    value: setting ? `${setting.icon}  ${setting.label}` : (b.setting || null) },
                      { label: 'Theme',      value: b.activityTheme || null },
                      { label: 'Notes',      value: b.message || b.notes || null },
                    ].filter(row => row.value !== null && row.value !== undefined).map((row, i) => (
                      <div key={i} className="flex items-start gap-4 py-3 border-b border-[#C87D87]/10 last:border-0">
                        <span className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase text-[#7a6a5a]/50 w-20 flex-shrink-0 pt-0.5">{row.label}</span>
                        <span className={`font-['Cormorant_Garamond',serif] text-sm flex-1 leading-relaxed
                          ${row.label==='Notes' ? 'italic text-[#7a6a5a]/80 bg-[#C87D87]/6 border border-[#C87D87]/14 rounded-xl px-3 py-2'
                            : row.label==='Contact via' ? 'text-[#C87D87] font-semibold'
                            : row.label==='Theme' ? 'italic text-[#C87D87]/80'
                            : 'text-[#3a3027]'}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mx-6 mb-5 mt-1 bg-[#6B7556]/10 border border-[#6B7556]/20 rounded-xl px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-['Cormorant_Garamond',serif] text-[0.58rem] tracking-widest uppercase text-[#7a6a5a]/50 mb-0.5">Total</p>
                      <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70">{b.participants} guests × 150 MAD</p>
                    </div>
                    <p className="font-['Playfair_Display',serif] italic text-2xl text-[#6B7556]">{total} MAD</p>
                  </div>

                  <div className="px-6 pb-6 flex gap-3 flex-wrap">
                    {isPending && (
                      <button onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="flex-[2] min-w-[120px] font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.25em] uppercase py-3.5 rounded-xl text-white transition-all duration-300 shadow-[0_8px_24px_rgba(107,117,86,0.3)]"
                        style={{ background:'linear-gradient(135deg,#6B7556,#4a5240)' }}>
                        ✓ Confirm Booking
                      </button>
                    )}
                    {isConfirmed && (
                      <button onClick={() => updateBookingStatus(b.id, 'completed')}
                        className="flex-[2] min-w-[120px] font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.25em] uppercase py-3.5 rounded-xl border border-[#6B7556]/40 text-[#6B7556] hover:bg-[#6B7556]/12 transition-all">
                        ✓ Mark as Completed
                      </button>
                    )}
                    {(isPending || isConfirmed) && (
                      <button onClick={() => updateBookingStatus(b.id, 'cancelled')}
                        className="flex-1 min-w-[80px] font-['Cormorant_Garamond',serif] text-[0.62rem] tracking-[.25em] uppercase py-3.5 rounded-xl border border-[#C87D87]/28 text-[#C87D87]/70 hover:bg-[#C87D87]/8 hover:text-[#C87D87] transition-all">
                        Cancel
                      </button>
                    )}
                    {(isCompleted || isCancelled) && (
                      <div className={`flex-1 font-['Cormorant_Garamond',serif] italic text-xs text-center py-3.5 rounded-xl border
                        ${isCompleted ? 'border-[#6B7556]/20 text-[#6B7556]/60 bg-[#6B7556]/5' : 'border-[#C87D87]/20 text-[#C87D87]/50 bg-[#C87D87]/5'}`}>
                        {isCompleted ? 'This booking is completed.' : 'This booking was cancelled.'}
                      </div>
                    )}
                    <button onClick={() => deleteBooking(b.id)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl border border-red-200/40 text-red-400/40 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════
            USER DRAWER
        ═══════════════════════════════════════ */}
        {selectedUser && (
          <>
            <div className="fixed inset-0 bg-[#3a3027]/40 backdrop-blur-sm z-50" onClick={() => setSelectedUser(null)}/>
            <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#fef6ec] z-50 overflow-y-auto shadow-[0_0_64px_rgba(58,48,39,0.25)] flex flex-col text-[#3a3027] border-l border-[#C87D87]/15"
              style={{ animation:'slideIn .3s cubic-bezier(.4,0,.2,1) both' }}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C87D87] to-[#6B7556]"/>

              <div className="flex items-center justify-between px-8 py-5 border-b border-[#C87D87]/12 sticky top-0 bg-[#fef6ec] z-10">
                <div className="absolute top-0 left-0 pointer-events-none"><LaceCorner/></div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-['Playfair_Display',serif] font-bold text-lg flex-shrink-0 ${selectedUser.role==='admin'?'bg-[#6B7556]':'bg-[#C87D87]'}`}>
                    {selectedUser.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027]">{selectedUser.fullName}</h3>
                      {selectedUser.isDeleted && <DeletedBadge/>}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#7a6a5a]/60">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedUser.role !== 'admin' && !selectedUser.isDeleted && (
                    <button
                      onClick={() => { toggleSuspend(selectedUser.id, selectedUser.suspended); setSelectedUser({...selectedUser, suspended: !selectedUser.suspended}); }}
                      className={`font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-widest uppercase px-4 py-2 rounded-xl border transition-all
                        ${selectedUser.suspended ? 'text-[#6B7556] border-[#6B7556]/35 hover:bg-[#6B7556]/8' : 'text-[#C87D87] border-[#C87D87]/35 hover:bg-[#C87D87]/8'}`}>
                      {selectedUser.suspended ? 'Restaurer' : 'Suspendre'}
                    </button>
                  )}
                  <button onClick={() => setSelectedUser(null)}
                    className="w-7 h-7 rounded-full border border-[#C87D87]/22 flex items-center justify-center text-[#7a6a5a]/50 hover:text-[#C87D87] transition-all font-['Cormorant_Garamond',serif]">✕</button>
                </div>
              </div>

              <div className="px-8 py-6 space-y-6 flex-1">

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'Rôle',   value: selectedUser.role, color: selectedUser.role==='admin'?'#6B7556':'#C87D87' },
                    { label:'Statut', value: selectedUser.isDeleted ? 'Deleted' : selectedUser.suspended?'Suspendu':'Actif', color: selectedUser.isDeleted?'#9ca3af':selectedUser.suspended?'#ef4444':'#6B7556' },
                    { label:'Depuis', value: new Date(selectedUser.createdAt).toLocaleDateString('fr-FR',{month:'short',year:'numeric'}), color:'#3a3027' },
                  ].map(m => (
                    <div key={m.label} className="bg-white/60 border border-[#C87D87]/12 rounded-xl p-3 text-center">
                      <p className="font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-widest uppercase text-[#7a6a5a]/40 mb-1">{m.label}</p>
                      <p className="font-['Cormorant_Garamond',serif] text-sm font-semibold capitalize" style={{color:m.color}}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* User bookings */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Réservations <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#C87D87]">{userBookings(selectedUser).length}</span>
                  </h4>
                  {userBookings(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm text-center py-4 bg-white/50 rounded-xl border border-[#C87D87]/10">Aucune réservation</p>
                  ) : userBookings(selectedUser).map(b => {
                    const s = getStatus(b.status);
                    return (
                      <div key={b.id}
                        onClick={() => { setSelectedUser(null); setTimeout(() => setSelectedBooking(b), 200); }}
                        className="bg-white/60 border border-[#C87D87]/12 rounded-xl px-4 py-3 mb-2 cursor-pointer hover:border-[#C87D87]/35 hover:bg-white/80 transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{b.activity}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {b.activityTheme && <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60">{b.activityTheme}</p>}
                              {b.date && <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/50">{new Date(b.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</p>}
                              {b.timeSlot && <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/65">{b.timeSlot}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-widest uppercase ${s.bg} ${s.border} ${s.text}`}>
                              <span className={`w-1 h-1 rounded-full ${s.dot}`}/>{s.label}
                            </span>
                            {b.totalPrice > 0 && <span className="font-['Playfair_Display',serif] italic text-sm text-[#6B7556]">{b.totalPrice} MAD</span>}
                          </div>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[0.58rem] text-[#C87D87]/35 mt-1.5">Cliquez pour voir les détails →</p>
                      </div>
                    );
                  })}
                </div>

                {/* User payments */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Paiements <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#6B7556]">{userPayments(selectedUser).length}</span>
                  </h4>
                  {userPayments(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm text-center py-4 bg-white/50 rounded-xl border border-[#C87D87]/10">Aucun paiement</p>
                  ) : userPayments(selectedUser).map(p => (
                    <div key={p.id} className="bg-white/60 border border-[#6B7556]/12 rounded-xl px-4 py-3 mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027] font-semibold truncate">{p.activity}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.timeSlot && <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/60">{p.timeSlot}</p>}
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/45">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                          </p>
                        </div>
                      </div>
                      <p className="font-['Playfair_Display',serif] italic text-lg text-[#6B7556] flex-shrink-0">{p.totalPrice||p.advancePaid||0} MAD</p>
                    </div>
                  ))}
                </div>

                {/* User reviews */}
                <div>
                  <h4 className="font-['Playfair_Display',serif] italic text-base text-[#3a3027] mb-3 flex items-center gap-2">
                    Avis <span className="font-['Cormorant_Garamond',serif] not-italic text-sm text-[#C87D87]">{userReviews(selectedUser).length}</span>
                  </h4>
                  {userReviews(selectedUser).length === 0 ? (
                    <p className="font-['Cormorant_Garamond',serif] italic text-[#7a6a5a]/40 text-sm text-center py-4 bg-white/50 rounded-xl border border-[#C87D87]/10">Aucun avis</p>
                  ) : userReviews(selectedUser).map(r => {
                    const isApproved = approvedReviews.some(a => a.id===r.id);
                    return (
                      <div key={r.id} className="bg-white/60 border border-[#C87D87]/12 rounded-xl px-4 py-3 mb-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs ${isApproved?'text-[#6B7556]':'text-[#C87D87]'}`}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                          </span>
                          <span className={`font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-widest uppercase px-2 py-0.5 rounded-full border
                            ${isApproved?'bg-[#6B7556]/8 text-[#4a5240] border-[#6B7556]/20':'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {isApproved?'Publié':'En attente'}
                          </span>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/80 leading-relaxed line-clamp-2">{r.comment}</p>
                        {!isApproved && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => approveReview(r.id)} className="font-['Cormorant_Garamond',serif] text-[0.56rem] tracking-widest uppercase px-3 py-1 border border-[#6B7556]/35 text-[#6B7556] hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">Approuver</button>
                            <button onClick={() => deleteReview(r.id)}  className="font-['Cormorant_Garamond',serif] text-[0.56rem] tracking-widest uppercase px-3 py-1 border border-[#C87D87]/35 text-[#C87D87] hover:bg-[#C87D87] hover:text-white transition-all rounded-lg">Supprimer</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}
