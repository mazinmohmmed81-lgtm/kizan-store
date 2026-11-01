"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      const { data } = await supabase.from("listings").select("*").eq("status", "available");
      if (data) setListings(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleBuy = async (listing: any) => {
    if (!user) { router.push("/login"); return; }
    const { data: order, error } = await supabase.from("orders").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.merchant_id,
      status: "pending_payment"
    }).select().single();
    if (!error) router.push(`/checkout/${order.id}`);
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">سوق الحسابات</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-full mb-4 inline-block">{item.game_name}</span>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{item.description}</p>
            <p className="text-2xl font-bold text-cyan-400 mb-4">{item.admin_price || item.price} ر.س</p>
            <button onClick={() => handleBuy(item)} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">طلب الشراء</button>
          </div>
        ))}
      </div>
    </div>
  );
}