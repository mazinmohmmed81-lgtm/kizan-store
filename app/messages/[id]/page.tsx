"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);

      const { data } = await supabase.from("chat_messages").select("*").eq("deal_id", id).order("created_at");
      if (data) setMessages(data);

      const subscription = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `deal_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

      return () => { supabase.removeChannel(subscription); };
    };
    fetchMessages();
  }, [id, router]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from("chat_messages").insert({
      deal_id: id, sender_id: user.id, receiver_id: "00000000-0000-0000-0000-000000000000", message: newMessage
    });
    setNewMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-4">دردشة الصفقة</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 h-96 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded-lg max-w-[70%] ${msg.sender_id === user?.id ? 'bg-cyan-600 text-white mr-auto' : 'bg-slate-800 text-slate-200 ml-auto'}`}>
            <p className="text-sm">{msg.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-4">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="اكتب رسالتك..." className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white" />
        <button type="submit" className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl">إرسال</button>
      </form>
    </div>
  );
}