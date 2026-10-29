"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const [gameName, setGameName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saleType, setSaleType] = useState("direct"); // الحالة الجديدة للمزاد
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("يجب تسجيل الدخول أولاً.");
      setLoading(false);
      return;
    }

    // تحديد وقت انتهاء المزاد (بعد 3 أيام) إذا كان النوع مزاد
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 3);

    const { error } = await supabase.from("listings").insert({
      merchant_id: user.id,
      game_name: gameName,
      title: title,
      description: description,
      price: parseFloat(price),
      status: "available",
      sale_type: saleType,
      auction_ends_at: saleType === "auction" ? endTime.toISOString() : null,
    });

    if (error) {
      setMessage("خطأ: " + error.message);
    } else {
      setMessage("تم نشر الإعلان بنجاح!");
      setTimeout(() => router.push(saleType === "auction" ? "/auctions" : "/accounts"), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-6">إضافة إعلان حساب جديد</h1>
      
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">اسم اللعبة</label>
          <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">عنوان الإعلان</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">وصف الحساب</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" required></textarea>
        </div>

        {/* حقل نوع البيع الجديد */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">نوع البيع</label>
          <select 
            value={saleType} 
            onChange={(e) => setSaleType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="direct">بيع مباشر</option>
            <option value="auction">مزاد</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">السعر (ر.س)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" required />
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all disabled:opacity-50">
          {loading ? "جاري النشر..." : "نشر الإعلان"}
        </button>
        
        {message && <div className="p-3 bg-slate-800 text-cyan-400 rounded-lg text-center">{message}</div>}
      </form>
    </div>
  );
}