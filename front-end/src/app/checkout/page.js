'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const PRICE_PER_PERSON = 150;
const ADVANCE_AMOUNT   = 250;

const stripeStyle = {
  base: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle:  'italic',
    fontSize:   '16px',
    color:      '#FBEAD6',
    letterSpacing: '0.04em',
    '::placeholder': { color: 'rgba(251,234,214,0.2)' },
  },
  invalid: { color: '#C87D87' },
};

// ════════════════════════════════════════
//  INNER FORM — must live inside <Elements>
// ════════════════════════════════════════
function PaymentForm({ booking, bookingId, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [name,    setName]    = useState('');
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState(null);
  const [focused, setFocused] = useState(null);

  const participants = parseInt(booking?.participants) || 1;
  const totalAmount  = participants * PRICE_PER_PERSON;
  const remaining    = totalAmount - ADVANCE_AMOUNT;
  const advancePct   = Math.min(100, Math.round((ADVANCE_AMOUNT / totalAmount) * 100));

  const fieldWrap = (field) =>
    `rounded-xl px-4 py-3 border transition-all duration-300 ${
      focused === field
        ? 'bg-[#FBEAD6]/8 border-[#C87D87]/60 shadow-[0_0_0_3px_rgba(200,125,135,0.1)]'
        : 'bg-[#FBEAD6]/4 border-[#FBEAD6]/10 hover:border-[#FBEAD6]/20'
    }`;

  const friendlyError = (code) => ({
    card_declined:      'Carte refusée. Veuillez essayer une autre carte.',
    incorrect_cvc:      'CVC incorrect.',
    expired_card:       'Carte expirée.',
    insufficient_funds: 'Fonds insuffisants.',
    incorrect_number:   'Numéro de carte incorrect.',
    processing_error:   'Erreur de traitement. Réessayez.',
  }[code] || 'Paiement refusé. Vérifiez vos informations.');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !name.trim()) return;
    setError(null);
    setPaying(true);

    try {
      // ── 1. Create PaymentIntent on your backend ──
      const intentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        }
      );
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error || 'Erreur serveur');

      console.log('✅ clientSecret received:', !!intentData.clientSecret);

      // ── 2. Confirm card with Stripe ──
      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name },
          },
        }
      );

      console.log('🔍 stripeErr:', stripeErr);         // ← debug
      console.log('🔍 paymentIntent:', paymentIntent);  // ← debug

      if (stripeErr) throw new Error(friendlyError(stripeErr.code));
      if (paymentIntent.status !== 'succeeded')
        throw new Error("Le paiement n'a pas abouti. Réessayez.");

      // ── 3. Tell your backend to verify + update DB ──
      const confirmRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, bookingId }),
        }
      );
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Erreur de confirmation');

      // ── 4. Show success ──
      onSuccess();

    } catch (err) {
      console.error('❌ handlePay error:', err.message); // ← debug
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="flex flex-col flex-1">

      {/* Title */}
      <div className="px-8 pt-6 pb-5">
        <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/50 text-[0.58rem] tracking-[0.4em] uppercase mb-1.5">
          Étape 2 sur 3
        </p>
        <h1 className="font-['Playfair_Display',serif] italic text-[clamp(2.2rem,3vw,3.5rem)] text-[#FBEAD6] leading-none">
          Paiement<span className="text-[#C87D87]">.</span>
        </h1>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/25 text-sm mt-1.5">
          Réglez votre avance pour confirmer votre place.
        </p>
      </div>

      {/* Booking strip */}
      <div className="mx-8 mb-5 rounded-2xl border border-[#FBEAD6]/8 bg-[#FBEAD6]/[0.04] overflow-hidden">
        <div className="h-px w-full" style={{background:'linear-gradient(90deg,transparent,rgba(200,125,135,0.5),transparent)'}}/>
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,rgba(200,125,135,0.2),rgba(200,125,135,0.08))'}}>
            <span className="text-[#C87D87]/70 text-sm">◈</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Playfair_Display',serif] italic text-[#FBEAD6]/80 text-base leading-tight truncate">
              {booking?.activity || 'Votre activité'}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {[
                booking?.date ? new Date(booking.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) : null,
                booking?.timeSlot,
                `${participants} pers.`,
              ].filter(Boolean).map((v,i,arr)=>(
                <span key={i} className="font-['Cormorant_Garamond',serif] italic text-[0.62rem] text-[#FBEAD6]/25">
                  {v}{i < arr.length-1 && <span className="ml-2 text-[#FBEAD6]/10">·</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-['Cormorant_Garamond',serif] text-[0.52rem] tracking-[0.18em] uppercase text-[#FBEAD6]/18 mb-0.5">Avance</p>
            <p className="font-['Playfair_Display',serif] italic text-xl text-[#C87D87]">{ADVANCE_AMOUNT} MAD</p>
          </div>
        </div>
      </div>

      {/* Card mockup */}
      <div className="mx-8 mb-5 rounded-2xl overflow-hidden relative"
        style={{background:'linear-gradient(135deg,#3d3528 0%,#2d3a28 45%,#3a2d28 100%)',
          boxShadow:'0 16px 48px rgba(0,0,0,0.45)',height:'130px'}}>
        <div className="absolute inset-0 opacity-[0.035]"
          style={{backgroundImage:'linear-gradient(rgba(251,234,214,1) 1px,transparent 1px),linear-gradient(90deg,rgba(251,234,214,1) 1px,transparent 1px)',backgroundSize:'36px 36px'}}/>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full"
          style={{background:'radial-gradient(circle,rgba(200,125,135,0.25) 0%,transparent 70%)',filter:'blur(18px)'}}/>
        <div className="absolute -bottom-6 -left-4 w-28 h-28 rounded-full"
          style={{background:'radial-gradient(circle,rgba(107,117,86,0.3) 0%,transparent 70%)',filter:'blur(15px)'}}/>
        <div className="relative h-full p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-8 h-6 rounded-md overflow-hidden"
              style={{background:'linear-gradient(135deg,rgba(251,234,214,0.35),rgba(200,125,135,0.25))'}}>
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px p-0.5">
                {[...Array(4)].map((_,i)=><div key={i} className="rounded-sm bg-[#FBEAD6]/15"/>)}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-[#6B7556]/50"/>
              <div className="w-5 h-5 rounded-full bg-[#C87D87]/40 -ml-2"/>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[0.44rem] tracking-widest uppercase text-[#FBEAD6]/15 mb-0.5">Titulaire</p>
              <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/55 text-xs tracking-wider uppercase">
                {name || 'VOTRE NOM'}
              </p>
            </div>
            <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/25 text-[0.6rem] tracking-widest">
              INORA PAY
            </p>
          </div>
        </div>
      </div>

      {/* ── Stripe card fields ── */}
      <div className="px-8 space-y-3.5 flex-1">

        {/* Card number */}
        <div>
          <label className="block font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-[0.18em] text-[#FBEAD6]/28 mb-1.5">
            Numéro de carte
          </label>
          <div className={fieldWrap('number') + ' relative'}>
            <CardNumberElement
              options={{ style: stripeStyle, showIcon: true }}
              onFocus={() => setFocused('number')}
              onBlur={()  => setFocused(null)}
            />
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-[0.18em] text-[#FBEAD6]/28 mb-1.5">
              Expiration
            </label>
            <div className={fieldWrap('expiry')}>
              <CardExpiryElement
                options={{ style: stripeStyle }}
                onFocus={() => setFocused('expiry')}
                onBlur={()  => setFocused(null)}
              />
            </div>
          </div>
          <div>
            <label className="block font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-[0.18em] text-[#FBEAD6]/28 mb-1.5">
              CVC
            </label>
            <div className={fieldWrap('cvc')}>
              <CardCvcElement
                options={{ style: stripeStyle }}
                onFocus={() => setFocused('cvc')}
                onBlur={()  => setFocused(null)}
              />
            </div>
          </div>
        </div>

        {/* Cardholder name */}
        <div>
          <label className="block font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-[0.18em] text-[#FBEAD6]/28 mb-1.5">
            Nom sur la carte
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={()  => setFocused(null)}
            placeholder="Prénom NOM"
            className={fieldWrap('name') + " w-full font-['Cormorant_Garamond',serif] italic text-base text-[#FBEAD6] placeholder-[#FBEAD6]/20 outline-none"}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-[#C87D87]/10 border border-[#C87D87]/25 flex items-center gap-2.5">
          <span className="text-[#C87D87] flex-shrink-0">⚠</span>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/90 text-sm">{error}</p>
        </div>
      )}

      {/* Pay button */}
      <div className="px-8 pt-5 pb-8">
        <div className="flex items-center gap-2.5 mb-4 px-3.5 py-2.5 rounded-xl bg-[#6B7556]/10 border border-[#6B7556]/15">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#6B7556]/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
          </svg>
          <p className="font-['Cormorant_Garamond',serif] text-[0.57rem] tracking-[0.12em] uppercase text-[#6B7556]/60 flex-1">
            SSL 256-bit · Stripe sécurisé · Aucune donnée stockée
          </p>
          <div className="flex gap-1.5">
            {['VISA','MC','CB'].map(b=>(
              <span key={b} className="font-['Cormorant_Garamond',serif] text-[0.46rem] uppercase text-[#FBEAD6]/18 border border-[#FBEAD6]/10 px-1.5 py-0.5 rounded-md">{b}</span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={paying || !stripe}
          className="w-full relative overflow-hidden group rounded-2xl font-['Cormorant_Garamond',serif] text-sm tracking-[0.25em] uppercase text-[#FBEAD6] py-4 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            background: paying
              ? 'rgba(107,117,86,0.4)'
              : 'linear-gradient(135deg,#C87D87 0%,#b36d77 40%,#C87D87 100%)',
            boxShadow: !paying
              ? '0 12px 36px rgba(200,125,135,0.45),0 4px 12px rgba(0,0,0,0.35)'
              : 'none',
          }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#FBEAD6]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"/>
          {paying ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-[#FBEAD6]/30 border-t-[#FBEAD6] animate-spin"/>
              Traitement sécurisé…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
              Payer {ADVANCE_AMOUNT} MAD en toute sécurité
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════
//  PAGE WRAPPER
// ════════════════════════════════════════
export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('bookingId');

  const [booking,      setBooking]      = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error,        setError]        = useState(null);
  const [paid,         setPaid]         = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Fetch booking
  useEffect(() => {
    if (!bookingId) { setError('No booking ID provided.'); setFetchLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Réservation introuvable'); return res.json(); })
      .then(data => {
        if (data.paymentStatus === 'PAID') setPaid(true);
        setBooking(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setFetchLoading(false));
  }, [bookingId]);

  // ── Loading ──
  if (loading || fetchLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background:'linear-gradient(135deg,#3a3027 0%,#4a5240 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border border-[#C87D87]/15"/>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C87D87] animate-spin"/>
        </div>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 tracking-[0.35em] text-xs uppercase">Chargement…</p>
      </div>
    </div>
  );

  if (!user) return null;

  const participants = parseInt(booking?.participants) || 1;
  const totalAmount  = participants * PRICE_PER_PERSON;
  const remaining    = totalAmount - ADVANCE_AMOUNT;
  const advancePct   = Math.min(100, Math.round((ADVANCE_AMOUNT / totalAmount) * 100));

  // ── Error ──
  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(135deg,#3a3027 0%,#4a5240 100%)' }}>
      <div className="text-center max-w-sm w-full bg-[#FBEAD6]/5 border border-[#FBEAD6]/10 rounded-2xl p-10">
        <div className="w-12 h-12 rounded-full bg-[#C87D87]/10 border border-[#C87D87]/25 flex items-center justify-center mx-auto mb-4">
          <span className="text-[#C87D87]">✕</span>
        </div>
        <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/50 text-base mb-6">{error}</p>
        <Link href="/account"
          className="font-['Cormorant_Garamond',serif] text-xs tracking-[0.2em] uppercase text-[#FBEAD6]/40 border border-[#FBEAD6]/15 px-6 py-2.5 rounded-xl hover:bg-[#FBEAD6]/5 transition-all inline-block">
          ← Retour
        </Link>
      </div>
    </div>
  );

  // ── Success ──
  if (paid) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(135deg,#3a3027 0%,#4a5240 100%)' }}>
      <style>{`
        @keyframes checkDraw { to { stroke-dashoffset: 0 } }
        @keyframes ringPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div className="relative max-w-md w-full rounded-3xl overflow-hidden border border-[#FBEAD6]/10"
        style={{ background:'linear-gradient(160deg,#2e2820 0%,#3a3a2a 100%)', boxShadow:'0 40px 100px rgba(58,48,39,0.7)' }}>
        <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#6B7556,#C87D87,#6B7556)' }}/>
        <div className="px-10 pt-10 pb-10 text-center">
          <div className="mx-auto mb-5 w-20 h-20" style={{animation:'ringPop .6s cubic-bezier(.34,1.56,.64,1) forwards'}}>
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle cx="40" cy="40" r="36" fill="rgba(107,117,86,0.1)" stroke="rgba(107,117,86,0.35)" strokeWidth="1.5"/>
              <path d="M24 40 L35 51 L56 29" fill="none" stroke="#6B7556" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="44" strokeDashoffset="44"
                style={{animation:'checkDraw .5s ease .45s forwards'}}/>
            </svg>
          </div>
          <p className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/60 text-[0.6rem] tracking-[0.4em] uppercase mb-1"
            style={{animation:'fadeUp .4s ease .5s both'}}>Paiement confirmé</p>
          <h2 className="font-['Playfair_Display',serif] italic text-4xl text-[#FBEAD6] mb-5"
            style={{animation:'fadeUp .4s ease .55s both'}}>Merci !</h2>
          <div className="rounded-2xl border border-[#FBEAD6]/8 divide-y divide-[#FBEAD6]/6 mb-6 text-left"
            style={{animation:'fadeUp .4s ease .6s both'}}>
            {[
              { l:'Activité',       v: booking?.activity || '—',   c:'text-[#FBEAD6]/70' },
              { l:'Participants',   v: `${participants} pers.`,     c:'text-[#FBEAD6]/70' },
              { l:'Total service',  v: `${totalAmount} MAD`,        c:'text-[#FBEAD6]/70' },
              { l:'Avance réglée',  v: `− ${ADVANCE_AMOUNT} MAD`,  c:'text-[#6B7556]'    },
              { l:'Reste sur place',v: `${remaining} MAD`,          c:'text-[#C87D87]', big:true },
            ].map(({l,v,c,big})=>(
              <div key={l} className="flex justify-between items-center px-5 py-3">
                <span className="font-['Cormorant_Garamond',serif] text-[0.62rem] uppercase tracking-[0.15em] text-[#FBEAD6]/25">{l}</span>
                <span className={`font-['Playfair_Display',serif] italic ${big?'text-xl':'text-base'} ${c}`}>{v}</span>
              </div>
            ))}
          </div>
          <Link href="/account"
            className="inline-block w-full font-['Cormorant_Garamond',serif] text-xs tracking-[0.25em] uppercase text-[#FBEAD6] rounded-2xl py-3.5 hover:opacity-90 transition-all"
            style={{animation:'fadeUp .4s ease .7s both',background:'linear-gradient(135deg,#6B7556,#4a5240)',boxShadow:'0 8px 24px rgba(107,117,86,0.4)'}}>
            Voir mes réservations →
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Main checkout layout ──
  return (
    <div className="min-h-screen flex flex-col lg:flex-row"
      style={{ background:'linear-gradient(135deg,#2e2820 0%,#3a3a2a 50%,#2e3428 100%)' }}>

      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes dotPop  { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
        @keyframes softGlow{ 0%,100%{opacity:.4} 50%{opacity:.9} }
        .l-col { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) .1s both }
        .r-col { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) .25s both }
      `}</style>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 left-1/3 w-[480px] h-[480px] rounded-full"
          style={{background:'radial-gradient(circle,rgba(200,125,135,0.12) 0%,transparent 65%)',filter:'blur(55px)',animation:'float 16s ease-in-out infinite'}}/>
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full"
          style={{background:'radial-gradient(circle,rgba(107,117,86,0.18) 0%,transparent 65%)',filter:'blur(50px)',animation:'float 20s ease-in-out infinite 5s'}}/>
        <div className="absolute inset-0 opacity-[0.022]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px,rgba(251,234,214,0.9) 1px,transparent 0)',backgroundSize:'30px 30px'}}/>
      </div>

      {/* LEFT */}
      <div className="l-col lg:w-[54%] flex flex-col min-h-screen relative z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#FBEAD6]/5">
          <Link href="/account"
            className="inline-flex items-center gap-2 font-['Cormorant_Garamond',serif] italic text-sm text-[#FBEAD6]/25 hover:text-[#FBEAD6]/60 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
            Retour
          </Link>
          <div className="flex items-center gap-1.5 bg-[#FBEAD6]/4 border border-[#FBEAD6]/8 rounded-full px-4 py-1.5">
            {['Réservation','Paiement','Confirmation'].map((s,i)=>(
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.45rem] font-bold ${
                  i < 1 ? 'bg-[#6B7556] text-[#FBEAD6]' : i===1 ? 'bg-[#C87D87] text-[#FBEAD6]' : 'bg-[#FBEAD6]/8 text-[#FBEAD6]/20'
                }`}>{i < 1 ? '✓' : i+1}</div>
                <span className={`font-['Cormorant_Garamond',serif] text-[0.55rem] tracking-[0.12em] uppercase hidden sm:block ${i===1?'text-[#FBEAD6]/55':'text-[#FBEAD6]/18'}`}>{s}</span>
                {i < 2 && <div className="w-3 h-px bg-[#FBEAD6]/10 mx-0.5"/>}
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Elements wraps the form */}
        <Elements stripe={stripePromise}>
          <PaymentForm
            booking={booking}
            bookingId={bookingId}
            onSuccess={() => setPaid(true)}
          />
        </Elements>
      </div>

      {/* RIGHT — price summary */}
      <div className="r-col lg:w-[46%] relative z-10 flex flex-col border-l border-[#FBEAD6]/5"
        style={{background:'linear-gradient(160deg,#FBEAD6 0%,#f5e0cc 100%)'}}>
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#6B7556,#C87D87,#6B7556)'}}/>
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px,#3a3027 1px,transparent 0)',backgroundSize:'18px 18px'}}/>
        {['top-4 left-4 border-t border-l','top-4 right-4 border-t border-r','bottom-4 left-4 border-b border-l','bottom-4 right-4 border-b border-r'].map((c,i)=>(
          <div key={i} className={`absolute ${c} w-7 h-7 border-[#C87D87]/20 pointer-events-none`}/>
        ))}

        <div className="flex-1 flex flex-col px-10 py-10 relative gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C87D87]/10 border border-[#C87D87]/20 rounded-full px-3 py-1 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C87D87]" style={{animation:'softGlow 2.5s ease-in-out infinite'}}/>
              <span className="font-['Cormorant_Garamond',serif] italic text-[#C87D87]/70 text-[0.58rem] tracking-[0.25em] uppercase">Simulation tarifaire</span>
            </div>
            <h2 className="font-['Playfair_Display',serif] italic text-[clamp(1.8rem,2.5vw,2.8rem)] text-[#3a3027] leading-tight">
              Votre tarification<span className="text-[#C87D87]">.</span>
            </h2>
            <div className="w-8 h-px bg-[#C87D87]/50 mt-2"/>
          </div>

          <div className="rounded-2xl border border-[#3a3027]/8 bg-white/45 overflow-hidden divide-y divide-[#3a3027]/5">
            {[
              { dot:'#6B7556', l:'Tarif par personne', sub:'Prix unitaire',                         v:`${PRICE_PER_PERSON} MAD`, vc:'text-[#3a3027]' },
              { dot:'#C87D87', l:'Participants',        sub:`${participants} × ${PRICE_PER_PERSON} MAD`, v:`${totalAmount} MAD`, vc:'text-[#3a3027]', dots:true },
              { dot:'#b36d77', l:'Avance à régler',     sub:'Payée maintenant',                     v:`− ${ADVANCE_AMOUNT} MAD`, vc:'text-[#C87D87]' },
            ].map(({dot,l,sub,v,vc,dots})=>(
              <div key={l} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{background:dot}}/>
                  <div>
                    <p className="font-['Cormorant_Garamond',serif] text-[0.62rem] uppercase tracking-[0.15em] text-[#5a4a3a]">{l}</p>
                    <p className="font-['Cormorant_Garamond',serif] italic text-[0.57rem] text-[#7a6a5a]/50 mt-0.5">{sub}</p>
                  </div>
                </div>
                <div className="text-right">
                  {dots && (
                    <div className="flex gap-[3px] justify-end mb-1">
                      {Array.from({length:Math.min(participants,9)}).map((_,i)=>(
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6B7556]/50"
                          style={{animation:`dotPop .25s ease ${i*35}ms both`}}/>
                      ))}
                      {participants>9&&<span className="font-['Cormorant_Garamond',serif] text-[0.5rem] text-[#6B7556]/40 ml-0.5">+{participants-9}</span>}
                    </div>
                  )}
                  <p className={`font-['Playfair_Display',serif] italic text-lg ${vc}`}>{v}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="rounded-2xl bg-white/40 border border-[#3a3027]/7 p-5">
            <div className="flex justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#C87D87]"/>
                <span className="font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-widest text-[#C87D87]/70">Avance · {advancePct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Cormorant_Garamond',serif] text-[0.57rem] uppercase tracking-widest text-[#7a6a5a]/40">Reste · {100-advancePct}%</span>
                <div className="w-2 h-2 rounded-full bg-[#6B7556]/40"/>
              </div>
            </div>
            <div className="relative h-2.5 rounded-full overflow-hidden bg-[#3a3027]/6">
              <div className="absolute left-0 top-0 h-full rounded-full"
                style={{width:`${advancePct}%`,background:'linear-gradient(90deg,#C87D87,rgba(200,125,135,0.65))'}}/>
              {[25,50,75].map(t=>(
                <div key={t} className="absolute top-0 bottom-0 w-px bg-white/50" style={{left:`${t}%`}}/>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]">{ADVANCE_AMOUNT} MAD</span>
              <span className="font-['Cormorant_Garamond',serif] italic text-xs text-[#7a6a5a]/40">{totalAmount} MAD</span>
            </div>
          </div>

          {/* Remaining hero */}
          <div className="rounded-2xl overflow-hidden relative"
            style={{background:'linear-gradient(135deg,#4a5240 0%,#3a3a2a 50%,#3d2e28 100%)',boxShadow:'0 16px 48px rgba(58,48,39,0.3)'}}>
            <div className="h-px w-full" style={{background:'linear-gradient(90deg,transparent,rgba(200,125,135,0.55),transparent)'}}/>
            <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full"
              style={{background:'radial-gradient(circle,rgba(200,125,135,0.2) 0%,transparent 70%)',filter:'blur(15px)'}}/>
            <div className="relative p-6 flex items-center justify-between">
              <div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/30 text-[0.57rem] tracking-[0.3em] uppercase mb-0.5">À régler sur place</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-['Playfair_Display',serif] italic text-[clamp(2.6rem,3.5vw,4rem)] text-[#FBEAD6] leading-none">{remaining}</p>
                  <span className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/35 text-base">MAD</span>
                </div>
                <p className="font-['Cormorant_Garamond',serif] italic text-[#FBEAD6]/20 text-xs mt-1.5">Le jour de l'activité · Aucun paiement en ligne</p>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-[#FBEAD6]/10 flex items-center justify-center"
                style={{background:'rgba(251,234,214,0.06)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#C87D87]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2.5 mt-auto">
            {[
              { a:'#6B7556', bg:'rgba(107,117,86,0.08)', b:'rgba(107,117,86,0.18)',
                icon:<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>,
                l:'Sécurisé', s:'SSL 256-bit' },
              { a:'#C87D87', bg:'rgba(200,125,135,0.08)', b:'rgba(200,125,135,0.18)',
                icon:<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
                l:'Garanti', s:'Place confirmée' },
              { a:'#7a6a5a', bg:'rgba(122,106,90,0.08)', b:'rgba(122,106,90,0.15)',
                icon:<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18-3V6"/></svg>,
                l:'Transparent', s:'Prix fixe' },
            ].map(({a,bg,b,icon,l,s})=>(
              <div key={l} className="flex flex-col items-center text-center p-3.5 rounded-2xl border hover:scale-[1.02] transition-all cursor-default"
                style={{background:bg,borderColor:b}}>
                <div className="mb-2" style={{color:a}}>{icon}</div>
                <p className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.12em] uppercase font-semibold text-[#3a3027]">{l}</p>
                <p className="font-['Cormorant_Garamond',serif] italic text-[0.56rem] text-[#7a6a5a]/50 mt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
