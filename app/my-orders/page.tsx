"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [router]);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">طلباتي</h1>
      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          لا توجد طلبات حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-white font-bold">طلب رقم: {order.id.slice(0, 8)}</p>
                <p className="text-slate-400 text-sm">التاريخ: {new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                order.status === 'paid' ? 'bg-green-900/50 text-green-400' : 
                order.status === 'completed' ? 'bg-blue-900/50 text-blue-400' : 
                'bg-yellow-900/50 text-yellow-400'
              }`}>
                {order.status === 'paid' ? 'مدفوع' : order.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}