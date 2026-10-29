"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgentDashboard() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDeals = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

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
        .eq("agent_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDeals(data);
      } else {
        console.log(error);
      }
      setLoading(false);
    };

    fetchDeals();
  }, [router]);

  if (loading) {
    return <div className="text-center py-20 text-cyan-400">جاري تحميل الصفقات...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة وكيل البيع</h1>
        <Link href="/accounts" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          العودة للسوق
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-xl font-bold text-slate-300">لا توجد صفقات حالياً</h2>
          <p className="text-slate-500 mt-2">اذهب إلى سوق الحسابات واستلم إعلاناً للبدء.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded-full">
                    {deal.listings?.game_name || "لعبة غير معروفة"}
                  </span>
                  <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded-full">
                    {deal.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {deal.listings?.title || "إعلان محذوف"}
                </h3>
                <p className="text-slate-400">السعر المطلوب: {deal.listings?.price || 0} ر.س</p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <Link 
                  href={`/dashboard/agent/deal/${deal.id}`} 
                  className="flex-1 md:flex-none text-center px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all"
                >
                  إدارة التفاوض
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}