"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (!roles?.some((r) => r.role === "admin")) { router.push("/"); return; }
      setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg">تسجيل الخروج</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/agents" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">إدارة الوكلاء</h2>
          <p className="text-slate-400">إضافة وكيل، عرض الوكلاء، وشحن محافظهم.</p>
        </Link>
        
        <Link href="/admin/wallets" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">شحن محافظ العملاء</h2>
          <p className="text-slate-400">شحن محفظة العميل برقم المحفظة.</p>
        </Link>

        <Link href="/admin/manage" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">لوحة الإدارة (المراجعة)</h2>
          <p className="text-slate-400">مراجعة الحسابات، إضافة الألعاب، وإدارة المنتجات.</p>
        </Link>

        <Link href="/admin/contact" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">تعديل بيانات الاتصال</h2>
          <p className="text-slate-400">تعديل أرقام التواصل والبريد الإلكتروني.</p>
        </Link>
      </div>
    </div>
  );
}