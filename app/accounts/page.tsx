"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      const { data } = await supabase.from("listings").select("*").eq("status", "available");
      if (data) setListings(data);
    };
    init();
  }, []);

  const handleBuy = async (listing: any) => {
    if (!user) { router.push("/login"); return; }
    const { data: order, error } = await supabase.from("orders").insert({
      listing_id: listing.id, buyer_id: user.id, seller_id: listing.merchant_id, status: "pending_payment"
    }).select().single();
    if (!error) router.push(`/checkout/${order.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">سوق الحسابات</h1>
        {user && <Link href="/accounts/new" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg">إضافة حساب</Link>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-full mb-4 inline-block">{item.game_name}</span>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{item.description}</p>
            <p className="text-2xl font-bold text-cyan-400 mb-4">{item.admin_price || item.price} $</p>
            <button onClick={() => handleBuy(item)} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">طلب الشراء</button>
          </div>
        ))}
      </div>
    </div>
  );
}