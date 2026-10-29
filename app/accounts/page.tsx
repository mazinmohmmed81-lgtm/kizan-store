"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AccountsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // جلب بيانات المستخدم
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // جلب الإعلانات
      fetchListings();
    };
    init();
  }, []);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (!error && data) setListings(data);
    setLoading(false);
  };

  const handleClaim = async (listing: any) => {
    if (!user) {
      alert("يجب تسجيل الدخول أولاً لاستلام الإعلان.");
      return;
    }
    
    setActionLoading(listing.id);

    // 1. محاولة استلام الإعلان
    const { data, error } = await supabase
      .from("listings")
      .update({ 
        status: "assigned", 
        assigned_agent_id: user.id 
      })
      .eq("id", listing.id)
      .eq("status", "available")
      .select();

    if (error) {
      alert("حدث خطأ: " + error.message);
    } else if (data && data.length === 0) {
      alert("عذراً، هذا الإعلان تم استلامه من قبل وكيل آخر للتو.");
      fetchListings(); 
    } else {
      // 2. نجح الاستلام، الآن ننشئ الصفقة
      const { error: dealError } = await supabase
        .from("deals")
        .insert({
          listing_id: listing.id,
          agent_id: user.id,
          merchant_id: listing.merchant_id,
          status: "negotiating",
          final_price: listing.price
        });

      if (dealError) {
        alert("تم استلام الإعلان، لكن حدث خطأ في إنشاء ملف الصفقة: " + dealError.message);
      } else {
        alert("تم استلام الإعلان وفتح ملف الصفقة بنجاح!");
      }
      
      fetchListings(); 
    }
    
    setActionLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">سوق حسابات الألعاب</h1>
        {user && (
          <Link href="/accounts/new" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">
            + إضافة إعلان جديد
          </Link>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-cyan-400">جاري تحميل الإعلانات...</div>
      ) : listings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-xl font-bold text-slate-300 mb-2">لا توجد إعلانات حالياً</h2>
          <p className="text-slate-500 mb-6">كن أول من ينشر حساباً للبيع في المنصة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-full">
                  {listing.game_name}
                </span>
                <span className="text-xl font-bold text-white">
                  {listing.price} ر.س
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{listing.title}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow">{listing.description}</p>
              
              {user && (
                <button 
                  onClick={() => handleClaim(listing)}
                  disabled={actionLoading === listing.id}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading === listing.id ? "جاري الاستلام..." : "استلام الإعلان (وكيل)"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}