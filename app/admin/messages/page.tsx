"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select(`*, profiles(full_name, email)`)
        .order("created_at", { ascending: false });
      if (data) setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, []);

  if (loading) return <div className="text-center py-20 text-cyan-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">دردشة الإدارة</h1>
      {messages.length === 0 ? (
        <div className="text-center text-slate-400">لا توجد رسائل حالياً.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-cyan-400 font-bold">{msg.profiles?.full_name || msg.profiles?.email}</span>
                <span className="text-slate-500 text-sm">{new Date(msg.created_at).toLocaleString('ar-SA')}</span>
              </div>
              <p className="text-white">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}