'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const registered = searchParams.get('registered');
  const resetSuccess = searchParams.get('reset');

  useEffect(() => {
    if (registered) {
      setSuccessMessage('Account created successfully! Please log in.');
    }
    if (resetSuccess) {
      setSuccessMessage('Password reset successfully! Please log in with your new password.');
    }
  }, [registered, resetSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 border border-[#C87D87]/20">
      {/* Form header */}
      <div className="mb-8 text-center">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87] text-sm tracking-[0.28em] uppercase mb-2">
          Welcome Back
        </p>
        <h2 className="font-['Playfair_Display',serif] italic text-3xl text-[#3a3027]">
          Sign In to Inora
        </h2>
        <div className="w-10 h-px bg-[#C87D87] mx-auto mt-3" />
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 text-sm font-['Cormorant_Garamond',serif]">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-['Cormorant_Garamond',serif]">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/80 border border-[#C87D87]/30 px-5 py-3 text-sm text-[#3a3027] placeholder-[#C87D87]/40 focus:outline-none focus:border-[#C87D87] transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block font-['Cormorant_Garamond',serif] text-xs tracking-[0.15em] uppercase text-[#3a3027] mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/80 border border-[#C87D87]/30 px-5 py-3 text-sm text-[#3a3027] placeholder-[#C87D87]/40 focus:outline-none focus:border-[#C87D87] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="font-['Cormorant_Garamond',serif] text-sm text-[#6B7556] hover:text-[#C87D87] transition-colors"
          >
            Forgot password?
          </Link>
          <Link
            href="/sign-up"
            className="font-['Cormorant_Garamond',serif] text-sm text-[#C87D87] hover:text-[#6B7556] transition-colors"
          >
            Create account
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-['Cormorant_Garamond',serif] text-sm tracking-[0.2em] uppercase text-white bg-[#C87D87] px-8 py-3 hover:bg-[#6B7556] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Decorative ornament */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <div className="w-8 h-px bg-[#C87D87]/30" />
        <span className="text-[#C87D87]/40 text-xs">✦</span>
        <div className="w-8 h-px bg-[#C87D87]/30" />
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoginFormFallback() {
  return (
    <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 border border-[#C87D87]/20">
      <div className="mb-8 text-center">
        <div className="h-4 w-24 bg-[#C87D87]/10 mx-auto mb-2 animate-pulse" />
        <div className="h-8 w-48 bg-[#C87D87]/10 mx-auto animate-pulse" />
        <div className="w-10 h-px bg-[#C87D87]/20 mx-auto mt-3" />
      </div>
      <div className="space-y-6">
        <div>
          <div className="h-4 w-24 bg-[#C87D87]/10 mb-2 animate-pulse" />
          <div className="h-12 w-full bg-[#C87D87]/10 animate-pulse" />
        </div>
        <div>
          <div className="h-4 w-24 bg-[#C87D87]/10 mb-2 animate-pulse" />
          <div className="h-12 w-full bg-[#C87D87]/10 animate-pulse" />
        </div>
        <div className="h-12 w-full bg-[#C87D87]/10 animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FBEAD6] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-16 w-64 h-64 rounded-full bg-[#C87D87]/5 animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-32 right-20 w-96 h-96 rounded-full bg-[#6B7556]/5 animate-[float_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/3 right-12 w-40 h-40 rounded-full bg-[#C87D87]/6 animate-[float_7s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-20 left-24 w-48 h-48 rounded-full bg-[#6B7556]/5 animate-[float_9s_ease-in-out_infinite_3s]" />
      </div>

      {/* Lace corner frames */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-3 border border-[#C87D87]/30" />
        <div className="absolute inset-5 border border-[#C87D87]/15" />
        
        <div className="absolute top-3 left-3 w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute top-0 left-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C87D87]/80" />
        </div>
        <div className="absolute top-3 right-3 w-16 h-16">
          <div className="absolute top-0 right-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute top-0 right-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C87D87]/80" />
        </div>
        <div className="absolute bottom-3 left-3 w-16 h-16">
          <div className="absolute bottom-0 left-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C87D87]/80" />
        </div>
        <div className="absolute bottom-3 right-3 w-16 h-16">
          <div className="absolute bottom-0 right-0 w-full h-px bg-[#C87D87]/60" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-[#C87D87]/60" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C87D87]/80" />
        </div>
      </div>

      <div className="relative z-20 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="font-['Playfair_Display',serif] italic text-4xl text-[#6B7556] hover:text-[#C87D87] transition-colors">
              Inora
            </h1>
          </Link>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-sm mt-1 tracking-[0.2em] uppercase">
            Gather. Create. Remember.
          </p>
        </div>

        {/* Wrap the component that uses useSearchParams in Suspense */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <p className="text-center mt-6 font-['Cormorant_Garamond',serif] text-xs text-[#7a6a5a]/50">
          © {new Date().getFullYear()} Inora. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </main>
  );
}