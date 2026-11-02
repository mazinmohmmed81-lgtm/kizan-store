"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        if (roles && roles.some((r: any) => r.role === "admin")) {
          setIsAdmin(true);
        }
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) setIsAdmin(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <button onClick={() => setIsSidebarOpen(true)} className="text-white text-2xl hover:text-cyan-400 transition-colors">
            ☰
          </button>

          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-cyan-400">ALKYZAN</span> STORE
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/accounts" className="hover:text-cyan-400 transition-colors">سوق الحسابات</Link>
            <Link href="/shipping" className="hover:text-cyan-400 transition-colors">شحن الألعاب</Link>
            <Link href="/contact" className="hover:text-cyan-400 transition-colors">اتصل بنا</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-1 bg-yellow-500/20 text-yellow-400 font-bold text-sm rounded-lg hover:bg-yellow-500/30 transition-colors">
                    لوحة الإدارة
                  </Link>
                )}
                <Link href="/my-orders" className="text-sm font-bold text-cyan-400 hover:text-cyan-300">
                  حسابي
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}