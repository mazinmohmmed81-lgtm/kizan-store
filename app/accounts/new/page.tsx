"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const [gameName, setGameName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("listings").insert({
      merchant_id: user.id, game_name: gameName, title: title, description: description, price: parseFloat(price), currency: "USD", status: "pending",
    });

    if (error) alert("خطأ: " + error.message);
    else { alert("تم الإرسال للأدمن للمراجعة."); router.push("/accounts"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-6">نشر حساب للبيع (وساطة الإدارة)</h1>
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <input type="text" placeholder="اسم اللعبة" value={gameName} onChange={(e) => setGameName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
        <input type="text" placeholder="عنوان الإعلان" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
        <textarea placeholder="وصف الحساب" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required></textarea>
        <input type="number" placeholder="السعر بالدولار ($)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
        <button type="submit" disabled={loading} className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg">{loading ? "جاري الإرسال..." : "إرسال للأدمن"}</button>
      </form>
    </div>
  );
}