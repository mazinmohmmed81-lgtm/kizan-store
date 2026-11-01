"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminWalletsPage() {
  const [walletNumber, setWalletNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handleCharge = async () => {
    if (!walletNumber || !amount) return;
    const { data: wallet } = await supabase.from("wallets").select("user_id").eq("wallet_number", walletNumber).single();
    if (!wallet) { alert("رقم المحفظة غير موجود!"); return; }
    await supabase.rpc('add_wallet_balance', { p_user_id: wallet.user_id, p_amount: parseFloat(amount), p_description: "شحن من الإدارة" });
    alert("تم الشحن!"); setWalletNumber(""); setAmount("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">شحن محافظ العملاء</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
        <input type="text" placeholder="رقم المحفظة" value={walletNumber} onChange={e => setWalletNumber(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        <input type="number" placeholder="المبلغ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        <button onClick={handleCharge} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl">شحن</button>
      </div>
    </div>
  );
}