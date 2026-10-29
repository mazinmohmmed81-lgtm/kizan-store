"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ShippingAgentDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. التأكد من تسجيل الدخول
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 2. جلب طلبات الشحن الخاصة بهذا الوكيل فقط
      const { data, error } = await supabase
        .from("shipping_orders")
        .select(`
          *,
          shipping_packages (
            game_name,
            package_name
          )
        `)
        .eq("agent_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      } else {
        console.log(error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return <div className="text-center py-20 text-cyan-400">جاري تحميل طلباتك...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة وكيل الشحن</h1>
        <Link href="/shipping" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">
          + طلب شحن جديد
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-slate-300">لا توجد طلبات شحن حالياً</h2>
          <p className="text-slate-500 mt-2">اذهب إلى صفحة الشحن لإنشاء أول طلب.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-full mb-2 inline-block">
                    {order.shipping_packages?.game_name}
                  </span>
                  <h3 className="text-lg font-bold text-white">{order.shipping_packages?.package_name}</h3>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  order.status === 'completed' ? 'bg-green-900/50 text-green-400' : 
                  order.status === 'processing' ? 'bg-blue-900/50 text-blue-400' : 
                  order.status === 'failed' ? 'bg-red-900/50 text-red-400' : 
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {order.status === 'new' ? 'جديد' : 
                   order.status === 'processing' ? 'قيد التنفيذ' : 
                   order.status === 'completed' ? 'مكتمل' : 'فشل'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">معرف اللاعب: <span className="text-white">{order.player_id}</span></p>
                <p className="text-slate-400">تاريخ الطلب: <span className="text-white">{new Date(order.created_at).toLocaleDateString("ar-SA")}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}