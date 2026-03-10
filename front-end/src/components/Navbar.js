'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const displayName = user?.fullName ?? user?.full_name ?? user?.name ?? user?.email ?? '?';
  const avatarUrl = user?.avatarUrl ?? null;
  const unreadNotifs = notifications.filter(n => !n.read);

  // ✅ Fetch notifications (only when logged in and not admin)
  const fetchNotifications = async () => {
    if (!user || isAdmin) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        credentials: 'include',
      });
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (user && !isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close both dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const handlePaymentClick = () => {
    setDropdownOpen(false);
    setShowPaymentModal(true);
  };

  // ✅ Notification actions
  const markAsRead = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH', credentials: 'include',
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
      method: 'PATCH', credentials: 'include',
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleCheckout = async (notif) => {
    await markAsRead(notif.id);
    setNotifOpen(false);
    setDropdownOpen(false);
    router.push(`/checkout?bookingId=${notif.bookingId}`);
  };

  if (loading) return null;

  const Avatar = ({ size = 8, textSize = 'text-sm' }) => (
    avatarUrl ? (
      <img
        src={`http://localhost:4000${avatarUrl}`}
        alt="avatar"
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 shadow-sm transition-all duration-300 ${
          dropdownOpen ? 'ring-2 ring-[#C87D87]' : 'ring-2 ring-[#C87D87]/30 group-hover:ring-[#C87D87]'
        }`}
      />
    ) : (
      <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold ${textSize} flex-shrink-0 shadow-sm transition-all duration-300 ${
        dropdownOpen ? 'ring-2 ring-[#C87D87]' : 'ring-2 ring-[#C87D87]/30 group-hover:ring-[#C87D87]'
      }`}>
        {displayName.charAt(0).toUpperCase()}
      </div>
    )
  );

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
      scrolled
        ? 'bg-[#6B7556]/98 border-b border-[#C87D87]/20 shadow-[0_2px_24px_rgba(107,117,86,0.15)] py-3'
        : 'bg-[#6B7556]/85 backdrop-blur-sm border-b border-[#C87D87]/10 py-5'
    }`}>

      {/* ── TOP ORNAMENTAL LINE ── */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/60 to-transparent" />

      {/* ── CORNER SVG MOTIFS ── */}
      {[
        { pos:'top-1 left-1',     rot:'rotate-0'   },
        { pos:'top-1 right-1',    rot:'rotate-90'  },
        { pos:'bottom-1 right-1', rot:'rotate-180' },
        { pos:'bottom-1 left-1',  rot:'-rotate-90' },
      ].map(({ pos, rot }, i) => (
        <div key={i} className={`absolute ${pos} w-10 h-10 pointer-events-none`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={rot}>
            <line x1="0"  y1="1"  x2="20" y2="1"  stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55" />
            <line x1="1"  y1="0"  x2="1"  y2="20" stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55" />
            <line x1="4"  y1="6"  x2="15" y2="6"  stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38" />
            <line x1="6"  y1="4"  x2="6"  y2="15" stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38" />
            <rect x="2.5" y="2.5" width="6" height="6" transform="rotate(45 5.5 5.5)"
              fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.85" />
            <circle cx="5.5" cy="5.5" r="0.9" fill="#C87D87" fillOpacity="0.45" />
            <rect x="11" y="2" width="3.5" height="3.5" transform="rotate(45 12.75 3.75)"
              fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35" />
            <rect x="2" y="11" width="3.5" height="3.5" transform="rotate(45 3.75 12.75)"
              fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35" />
            <circle cx="10" cy="6" r="0.8" fill="#C87D87" fillOpacity="0.22" />
            <circle cx="14" cy="6" r="0.6" fill="#C87D87" fillOpacity="0.16" />
            <circle cx="6" cy="10" r="0.8" fill="#C87D87" fillOpacity="0.22" />
            <circle cx="6" cy="14" r="0.6" fill="#C87D87" fillOpacity="0.16" />
            {[8, 12, 16].map((x, j) => (
              <line key={j} x1={x} y1="1" x2={x} y2={j % 2 === 0 ? 4 : 3}
                stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28" />
            ))}
            {[8, 12, 16].map((y, j) => (
              <line key={j} x1="1" y1={y} x2={j % 2 === 0 ? 4 : 3} y2={y}
                stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28" />
            ))}
            {[7, 10, 13, 16].map((x, j) => (
              <circle key={j} cx={x} cy="3.5" r="0.4" fill="#C87D87" fillOpacity={0.08 + j * 0.03} />
            ))}
            {[7, 10, 13, 16].map((y, j) => (
              <circle key={j} cx="3.5" cy={y} r="0.4" fill="#C87D87" fillOpacity={0.08 + j * 0.03} />
            ))}
          </svg>
        </div>
      ))}

      {/* ── TOP CENTRE ORNAMENT ── */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30" />
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <g transform="translate(10 6)">
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5" />
            <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35" />
            <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35" />
            <circle cx="0" cy="0" r="1" fill="#C87D87" fillOpacity="0.5" />
          </g>
        </svg>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30" />
      </div>

      {/* ── BOTTOM CENTRE ORNAMENT ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C87D87]/25" />
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <g transform="translate(10 6)">
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28" />
            <line x1="2.8" y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28" />
            <circle cx="0" cy="0" r="0.9" fill="#C87D87" fillOpacity="0.4" />
          </g>
        </svg>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#C87D87]/25" />
      </div>

      {/* ── NAV CONTENT ── */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-10">

        {/* LOGO */}
        <Link href="/" className="flex flex-col items-start group">
          <h1 className="font-['Playfair_Display',serif] italic text-[1.6rem] text-[#FBEAD6] tracking-wide leading-none group-hover:text-[#C87D87] transition-colors duration-300">
            Inora
          </h1>
          <div className="w-full h-px bg-gradient-to-r from-[#FBEAD6]/50 via-[#FBEAD6]/20 to-transparent mt-1" />
        </Link>

        {/* CENTER LINKS */}
        <ul className="hidden md:flex gap-10 list-none absolute left-1/2 -translate-x-1/2">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <li key={item} className="relative group">
              <Link
                href={item === 'Home' ? '/' : `#${item.toLowerCase()}`}
                className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase text-[#FBEAD6]/80 hover:text-[#C87D87] transition-colors duration-300"
              >
                {item}
              </Link>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#C87D87] group-hover:w-full transition-all duration-300" />
            </li>
          ))}
          {isAdmin && (
            <li className="relative group">
              <Link href="/admin"
                className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.22em] uppercase text-[#C87D87] hover:text-[#FBEAD6] transition-colors duration-300">
                Admin
              </Link>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#FBEAD6] group-hover:w-full transition-all duration-300" />
            </li>
          )}
        </ul>

        {/* AUTH */}
        {user ? (
          <div className="flex items-center gap-3">

            {/* ✅ NOTIFICATION BELL — only for non-admin users */}
            {!isAdmin && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full border border-[#FBEAD6]/20 hover:border-[#C87D87]/50 hover:bg-[#C87D87]/10 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#FBEAD6]/70 hover:text-[#C87D87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[0.5rem] font-bold animate-pulse">
                      {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* ✅ NOTIFICATION DROPDOWN */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-96 z-[100] bg-[#FBEAD6] border border-[#C87D87]/20 shadow-[0_20px_60px_rgba(200,125,135,0.2)] animate-[fadeInUp_0.2s_ease_forwards]">

                    {/* Notif header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#C87D87]/15 bg-[#FBEAD6]">
                      <div>
                        <p className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">Notifications</p>
                        {unreadNotifs.length > 0 && (
                          <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]">
                            {unreadNotifs.length} non lue{unreadNotifs.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      {unreadNotifs.length > 0 && (
                        <button onClick={markAllAsRead}
                          className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#6B7556] border border-[#6B7556]/30 px-3 py-1.5 hover:bg-[#6B7556] hover:text-white transition-all">
                          Tout lire
                        </button>
                      )}
                    </div>

                    {/* Notif list */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#C87D87]/8">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/40 text-base">— Aucune notification —</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id}
                            className={`px-5 py-4 transition-colors duration-200 ${!notif.read ? 'bg-[#C87D87]/6' : 'hover:bg-[#C87D87]/4'}`}>
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!notif.read ? 'bg-green-100 border border-green-300' : 'bg-[#C87D87]/10 border border-[#C87D87]/20'}`}>
                                <span className="text-base">{!notif.read ? '🎉' : '✓'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`font-['Playfair_Display',serif] italic text-sm leading-tight ${!notif.read ? 'text-[#3a3027]' : 'text-[#5a4a3a]'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.read && (
                                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5 animate-pulse" />
                                  )}
                                </div>
                                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/80 mt-1 leading-relaxed line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] text-[#C87D87]/50 mt-1.5">
                                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>

                                {/* ✅ Checkout CTA — only for unread booking confirmations */}
                                {notif.type === 'BOOKING_CONFIRMED' && !notif.read && (
                                  <button
                                    onClick={() => handleCheckout(notif)}
                                    className="mt-3 w-full font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.2em] uppercase text-white bg-[#6B7556] px-4 py-2.5 hover:bg-[#4a5240] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                    </svg>
                                    Procéder au paiement →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom ornament */}
                    <div className="flex items-center justify-center gap-2 py-2 border-t border-[#C87D87]/10">
                      <div className="w-6 h-px bg-[#C87D87]/20" />
                      <span className="text-[#C87D87]/30 text-[0.5rem]">✦</span>
                      <div className="w-6 h-px bg-[#C87D87]/20" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USER AVATAR + DROPDOWN */}
            <div ref={dropdownRef}>
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <Avatar size={8} textSize="text-sm" />
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="font-['Cormorant_Garamond',serif] text-sm italic text-[#FBEAD6]/80 tracking-wide group-hover:text-[#C87D87] transition-colors duration-300">
                    {displayName}
                  </span>
                  {isAdmin && (
                    <span className="font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.15em] uppercase text-[#6B7556] bg-[#FBEAD6]/80 px-1.5 py-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg"
                  className={`hidden lg:block w-3 h-3 text-[#FBEAD6]/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-[#C87D87]' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN */}
              {dropdownOpen && (
                <div className="absolute top-full right-8 mt-3 w-64 bg-[#FBEAD6] border border-[#C87D87]/20 shadow-[0_12px_40px_rgba(58,48,39,0.15)] z-[100] animate-[fadeInUp_0.2s_ease_forwards]">

                  {[
                    { pos:'top-1 left-1',  rot:'rotate-0'  },
                    { pos:'top-1 right-1', rot:'rotate-90' },
                  ].map(({ pos, rot }, i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={rot}>
                        <line x1="0" y1="1"  x2="10" y2="1"  stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.45" />
                        <line x1="1" y1="0"  x2="1"  y2="10" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.45" />
                        <rect x="2" y="2" width="4" height="4" transform="rotate(45 4 4)"
                          fill="none" stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.7" />
                        <circle cx="4" cy="4" r="0.7" fill="#C87D87" fillOpacity="0.4" />
                      </svg>
                    </div>
                  ))}

                  {/* User info */}
                  <div className="px-5 pt-5 pb-4 border-b border-[#C87D87]/10">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={`http://localhost:4000${avatarUrl}`} alt="avatar"
                          className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-[#C87D87]/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C87D87] to-[#FBEAD6] flex items-center justify-center text-[#6B7556] font-['Playfair_Display',serif] font-bold text-base shadow-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-['Playfair_Display',serif] italic text-sm text-[#3a3027] leading-tight">{displayName}</p>
                          <span className={`font-['Cormorant_Garamond',serif] text-[0.5rem] tracking-[0.15em] uppercase px-1.5 py-0.5 ${
                            isAdmin ? 'text-white bg-[#6B7556]' : 'text-[#C87D87] bg-[#C87D87]/10'
                          }`}>
                            {isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </div>
                        <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a] tracking-wide">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={handlePaymentClick}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#C87D87]/8 transition-colors group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/60 group-hover:text-[#C87D87] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      <div className="text-left">
                        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] group-hover:text-[#C87D87] transition-colors">Payment</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#7a6a5a]">Manage your payments</p>
                      </div>
                    </button>

                    {isAdmin && (
                      <Link href="/admin" onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#C87D87]/8 transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/60 group-hover:text-[#C87D87] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] group-hover:text-[#C87D87] transition-colors">Admin Panel</p>
                      </Link>
                    )}

                    {!isAdmin && (
                      <Link href="/account" onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#C87D87]/8 transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/60 group-hover:text-[#C87D87] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] group-hover:text-[#C87D87] transition-colors">Settings</p>
                      </Link>
                    )}

                    <div className="mx-5 my-1 h-px bg-[#C87D87]/10" />

                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#C87D87]/8 transition-colors group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/60 group-hover:text-[#C87D87] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] group-hover:text-[#C87D87] transition-colors">Sign Out</p>
                    </button>
                  </div>

                  {/* Bottom ornament */}
                  <div className="flex items-center justify-center gap-2 py-2 border-t border-[#C87D87]/10">
                    <div className="w-6 h-px bg-[#C87D87]/20" />
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <g transform="translate(5 5)">
                        <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
                        <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
                        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.28" />
                        <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.28" />
                        <circle cx="0" cy="0" r="0.9" fill="#C87D87" fillOpacity="0.4" />
                      </g>
                    </svg>
                    <div className="w-6 h-px bg-[#C87D87]/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[#C87D87]/50 text-xs hidden lg:block">✦</span>
            <Link href="/login"
              className="font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.22em] uppercase text-[#FBEAD6] border border-[#FBEAD6]/40 px-5 py-1.5 hover:bg-[#C87D87] hover:text-white hover:border-[#C87D87] transition-all duration-300">
              Sign In
            </Link>
            <span className="text-[#C87D87]/50 text-xs hidden lg:block">✦</span>
          </div>
        )}
      </div>

      {/* ── BOTTOM ORNAMENTAL LINE ── */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent" />

      {/* ✅ PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-[#FBEAD6] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#FBEAD6] z-10 border-b border-[#C87D87]/20 px-6 py-4 flex justify-between items-center">
              <h2 className="font-['Playfair_Display',serif] italic text-xl text-[#3a3027]">Payment Methods</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-[#C87D87] hover:text-[#6B7556] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h3 className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-[#C87D87] mb-4">Saved Cards</h3>
                <div className="space-y-3">
                  {[
                    { last4: '4242', expiry: '12/25', isDefault: true },
                    { last4: '8888', expiry: '06/24', isDefault: false },
                  ].map(card => (
                    <div key={card.last4} className="flex items-center justify-between p-4 border border-[#C87D87]/20 bg-white/60">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-6 bg-gradient-to-r from-[#C87D87] to-[#6B7556] rounded" />
                        <div>
                          <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">•••• •••• •••• {card.last4}</p>
                          <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]">Expires {card.expiry}</p>
                        </div>
                      </div>
                      {card.isDefault
                        ? <span className="text-[#6B7556] text-xs border border-[#6B7556]/30 px-2 py-1">Default</span>
                        : <button className="text-[#C87D87] text-xs hover:text-[#6B7556] transition-colors">Edit</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-[#C87D87] mb-4">Add New Card</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Card Number', placeholder: '1234 5678 9012 3456', type: 'text', full: true },
                    { label: 'Expiry Date', placeholder: 'MM/YY', type: 'text', full: false },
                    { label: 'CVC', placeholder: '123', type: 'text', full: false },
                    { label: 'Cardholder Name', placeholder: 'John Doe', type: 'text', full: true },
                  ].filter((_, i, arr) => true).map((field, i) => (
                    field.full ? (
                      <div key={field.label}>
                        <label className="block font-['Cormorant_Garamond',serif] text-xs uppercase tracking-[0.15em] text-[#3a3027] mb-2">{field.label}</label>
                        <input type={field.type} placeholder={field.placeholder}
                          className="w-full bg-white/80 border border-[#C87D87]/30 px-4 py-3 text-sm text-[#3a3027] placeholder-[#C87D87]/40 focus:outline-none focus:border-[#C87D87] transition-colors" />
                      </div>
                    ) : null
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Expiry Date', placeholder: 'MM/YY' },
                      { label: 'CVC', placeholder: '123' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block font-['Cormorant_Garamond',serif] text-xs uppercase tracking-[0.15em] text-[#3a3027] mb-2">{field.label}</label>
                        <input type="text" placeholder={field.placeholder}
                          className="w-full bg-white/80 border border-[#C87D87]/30 px-4 py-3 text-sm text-[#3a3027] placeholder-[#C87D87]/40 focus:outline-none focus:border-[#C87D87] transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="defaultCard" className="accent-[#C87D87]" />
                    <label htmlFor="defaultCard" className="font-['Cormorant_Garamond',serif] text-sm text-[#3a3027]">Set as default payment method</label>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-[#C87D87] mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Beach Adventure', date: 'Mar 15, 2024', amount: '$299.00' },
                    { name: 'Mountain Hiking', date: 'Feb 28, 2024', amount: '$149.00' },
                  ].map(tx => (
                    <div key={tx.name} className="flex items-center justify-between py-2 border-b border-[#C87D87]/10">
                      <div>
                        <p className="font-['Playfair_Display',serif] text-sm text-[#3a3027]">{tx.name}</p>
                        <p className="font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]">{tx.date}</p>
                      </div>
                      <span className="font-['Playfair_Display',serif] text-sm text-[#6B7556]">{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-[#FBEAD6] border-t border-[#C87D87]/20 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowPaymentModal(false)}
                className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#C87D87] border border-[#C87D87] px-6 py-2 hover:bg-[#C87D87] hover:text-white transition-colors">
                Cancel
              </button>
              <button className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-white bg-[#C87D87] px-6 py-2 hover:bg-[#6B7556] transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

