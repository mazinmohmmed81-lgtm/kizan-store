"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: profiles } = await supabase.from("profiles").select("*");
        const { data: wallets } = await supabase.from("wallets").select("*");
        const { data: roles } = await supabase.from("user_roles").select("*");

        if (profiles) {
          const combined = profiles.map(p => {
            const userWallet = wallets?.find(w => w.user_id === p.id);
            const userRole = roles?.find(r => r.user_id === p.id);
            return {
              ...p,
              wallet_number: userWallet?.wallet_number || "لا يوجد",
              balance: userWallet?.balance || 0,
              role: userRole?.role || "buyer"
            };
          });
          setUsers(combined);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">قائمة المستخدمين والوكلاء</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-950 text-slate-400 text-sm">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">الدور</th>
              <th className="p-4">رقم المحفظة</th>
              <th className="p-4">الرصيد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="p-4 text-white">{u.full_name || "غير محدد"}</td>
                <td className="p-4 text-slate-300">{u.email}</td>
                <td className="p-4 text-cyan-400 font-bold">
                  {u.role === "admin" ? "مدير" : u.role === "shipping_agent" ? "وكيل شحن" : "عميل"}
                </td>
                <td className="p-4 text-slate-300">{u.wallet_number}</td>
                <td className="p-4 text-green-400 font-bold">{u.balance} $</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}