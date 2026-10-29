"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("sale_type", "auction")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (!error && data) setAuctions(data);
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري تحميل المزادات...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">المزادات الحية</h1>
      
      {auctions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔨</div>
          <h2 className="text-xl font-bold text-slate-300">لا توجد مزادات حالياً</h2>
          <p className="text-slate-500 mt-2">سيتم الإعلان عن المزادات القادمة قريباً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <span className="px-3 py-1 bg-purple-900/50 text-purple-400 text-xs font-bold rounded-full mb-4 inline-block">
                {auction.game_name}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{auction.title}</h3>
              <p className="text-slate-400 text-sm mb-4">ينتهي في: {auction.auction_ends_at ? new Date(auction.auction_ends_at).toLocaleString('ar-SA') : 'غير محدد'}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-cyan-400">{auction.price} ر.س</span>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">
                  دخول المزاد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}