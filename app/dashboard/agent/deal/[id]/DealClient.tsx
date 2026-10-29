"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DealClient() {
  const { id } = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showPriceInput, setShowPriceInput] = useState(false);
  const [finalPrice, setFinalPrice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
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
            description,
            game_name,
            price
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
      } else {
        setDeal(data);
        if (data.final_price) {
          setFinalPrice(data.final_price.toString());
        }
      }
      setLoading(false);
    };

    fetchDeal();
  }, [id, router]);

  const handleProposePrice = async () => {
    if (!finalPrice) {
      alert("الرجاء إدخال السعر أولاً.");
      return;
    }
    setActionLoading(true);

    const { error } = await supabase
      .from("deals")
      .update({
        final_price: parseFloat(finalPrice),
        status: "pending_approval",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert("حدث خطأ: " + error.message);
    } else {
      alert("تم اقتراح السعر النهائي بنجاح! بانتظار موافقة الأطراف.");
      setDeal({ ...deal, final_price: finalPrice, status: "pending_approval" });
      setShowPriceInput(false);
    }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-cyan-400">جاري تحميل الصفقة...</div>;
  }

  if (!deal) {
    return <div className="text-center py-20 text-red-400">الصفقة غير موجودة أو لا تملك صلاحية الوصول.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">إدارة التفاوض</h1>
        <Link href="/dashboard/agent" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          عودة للصفقات
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <span className="px-3 py-1 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded-full mb-2 inline-block">
              {deal.listings?.game_name}
            </span>
            <h2 className="text-2xl font-bold text-white">{deal.listings?.title}</h2>
            <p className="text-slate-400 mt-2">{deal.listings?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">السعر الأصلي المطلوب</p>
            <p className="text-2xl font-bold text-cyan-400">{deal.listings?.price} ر.س</p>
          </div>
        </div>

        <hr className="border-slate-800" />

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">حالة الصفقة والتفاوض</h3>
          
          <div className="space-y-2 mb-6">
            <p className="text-slate-300">
              الحالة الحالية: <span className="font-bold text-yellow-400">{deal.status}</span>
            </p>
            <p className="text-slate-300">
              السعر النهائي المقترح:{" "}
              <span className="font-bold text-cyan-400">
                {deal.final_price ? `${deal.final_price} ر.س` : "لم يتم اقتراحه بعد"}
              </span>
            </p>
          </div>
          
          {showPriceInput ? (
            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-900 p-4 rounded-lg border border-slate-700">
              <div className="flex-1 w-full">
                <label className="block text-sm text-slate-400 mb-1">أدخل السعر النهائي المتفق عليه (ر.س)</label>
                <input 
                  type="number" 
                  value={finalPrice} 
                  onChange={(e) => setFinalPrice(e.target.value)} 
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleProposePrice} 
                  disabled={actionLoading}
                  className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? "جاري الحفظ..." : "تأكيد السعر"}
                </button>
                <button 
                  onClick={() => setShowPriceInput(false)}
                  className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => setShowPriceInput(true)}
                disabled={deal.status === "agreed" || deal.status === "completed"}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all w-full disabled:opacity-50"
              >
                اقتراح سعر نهائي
              </button>
              <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all w-full">
                مراسلة التاجر
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}