"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CheckoutClient() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status: "paid" }).eq("id", id);
    if (error) {
      alert("خطأ: " + error.message);
    } else {
      alert("تم الدفع الوهمي بنجاح!");
      router.push(`/messages/${id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-white mb-6">صفحة الدفع</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <p className="text-slate-300 mb-6">إتمام عملية الشراء عبر وساطة الإدارة.</p>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <p className="text-sm text-slate-400">طريقة الدفع:</p>
          <p className="font-bold text-cyan-400">دفع وهمي</p>
        </div>
        <button onClick={handlePayment} disabled={loading} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl">
          {loading ? "جاري الدفع..." : "تأكيد الدفع"}
        </button>
      </div>
    </div>
  );
}