"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminContactPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) { setEmail(data.contact_email); setPhone(data.contact_phone); }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    await supabase.from("site_settings").update({ contact_email: email, contact_phone: phone }).eq("id", 1);
    alert("تم حفظ بيانات الاتصال!");
  };

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">تعديل بيانات الاتصال</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">البريد الإلكتروني</label>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">رقم الواتساب</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-cyan-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
      </div>
    </div>
  );
}