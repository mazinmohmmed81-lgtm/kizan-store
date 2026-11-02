"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // جلب المحفظة
        const { data: w } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        if (w) setWallet(w);

        // جلب عدد السلة
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", session.user.id);
        
        if (count) setCartCount(count);
      }
      setLoading(false);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      
      <div className="relative w-80 bg-slate-900 h-full shadow-2xl flex flex-col p-6">
        <button onClick={onClose} className="self-end text-slate-400 hover:text-white mb-6">✕ إغلاق</button>
        
        {loading ? (
          <div className="text-center text-slate-400">جاري التحميل...</div>
        ) : user ? (
          <>
            <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800 text-center">
              <p className="text-white font-bold text-lg">{user.email?.split('@')[0]}</p>
              <p className="text-cyan-400 text-sm mt-1">
                رقم المحفظة: {wallet?.wallet_number || "غير متوفر"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-slate-400 text-xs mb-1">المحفظة</p>
                <p className="text-green-400 font-bold text-xl">{wallet?.balance || 0} $</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-slate-400 text-xs mb-1">السلة</p>
                <p className="text-cyan-400 font-bold text-xl">{cartCount}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-slate-300">
              <Link href="/accounts" onClick={onClose} className="hover:text-cyan-400">سوق الحسابات</Link>
              <Link href="/shipping" onClick={onClose} className="hover:text-cyan-400">شحن الألعاب</Link>
              <Link href="/my-orders" onClick={onClose} className="hover:text-cyan-400">طلباتي</Link>
              <Link href="/cart" onClick={onClose} className="hover:text-cyan-400">سلة المشتريات</Link>
            </div>

            <button onClick={handleLogout} className="mt-auto w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/40 font-bold rounded-xl transition-all">
              تسجيل الخروج
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-4 mt-10">
            <Link href="/login" onClick={onClose} className="w-full py-3 text-center bg-cyan-600 text-white font-bold rounded-xl">تسجيل الدخول</Link>
            <Link href="/register" onClick={onClose} className="w-full py-3 text-center bg-slate-800 text-white font-bold rounded-xl">إنشاء حساب</Link>
          </div>
        )}
      </div>
    </div>
  );
}