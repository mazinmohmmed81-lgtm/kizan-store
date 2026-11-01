"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminShippingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from("shipping_orders").select(`
      *,
      profiles (full_name, email),
      shipping_packages (package_name, game_name)
    `).order("created_at", { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("shipping_orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">إدارة طلبات الشحن</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-950 text-slate-400 text-sm">
            <tr>
              <th className="p-4">العميل</th>
              <th className="p-4">اللعبة / الباقة</th>
              <th className="p-4">معرف اللاعب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-800/50">
                <td className="p-4 text-white">{o.profiles?.full_name || o.profiles?.email}</td>
                <td className="p-4 text-slate-300">{o.shipping_packages?.game_name} - {o.shipping_packages?.package_name}</td>
                <td className="p-4 text-slate-300">{o.player_id}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    o.status === 'completed' ? 'bg-green-900/50 text-green-400' : 
                    o.status === 'processing' ? 'bg-blue-900/50 text-blue-400' : 
                    'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {o.status === 'new' && <button onClick={() => updateStatus(o.id, 'processing')} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg">بدء التنفيذ</button>}
                  {o.status === 'processing' && <button onClick={() => updateStatus(o.id, 'completed')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">إكمال</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}