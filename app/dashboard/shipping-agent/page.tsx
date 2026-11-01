"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ShippingAgentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة وكيل الشحن</h1>
        <Link 
          href="/admin/wallets" 
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
        >
          شحن محفظة عميل
        </Link>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-4">أهلاً بك في لوحة وكيل الشحن</h2>
        <p className="text-slate-400 mb-6">يمكنك من هنا شحن محافظ العملاء مباشرة.</p>
        <p className="text-slate-500 text-sm">(سيتم عرض طلبات الشحن التي قمت بها هنا قريباً)</p>
      </div>
    </div>
  );
}