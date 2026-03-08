'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [scrolled,     setScrolled]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin     = user?.role === 'admin';
  const displayName = user?.fullName ?? user?.full_name ?? user?.name ?? user?.email ?? '?';
  const avatarUrl   = user?.avatarUrl ?? null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
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

      {/* ── CORNER SVG MOTIFS ── scaled-down version of page lace frame corners */}
      {[
        { pos:'top-1 left-1',     rot:'rotate-0'   },
        { pos:'top-1 right-1',    rot:'rotate-90'  },
        { pos:'bottom-1 right-1', rot:'rotate-180' },
        { pos:'bottom-1 left-1',  rot:'-rotate-90' },
      ].map(({ pos, rot }, i) => (
        <div key={i} className={`absolute ${pos} w-10 h-10 pointer-events-none`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={rot}>
            {/* Outer L */}
            <line x1="0"  y1="1"  x2="20" y2="1"  stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55" />
            <line x1="1"  y1="0"  x2="1"  y2="20" stroke="#C87D87" strokeWidth="0.9" strokeOpacity="0.55" />
            {/* Echo L */}
            <line x1="4"  y1="6"  x2="15" y2="6"  stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38" />
            <line x1="6"  y1="4"  x2="6"  y2="15" stroke="#C87D87" strokeWidth="0.55" strokeOpacity="0.38" />
            {/* Corner diamond */}
            <rect x="2.5" y="2.5" width="6" height="6" transform="rotate(45 5.5 5.5)"
              fill="none" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.85" />
            {/* Centre dot */}
            <circle cx="5.5" cy="5.5" r="0.9" fill="#C87D87" fillOpacity="0.45" />
            {/* Small secondary diamond along H-edge */}
            <rect x="11" y="2" width="3.5" height="3.5" transform="rotate(45 12.75 3.75)"
              fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35" />
            {/* Small secondary diamond along V-edge */}
            <rect x="2" y="11" width="3.5" height="3.5" transform="rotate(45 3.75 12.75)"
              fill="none" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.35" />
            {/* Petal dots — H */}
            <circle cx="10" cy="6" r="0.8" fill="#C87D87" fillOpacity="0.22" />
            <circle cx="14" cy="6" r="0.6" fill="#C87D87" fillOpacity="0.16" />
            {/* Petal dots — V */}
            <circle cx="6" cy="10" r="0.8" fill="#C87D87" fillOpacity="0.22" />
            <circle cx="6" cy="14" r="0.6" fill="#C87D87" fillOpacity="0.16" />
            {/* Tick marks — H */}
            {[8, 12, 16].map((x, j) => (
              <line key={j} x1={x} y1="1" x2={x} y2={j % 2 === 0 ? 4 : 3}
                stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28" />
            ))}
            {/* Tick marks — V */}
            {[8, 12, 16].map((y, j) => (
              <line key={j} x1="1" y1={y} x2={j % 2 === 0 ? 4 : 3} y2={y}
                stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.28" />
            ))}
            {/* Dot trail — H */}
            {[7, 10, 13, 16].map((x, j) => (
              <circle key={j} cx={x} cy="3.5" r="0.4"
                fill="#C87D87" fillOpacity={0.08 + j * 0.03} />
            ))}
            {/* Dot trail — V */}
            {[7, 10, 13, 16].map((y, j) => (
              <circle key={j} cx="3.5" cy={y} r="0.4"
                fill="#C87D87" fillOpacity={0.08 + j * 0.03} />
            ))}
          </svg>
        </div>
      ))}

      {/* ── TOP CENTRE ORNAMENT ── SVG ✦ with flanking lines */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30" />
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <g transform="translate(10 6)">
            <line x1="-4" y1="0"    x2="4"   y2="0"   stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5" />
            <line x1="0"  y1="-4"   x2="0"   y2="4"   stroke="#C87D87" strokeWidth="0.6" strokeOpacity="0.5" />
            <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35" />
            <line x1="2.8"  y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.4" strokeOpacity="0.35" />
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
            <line x1="-4" y1="0"    x2="4"   y2="0"   stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="0"  y1="-4"   x2="0"   y2="4"   stroke="#C87D87" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28" />
            <line x1="2.8"  y1="-2.8" x2="-2.8" y2="2.8" stroke="#C87D87" strokeWidth="0.35" strokeOpacity="0.28" />
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
          <div className="flex items-center gap-3" ref={dropdownRef}>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
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

                {/* Dropdown corner accents — same SVG motif, even smaller */}
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
                  {!isAdmin && (
                    <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#C87D87]/8 transition-colors group">
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C87D87]/60 group-hover:text-[#C87D87] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#C87D87] rounded-full" />
                      </div>
                      <div className="text-left">
                        <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] group-hover:text-[#C87D87] transition-colors">Notifications</p>
                        <p className="font-['Cormorant_Garamond',serif] italic text-[0.65rem] text-[#7a6a5a]">2 new updates</p>
                      </div>
                    </button>
                  )}
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

    </nav>
  );
}
