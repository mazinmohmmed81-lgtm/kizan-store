"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [email, setEmail] = useState("support@alkyzan.com");
  const [phone, setPhone] = useState("+966 50 000 0000");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) {
        if (data.contact_email) setEmail(data.contact_email);
        if (data.contact_phone) setPhone(data.contact_phone);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-white mb-6">اتصل بنا</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
        <p className="text-slate-300">للتواصل مع إدارة المتجر:</p>
        <p className="text-xl font-bold text-cyan-400">البريد الإلكتروني: {email}</p>
        <p className="text-xl font-bold text-cyan-400">واتساب: {phone}</p>
      </div>
    </div>
  );
}