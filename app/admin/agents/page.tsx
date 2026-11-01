"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");

  const fetchAgents = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, role, profiles(full_name, email)")
      .eq("role", "shipping_agent");
    if (data) setAgents(data);
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    if (error) { alert(error.message); return; }
    
    if (authData.user) {
      await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "shipping_agent" });
      await supabase.from("profiles").insert({ id: authData.user.id, full_name: "وكيل شحن", email: email });
      const walletNumber = Math.floor(1000 + Math.random() * 9000).toString();
      await supabase.from("wallets").insert({ user_id: authData.user.id, wallet_number: walletNumber, balance: 0 });

      alert(`تمت إضافة الوكيل! رقم محفظته: ${walletNumber}`);
      setEmail(""); setPassword(""); fetchAgents();
    }
  };

  const handleCharge = async (userId: string) => {
    if (!chargeAmount) return;
    await supabase.rpc('add_wallet_balance', { 
      p_user_id: userId, 
      p_amount: parseFloat(chargeAmount), 
      p_description: "شحن من الإدارة" 
    });
    alert("تم شحن المحفظة!"); 
    setChargeAmount("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* زر العودة لشحن العملاء */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">إدارة الوكلاء</h1>
        <Link 
          href="/admin/wallets" 
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
        >
          شحن محفظة عميل
        </Link>
      </div>
      
      {/* إضافة وكيل جديد */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">إضافة وكيل جديد</h2>
        <form onSubmit={handleAddAgent} className="flex flex-col md:flex-row gap-4">
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
            required 
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" 
            required 
          />
          <button 
            type="submit" 
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg"
          >
            إضافة
          </button>
        </form>
      </div>

      {/* قائمة الوكلاء */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.user_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white">{agent.profiles?.full_name || "بدون اسم"}</h3>
            <p className="text-slate-400 mb-4">{agent.profiles?.email}</p>
            
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="المبلغ" 
                value={chargeAmount} 
                onChange={e => setChargeAmount(e.target.value)} 
                className="w-24 px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white" 
              />
              <button 
                onClick={() => handleCharge(agent.user_id)} 
                className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
              >
                شحن الوكيل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}