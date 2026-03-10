'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef(null);

  const unread = notifications.filter(n => !n.read);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        credentials: 'include',
      });
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    setOpen(false);
    router.push(`/checkout?bookingId=${notif.bookingId}`);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full border border-[#C87D87]/30 bg-[#FBEAD6]/80 hover:bg-[#C87D87]/10 transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6B7556]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[0.55rem] font-bold animate-pulse">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 z-50 bg-[#FBEAD6] border border-[#C87D87]/20 shadow-2xl rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(200,125,135,0.2)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#C87D87]/15 bg-[#FBEAD6]">
            <div>
              <p className="font-['Playfair_Display',serif] italic text-lg text-[#3a3027]">Notifications</p>
              {unread.length > 0 && (
                <p className="font-['Cormorant_Garamond',serif] italic text-xs text-[#C87D87]">{unread.length} non lue{unread.length > 1 ? 's' : ''}</p>
              )}
            </div>
            {unread.length > 0 && (
              <button onClick={markAllAsRead}
                className="font-['Cormorant_Garamond',serif] text-[0.6rem] tracking-[0.2em] uppercase text-[#6B7556] border border-[#6B7556]/30 px-3 py-1.5 hover:bg-[#6B7556] hover:text-white transition-all rounded-lg">
                Tout lire
              </button>
            )}
          </div>

          {/* List */}
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
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5 animate-pulse" />}
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
                          className="mt-3 w-full font-['Cormorant_Garamond',serif] text-[0.65rem] tracking-[0.2em] uppercase text-white bg-[#6B7556] px-4 py-2.5 rounded-xl hover:bg-[#4a5240] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
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
        </div>
      )}
    </div>
  );
}
