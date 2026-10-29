"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // جلب أدوار المستخدم
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
          
        if (data) {
          setRoles(data.map(r => r.role));
        }
      }
      setLoading(false);
    };

    getUserData();

    // الاستماع لتغيرات حالة الدخول (تسجيل دخول/خروج)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        setRoles([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="text-sm text-slate-500">...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
          تسجيل الدخول
        </Link>
        <Link href="/register" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all">
          إنشاء حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-3 text-sm font-bold">
        {roles.includes("admin") && (
          <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">الإدارة</Link>
        )}
        {roles.includes("merchant") && (
          <Link href="/dashboard/merchant" className="text-slate-300 hover:text-white">لوحة التاجر</Link>
        )}
        {roles.includes("account_agent") && (
          <Link href="/dashboard/agent" className="text-slate-300 hover:text-white">لوحة الوكيل</Link>
        )}
        {roles.includes("shipping_agent") && (
          <Link href="/dashboard/shipping-agent" className="text-slate-300 hover:text-white">وكيل الشحن</Link>
        )}
      </div>
      
      <button onClick={handleLogout} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 text-sm font-bold rounded-lg transition-all">
        خروج
      </button>
    </div>
  );
}