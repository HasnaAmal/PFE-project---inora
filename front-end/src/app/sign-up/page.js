'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    try {
      await register(form.fullName, form.email, form.password, adminCode || undefined);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  const handleAdminSubmit = () => {
    setShowAdminPopup(false);
    // The admin code is already stored in state, will be used when form is submitted
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-6 sm:py-10"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
    >
      <style>{`
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes lacePulse  { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes formIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popupIn    { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shimmer    { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
        
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0px 1000px rgba(255,255,255,0.5) inset;
          -webkit-text-fill-color:#3a3027;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          input, button {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* NOISE */}
      <div className="absolute inset-0 opacity-[0.02] sm:opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize:'150px' }} />

      {/* ORBS */}
      <div className="absolute -top-10 -left-10 w-40 sm:w-64 h-40 sm:h-64 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(251,234,214,0.08) 0%,transparent 70%)', animation:'floatOrb 10s ease-in-out infinite', filter:'blur(15px)' }} />
      <div className="absolute -bottom-10 -right-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(200,125,135,0.1) 0%,transparent 70%)', animation:'floatOrb 13s ease-in-out infinite 2s', filter:'blur(18px)' }} />

      {/* LACE SVG - hidden on mobile for performance */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:30}).map((_,row)=>
          Array.from({length:48}).map((_,col)=>{
            const x=col*32+(row%2===0?0:16), y=row*32;
            return <circle key={`d-${row}-${col}`} cx={x} cy={y} r="1.2" fill="#FBEAD6" fillOpacity="0.22"/>;
          })
        )}
        {Array.from({length:30}).map((_,row)=>
          Array.from({length:47}).map((_,col)=>{
            const x1=col*32+(row%2===0?0:16), y1=row*32;
            return <line key={`h-${row}-${col}`} x1={x1} y1={y1} x2={x1+32} y2={y1} stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>;
          })
        )}
        {Array.from({length:29}).map((_,row)=>
          Array.from({length:48}).map((_,col)=>{
            const x1=col*32+(row%2===0?0:16), y1=row*32;
            const x2=x1+(row%2===0?16:-16), y2=y1+32;
            return <line key={`dl-${row}-${col}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>;
          })
        )}
        {[
          {cx:120, cy:120},{cx:360,cy:80},{cx:720,cy:50},{cx:1080,cy:80},{cx:1320,cy:120},
          {cx:60,  cy:450},{cx:1380,cy:450},
          {cx:200, cy:790},{cx:720, cy:840},{cx:1240,cy:790},
          {cx:480, cy:185},{cx:960, cy:185},
          {cx:480, cy:695},{cx:960, cy:695},
          {cx:240, cy:340},{cx:1200,cy:340},
          {cx:240, cy:580},{cx:1200,cy:580},
        ].map(({cx,cy},i)=>(
          <g key={`m-${i}`} transform={`translate(${cx},${cy})`}
            style={{animation:`lacePulse ${3.5+(i%3)*0.8}s ease-in-out infinite ${i*0.25}s`}}>
            <circle r="28" fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.35" strokeDasharray="3 5"/>
            <circle r="20" fill="none" stroke="#FBEAD6" strokeWidth="0.55" strokeOpacity="0.30"/>
            <circle r="12" fill="none" stroke="#FBEAD6" strokeWidth="0.45" strokeOpacity="0.25"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,j)=>(
              <line key={j}
                x1={Math.cos(a*Math.PI/180)*5}  y1={Math.sin(a*Math.PI/180)*5}
                x2={Math.cos(a*Math.PI/180)*28} y2={Math.sin(a*Math.PI/180)*28}
                stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.28"/>
            ))}
            <rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.45"/>
            <circle r="1.5" fill="#FBEAD6" fillOpacity="0.45"/>
          </g>
        ))}
        {Array.from({length:9}).map((_,i)=>{
          const x=80+i*160;
          return (
            <g key={`st-${i}`}>
              <path d={`M${x},14 Q${x+80},50 ${x+160},14`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/>
              <circle cx={x+80} cy={50} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/>
              <circle cx={x}    cy={14} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/>
              <circle cx={x+160} cy={14} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/>
            </g>
          );
        })}
        {Array.from({length:9}).map((_,i)=>{
          const x=80+i*160;
          return (
            <g key={`sb-${i}`}>
              <path d={`M${x},886 Q${x+80},850 ${x+160},886`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/>
              <circle cx={x+80} cy={850} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/>
              <circle cx={x}    cy={886} r="1.4" fill="#FBEAD6" fillOpacity="0.32"/>
            </g>
          );
        })}
        {Array.from({length:6}).map((_,i)=>{
          const y=75+i*150;
          return (
            <g key={`sl-${i}`}>
              <path d={`M14,${y} Q50,${y+75} 14,${y+150}`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/>
              <circle cx={50} cy={y+75} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/>
            </g>
          );
        })}
        {Array.from({length:6}).map((_,i)=>{
          const y=75+i*150;
          return (
            <g key={`sr-${i}`}>
              <path d={`M1426,${y} Q1390,${y+75} 1426,${y+150}`} fill="none" stroke="#FBEAD6" strokeWidth="0.7" strokeOpacity="0.30"/>
              <circle cx={1390} cy={y+75} r="2.2" fill="#FBEAD6" fillOpacity="0.28"/>
            </g>
          );
        })}
        {[{cx:0,cy:0,s:0,e:90},{cx:1440,cy:0,s:90,e:180},{cx:1440,cy:900,s:180,e:270},{cx:0,cy:900,s:270,e:360}].map(({cx,cy,s,e},idx)=>(
          <g key={`cf-${idx}`}>
            {[55,90,125,160,195,230].map((r,i)=>(
              <path key={i}
                d={`M${cx+Math.cos(s*Math.PI/180)*r},${cy+Math.sin(s*Math.PI/180)*r} A${r},${r} 0 0 1 ${cx+Math.cos(e*Math.PI/180)*r},${cy+Math.sin(e*Math.PI/180)*r}`}
                fill="none" stroke="#FBEAD6" strokeWidth="0.55" strokeOpacity={0.18+i*0.04}
                style={{animation:`lacePulse ${3.5+i*0.5}s ease-in-out infinite ${i*0.3}s`}}/>
            ))}
            {Array.from({length:15}).map((_,j)=>{
              const a=(s+(e-s)/14*j)*Math.PI/180;
              return (
                <line key={j}
                  x1={cx+Math.cos(a)*30} y1={cy+Math.sin(a)*30}
                  x2={cx+Math.cos(a)*230} y2={cy+Math.sin(a)*230}
                  stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.16"/>
              );
            })}
            {[55,90,125,160,195,230].map((r,i)=>
              Array.from({length:7}).map((_,j)=>{
                const a=(s+(e-s)/6*j)*Math.PI/180;
                return <circle key={`fd-${i}-${j}`} cx={cx+Math.cos(a)*r} cy={cy+Math.sin(a)*r} r="1.2" fill="#FBEAD6" fillOpacity="0.30"/>;
              })
            )}
          </g>
        ))}
        <rect x="18" y="18" width="1404" height="864" rx="4"
          fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.18" strokeDasharray="6 10"/>
        <rect x="10" y="10" width="1420" height="880" rx="6"
          fill="none" stroke="#FBEAD6" strokeWidth="0.4" strokeOpacity="0.12" strokeDasharray="2 8"/>
        {[
          {cx:330,cy:200},{cx:1110,cy:200},{cx:720,cy:140},
          {cx:200,cy:490},{cx:1240,cy:490},
          {cx:330,cy:700},{cx:1110,cy:700},{cx:720,cy:760},
          {cx:560,cy:330},{cx:880,cy:330},
          {cx:560,cy:580},{cx:880,cy:580},
        ].map(({cx,cy},i)=>(
          <g key={`ld-${i}`} transform={`translate(${cx},${cy})`}
            style={{animation:`lacePulse ${4+i*0.2}s ease-in-out infinite ${i*0.4}s`}}>
            <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)"
              fill="none" stroke="#FBEAD6" strokeWidth="0.5" strokeOpacity="0.28"/>
            <rect x="-9" y="-9" width="18" height="18" transform="rotate(45)"
              fill="none" stroke="#FBEAD6" strokeWidth="0.35" strokeOpacity="0.18"/>
            <circle r="1.3" fill="#FBEAD6" fillOpacity="0.35"/>
          </g>
        ))}
      </svg>

      {/* MAIN FORM - Centered */}
      <div
        className="relative z-10 w-full max-w-[400px]"
        style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}
      >
        <form onSubmit={handleSubmit}
          className="relative w-full bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-4 sm:px-7 py-5 sm:py-6 shadow-[0_20px_60px_rgba(10,18,6,0.5)] sm:shadow-[0_32px_90px_rgba(10,18,6,0.55)]">

          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[3px] sm:inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <Link href="/"
              className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#C87D87] tracking-widest block mb-1 sm:mb-2 hover:text-[#a85e6a] transition-colors duration-300">
              Inora
            </Link>
            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 14 14" fill="none">
                <g transform="translate(7 7)">
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.6"/>
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#C87D87" strokeWidth="0.7" strokeOpacity="0.6"/>
                  <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.4"/>
                  <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#C87D87" strokeWidth="0.45" strokeOpacity="0.4"/>
                  <circle r="1.3" fill="#C87D87" fillOpacity="0.6"/>
                </g>
              </svg>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/30"/>
            </div>
            <h2 className="font-['Playfair_Display',serif] italic text-xl sm:text-2xl text-[#5a6347] leading-tight">
              Create Account
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 border border-[#C87D87]/25 bg-[#C87D87]/6 px-3 py-2 rounded-lg"
              style={{animation:'fadeInUp 0.3s ease forwards'}}>
              <span className="text-[#C87D87] text-[0.7rem] sm:text-xs flex-shrink-0 mt-0.5">◆</span>
              <p className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-[#C87D87]/90 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            {/* Full Name field */}
            <div className="group">
              <label className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-xs tracking-[0.16em] sm:tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text" placeholder="Your full name"
                  value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})}
                  required
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-2 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-[0.95rem] sm:text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
                />
                <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
              </div>
            </div>

            {/* Email field */}
            <div className="group">
              <label className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-xs tracking-[0.16em] sm:tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={e=>setForm({...form, email: e.target.value})}
                  required
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-2 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-[0.95rem] sm:text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
                />
                <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
              </div>
            </div>

            {/* Password field with eye button */}
            <div className="group">
              <label className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-xs tracking-[0.16em] sm:tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e=>setForm({...form, password: e.target.value})}
                  required
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-2 pr-10 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-[0.95rem] sm:text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C87D87]/50 hover:text-[#C87D87] transition-colors w-8 h-8 flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
              </div>
            </div>

            {/* Confirm Password field with eye button */}
            <div className="group">
              <label className="font-['Cormorant_Garamond',serif] text-[0.65rem] sm:text-xs tracking-[0.16em] sm:tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e=>setForm({...form, confirmPassword: e.target.value})}
                  required
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-2 pr-10 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-[0.95rem] sm:text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C87D87]/50 hover:text-[#C87D87] transition-colors w-8 h-8 flex items-center justify-center"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
              </div>
            </div>
          </div>

          {/* Admin toggle button */}
          <button type="button"
            onClick={()=> setShowAdminPopup(true)}
            className="w-full flex items-center justify-center gap-2.5 mt-4 group py-2.5 px-3 rounded-xl transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(200,125,135,0.12) 0%, rgba(200,125,135,0.06) 100%)',
              border: '1px solid rgba(200,125,135,0.25)',
            }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/20"/>
            <span className="font-['Cormorant_Garamond',serif] text-[0.7rem] sm:text-[0.75rem] tracking-[0.16em] sm:tracking-[0.18em] font-semibold transition-colors duration-300 flex items-center gap-2 text-[#C87D87]">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Register as Administrator
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/20"/>
          </button>

          {/* Submit button - changes color if admin code is entered */}
          <button type="submit" disabled={loading}
            className={`w-full mt-3 relative overflow-hidden font-['Cormorant_Garamond',serif] text-[0.75rem] sm:text-sm tracking-[0.24em] sm:tracking-[0.28em] uppercase text-white border-0 py-2.5 sm:py-3 min-h-[44px] sm:min-h-[48px] rounded-xl transition-all duration-300 disabled:opacity-50 group ${
              adminCode ? 'bg-[#C87D87] hover:bg-[#a85e6a]' : 'bg-[#6B7556] hover:bg-[#5a6347]'
            }`}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.45rem] sm:text-[0.5rem]">◆</span>
              {loading ? '— Creating —' : adminCode ? 'Create Admin Account' : 'Create Account'}
              <span className="opacity-50 text-[0.45rem] sm:text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </button>

          {/* Admin code indicator if entered */}
          {adminCode && (
            <div className="mt-2 text-center">
              <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#C87D87]/70 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C87D87]/60"></span>
                Admin mode active
                <button 
                  type="button"
                  onClick={() => setAdminCode('')}
                  className="text-[#C87D87]/50 hover:text-[#C87D87] ml-1"
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* Sign in */}
          <div className="flex items-center gap-3 mt-4 mb-3">
            <div className="flex-1 h-px bg-[#C87D87]/12"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-[#5a4a3a]/70 text-center">
            Already have an account?{' '}
            <Link href="/login"
              className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/25 pb-px">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      {/* ADMIN CODE POPUP MODAL */}
      {showAdminPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeInUp 0.2s ease forwards' }}
          onClick={() => setShowAdminPopup(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          {/* Popup Content */}
          <div 
            className="relative max-w-[320px] sm:max-w-[340px] w-full bg-[#3e4a2e] rounded-xl shadow-2xl overflow-hidden"
            style={{ animation: 'popupIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top border */}
            <div className="h-0.5 bg-gradient-to-r from-[#C87D87] via-[#FBEAD6] to-[#C87D87]" />
            
            {/* Close button */}
            <button
              onClick={() => setShowAdminPopup(false)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#FBEAD6]/10 transition-colors duration-200 z-10"
            >
              <svg className="w-3 h-3 text-[#FBEAD6]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C87D87]/20 mb-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12,2 L14,8 L20,9 L16,13.5 L17,20 L12,17 L7,20 L8,13.5 L4,9 L10,8 Z"
                      fill="none" stroke="#FBEAD6" strokeWidth="0.8" strokeOpacity="0.7"/>
                    <circle cx="12" cy="12" r="3" fill="none" stroke="#FBEAD6" strokeWidth="0.6" strokeOpacity="0.5"/>
                  </svg>
                </div>
                <h3 className="font-['Playfair_Display',serif] italic text-lg text-[#FBEAD6] mb-1">
                  Admin Access
                </h3>
                <div className="w-8 h-px bg-[#C87D87]/40 mx-auto" />
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#FBEAD6]/60 mt-2 leading-relaxed">
                  Enter verification code
                </p>
              </div>

              <div className="space-y-3">
                <div className="group">
                  <label className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.16em] uppercase text-[#FBEAD6]/55 font-semibold block mb-1">
                    Admin Code
                  </label>
                  <input
                    type="password" 
                    placeholder="••••••••"
                    value={adminCode} 
                    onChange={e => setAdminCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBEAD6]/10 border border-[#FBEAD6]/20 focus:border-[#C87D87]/50 focus:bg-[#FBEAD6]/15 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-sm text-[#FBEAD6] placeholder:text-[#FBEAD6]/30 tracking-widest transition-all duration-300"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-1.5 py-1">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${adminCode.length > 0 ? 'bg-[#C87D87]' : 'bg-[#FBEAD6]/30'}`}/>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] text-[#FBEAD6]/50">
                    {adminCode.length > 0 ? 'Code entered' : 'Waiting for code...'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowAdminPopup(false)}
                  className="flex-1 font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.16em] uppercase text-[#FBEAD6]/60 hover:text-[#FBEAD6] py-2 rounded-lg border border-[#FBEAD6]/20 hover:border-[#FBEAD6]/40 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminSubmit}
                  disabled={!adminCode}
                  className="flex-1 font-['Cormorant_Garamond',serif] text-[0.7rem] tracking-[0.2em] uppercase text-white bg-[#C87D87] hover:bg-[#a85e6a] py-2 rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}