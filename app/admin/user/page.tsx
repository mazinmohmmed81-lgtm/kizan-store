"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select(`
          id, full_name, email,
          user_roles (role),
          wallets (wallet_number, balance)
        `);
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

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
                  {u.user_roles?.[0]?.role === "admin" ? "مدير" : 
                   u.user_roles?.[0]?.role === "shipping_agent" ? "وكيل شحن" : "عميل"}
                </td>
                <td className="p-4 text-slate-300">{u.wallets?.[0]?.wallet_number || "لا يوجد"}</td>
                <td className="p-4 text-green-400 font-bold">{u.wallets?.[0]?.balance || 0} $</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}