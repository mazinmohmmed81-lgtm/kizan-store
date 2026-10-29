"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MerchantDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDeals = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // جلب الصفقات التي يكون فيها المستخدم الحالي هو التاجر (merchant)
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          listings (
            title,
            game_name,
            price
          )
        `)
        .eq("merchant_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDeals(data);
      }
      setLoading(false);
    };

    fetchDeals();
  }, [router]);

  const handleApprove = async (dealId: string) => {
    setActionLoading(dealId);
    const { error } = await supabase
      .from("deals")
      .update({ status: "agreed" }) // تغيير الحالة إلى "تم الاتفاق"
      .eq("id", dealId);

    if (error) {
      alert("حدث خطأ: " + error.message);
    } else {
      alert("تمت الموافقة على السعر بنجاح!");
      setDeals(deals.map(d => d.id === dealId ? { ...d, status: "agreed" } : d));
    }
    setActionLoading(null);
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري تحميل إعلاناتك...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة التاجر (البائع)</h1>
        <Link href="/accounts/new" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">
          + إضافة إعلان جديد
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-xl font-bold text-slate-300">لا توجد صفقات أو عروض على إعلاناتك حالياً</h2>
          <p className="text-slate-500 mt-2">عندما يستلم وكيل إعلانك ويقدم عرضاً، سيظهر هنا.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded-full">
                    {deal.listings?.game_name}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${deal.status === 'agreed' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                    {deal.status === 'pending_approval' ? 'بانتظار موافقتك' : deal.status === 'agreed' ? 'تم الاتفاق' : deal.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{deal.listings?.title}</h3>
                <p className="text-slate-400 mb-2">السعر الأصلي: {deal.listings?.price} ر.س</p>
                
                {/* عرض السعر المقترح من الوكيل */}
                {deal.final_price && (
                  <p className="text-lg font-bold text-cyan-400">
                    السعر المعروض من الوكيل: {deal.final_price} ر.س
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {deal.status === "pending_approval" && (
                  <button 
                    onClick={() => handleApprove(deal.id)}
                    disabled={actionLoading === deal.id}
                    className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {actionLoading === deal.id ? "جاري الموافقة..." : "الموافقة على السعر"}
                  </button>
                )}
                {deal.status === "agreed" && (
                  <span className="px-6 py-2 text-green-400 font-bold">تمت الموافقة ✅</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}