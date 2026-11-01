"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user.id, account_number: accountNumber, amount: parseFloat(amount),
    });

    if (error) setMessage("خطأ: " + error.message);
    else { setMessage("تم إرسال طلب الشحن! سيتم مراجعته."); setAccountNumber(""); setAmount(""); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-white mb-6">شحن المحفظة</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <p className="text-slate-300 mb-4">أدخل رقم حسابك (الذي حصلت عليه من الإدارة) والمبلغ.</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <input type="text" placeholder="رقم الحساب" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="number" placeholder="المبلغ (ر.س)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <button type="submit" disabled={loading} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">{loading ? "جاري الإرسال..." : "إرسال الطلب"}</button>
        </form>
        {message && <div className="mt-4 p-3 bg-slate-800 text-cyan-400 rounded-lg text-sm">{message}</div>}
      </div>
    </div>
  );
}