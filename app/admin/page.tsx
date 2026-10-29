"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // التحقق من الصلاحية
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        router.push("/");
        return;
      }

      setUser(session.user);

      // جلب طلبات الشحن
      const { data: ordersData } = await supabase
        .from("shipping_orders")
        .select(`
          *,
          shipping_packages (
            game_name,
            package_name
          )
        `)
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);
      setLoading(false);
    };

    checkUserAndFetch();
  }, [router]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    const { error } = await supabase
      .from("shipping_orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("خطأ: " + error.message);
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setActionLoading(null);
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
        <p className="text-slate-400">مرحباً، {user?.email}</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-1">إجمالي طلبات الشحن</h3>
          <p className="text-3xl font-bold text-cyan-400">{orders.length}</p>
        </div>
      </div>

      {/* جدول طلبات الشحن */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">إدارة طلبات الشحن</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-950 text-slate-400 text-sm">
              <tr>
                <th className="p-4 font-medium">اللعبة</th>
                <th className="p-4 font-medium">الباقة</th>
                <th className="p-4 font-medium">معرف اللاعب</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/50">
                  <td className="p-4 text-white">{order.shipping_packages?.game_name}</td>
                  <td className="p-4 text-white">{order.shipping_packages?.package_name}</td>
                  <td className="p-4 text-slate-300">{order.player_id}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      order.status === 'completed' ? 'bg-green-900/50 text-green-400' : 
                      order.status === 'processing' ? 'bg-blue-900/50 text-blue-400' : 
                      order.status === 'failed' ? 'bg-red-900/50 text-red-400' : 
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {order.status === 'new' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500"
                        >
                          بدء التنفيذ
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            disabled={actionLoading === order.id}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500"
                          >
                            إكمال
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'failed')}
                            disabled={actionLoading === order.id}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500"
                          >
                            فشل
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">لا توجد طلبات شحن حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}