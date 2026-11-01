"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setMessage("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { setMessage("خطأ: " + authError.message); setLoading(false); return; }

    if (authData.user) {
      const walletNumber = Math.floor(1000 + Math.random() * 9000).toString();
      await supabase.from("profiles").insert({ id: authData.user.id, full_name: fullName, email: email });
      await supabase.from("wallets").insert({ user_id: authData.user.id, wallet_number: walletNumber, balance: 0 });
      setMessage(`تم إنشاء الحساب! رقم محفظتك هو: ${walletNumber}. احتفظ به.`);
      setTimeout(() => router.push("/login"), 4000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">إنشاء حساب جديد</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <button type="submit" disabled={loading} className="w-full py-2 bg-cyan-600 text-white font-bold rounded-lg">{loading ? "جاري..." : "إنشاء الحساب"}</button>
        </form>
        {message && <div className="mt-4 p-3 bg-slate-800 text-cyan-400 rounded-lg text-center text-sm">{message}</div>}
        <p className="mt-6 text-center text-sm text-slate-400">لديك حساب؟ <Link href="/login" className="text-cyan-400">دخول</Link></p>
      </div>
    </div>
  );
}