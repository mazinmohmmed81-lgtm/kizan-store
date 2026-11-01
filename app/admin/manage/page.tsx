"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminManagePage() {
  const [listings, setListings] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: l } = await supabase.from("listings").select("*").eq("status", "pending");
    if (l) setListings(l);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (listingId: string, newPrice: number) => {
    await supabase.from("listings").update({ status: "available", admin_price: newPrice }).eq("id", listingId);
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">مراجعة الحسابات</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">الحسابات المعلقة</h2>
        {listings.length === 0 ? <p className="text-slate-400">لا توجد حسابات معلقة.</p> : (
          <div className="space-y-4">
            {listings.map(l => (
              <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{l.title}</h3>
                  <p className="text-sm text-slate-400">{l.description}</p>
                  <p className="text-cyan-400 mt-1">السعر المقترح: {l.price} $</p>
                </div>
                <div className="flex gap-2 items-center">
                  <input type="number" placeholder="السعر الجديد" className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white" 
                    onChange={(e) => l.admin_price = e.target.value} />
                  <button onClick={() => handleApprove(l.id, Number(l.admin_price))} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg">موافقة</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}