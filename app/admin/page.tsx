"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
        <button 
          onClick={handleLogout} 
          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. المستخدمين والوكلاء */}
        <Link href="/admin/users" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">المستخدمين والوكلاء</h2>
          <p className="text-slate-400">عرض جميع الحسابات وأرقام المحافظ.</p>
        </Link>
        
        {/* 2. إدارة الوكلاء */}
        <Link href="/admin/agents" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">إدارة الوكلاء</h2>
          <p className="text-slate-400">إضافة وكيل، وشحن محفظته.</p>
        </Link>
        
        {/* 3. شحن المحافظ */}
        <Link href="/admin/wallets" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">شحن المحافظ</h2>
          <p className="text-slate-400">شحن محفظة العميل برقم المحفظة.</p>
        </Link>

        {/* 4. مراجعة الحسابات */}
        <Link href="/admin/manage" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">مراجعة الحسابات</h2>
          <p className="text-slate-400">مراجعة الحسابات المعلقة والموافقة عليها.</p>
        </Link>

        {/* 5. المنتجات والألعاب */}
        <Link href="/admin/products" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">المنتجات والألعاب</h2>
          <p className="text-slate-400">إضافة المنتجات والصور والألعاب.</p>
        </Link>

        {/* 6. بيانات الاتصال */}
        <Link href="/admin/contact" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">بيانات الاتصال</h2>
          <p className="text-slate-400">تعديل أرقام التواصل والبريد.</p>
        </Link>

        {/* 7. طلبات الشحن */}
        <Link href="/admin/shipping" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">إدارة طلبات الشحن</h2>
          <p className="text-slate-400">متابعة طلبات الشحن وتحديث حالتها.</p>
        </Link>

        {/* 8. دردشة الإدارة */}
        <Link href="/admin/messages" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500 transition-colors">
          <h2 className="text-2xl font-bold text-white mb-2">دردشة الإدارة</h2>
          <p className="text-slate-400">عرض جميع رسائل العملاء والرد عليها.</p>
        </Link>

      </div>
    </div>
  );
}