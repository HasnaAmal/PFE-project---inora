'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

// ════════════════════════════════════════
//  LOGIN CONTENT (avec useSearchParams)
// ════════════════════════════════════════
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuspended = searchParams.get('suspended') === 'true';

  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('user');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (selectedRole === 'admin' && !adminCode.trim()) {
      setError('Admin code is required');
      return;
    }
    try {
      const data = await login(form.email, form.password, selectedRole, adminCode);
      const actualRole = data?.user?.role || data?.role;
      if (actualRole !== selectedRole) {
        setError(`You are not registered as ${selectedRole}`);
        return;
      }
      router.refresh();
      router.push(actualRole === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}
    >
      <style>{`
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes lacePulse  { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes formIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes adminSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0px 1000px rgba(255,255,255,0.5) inset;
          -webkit-text-fill-color:#3a3027;
        }
      `}</style>

      {/* NOISE */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize:'200px' }} />

      {/* ORBS */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(251,234,214,0.10) 0%,transparent 70%)', animation:'floatOrb 10s ease-in-out infinite', filter:'blur(18px)' }} />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 70%)', animation:'floatOrb 13s ease-in-out infinite 2s', filter:'blur(22px)' }} />

      {/* LACE SVG - identique à votre code, gardez tout ici */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {/* ... tout votre SVG existant (je le copie pas pour économiser de l'espace, mais gardez tout votre code SVG ici) ... */}
      </svg>

      {/* FORM */}
      <div className="relative z-10" style={{ animation:'formIn 0.9s cubic-bezier(.4,0,.2,1) forwards 0.2s', opacity:0 }}>
        <form onSubmit={handleSubmit}
          className="relative w-[370px] bg-[#FBEAD6]/92 backdrop-blur-xl border border-[#FBEAD6]/25 rounded-2xl px-7 py-6 shadow-[0_32px_90px_rgba(10,18,6,0.55)]">

          <div className="absolute inset-0 rounded-2xl border border-[#C87D87]/12 pointer-events-none"/>
          <div className="absolute inset-[5px] rounded-xl border border-[#C87D87]/8 pointer-events-none"/>

          {/* Header */}
          <div className="text-center mb-5">
            <Link href="/"
              className="font-['Playfair_Display',serif] italic text-2xl text-[#C87D87] tracking-widest block mb-2 hover:text-[#a85e6a] transition-colors duration-300">
              Inora
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/30"/>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            <p className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.32em] uppercase text-[#C87D87]/55 mb-1">
              Welcome Back
            </p>
            <h2 className="font-['Playfair_Display',serif] italic text-2xl text-[#5a6347] leading-tight">
              Sign In
            </h2>
          </div>

          {/* ROLE SELECTOR */}
          <div className="mb-4">
            <p className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#5a4a3a]/65 font-semibold mb-2 text-center">
              Sign in as
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button"
                onClick={()=>{ setSelectedRole('user'); setAdminCode(''); setError(''); }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-300 ${
                  selectedRole==='user'
                    ? 'border-[#6B7556]/60 bg-[#6B7556]/10'
                    : 'border-[#C87D87]/15 bg-transparent hover:border-[#C87D87]/30'
                }`}>
                <svg className={`w-5 h-5 transition-colors ${selectedRole==='user'?'text-[#6B7556]':'text-[#C87D87]/45'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.16em] uppercase font-semibold transition-colors ${selectedRole==='user'?'text-[#6B7556]':'text-[#7a6a5a]/70'}`}>
                  Member
                </span>
                {selectedRole==='user' && <div className="w-4 h-px bg-[#6B7556]/60"/>}
              </button>

              <button type="button"
                onClick={()=>{ setSelectedRole('admin'); setError(''); }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-300 ${
                  selectedRole==='admin'
                    ? 'border-[#C87D87]/55 bg-[#C87D87]/8'
                    : 'border-[#C87D87]/15 bg-transparent hover:border-[#C87D87]/30'
                }`}>
                <svg className={`w-5 h-5 transition-colors ${selectedRole==='admin'?'text-[#C87D87]':'text-[#C87D87]/45'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span className={`font-['Cormorant_Garamond',serif] text-xs tracking-[0.16em] uppercase font-semibold transition-colors ${selectedRole==='admin'?'text-[#C87D87]':'text-[#7a6a5a]/70'}`}>
                  Admin
                </span>
                {selectedRole==='admin' && <div className="w-4 h-px bg-[#C87D87]/60"/>}
              </button>
            </div>
          </div>

          {/* Suspended banner */}
          {isSuspended && !error && (
            <div className="mb-4 flex items-center gap-2 border border-[#C87D87]/35 bg-[#C87D87]/8 px-3 py-2.5 rounded-lg"
              style={{ animation:'fadeInUp 0.3s ease forwards' }}>
              <span className="text-[#C87D87] text-xs flex-shrink-0">◆</span>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]">
                Your account has been suspended. Please contact support.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 border border-[#C87D87]/25 bg-[#C87D87]/6 px-3 py-2 rounded-lg"
              style={{ animation:'fadeInUp 0.3s ease forwards' }}>
              <span className="text-[#C87D87] text-xs">◆</span>
              <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#C87D87]/90">{error}</p>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            {[
              { label:'Email',    key:'email',    type:'email',    placeholder:'you@example.com'     },
              { label:'Password', key:'password', type:'password', placeholder:'Enter your password' },
            ].map(({label,key,type,placeholder})=>(
              <div key={key} className="group">
                <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={type} placeholder={placeholder}
                    value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                    required
                    className="w-full px-3.5 py-2 bg-white/55 border border-[#C87D87]/18 focus:border-[#C87D87]/50 focus:bg-white/70 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300 group-hover:border-[#C87D87]/28"
                  />
                  <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
                </div>
              </div>
            ))}

            {selectedRole === 'admin' && (
              <div style={{ animation:'adminSlide 0.35s cubic-bezier(.4,0,.2,1) forwards' }}>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C87D87]/18"/>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[0.6rem] tracking-[0.2em] uppercase text-[#C87D87]/48">
                    Admin Verification
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C87D87]/18"/>
                </div>
                <div className="group">
                  <label className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.18em] uppercase text-[#5a4a3a]/75 font-semibold block mb-1">
                    Admin Code
                  </label>
                  <div className="relative">
                    <input
                      type="password" placeholder="Enter your admin code"
                      value={adminCode} onChange={e=>setAdminCode(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-[#C87D87]/5 border border-[#C87D87]/22 focus:border-[#C87D87]/50 focus:bg-[#C87D87]/8 focus:outline-none rounded-lg font-['Cormorant_Garamond',serif] italic text-sm text-[#3a3027] placeholder:text-[#7a6a5a]/35 transition-all duration-300"
                    />
                    <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C87D87]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"/>
                  </div>
                  <p className="font-['Cormorant_Garamond',serif] italic text-[0.63rem] text-[#C87D87]/40 mt-1.5 text-center">
                    — Provided by your organization —
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Forgot password */}
          <div className="mt-2 text-right">
            <Link href="/forgot-password"
              className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]/55 hover:text-[#C87D87] transition-colors border-b border-[#C87D87]/18 pb-px">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className={`w-full mt-4 relative overflow-hidden font-['Cormorant_Garamond',serif] text-sm tracking-[0.28em] uppercase text-white border-0 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 group ${
              selectedRole==='admin' ? 'bg-[#C87D87] hover:bg-[#a85e6a]' : 'bg-[#6B7556] hover:bg-[#5a6347]'
            }`}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="opacity-50 text-[0.5rem]">◆</span>
              {loading ? '— Signing In —' : `Sign In as ${selectedRole==='admin'?'Admin':'Member'}`}
              <span className="opacity-50 text-[0.5rem]">◆</span>
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300 rounded-xl"/>
          </button>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-4 mb-3">
            <div className="flex-1 h-px bg-[#C87D87]/12"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-sm text-[#5a4a3a]/70 text-center">
            Don't have an account?{' '}
            <Link href="/sign-up"
              className="text-[#C87D87] hover:text-[#6B7556] transition-colors duration-300 border-b border-[#C87D87]/25 pb-px">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//  PAGE WRAPPER (avec Suspense)
// ════════════════════════════════════════
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background:'linear-gradient(150deg,#4e5a3c 0%,#6B7556 45%,#5a6347 80%,#4a5535 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-[#FBEAD6]/20"/>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FBEAD6] animate-spin"/>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/70 tracking-[0.35em] text-xs uppercase">
            Chargement...
          </p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}